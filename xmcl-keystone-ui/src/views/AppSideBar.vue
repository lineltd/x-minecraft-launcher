<template>
  <div
    class="sidebar moveable z-10 gap-2 mb-2"
    :style="{ 'backdrop-filter': `blur(${blurSidebar}px)`, backgroundColor: sideBarColor }"
  >
    <v-list
      nav
      dense
      class="ml-1 flex flex-grow-1 flex-col justify-start overflow-auto px-2"
    >
      <AppSideBarItem
        class="non-moveable"
        @click="goBack"
        icon="arrow_back"
      >
      </AppSideBarItem>
      <v-list-group
        v-model="expanding"
        v-shared-tooltip.right="_ => t('myStuff')"
        active-class="v-list-item--link"
        :append-icon="undefined"
        class="non-moveable avatar"
      >
        <template #activator>
          <v-list-item-icon>
            <v-icon> widgets </v-icon>
          </v-list-item-icon>
        </template>

        <v-list-item
          v-shared-tooltip.right="_ => t('modpack.name', 2) + ' & ' + t('localVersion.title')"
          link
          push
          to="/local-resources"
          class="non-moveable"
        >
          <v-list-item-icon>
            <v-icon> inventory </v-icon>
          </v-list-item-icon>
          <v-list-item-title v-text="'Text'" />
        </v-list-item>

        <v-list-item
          v-if="sideBarShowCurseforge"
          v-shared-tooltip.right="'Curseforge'"
          link
          class="non-moveable"
          @click="goToCurseforge()"
        >
          <v-list-item-icon>
            <v-icon
              :size="28"
              class="mr-0.5"
            >
            xmcl:curseforge
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>Curseforge</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="sideBarShowModrinth"
          v-shared-tooltip.right="'Modrinth'"
          link
          class="non-moveable"
          @click="goToModrinth()"
        >
          <v-list-item-icon>
            <v-icon>
              xmcl:modrinth
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>Modrinth</v-list-item-title>
        </v-list-item>
      </v-list-group>
      <v-list-item
        v-if="true"
        v-shared-tooltip.right="_ => t('store.name', 2)"
        link
        push
        to="/store"
        class="non-moveable"
      >
        <v-list-item-icon>
          <v-icon
            :size="28"
          >
            store
          </v-icon>
        </v-list-item-icon>
        <v-list-item-title v-text="'Text'" />
      </v-list-item>
      <v-divider />
    </v-list>

    <AppSideBarContentFocus v-if="useFocus" />
    <AppSideBarContentNext v-else />

    <v-list
      nav
      dense
      class="ml-1 px-2"
      style=""
    >
      <v-list-item
        v-shared-tooltip.right="_ => t('multiplayer.name')"
        push
        link
        class="non-moveable"
        to="/multiplayer"
      >
        <v-list-item-icon>
          <v-icon
            :size="23"
          >
            hub
          </v-icon>
        </v-list-item-icon>
        <v-list-item-title>Multiplayer</v-list-item-title>
      </v-list-item>

    <div class="flex flex-col gap-2">
      <AppSideBarItem
        icon="hub"
        :tooltip="t('multiplayer.name')"
        to="/multiplayer"
      />
      <v-divider
        class="mx-1 block"
      />

      <v-list-item
        v-shared-tooltip.right="_ => t('setting.name', 2)"
        link
        push
        to="/setting"
        class="non-moveable"
      >
        <v-list-item-icon>
          <v-badge
            right
            overlap
            :value="state?.updateStatus !== 'none'"
          >
            <template #badge>
              <span>{{ 1 }}</span>
            </template>
            <v-icon>
              settings
            </v-icon>
          </v-badge>
        </v-list-item-icon>
        <v-list-item-title>Settings</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang=ts setup>
import { useLocalStorageCacheBool } from '@/composables/cache'
import { kSettingsState } from '@/composables/setting'
import { kMarketRoute } from '@/composables/useMarketRoute'
import { injection } from '@/util/inject'
import { useBarBlur } from '../composables/background'
import { kColorTheme } from '../composables/colorTheme'
import { kUILayout } from '../composables/uiLayout'
import AppSideBarContentFocus from './AppSideBarContentFocus.vue'
import AppSideBarContentNext from './AppSideBarContentNext.vue'
import { vSharedTooltip } from '@/directives/sharedTooltip'

const { blurSidebar } = useBarBlur()
const layout = injection(kUILayout)
const useFocus = computed(() => layout.value === 'focus')
const { state } = injection(kSettingsState)

const sideBarShowCurseforge = useLocalStorageCacheBool('sideBarShowCurseforge', true)
const sideBarShowModrinth = useLocalStorageCacheBool('sideBarShowModrinth', true)

const { t } = useI18n()
const { sideBarColor } = injection(kColorTheme)
const { push, back, currentRoute } = useRouter()
const expanding = ref(false)

const navToMe = () => {
  if (currentRoute.value.path !== 'me') {
    push('/me')
  }
}

const { goToCurseforge, goToModrinth, goToFtb } = injection(kMarketRoute)

function goBack() {
  back()
}

</script>

<style scoped>
.sidebar {
  min-width: 80px;
  max-width: 80px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

</style>
<style>

.v-navigation-drawer__content {
  @apply flex flex-col flex-grow-0 h-full;
}

.sidebar .v-list .v-list-item--active .v-icon {
  /* color: #4caf50 !important; */
  color: var(--primary);
}

.sidebar .v-list-item--link:before {
  @apply text-white;
}

.sidebar .theme--dark.v-list-item--active:hover:before {
  opacity: .5;
}

.sidebar .theme--light.v-list-item--active:before {
  opacity: .25;
  background-color: gray;
}

.avatar .v-list-group__header.v-list-item--active:not(:hover):not(:focus):before {
  opacity: .24;
}
</style>
