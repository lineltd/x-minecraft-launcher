import './controller'
import { serviceChannels } from './service'

import { createMultiplayer } from '@xmcl/runtime/peer/multiplayerImpl'
import { contextBridge, ipcRenderer } from 'electron/renderer'
import { Logger, formatLogMessage, getMessageFromError } from '@xmcl/runtime/logger'
import { PeerServiceKey } from '@xmcl/runtime-api'

const logger: Logger = {
  log: (message, ...options: any[]) => {
    const text = formatLogMessage(message, options)
    console.log(text)
  },
  warn: (message: any, ...options: any[]) => {
    const text = formatLogMessage(message, options)
    console.warn(text)
  },
  error: (error, scope) => {
    const message = getMessageFromError(error)
    console.error(message)
  },
}

let inited = false
ipcRenderer.invoke('multiplayer-init').then((payload: { appDataPath: string; resourcePath: string; sessionId: string }) => {
  init(payload.appDataPath, payload.resourcePath, payload.sessionId)
  emitter.emit('ready')
  inited = true
})

ipcRenderer.on('peer-instance-shared', (_, options) => {
  shareInstance(options)
})

let stateReady = false
const serv = serviceChannels.open(PeerServiceKey)
serv.call('getPeerState').then((state) => state).then(state => {
  setState(state)
  stateReady = true
})

const { init, emitter, shareInstance, setState, ...peer } = createMultiplayer(logger)

const multiplayer = {
  ...peer,
  getNatDeviceInfo: peer.getNatDeviceInfo,
  isNatSupported: peer.isNatSupported,
  isReady: () => inited && stateReady,
  on: (eventName: string | symbol, listener: (...args: any[]) => void) => emitter.on(eventName, listener),
  once: (eventName: string | symbol, listener: (...args: any[]) => void) => emitter.once(eventName, listener),
  off: (eventName: string | symbol, listener: (...args: any[]) => void) => emitter.off(eventName, listener),
  addListener: (eventName: string | symbol, listener: (...args: any[]) => void) => emitter.addListener(eventName, listener),
  removeListener: (eventName: string | symbol, listener: (...args: any[]) => void) => emitter.removeListener(eventName, listener),
}

contextBridge.exposeInMainWorld('multiplayer', multiplayer)
