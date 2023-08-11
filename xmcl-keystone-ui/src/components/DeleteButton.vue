<template>
  <v-fab-transition>
    <v-btn
      v-if="visible"
      large
      absolute
      bottom
      color="error"
      icon="delete"
      class="rounded-circle"
      @dragover.prevent
      @drop="drop"
    />
  </v-fab-transition>
</template>

<script lang=ts setup>
defineProps<{
  visible: boolean
  drop(dropEvent: DragEvent): void
}>()
</script>
