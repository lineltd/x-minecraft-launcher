<template>
  <v-app
    class="h-full max-h-[100vh] overflow-auto overflow-x-hidden"
    :class="{ 'dark': darkTheme }"
    :style="cssVars"
  >
    <AppSystemBar
      no-task
      no-user
      back
    >
      <span
        v-if="currentRoute.path.startsWith('/modrinth')"
        class="flex items-center"
      >
        <v-icon small>
          xmcl:modrinth
        </v-icon>
        Modrinth
      </span>
      <span
        v-else-if="currentRoute.path.startsWith('/curseforge')"
        class="flex items-center"
      >
        <v-icon small>
          xmcl:curseforge
        </v-icon>
        CurseForge
      </span>
      <span
        v-else
        class="flex items-center"
      >
        <v-icon small>
          xmcl:ftb
        </v-icon>
        FeedTheBeast
      </span>
    </AppSystemBar>
    <div
      class="relative flex h-full overflow-auto"
    >
      <main
        class="relative inset-y-0 right-0 flex max-h-full flex-col overflow-auto"
        :class="{ solid: !blurMainBody }"
      >
        <transition
          name="fade-transition"
          mode="out-in"
          @after-enter="end"
          @leave="start"
        >
          <router-view class="z-2" />
        </transition>
      </main>
    </div>
    <AppContextMenu />
    <AppNotifier />
    <AppImageDialog />
    <AppSharedTooltip />
  </v-app>
</template>

<script lang=ts setup>
import '@/assets/common.css'
import AppImageDialog from '@/components/AppImageDialog.vue'
import AppSharedTooltip from '@/components/AppSharedTooltip.vue'
import { useExternalRoute, useTheme } from '@/composables'
import { useBackground } from '@/composables/background'
import { kColorTheme } from '@/composables/colorTheme'
import { useDefaultErrorHandler } from '@/composables/errorHandler'
import { useNotifier } from '@/composables/notifier'
import { useBlockSharedTooltip } from '@/composables/sharedTooltip'
import { injection } from '@/util/inject'
import AppContextMenu from '@/views/AppContextMenu.vue'
import AppNotifier from '@/views/AppNotifier.vue'
import AppSystemBar from '@/views/AppSystemBar.vue'

const { cssVars } = injection(kColorTheme)
const { blurMainBody } = useBackground()

const { darkTheme } = useTheme()
const { notify } = useNotifier()
useDefaultErrorHandler(notify)

const { currentRoute } = useRouter()
useExternalRoute()

const { start, end } = useBlockSharedTooltip()

</script>

<style scoped>
.clip-head {
  clip-path: inset(0px 30px 30px 0px) !important;
  width: 64px;
  height: auto; /*to preserve the aspect ratio of the image*/
}
.v-input__icon--prepend {
  margin-right: 7px;
}
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* main {
  border-left: 1px solid hsla(0,0%,100%,.12);
  border-top: 1px solid hsla(0,0%,100%,.12);
  border-top-left-radius: 0.5rem;
} */
</style>
