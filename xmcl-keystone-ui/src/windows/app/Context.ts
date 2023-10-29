import { kSemaphores, useExternalRoute, useI18nSync, useSemaphores, useThemeSync } from '@/composables'
import { kColorTheme, useColorTheme } from '@/composables/colorTheme'
import { kExceptionHandlers, useExceptionHandlers } from '@/composables/exception'
import { kImageDialog, useImageDialog } from '@/composables/imageDialog'
import { kInstance, useInstance } from '@/composables/instance'
import { kInstances, useInstances } from '@/composables/instances'
import { kNotificationQueue, useNotificationQueue } from '@/composables/notifier'
import { kServerStatusCache, useServerStatusCache } from '@/composables/serverStatus'
import { kSettingsState, useSettingsState } from '@/composables/setting'
import { kUILayout, useUILayout } from '@/composables/uiLayout'
import { kMarketRoute, useMarketRoute } from '@/composables/useMarketRoute'
import { kLocalVersions, useLocalVersions } from '@/composables/versionLocal'
import { provide } from 'vue'
import { useTheme } from 'vuetify'

export default defineComponent({
  setup(props, ctx) {
    provide(kSemaphores, useSemaphores())
    provide(kExceptionHandlers, useExceptionHandlers())
    provide(kServerStatusCache, useServerStatusCache())
    provide(kNotificationQueue, useNotificationQueue())

    const theme = useTheme()
    provide(kColorTheme, useColorTheme(computed(() => theme.current.value.dark)))

    const settings = useSettingsState()
    provide(kSettingsState, settings)

    useI18nSync(settings.state)
    useThemeSync(settings.state)

    useExternalRoute()

    provide(kLocalVersions, useLocalVersions())
    const instances = useInstances()
    provide(kInstances, instances)
    provide(kInstance, useInstance(instances.selectedInstance, instances.instances))

    provide(kUILayout, useUILayout())
    provide(kImageDialog, useImageDialog())
    provide(kMarketRoute, useMarketRoute())

    return () => ctx.slots.default?.()
  },
})
