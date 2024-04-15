import { LauncherAppPlugin } from '~/app'
import { createLazyWorker } from '../worker'
import createResourceWorker from './resourceWorkerEntry?worker'
import { ResourceWorker, kResourceWorker } from './worker'
import mmhash from '@xmcl/murmurhash2/wasm'

console.log(mmhash)
const mmhashmod = WebAssembly.compile(mmhash).then(m => {
  console.log(m)
  return WebAssembly.instantiate(m)
}).then(i => {
  console.log(i)
  return i.exports
})

export const pluginResourceWorker: LauncherAppPlugin = async (app) => {
  const logger = app.getLogger('ResourceWorker')

  const resourceWorker: ResourceWorker = createLazyWorker(createResourceWorker, ['checksum', 'fingerprint2', 'copyPassively', 'hash', 'hashAndFileType', 'parse', 'fingerprint'], logger)
  app.registry.register(kResourceWorker, resourceWorker)

  resourceWorker.fingerprint()
}
