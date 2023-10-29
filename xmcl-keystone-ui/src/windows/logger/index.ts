import { useI18nSync, useThemeSync } from '@/composables'
import { useState } from '@/composables/syncableState'
import { i18n } from '@/i18n'
import { vuetify } from '@/vuetify'
import { Settings } from '@xmcl/runtime-api'
import { h } from 'vue'
import App from './App.vue'
import { baseService } from './baseService'

const search = window.location.search.slice(1)
const pairs = search.split('&').map((pair) => pair.split('='))
const _locale = pairs.find(p => p[0] === 'locale')?.[1] ?? 'en'
const theme = pairs.find(p => p[0] === 'theme')?.[1] ?? 'dark'

const app = createApp(defineComponent({
  setup(props, context) {
    const { locale } = useI18n()
    locale.value = _locale
    const { state } = useState(() => baseService.call('getSettings').then(v => v), Settings)
    useThemeSync(state)
    useI18nSync(state)
    return () => h(App)
  },
}))
vuetify.theme.global.name.value = theme === 'dark' ? 'dark' : 'light'
vuetify.theme.global.name.value = theme === 'dark' ? 'dark' : 'light'
app.use(vuetify)
app.use(i18n)
app.mount('#app')
