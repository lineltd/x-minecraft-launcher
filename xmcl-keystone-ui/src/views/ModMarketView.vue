<template>
  <div
    class="relative flex h-full w-full flex-col"
    style="min-height: min-content;"
  >
    <div class="z-3 flex w-full">
      <v-card
        class="hide-underline flex items-center gap-2 p-1"
        solo
      >
        <v-btn-toggle
          v-model="_modLoader"
          borderless
        >
          <v-btn
            icon
            text
            value="forge"
          >
            <v-img
              width="28"
              :src="'http://launcher/icons/forge'"
            />
          </v-btn>

          <v-btn
            icon
            text
            value="fabric"
          >
            <v-img
              width="28"
              :src="'http://launcher/icons/fabric'"
            />
          </v-btn>

          <v-btn
            icon
            text
            value="quilt"
          >
            <v-img
              width="28"
              :src="'http://launcher/icons/quilt'"
            />
          </v-btn>
        </v-btn-toggle>
        <v-combobox
          v-model="_gameVersion"
          class="min-w-40 w-40 flex-grow-0"
          solo
          flat
          :label="t('minecraftVersion.name')"
          clearable
          :items="versions.map(v => v.id)"
          hide-details
        />
        <div class="flex-grow" />
        <MarketTextFieldWithMenu
          :placeholder="t('mod.search')"
          :keyword.sync="keyword"
          :curseforge-category.sync="curseforgeCategory"
          :modrinth-categories.sync="modrinthCategories"
          curseforge-category-filter="mc-mods"
          modrinth-category-filter="mod"
          :enable-curseforge.sync="isCurseforgeActive"
          :enable-modrinth.sync="isModrinthActive"
          :sort.sync="sort"
        />
      </v-card>
    </div>

    <div
      v-if="!error && items.length > 0"
      class="flex flex-col gap-3 overflow-auto lg:px-2.5"
    >
      <StoreExploreCard
        v-for="mod in items"
        :key="mod.id"
        v-ripple
        :disabled="false"
        :value="mod"
        class="cursor-pointer"
        @click="onSelect(mod)"
      />

      <div class="min-h-14 max-h-14 w-full p-1" />
    </div>
    <Hint
      v-if="items.length === 0"
      icon="mood_bad"
      :size="80"
      :text="`No search result for ${_query}`"
    />
    <ErrorView :error="error" />

    <div
      class="hover:(scale-100 opacity-100) absolute bottom-3 z-10 h-[56px] w-full scale-90 transform opacity-60 transition"
    >
      <v-pagination
        v-model="page"
        :length="20"
        color="success"
        :disabled="isValidating"
        :total-visible="12"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import ErrorView from '@/components/ErrorView.vue'
import Hint from '@/components/Hint.vue'
import MarketTextFieldWithMenu from '@/components/MarketTextFieldWithMenu.vue'
import StoreExploreCard, { ExploreProject } from '@/components/StoreExploreCard.vue'
import { useHybridSearch } from '@/composables/hybridSearch'
import { useQuery, useQueryBoolean, useQueryNumber, useQueryStringArray } from '@/composables/query'
import { useMinecraftVersions } from '@/composables/version'
import { RuntimeVersions } from '@xmcl/runtime-api'

const props = defineProps<{ runtime: RuntimeVersions }>()

const _query = useQuery('query')
const _gameVersion = useQuery('gameVersion')
const _modLoader = useQuery('modLoader')
const page = useQueryNumber('page', 1)
const sort = useQueryNumber('sort', 0)
const curseforgeCategory = useQueryNumber('curseforgeCategory', undefined as number | undefined)
const modrinthCategories = useQueryStringArray('modrinthCategory')
const isModrinthActive = useQueryBoolean('modrinthActive', true)
const isCurseforgeActive = useQueryBoolean('curseforgeActive', true)
const { t } = useI18n()
const keyword = ref(_query.value)

watch(() => props.runtime, (runtime) => {
  if (runtime.minecraft) {
    _gameVersion.value = runtime.minecraft
  }
  if (runtime.forge) {
    _modLoader.value = 'forge'
  } else if (runtime.fabric) {
    _modLoader.value = 'fabric'
  } else if (runtime.quilt) {
    _modLoader.value = 'quilt'
  }
}, { immediate: true })

const gameVersion = computed(() => _gameVersion.value || props.runtime.minecraft)
const { versions, mutate } = useMinecraftVersions()
onMounted(() => {
  if (versions.value.length === 0) {
    mutate()
  }
})
const { items, error, isValidating } = useHybridSearch(
  ref('mod'),
  _query,
  gameVersion,
  _modLoader,
  curseforgeCategory,
  computed(() => modrinthCategories.value.filter(v => v)),
  page,
  sort,
  isCurseforgeActive,
  isModrinthActive,
)

const { push } = useRouter()
function onSelect(mod: ExploreProject) {
  if (mod.type === 'modrinth') {
    push({ query: { id: `modrinth:${mod.id}` } })
  } else if (mod.type === 'curseforge') {
    push({ query: { id: `curseforge:${mod.id}` } })
  }
}

</script>
