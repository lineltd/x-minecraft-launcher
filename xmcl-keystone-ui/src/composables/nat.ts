import { NatDeviceInfo, NatServiceKey, NatState } from '@xmcl/runtime-api'
import { set } from 'vue'
import { useService } from './service'
import { useState } from './syncableState'

export function useNatState() {
  // const { state, isValidating, error } = useState(getNatState, class extends NatState {
  //   override natAddressSet(address: string): void {
  //     set(this, 'natAddress', address)
  //   }

  //   override natDeviceSet(device: NatDeviceInfo): void {
  //     set(this, 'natDevice', device)
  //   }
  // })
  const natType = computed(() => undefined ?? 'Unknown')
  const externalIp = computed(() => undefined ?? '')
  const externalPort = computed(() => undefined ?? 0)
  const localIp = computed(() => undefined ?? '')
  const natDevice = computed(() => undefined ?? undefined)
  return {
    natType,
    externalIp,
    externalPort,
    localIp,
    natDevice,
    isValidating: ref(false),
    error: ref(undefined),
  }
}
