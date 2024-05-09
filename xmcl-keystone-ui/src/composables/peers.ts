import { BaseServiceKey, GameProfileAndTexture, NatDeviceInfo, PeerServiceKey, PeerState } from '@xmcl/runtime-api'
import { InjectionKey, Ref } from 'vue'
import { PeerGroup } from './peerGroup'
import { useService } from './service'
import { useState } from './syncableState'

export const kPeerShared: InjectionKey<ReturnType<typeof usePeerConnections>> = Symbol('PeerState')

export function usePeerConnections() {
  const { getPeerState } = useService(PeerServiceKey)
  const { state } = useState(getPeerState, PeerState)
  return {
    connections: computed(() => state.value?.connections ?? []),
  }
}

export const kPeerState: InjectionKey<ReturnType<typeof usePeerState>> = Symbol('PeerState')

export function usePeerState(gameProfile: Ref<GameProfileAndTexture>) {
  const { getPeerState } = useService(PeerServiceKey)
  const { getNatDeviceInfo, initiate, on, setRemoteDescription, drop, isReady, setUserInfo } = multiplayer

  const device = ref<NatDeviceInfo | undefined>(undefined)
  getNatDeviceInfo().then((d) => {
    device.value = d
  })

  const { state } = useState(getPeerState, PeerState)
  const connections = computed(() => state.value?.connections ?? [])
  const validIceServers = computed(() => state.value?.validIceServers ?? [])
  const ips = computed(() => state.value?.ips ?? [])

  watch(gameProfile, (p) => {
    setUserInfo({
      ...p,
      name: p.name,
      avatar: p.textures.SKIN.url,
    })
  })
  const { getSessionId } = useService(BaseServiceKey)

  const group = ref('')
  const groupState = ref<'connecting' | 'connected' | 'closing' | 'closed'>('closed')
  const error = ref<Error | undefined>(undefined)
  let _group: PeerGroup | undefined
  let _id = ''

  getSessionId().then((s) => {
    _id = s
  })

  on('connection-local-description', ({ description, type, iceServer, iceServers }) => {
    _group?.sendLocalDescription(description.id, description.sdp, type, description.candidates, iceServer, iceServers)
  })

  on('connection-unexpected-closed', ({ id }) => {
    
  })

  async function joinGroup(groupId?: string) {
    if (!groupId) {
      const buf = new Uint16Array(1)
      window.crypto.getRandomValues(buf)
      groupId = gameProfile.value.name + '@' + buf[0]
    }
    if (!_id) {
      if (typeof window.crypto.randomUUID === 'function') {
        _id = window.crypto.randomUUID()
      } else {
        _id = await getSessionId()
      }
    }
    _group = new PeerGroup(groupId, _id, gameProfile)

    _group.onheartbeat = (sender) => {
      console.log(`Get heartbeat from ${sender}`)
      const peer = state.value?.connections.find(p => p.remoteId === sender)
      // Ask sender to connect to me :)
      if (!peer) {
        if (_id.localeCompare(sender) > 0) {
          console.log(`Not found the ${sender}. Initiate new connection`)
          // Only if my id is greater than other's id, we try to initiate the connection.
          // This will have a total order in the UUID random space

          // Try to connect to the sender
          initiate({ remoteId: sender, initiate: true })
        }
      }
    }
    _group.ondescriptor = async (sender, sdp, type, candidates, iceServer, allIceServers) => {
      setRemoteDescription({
        description: {
          id: sender,
          session: '',
          sdp,
          candidates,
        },
        type: type as any,
        iceServer,
        iceServers: allIceServers,
      })
    }
    _group.onuser = (sender, profile) => {
      const peer = state.value?.connections.find(p => p.remoteId === sender)
      if (peer) {
        peer.userInfo = {
          ...profile,
          avatar: profile.textures.SKIN.url,
        }
      }
    }
    _group.onstate = (state) => {
      groupState.value = state
    }
    _group.onerror = (err) => {
      if (err instanceof Error) error.value = err
    }

    group.value = groupId
    groupState.value = _group.state
  }

  function leaveGroup() {
    _group?.quit()
    _group = undefined
    group.value = ''
    groupState.value = 'closed'
  }

  function _setRemoteDescription(type: 'offer' | 'answer', description: string) {
    return setRemoteDescription({
      description,
      type,
    })
  }

  function _initiate() {
    return initiate({ initiate: true })
  }

  return {
    device,
    joinGroup,
    validIceServers,
    ips,
    leaveGroup,
    setRemoteDescription: _setRemoteDescription,
    initiate: _initiate,
    group,
    groupState,
    connections,
    drop,
  }
}
