import { InstanceManifest } from './entities/instanceManifest.schema'
import { GameProfileAndTexture } from './entities/user.schema'
import { GenericEventEmitter } from './events'
import { NatDeviceInfo } from './services/NatService'

export interface RTCSessionDescription {
  sdp: string
  type: 'answer' | 'offer' | 'pranswer' | 'rollback'
}

export type ConnectionState = 'closed' | 'connected' | 'connecting' | 'disconnected' | 'failed' | 'new'
export type IceGatheringState = 'complete' | 'gathering' | 'new'
export type SignalingState = 'closed' | 'have-local-offer' | 'have-local-pranswer' | 'have-remote-offer' | 'have-remote-pranswer' | 'stable'

export interface SelectedCandidateInfo {
  address: string
  port: number
  type: 'host' | 'prflx' | 'srflx' | 'relay'
  transportType: 'udp' | 'tcp'
}

export interface ConnectionUserInfo extends GameProfileAndTexture {
  /**
   * The readable text
   */
  name: string
  /**
   * The avatar url
   */
  avatar: string
}

/**
 * Represent a peer.
 *
 * A peer might have multiple connections.
 */
export interface Peer {
  id: string
  remoteId: string
  userInfo: ConnectionUserInfo
  initiator: boolean
  /**
   * Current ice server
   */
  iceServer: string
  /**
   * The tried ice servers
   */
  triedIceServers: string[]
  /**
   * The ice servers that this peer prefers
   */
  preferredIceServers: string[]

  selectedCandidate?: {
    local: SelectedCandidateInfo
    remote: SelectedCandidateInfo
  }

  localDescriptionSDP: string
  ping: number
  connectionState: ConnectionState
  iceGatheringState: IceGatheringState
  signalingState: SignalingState
  /**
   * The instance that this peer is sharing
   */
  sharing?: InstanceManifest
}

interface MultiplayerEvents {
  share: { id: string; manifest?: InstanceManifest }
  'connection-local-description': { description: TransferDescription; type: 'offer' | 'answer'; iceServer: string; iceServers: string[] }
  'connection-unexpected-closed': { id: string }
}

export interface TransferDescription {
  /**
   * The peer id
   */
  id: string
  session: string
  sdp: string
  candidates: Array<{ candidate: string; mid: string }>
}

export interface SetRemoteDescriptionOptions {
  type: 'offer' | 'answer'
  /**
   * The remote description
   */
  description: string | TransferDescription
  /**
   * Peer selected ice server
   */
  iceServer?: string
  /**
   * The ice servers that this peer prefers
   */
  iceServers?: string[]
  /**
   * Your ice server last seen by the peer
   */
  targetIceServer?: string
}

export interface InitiateOptions {
  /**
   * Peer client id
   */
  remoteId?: string
  /**
   * Peer connection id
   */
  session?: string
  initiate?: boolean
  /**
   * Use the ice server
   */
  preferredIceServers?: string[]
}

export interface Multiplayer extends GenericEventEmitter<MultiplayerEvents> {
  isReady(): boolean

  getNatDeviceInfo(): Promise<NatDeviceInfo | undefined>
  /**
   * Get the peers
   */
  getPeers(): Peer[]
  /**
   * Set your user info
   */
  setUserInfo(info: ConnectionUserInfo): void
  /**
   * Initiate a peer connection, and return the session description payload.
   * You need to manually send this offer payload to other user
   */
  initiate(options: InitiateOptions): Promise<string>
  /**
   * Receive the offer/answer from other user.
   */
  setRemoteDescription(options: SetRemoteDescriptionOptions): Promise<string>
  /**
   * Low level api to create peer
   *
   * Drop the existed session
   * @param id The session to drop
   */
  drop(id: string): Promise<void>
}
