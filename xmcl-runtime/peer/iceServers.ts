import { UserProfile } from '@xmcl/runtime-api'
import { readJson } from 'fs-extra'
import { IceServer } from 'node-datachannel'
import { request } from 'undici'
import { Logger } from '~/logger'
import { NodeDataChannelModule } from './NodeDataChannel'
import { join } from 'path'

const BUILTIN = [
  'stun.voipbuster.com:3478',
  'stun.voipstunt.com:3478',
  'stun.internetcalls.com:3478',
  'stun.voip.aebc.com:3478',
  'stun.qq.com:3478',
  'stun.l.google.com:19302',
  'stun2.l.google.com:19302',
  'stun3.l.google.com:19302',
  'stun4.l.google.com:19302',
]

export async function getIceServers(logger: Logger, officialAccount: undefined | (UserProfile & { accessToken: string | undefined })) {
  logger.log('Try to fetch rtc credential')
  const username = officialAccount?.username ?? 'anonymous'
  logger.log(`Use minecraft xbox ${username} to fetch rtc credential`)
  const response = await request('https://api.xmcl.app/rtc/official', {
    method: 'POST',
    headers: officialAccount
      ? {
        authorization: `Bearer ${officialAccount.accessToken}`,
      }
      : undefined,
  })
  if (response.statusCode === 200) {
    const credential: {
      password: string
      username: string
      uris: string[]
      stuns: string[]
    } = await response.body.json() as any
    return [
      ...credential.uris
        .filter(u => u.startsWith('turn:'))
        .map(u => u.substring('turn:'.length))
        .map(u => {
          const [hostname, port] = u.split(':')
          return {
            username: credential.username,
            password: credential.password,
            hostname,
            port: port ? Number.parseInt(port) : 3478,
            relayType: 'TurnUdp' as any,
          }
        }),
      ...credential.stuns.map((s) => {
        const [hostname, port] = s.split(':')
        return {
          hostname,
          port: port ? Number.parseInt(port) : 3478,
        }
      }),
      {
        hostname: 'stun.qq.com',
        port: 3478,
      },
    ]
  } else {
    return []
  }
}

export async function loadIceServers(logger: Logger, cachePath: string) {
  try {
    const caches = await readJson(join(cachePath, 'ice-servers.json'))
    if (caches instanceof Array && caches.length > 0) {
      return caches as IceServer[]
    }
    return []
  } catch (e) {
    logger.error(e as any)
    return []
  }
}

async function test(iceServer: (string | IceServer), portBegin?: number) {
  const { PeerConnection } = await NodeDataChannelModule.getInstance()
  return new Promise<string[]>((resolve) => {
    const co = new PeerConnection('test', {
      iceServers: [iceServer],
      iceTransportPolicy: 'all',
      portRangeBegin: portBegin,
      portRangeEnd: portBegin,
      enableIceUdpMux: true,
    })
    const ips = new Set<string>()
    co.onGatheringStateChange((s) => {
      if (s === 'complete') {
        resolve([...ips])
      }
    })
    co.onLocalCandidate((candidate) => {
      if (candidate.indexOf('srflx') !== -1) {
        // parse candidate for public ip
        const ip = candidate.split(' ')[4]
        ips.add(ip)
      }
    })
    co.createDataChannel('test', { protocol: 'test' }).close()
  })
}

export function getKey(server: IceServer | string) {
  if (typeof server === 'string') {
    return server
  } else {
    return `${server.hostname}:${server.port}`
  }
}
async function testIceServers(
  servers: (IceServer | string)[],
  passed: Record<string, IceServer | string>,
  blocked: Record<string, IceServer | string>,
  onValidIceServer: (server: IceServer | string) => void,
  onIp: (ip: string) => void,
  portBegin?: number) {
  const ipSet = new Set<string>()
  await Promise.all(servers.map(async (server) => {
    const ips = await test(server, portBegin).catch(() => [])
    const key = getKey(server)
    if (ips.length > 0) {
      passed[key] = server
      delete blocked[key]
      onValidIceServer(server as IceServer)
      for (const ip of ips) {
        if (!ipSet.has(ip)) {
          ipSet.add(ip)
          onIp(ip)
        }
      }
    } else {
      blocked[key] = server
      delete passed[key]
    }
  }))
}

export function createIceServersProvider(
  logger: Logger,
  onValidIceServer: (server: IceServer | string) => void,
  onIp: (ip: string) => void,
) {
  const passed: Record<string, IceServer | string> = {}
  const blocked: Record<string, IceServer | string> = {}

  let _resolve = () => { }
  const initPromise: Promise<void> = new Promise((resolve) => {
    _resolve = resolve
  })

  return {
    async init(cachePath: string) {
      loadIceServers(logger, cachePath).then(cached => {
        const all = [...cached, ...BUILTIN]
        const pending: Record<string, any> = {}
        for (const a of all) {
          pending[getKey(a)] = a
        }
        testIceServers(Object.values(pending), passed, blocked, onValidIceServer, onIp)
        _resolve()
      }, _resolve)
    },
    async update(officialAccount: undefined | (UserProfile & { accessToken: string | undefined })) {
      const fetched = await getIceServers(logger, officialAccount)
      testIceServers(fetched, passed, blocked, onValidIceServer, onIp)
    },
    async get() {
      await initPromise
      return Object.keys(passed).length > 0 ? Object.values(passed) : Object.values(blocked)
    },
  }
}
