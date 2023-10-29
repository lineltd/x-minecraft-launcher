<template>
  <div class="mb-1">
    <v-list-group
      v-model="expanding"
      push
      color="currentColor"
      class="non-moveable"
      prepend-icon="home"
      link
      @click.capture="onHomeClick"
    >
      <v-list-item
        v-shared-tooltip.right="_ => t('home', 2)"
        link
        push
        to="/"
        class="non-moveable"
      >
        <v-list-item-icon>
          <v-icon>
            home
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title v-text="'Text'" />
      </v-list-item>
      <v-list-item
        v-shared-tooltip.right="_ => t('mod.name', 2)"
        link
        push
        to="/mods"
        class="non-moveable"
      >
        <v-list-item-icon>
          <v-icon>
            extension
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title v-text="'Text'" />
      </v-list-item>
      <v-list-item
        v-shared-tooltip.right="_ => t('resourcepack.name', 2)"
        link
        push
        to="/resource-pack-setting"
        class="non-moveable"
      >
        <v-list-item-icon>
          <v-icon> palette </v-icon>
        </v-list-item-icon>
        <v-list-item-title v-text="'Text'" />
      </v-list-item>
      <v-list-item
        v-shared-tooltip.right="_ => t('shaderPack.name', 2)"
        link
        push
        to="/shader-pack-setting"
        class="non-moveable"
      >
        <v-list-item-icon>
          <v-icon> gradient </v-icon>
        </v-list-item-icon>
        <v-list-item-title v-text="'Text'" />
      </v-list-item>
      <v-divider />

      <v-list-item
        id="select-game-button"
        v-shared-tooltip.right="_ => t('instances.choose')"
        push
        link
        to="/instances"
        class="non-moveable"
      >
        <v-list-item-icon>
          <v-icon>apps</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Instances</v-list-item-title>
      </v-list-item>
      <v-spacer />
    </v-list>
  </div>

  <v-tooltip
    color="black"
    transition="scroll-x-transition"
    :close-delay="0"
    right
  >
    <template #activator="{ props: tooltip }">
      <v-list-item
        push
        link
        to="/instances"
        class="non-moveable"
        v-bind="tooltip"
      >
        <template #prepend>
          <v-icon>apps</v-icon>
        </template>
        <v-list-item-title>Instances</v-list-item-title>
      </v-list-item>
    </template>
    {{ t('instances.choose') }}
  </v-tooltip>
  <v-spacer />
</template>
<script lang="ts" setup>
import { vSharedTooltip } from '@/directives/sharedTooltip'

const router = useRouter()
const expanding = ref(false)
const subRoutes = new Set([
  '/',
  '/base-setting',
  '/mods',
  '/resource-pack-setting',
  '/shader-pack-setting',
])
expanding.value = subRoutes.has(router.currentRoute.value.fullPath)

router.afterEach((to) => {
  if (!subRoutes.has(to.fullPath)) {
    expanding.value = false
  } else {
    expanding.value = true
  }
})
const { t } = useI18n()
</script>
