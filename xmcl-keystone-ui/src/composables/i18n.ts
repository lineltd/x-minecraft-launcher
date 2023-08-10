import { clientCurseforgeV1Locale, clientModrinchV2Locale } from '@/util/clients'
import { Settings } from '@xmcl/runtime-api'
import { Ref } from 'vue'
import { useLocale } from 'vuetify'

export function useI18nSync(state: Ref<Settings | undefined>) {
  const { locale } = useI18n()
  const localeInstnace = useLocale()
  watch(computed(() => state.value?.locale || ''), (newValue: string, oldValue: string) => {
    console.log(`Locale changed ${oldValue} -> ${newValue}`)
    locale.value = newValue
    const lang = localeInstnace.current
    if (newValue === 'zh-CN') {
      lang.value = 'zhHans'
    } else if (newValue === 'ru') {
      lang.value = 'ru'
    } else {
      lang.value = 'en'
    }

    clientModrinchV2Locale.headers = {
      'Accept-Language': newValue,
    }
    clientCurseforgeV1Locale.headers = {
      'Accept-Language': newValue,
    }
  })
}
