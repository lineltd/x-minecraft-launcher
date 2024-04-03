<template>
  <div class="mb-0 flex flex-col">
    <div
      class="flex flex-1 flex-grow-0 flex-row items-center justify-center"
    >
      <div
        class="flex flex-grow-0 flex-row items-center justify-center gap-1"
      >
        <AvatarItemList :items="extensionItems" />
      </div>
      <div class="flex-grow" />
    </div>
    <MarketExtensions />
  </div>
</template>

<script lang=ts setup>
import AvatarItemList from '@/components/AvatarItemList.vue'
import MarketExtensions from '@/components/MarketExtensions.vue'
import { kInstance } from '@/composables/instance'
import { kModsSearch } from '@/composables/modSearch'
import { getExtensionItemsFromRuntime } from '@/util/extensionItems'
import { injection } from '@/util/inject'

const { runtime: version } = injection(kInstance)
const { modrinth, curseforge, instanceMods, cachedMods, modLoaderFilters, curseforgeCategory, modrinthCategories, isCurseforgeActive, isModrinthActive, sort } = injection(kModsSearch)
const { t } = useI18n()

const search = (v: string | undefined) => {
  if (v !== route.query.keyword) {
    replace({ query: { ...route.query, keyword: v } })
  }
}
const { replace } = useRouter()
const route = useRoute()
const _keyword = computed({
  get: () => route.query.keyword as string ?? '',
  set: (v) => { search(v) },
})

const extensionItems = computed(() => [
  {
    icon: 'folder_zip',
    title: t('mod.name', { count: 2 }),
    text: t('mod.enabled', { count: instanceMods.value.length }),
  },
  ...getExtensionItemsFromRuntime(version.value),
])

</script>
