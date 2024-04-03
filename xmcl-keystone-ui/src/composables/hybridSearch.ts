import { CurseforgeProps, useCurseforge, useCurseforgeCategories, useCurseforgeCategoryI18n } from './curseforge'
import { useMarketSort } from './marketSort'
import { ModrinthOptions, useModrinth, useModrinthTags } from './modrinth'
import { useSortByItems } from './sortBy'
import { useDateString } from './date'
import { FileModLoaderType } from '@xmcl/curseforge'
import { ExploreProject } from '@/components/StoreExploreCard.vue'
import { getExpectedSize } from '@/util/size'
import { CategoryChipProps } from '@/components/CategoryChip.vue'
import { Ref } from 'vue'
import { merge } from '@/util/merge'

export function useHybridSearch(
  type: Ref<'modpacks' | 'mod' | 'resourcepack'>,
  _query: Ref<string>,
  _gameVersion: Ref<string>,
  _modLoader: Ref<string>,
  curseforgeCategory: Ref<number | undefined>,
  modrinthCategories: Ref<string[]>,
  page: Ref<number>,
  sort: Ref<number>,
  isCurseforgeActive: Ref<boolean>,
  isModrinthActive: Ref<boolean>,
) {
  const tCategory = useCurseforgeCategoryI18n()
  const { t } = useI18n()
  const { refreshing: refreshingTag, categories, modLoaders, gameVersions, error: tagError } = useModrinthTags()
  const { getDateString } = useDateString()

  const { modrinthSort, curseforgeSort } = useMarketSort(0, sort)
  // Modrinth
  const data: ModrinthOptions = reactive({
    query: _query,
    gameVersion: _gameVersion,
    license: '',
    category: modrinthCategories,
    modLoader: _modLoader,
    environment: '',
    sortBy: modrinthSort as any,
    projectType: computed(() => type.value === 'modpacks' ? 'modpack' : type.value),
    page,
  })

  const {
    error: modrinthError,
    refreshing: isModrinthSearching, projects, pageCount,
  } = useModrinth(data)

  // Curseforge
  const curseforgeData: CurseforgeProps = reactive({
    type: computed(() => type.value === 'modpacks' ? 'modpacks' : type.value === 'resourcepack' ? 'texture-packs' : 'mc-mods'),
    page,
    keyword: _query,
    category: curseforgeCategory,
    sortField: curseforgeSort as any,
    modLoaderType: computed(() => {
      return _modLoader.value === 'forge'
        ? FileModLoaderType.Forge
        : _modLoader.value === 'fabric'
          ? FileModLoaderType.Fabric
          : _modLoader.value === 'quilt'
            ? FileModLoaderType.Quilt
            : FileModLoaderType.Any
    }),
    sortOrder: 'desc',
    gameVersion: _gameVersion,
    from: '',
  })
  const { projects: curseforgeProjects, refreshing: isCurseforgeSearching, error: curseError } = useCurseforge(curseforgeData)

  const items = computed(() => {
    const modrinths = projects.value.map((p) => {
      const mapped: ExploreProject = {
        id: p.project_id,
        type: 'modrinth',
        title: p.title,
        icon_url: p.icon_url,
        description: p.description,
        author: p.author,
        labels: [
          { icon: 'file_download', text: getExpectedSize(p.downloads, '') },
          { icon: 'event', text: getDateString(p.date_created) },
          { icon: 'edit', text: getDateString(p.date_modified) },
          { icon: 'local_offer', text: p.versions[p.versions.length - 1] },
        ],
        tags: p.categories.map(c => ({ icon: categories.value.find(cat => cat.name === c)?.icon, text: t(`modrinth.categories.${c}`, c) })),
        gallery: p.gallery,
      }
      return mapped
    })
    const curseforges = curseforgeProjects.value.map((p) => {
      const existed = new Set<number>()
      const tags = p.categories.map(c => {
        if (existed.has(c.id)) return undefined
        existed.add(c.id)
        return { icon: c.iconUrl, text: tCategory(c.name) } as CategoryChipProps
      }).filter((v): v is CategoryChipProps => v !== undefined)
      const mapped: ExploreProject = {
        id: p.id.toString(),
        type: 'curseforge',
        title: p.name,
        icon_url: p.logo.thumbnailUrl,
        description: p.summary,
        author: p.authors[0].name,
        labels: [
          { icon: 'file_download', text: getExpectedSize(p.downloadCount, '') },
          { icon: 'event', text: getDateString(p.dateModified) },
          { icon: 'edit', text: getDateString(p.dateModified) },
          { icon: 'local_offer', text: p.latestFilesIndexes[0].gameVersion },
        ],
        tags,
        gallery: p.screenshots.map(s => s.thumbnailUrl),
      }
      return mapped
    })

    if ((curseforgeData.category && data.category.length === 0) || !isModrinthActive.value) {
      return curseforges
    }
    if ((data.category.length > 0 && curseforgeData.category === '') || !isCurseforgeActive.value) {
      return modrinths
    }

    return merge((modrinths), curseforges)
  })

  const error = computed(() => modrinthError.value || curseError.value || tagError.value)
  const isValidating = computed(() => isModrinthSearching.value || isCurseforgeSearching.value || refreshingTag.value)
  return { items, error, isValidating, pageCount }
}
