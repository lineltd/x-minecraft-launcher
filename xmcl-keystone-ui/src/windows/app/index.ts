import TextComponent from '@/components/TextComponent'
import { kSemaphores, kServiceFactory, useSemaphores, useServiceFactory } from '@/composables'
import { kDialogModel, useDialogModel } from '@/composables/dialog'
import { kSWRVConfig, useSWRVConfig } from '@/composables/swrvConfig'
import { kTaskManager, useTaskManager } from '@/composables/taskManager'
import { i18n } from '@/i18n'
import { vuetify } from '@/vuetify'
import 'virtual:uno.css'
import { defineComponent, h, provide } from 'vue'
import App from './App.vue'
import { router } from './router'
import { kExceptionHandlers, useExceptionHandlers } from '@/composables/exception'
import Context from './Context'

// to prevent the universal drop activated on self element dragging
document.addEventListener('dragstart', (e) => {
  if (e.dataTransfer?.effectAllowed === 'uninitialized') {
    e.dataTransfer!.effectAllowed = 'none'
  }
})

const app = createApp(defineComponent({
  setup() {
    provide(kServiceFactory, useServiceFactory())
    provide(kSemaphores, useSemaphores())
    provide(kExceptionHandlers, useExceptionHandlers())
    provide(kDialogModel, useDialogModel())
    provide(kTaskManager, useTaskManager())
    provide(kServiceFactory, useServiceFactory())
    provide(kDialogModel, useDialogModel())
    provide(kSWRVConfig, useSWRVConfig())

    return () => h(Context, [h(App)])
  },
}))

app.component('TextComponent', TextComponent)
app.use(i18n)
app.use(router)
app.use(vuetify)
app.mount('#app')

const params = window.location.search.substring(1)
if (params.startsWith('route=')) {
  const route = decodeURIComponent(params.substring('route='.length))
  const split = route.split('/')
  if (split.length > 2) {
    const base = split.slice(0, split.length - 1).join('/')
    if (base.endsWith('curseforge')) {
      router.replace(route)
      console.log(`Replace to ${route}`)
    } else {
      router.replace(base)
      console.log(`Replace to ${base}`)
      router.push(route)
      console.log(`Push to ${route}`)
    }
  } else {
    router.replace(route)
    console.log(`Replace to ${route}`)
  }
}

router.afterEach((to, from) => {
  console.log(`Route changed from ${from.path} to ${to.path}`)
})

window.addEventListener('message', (e) => {
  if (e.data.route) {
    if (router.currentRoute.value.path !== e.data.route) {
      router.push(e.data.route)
    }
    windowController.focus()
  }
})
