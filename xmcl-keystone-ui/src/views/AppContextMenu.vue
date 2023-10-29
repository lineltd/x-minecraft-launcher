<template>
  <v-menu
    v-model="shown"
    :position-x="x"
    :position-y="y"
    absolute
    offset-y
    z-index="205"
  >
    <v-list dense>
      <template
        :key="item.text"
        v-for="(item, index) in items"
      >
        <v-list-item
          class="min-w-40 mx-1 rounded-lg"
          @click="item.onClick"
        >
          <template #prepend>
            <v-icon
              :size="item.icon === 'xmcl:curseforge' ? 22 : undefined"
              :color="item.color || ''"
            >
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
        <v-divider
          v-if="index !== items.length - 1"
        />
      </template>
    </v-list>
  </v-menu>
</template>

<script lang=ts setup>
import { useContextMenuData } from '../composables/contextMenu'

const { x, y, items, shown } = useContextMenuData()
document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape' && shown.value) {
    shown.value = false
    e.preventDefault()
    e.stopPropagation()
  }
}, { capture: true })
</script>
