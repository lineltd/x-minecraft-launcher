import { injection } from '@/util/inject'
import { Ref, computed } from 'vue'
import { Settings } from '@xmcl/runtime-api'
import { useTheme as vuseTheme } from 'vuetify'

export function useTheme() {
  const theme = vuseTheme()
  const darkTheme = computed(() => theme.current.value.dark)
  return {
    darkTheme,
  }
}

export function usePreferDark() {
  const preferDark = ref(true)
  const matches = (window.matchMedia) ? window.matchMedia('(prefers-color-scheme: dark)') : false
  if (matches) {
    preferDark.value = matches.matches
    matches.onchange = ({ matches }) => {
      preferDark.value = matches
    }
  }
  return preferDark
}

export function useThemeSync(state: Ref<Settings | undefined>) {
  const preferDark = usePreferDark()

  const themeInstance = vuseTheme()

  const updateTheme = (theme: 'dark' | 'system' | 'light') => {
    if (theme === 'system') {
      // themeInstance.global.name.value = preferDark.value ? 'dark' : 'light'
    } else {
      // themeInstance.global.name.value = theme
    }
  }

  watch(computed(() => state.value?.theme ?? 'system'), (newValue: string, oldValue: string) => {
    console.log(`Theme changed ${oldValue} -> ${newValue}`)
    updateTheme(newValue as any)
  })

  updateTheme(state.value?.theme || 'system')
}
