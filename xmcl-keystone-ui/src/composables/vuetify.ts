// @ts-ignore
import colors from 'vuetify/lib/util/colors'
import { useTheme } from 'vuetify'
export function useVuetifyColor() {
  const theme = useTheme()
  const getColorCode = (code: string) => {
    return theme.current.value.colors[code] ?? (colors as any)[code]?.base ?? ''
  }

  return {
    getColorCode,
  }
}
