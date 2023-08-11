import { ObjectDirective } from 'vue'

const listenerMap: Map<HTMLElement, [Function, Function]> = new Map()

export const vFocusOnSearch: ObjectDirective<HTMLElement, (show: boolean) => boolean> = {
  mounted(el, bindings, vnode) {
    function handleKeydown(e: KeyboardEvent) {
      if (e.code === 'KeyF' && (e.ctrlKey || e.metaKey)) {
        // @ts-ignore
        if (bindings.instance?.focus) {
          (bindings.instance as any).focus()
        } else {
          el.focus()
        }
        if (bindings.value(true)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }
    function handleKeyup(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // @ts-ignore
        if (bindings.instance?.blur) {
          (bindings.instance as any).blur()
        } else {
          el.blur()
        }
        if (bindings.value(false)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }
    document.addEventListener('keyup', handleKeyup)
    document.addEventListener('keydown', handleKeydown)
    listenerMap.set(el, [handleKeydown, handleKeyup])
  },
  unmounted(el, bindings) {
    const cache = listenerMap.get(el)
    if (cache) {
      const [keydown, keyup] = cache
      document.removeEventListener('keydown', keydown as any)
      document.removeEventListener('keyup', keyup as any)
    }
  },
}
