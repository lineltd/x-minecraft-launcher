/* eslint-disable vue/one-component-per-file */
import TextComponent from '@/components/TextComponent'
import { kServiceFactory, useServiceFactory } from '@/composables'
import { kDialogModel, useDialogModel } from '@/composables/dialog'
import { kSWRVConfig, useSWRVConfig } from '@/composables/swrvConfig'
import { kTaskManager, useTaskManager } from '@/composables/taskManager'
import { i18n } from '@/i18n'
import { vuetify } from '@/vuetify'
import 'virtual:uno.css'
import { defineComponent, h, provide } from 'vue'
import App from './App.vue'
import Context from './Context'
import { router } from './router'
import { kFlights } from '@/composables/flights'

// to prevent the universal drop activated on self element dragging
document.addEventListener('dragstart', (e) => {
  if (e.dataTransfer?.effectAllowed === 'uninitialized') {
    e.dataTransfer!.effectAllowed = 'none'
  }
})

const app = createApp(defineComponent({
  setup() {
    provide(kFlights, (window as any).flights || {})
    provide(kTaskManager, useTaskManager())
    provide(kServiceFactory, useServiceFactory())
    provide(kDialogModel, useDialogModel())
    provide(kSWRVConfig, useSWRVConfig())

    return () => h(Context, [h(App)])
  },
}))

app.component('TextComponent', TextComponent)
app.use(vuetify)
app.use(i18n)
app.use(router)
app.mount('#app')
