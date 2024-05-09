import { InstanceManifest, ShareInstanceOptions } from '@xmcl/runtime-api'
import { PeerSession } from './connection'
import { join } from 'path'
import { MessageShareManifest } from './messages/download'

export function createPeerSharing(peers: Record<string, PeerSession>) {
  let sharedManifest: InstanceManifest | undefined
  let shareInstancePath = ''
  let resourcePath = ''

  return {
    setResourcePath: (path: string) => {
      resourcePath = path
    },

    getSharedInstance: () => sharedManifest,
    getShadedInstancePath: () => shareInstancePath,
    getSharedAssetsPath: () => join(resourcePath, 'assets'),
    getSharedLibrariesPath: () => join(resourcePath, 'assets'),
    getSharedImagePath: (image: string) => join(resourcePath, 'images', image),

    shareInstance: async (options: ShareInstanceOptions) => {
      sharedManifest = options.manifest
      shareInstancePath = options.instancePath
      for (const sess of Object.values(peers)) {
        sess.send(MessageShareManifest, { manifest: options.manifest })
      }
    },
  }
}
