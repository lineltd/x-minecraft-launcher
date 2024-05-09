import { UpnpClient } from '@xmcl/nat-api'
import { createPromiseSignal, NatService as INatService, NatServiceKey, NatState } from '@xmcl/runtime-api'
import { getNatInfoUDP, sampleNatType, UnblockedNatInfo } from '@xmcl/stun-client'
import { Inject, LauncherAppKey } from '~/app'
import { ExposeServiceKey, ServiceStateManager, Singleton, StatefulService } from '~/service'
import { LauncherApp } from '../app/LauncherApp'
@ExposeServiceKey(NatServiceKey)
export class NatService extends StatefulService<NatState> implements INatService {
  private client = createPromiseSignal<UpnpClient>()

  constructor(
    @Inject(LauncherAppKey) app: LauncherApp,
    @Inject(ServiceStateManager) store: ServiceStateManager,
  ) {
    super(app, () => store.registerStatic(new NatState(), NatServiceKey), async () => {
      this.refreshNatType().catch((e) => {
        this.warn('Failed to get nat type: %o', e)
      })
    })
    this.client.promise.catch((e) => {
      this.warn(e)
    })
  }

  @Singleton()
  async refreshNatType(): Promise<void> {
    this.log('Start to sample the nat type')

    const p = await this.app.registry.get(kIceServerProvider)
    const stuns = p.getIceServers().map(ice => ({ ip: ice.hostname, port: ice.port }))
    stuns.push({ ip: '20.239.69.131', port: 3478 })

    const winner = createPromiseSignal<{
      stun: {
        ip: string
        port: number
      }
      info: UnblockedNatInfo
    }>()
    const all = Promise.all(stuns.map(async (stun) => {
      this.log(`Testing nat type with ${stun.ip}:${stun.port}`)
      const info = await getNatInfoUDP({ stun })
      this.log(`Nat type test result ${stun.ip}:${stun.port}: %o`, info)
      if (info.type !== 'Blocked') {
        winner.resolve({ stun, info })
      }
    }))
    const winOrBlocked = await Promise.race([winner.promise, all])
    if (winOrBlocked instanceof Array) {
      // All blocked
      this.state.natTypeSet('Blocked')
      this.log('All nat type test failed')
    } else {
      const { stun, info } = winOrBlocked
      this.state.natInfoSet(info.externalIp, info.externalPort)
      this.state.natTypeSet(info.type)
      this.log('Fast nat detection: %o', info)

      const result = await sampleNatType({
        sampleCount: 3,
        retryInterval: 3_000,
        stun,
      })
      if (result) {
        this.state.natTypeSet(result)
      }
      this.log(`Refresh nat type ${result}`)
    }
  }
}
