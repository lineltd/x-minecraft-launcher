import { useI18nSync } from '@/composables'
import { useState } from '@/composables/syncableState'
import { i18n } from '@/i18n'
import { vuetify } from '@/vuetify'
import { BaseServiceKey, Settings } from '@xmcl/runtime-api'
import 'virtual:uno.css'
import { h } from 'vue'
import BrowseVue from './Browse.vue'

const baseServiceChannel = serviceChannels.open(BaseServiceKey)

const app = createApp({
  setup() {
    const { state } = useState(() => baseServiceChannel.call('getSettings').then(v => v), Settings)
    useI18nSync(state)
    return () => h(BrowseVue)
  },
})

app.use(vuetify)
app.use(i18n)
app.mount('#app')
