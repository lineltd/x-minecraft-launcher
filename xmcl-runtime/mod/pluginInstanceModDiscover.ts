import { CurseforgeV1Client } from '@xmcl/curseforge'
import { ModrinthV2Client } from '@xmcl/modrinth'
import { InstanceModUpdatePayloadAction, InstanceModsState, MutableState, Resource } from '@xmcl/runtime-api'
import { LauncherAppPlugin } from '~/app'
import { ResourceService, kResourceWorker } from '~/resource'
import { ServiceStateManager } from '~/service'
import { AggregateExecutor } from '~/util/aggregator'

export const pluginInstanceModDiscover: LauncherAppPlugin = async (app) => {
  const resourceService = await app.registry.getOrCreate(ResourceService)
  const modrinthClient = await app.registry.getOrCreate(ModrinthV2Client)
  const curseforgeClient = await app.registry.getOrCreate(CurseforgeV1Client)
  const worker = await app.registry.getOrCreate(kResourceWorker)
  const logger = app.getLogger('InstanceModDiscover')

  const onRefreshModrinth = async (all: Resource[]) => {
    try {
      const versions = await modrinthClient.getProjectVersionsByHash(all.map(v => v.hash))
      const options = Object.entries(versions).map(([hash, version]) => {
        const f = all.find(f => f.hash === hash)
        if (f) return { hash: f.hash, metadata: { modrinth: { projectId: version.project_id, versionId: version.id } } }
        return undefined
      }).filter((v): v is any => !!v)
      await resourceService.updateResources(options)
    } catch (e) {
      logger.error(e as any)
    }
  }
  const refreshModrinth = new AggregateExecutor<Resource, Resource[]>(v => v, onRefreshModrinth, 500)

  const onRefreshCurseforge = async (all: Resource[]) => {
    try {
      const chunkSize = 8
      const allChunks = [] as Resource[][]
      for (let i = 0; i < all.length; i += chunkSize) {
        allChunks.push(all.slice(i, i + chunkSize))
      }

      for (const chunk of allChunks) {
        const prints = (await Promise.all(chunk.map(v => v.path).map(worker.fingerprint))).map(BigInt)
        const result = await curseforgeClient.getFingerprintsMatchesByGameId(432, prints)
        for (const f of result.exactMatches) {
          const r = chunk.find((v, i) => prints[i] === BigInt(f.id))
          if (r) {
            r.metadata.curseforge = { projectId: f.file.modId, fileId: f.file.id }
          }
        }
      }
      // const options = Object.entries(result).map(([hash, version]) => {
      //   const f = all.find(f => f.hash === hash)
      //   if (f) return { hash: f.hash, metadata: { curseforge: { projectId: version.project_id, fileId: version.id } } }
      //   return undefined
      // }).filter((v): v is any => !!v)
      // await resourceService.updateResources(options)
    } catch (e) {
      logger.error(e as any)
    }
  }
  const refreshCurseforge = new AggregateExecutor<Resource, Resource[]>(v => v, onRefreshCurseforge, 500)

  app.registry.get(ServiceStateManager).then(serv => {
    app.on('service-state-init', (id) => {
      const state = serv.get(id) as MutableState<InstanceModsState>
      if (state instanceof InstanceModsState) {
        state.subscribe('instanceModUpdates', (payload) => {
          for (const [r, type] of payload) {
            if (type === InstanceModUpdatePayloadAction.Upsert) {
              if (!r.metadata.curseforge) {
                refreshCurseforge.push(r)
              } else if (!r.metadata.modrinth) {
                refreshModrinth.push(r)
              }
            }
          }
        })
      }
    })
  })
}
