import { InitiateOptions, PeerState, SetRemoteDescriptionOptions, TransferDescription } from '@xmcl/runtime-api'
import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import { promisify } from 'util'
import { brotliCompress, brotliDecompress } from 'zlib'
import { Logger } from '~/logger'
import { NodeDataChannelModule } from './NodeDataChannel'
import { PeerContext } from './PeerContext'
import { PeerSession } from './connection'
import { createIceServersProvider, getKey } from './iceServers'
import { createLanDiscover } from './lanDiscover'
import { exposeLocalPort, parseCandidate } from './mapAndGetPortCanidate'
import { createPeerSharing } from './peerSharing'
import { createPeerUserInfo } from './peerUserInfo'
import { getDeviceInfo, getNatAddress, isSupported } from './ssdpClient'
import { IceServer } from 'node-datachannel'

const pBrotliDecompress = promisify(brotliDecompress)
const pBrotliCompress = promisify(brotliCompress)

async function decode(description: string): Promise<TransferDescription> {
  return JSON.parse((await pBrotliDecompress(Buffer.from(description, 'base64'))).toString('utf-8'))
}

export function createMultiplayer(logger: Logger) {
  const peers: Record<string, PeerSession> = {}
  const emitter = new EventEmitter()
  const discover = createLanDiscover(peers, logger)
  const sharing = createPeerSharing(peers)
  const userInfo = createPeerUserInfo()
  const iceServers = createIceServersProvider(logger,
    (server) => {
      console.log('Valid ice server', server)
      if (state) {
        state?.validIceServerSet(Array.from(new Set([...state.validIceServers, getKey(server)])))
      }
    },
    (ip) => {
      console.log('Public ip', ip)
      if (state) {
        state?.ipsSet(Array.from(new Set([...state.ips, ip])))
      }
    },
  )
  const portCandidate = 35565
  let state: PeerState | undefined

  const getContext = (remoteId: string | undefined, all: Array<string | IceServer>): PeerContext => {
    let index = 0
    return {
      getCurrentIceServer: () => all[index],
      getNextIceServer: () => {
        const cur = all[index]
        index++
        return cur
      },
      onHeartbeat: (session, ping) => {
        state?.connectionPing({ id: session, ping })
      },
      onInstanceShared: (session, manifest) => {
        state?.connectionShareManifest({ id: session, manifest })
      },
      onDescriptorUpdate: async (session, sdp, type, candidates) => {
        logger.log(`Send local description ${remoteId}: ${sdp} ${type}`)
        logger.log(candidates)

        const candidate = candidates.find(c => c.candidate.indexOf('typ srflx') !== -1)
        if (candidate) {
          const [ip, port] = parseCandidate(candidate.candidate)
          if (ip && port) {
            await exposeLocalPort(portCandidate, Number(port), logger).catch((e) => {
              if (e.name === 'Error') { e.name = 'MapNatError' }
              logger.error(e)
            })
          }
        }
        const payload = { sdp, id: remoteId, session, candidates }
        emitter.emit('connection-local-description', { type, description: payload, iceServer: all[index], iceServers: all })
        pBrotliCompress(JSON.stringify(payload)).then((s) => s.toString('base64')).then((compressed) => {
          state?.connectionLocalDescription({ id: payload.session, description: compressed })
        })
      },
      onIdentity: (session, info) => {
        const p = peers[session]
        if (p) {
          p.remoteInfo = info
        }
        state?.connectionUserInfo({ id: session, info })
      },
      onLanMessage: discover.onLanMessage,
      getUserInfo: userInfo.getUserInfo,
      getSharedInstance: sharing.getSharedInstance,
      getShadedInstancePath: sharing.getShadedInstancePath,
      getSharedAssetsPath: sharing.getSharedAssetsPath,
      getSharedLibrariesPath: sharing.getSharedLibrariesPath,
      getSharedImagePath: sharing.getSharedImagePath,
    }
  }

  const getPeers = () => peers

  const init = (appDataPath: string, resourcePath: string, sessionId: string) => {
    NodeDataChannelModule.init(appDataPath)
    iceServers.init(appDataPath)
    discover.start(sessionId)
    sharing.setResourcePath(resourcePath)
  }

  return {
    init,
    emitter,
    setState: (_state: PeerState) => { state = _state },
    setUserProfile: userInfo.setUserInfo,
    getNatDeviceInfo: getDeviceInfo,
    isNatSupported: isSupported,
    getPeers,
    async initiate(options: InitiateOptions) {
      const initiator = !options.remoteId || options.initiate || false
      const remoteId = options.remoteId
      const sessionId = options.session || randomUUID() // `${await this.getLocalIp(true)}-${randomUUID()}`
      const preferredIceServers = options.preferredIceServers || []

      logger.log(`Create peer connection to ${remoteId}. Is initiator: ${initiator}`)
      const privatePort = portCandidate

      const all = await iceServers.get()
      // sort all servers by preferredIceServers
      if (preferredIceServers.length > 0) {
        all.sort((a, b) => {
          const aIndex = preferredIceServers.indexOf(getKey(a))
          const bIndex = preferredIceServers.indexOf(getKey(b))
          if (aIndex === -1 && bIndex === -1) {
            return 0
          }
          if (aIndex === -1) {
            return 1
          }
          if (bIndex === -1) {
            return -1
          }
          return aIndex - bIndex
        })
      }

      const { PeerConnection } = await NodeDataChannelModule.getInstance()
      const create = (ctx: PeerContext, sessionId: string) => {
        const ice = ctx.getNextIceServer()
        logger.log('Use ice servers: %o', ice)

        if (ice) {
          state?.connectionIceServersSet({ id: sessionId, iceServer: getKey(ice) })
        }

        const co = new PeerConnection(sessionId, {
          iceServers: ice ? [ice] : [],
          iceTransportPolicy: 'all',
          portRangeBegin: privatePort,
          portRangeEnd: privatePort,
          enableIceUdpMux: true,
        })

        co.onStateChange((_state) => {
          const pair = co.getSelectedCandidatePair()
          if (pair) {
            logger.log('Select pair %o', pair)
            state?.connectionSelectedCandidate({
              id: sessionId,
              remote: pair.remote as any,
              local: pair.local as any,
            })
          }
          state?.connectionStateChange({ id: sessionId, connectionState: _state as any })
          if (_state === 'closed') {
            if (sess.isClosed) {
              // Close by user manually
              delete peers[sessionId]
              state?.connectionDrop(sessionId)
            } else {
              if (initiator) {
                // unexpected close! reconnect
                sess.connection = create(ctx, sessionId)
                sess.initiate()
              }
            }
          }
        })
        co.onSignalingStateChange((sstate) => {
          state?.signalingStateChange({ id: sessionId, signalingState: sstate as any })
        })
        co.onGatheringStateChange((gstate) => {
          state?.iceGatheringStateChange({ id: sessionId, iceGatheringState: gstate as any })
        })

        return co
      }

      state?.connectionAdd({
        id: sessionId,
        initiator,
        remoteId: remoteId ?? '',
        userInfo: {
          name: '',
          id: '',
          textures: {
            SKIN: { url: '' },
          },
          avatar: '',
        },
        iceServer: '',
        triedIceServers: [],
        preferredIceServers,
        ping: -1,
        signalingState: 'closed',
        localDescriptionSDP: '',
        iceGatheringState: 'new',
        connectionState: 'new',
        sharing: undefined,
        selectedCandidate: undefined,
      })

      const ctx = getContext(remoteId, all)
      const sess = new PeerSession(sessionId, create(ctx, sessionId), ctx, logger)

      peers[sess.id] = sess

      if (initiator) {
        sess.initiate()
      }

      return sess.id
    },
    async setRemoteDescription({ description, type, iceServer, iceServers, targetIceServer }: SetRemoteDescriptionOptions) {
      const desc = typeof description === 'string' ? await decode(description) : description
      const { sdp, candidates, id: sender, session } = desc
      let sess = peers[session] ?? Object.values(peers).find(p => p.remoteId === sender)
      const newPeer = !sess
      if (!sess) {
        logger.log(`Not found the ${sender}. Initiate new connection`)
        // Try to connect to the sender
        await this.initiate({ remoteId: sender, session, initiate: false, preferredIceServers: iceServers })
        sess = peers[session] ?? Object.values(peers).find(p => p.remoteId === sender)!
      }

      sess.

      if (targetIceServer && sess.context.getCurrentIceServer() !== targetIceServer) {
        // ignore the message if the target ice server is not the current ice server
        // in this case, the message is out of date
        return sess.id
      }

      logger.log(`Set remote ${type} description: ${sdp}`)
      logger.log(candidates)
      const sState = sess.connection.signalingState()
      if (sState !== 'stable' || newPeer) {
        try {
          sess.connection.setRemoteDescription(sdp, type as any)
          for (const { candidate, mid } of candidates) {
            logger.log(`Add remote candidate: ${candidate} ${mid}`)
            sess.connection.addRemoteCandidate(candidate, mid)
          }
        } catch (e) {
          if (e instanceof Error && e.name === 'Error') {
            e.name = 'SetRemoteDescriptionError'
          }
          throw e
        }
      } else {
        logger.log('Skip to set remote description as signal state is stable')
      }

      return sess.id
    },
    shareInstance: sharing.shareInstance,
    async drop(id: string): Promise<void> {
      const existed = peers[id]
      if (existed) {
        existed.close()
        emitter.emit('drop', { id })
      }
    },
  }
}
