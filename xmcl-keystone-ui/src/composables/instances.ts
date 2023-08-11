import { EditInstanceOptions, InstanceSchema, InstanceServiceKey, InstanceState } from '@xmcl/runtime-api'
import { InjectionKey, Ref } from 'vue'
import { useService } from './service'
import { useState } from './syncableState'
import { DeepPartial } from '@xmcl/runtime-api/src/util/object'
import { useSortedInstance } from './instanceSort'
import { useLocalStorageCacheStringValue } from './cache'

export const kInstances: InjectionKey<ReturnType<typeof useInstances>> = Symbol('Instances')

/**
 * Hook of a view of all instances & some deletion/selection functions
 */
export function useInstances() {
  const { createInstance, getSharedInstancesState, editInstance, deleteInstance, validateInstancePath } = useService(InstanceServiceKey)
  const { state, isValidating, error } = useState(getSharedInstancesState, InstanceState)
  const _instances = computed(() => state.value?.instances ?? [])
  const { instances, setToPrevious } = useSortedInstance(_instances)
  const _path = useLocalStorageCacheStringValue('selectedInstancePath', '' as string)
  const path = ref('')

  async function edit(options: EditInstanceOptions & { instancePath: string }) {
    await editInstance(options)
  }
  async function remove(instancePath: string) {
    const index = instances.value.findIndex(i => i.path === instancePath)
    const lastSelected = path.value
    await deleteInstance(instancePath)
    if (instancePath === lastSelected) {
      path.value = instances.value[Math.max(index - 1, 0)]?.path ?? ''
      if (!path.value) {
        createInstance({
          name: 'Minecraft',
        }).then(p => {
          path.value = p
        })
      }
    }
  }
  watch(state, async (newVal, oldVal) => {
    if (!newVal) return
    if (!oldVal) {
      // initialize
      const instances = [...newVal.instances]
      const lastSelectedPath = _path.value

      const selectDefault = async () => {
        // Select the first instance
        let defaultPath = instances[0]?.path as string | undefined
        if (!defaultPath) {
          // Create a default instance
          defaultPath = await createInstance({
            name: 'Minecraft',
          })
        }
        _path.value = defaultPath
      }

      if (lastSelectedPath) {
        // Validate the last selected path
        if (!instances.some(i => i.path === lastSelectedPath)) {
          const badInstance = await validateInstancePath(lastSelectedPath)
          if (badInstance) {
            await selectDefault()
          }
        }
      } else {
        // No selected, try to select the first instance
        await selectDefault()
      }

      path.value = _path.value
    }
  })
  watch(path, (newPath) => {
    if (newPath !== _path.value) {
      // save to local storage
      _path.value = newPath
    }
    editInstance({
      instancePath: newPath,
      lastAccessDate: Date.now(),
    })
  })
  return {
    selectedInstance: path,
    instances,
    setToPrevious,
    isValidating,
    error,
    edit,
    remove,
  }
}
