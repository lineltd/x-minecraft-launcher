import { useColorTheme } from './colorTheme'
import { useTheme } from 'vuetify'

export function useVuetifyColorTheme({
  primaryColor,
  accentColor,
  infoColor,
  errorColor,
  successColor,
  warningColor,
}: Omit<ReturnType<typeof useColorTheme>, 'cssVars'>) {
  const { themes, name } = useTheme()
  const current = themes.value[name.value]

  // if (primaryColor.value) { current.colors.primary = primaryColor.value }
  // if (accentColor.value) { current.colors.accent = accentColor.value }
  // if (infoColor.value) { current.colors.info = infoColor.value }
  // if (errorColor.value) { current.colors.error = errorColor.value }
  // if (successColor.value) { current.colors.success = successColor.value }
  // if (warningColor.value) { current.colors.warning = warningColor.value }

  // watch(primaryColor, (newColor) => { current.colors.primary = newColor })
  // watch(accentColor, (newColor) => { current.colors.accent = newColor })
  // watch(infoColor, (newColor) => { current.colors.info = newColor })
  // watch(errorColor, (newColor) => { current.colors.error = newColor })
  // watch(successColor, (newColor) => { current.colors.success = newColor })
  // watch(warningColor, (newColor) => { current.colors.warning = newColor })
}
