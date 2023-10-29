<template>
  <div v-ripple class="non-moveable mx-3 rounded-lg items-center justify-center flex cursor-pointer" @click="onClick">
    <v-tooltip :close-delay="0" right color="black" transition="scroll-x-transition">
      <template #activator="{ props }">
        <v-avatar size="48" v-if="avatar"
          class="bg-[rgba(80,80,80,0.4)] transition-all duration-300 hover:rounded-xl hover:bg-green-500" large
          v-bind="props">
          <v-badge :color="transparentBadge ? 'transparent' : undefined" right overlap :model-value="badge">
            <template #badge>
              <slot></slot>
            </template>
            <v-icon :icon="icon" />
          </v-badge>
        </v-avatar>
        <div v-else class="item transition-all" :class="{ active: active }" v-bind="props" @click="emit('click')">
          <v-badge :color="transparentBadge ? 'transparent' : undefined" right overlap :model-value="badge">
            <template #badge>
              <slot></slot>
            </template>
            <v-icon :icon="icon" />
          </v-badge>
        </div>
      </template>
      {{ tooltip }}
    </v-tooltip>
  </div>
</template>
<script setup lang="ts">

const props = defineProps<{
  icon: string
  active?: boolean
  tooltip?: string
  avatar?: boolean
  badge?: boolean
  transparentBadge?: boolean
  push?: string
}>()
const emit = defineEmits<{
  (event: 'click'): void
}>()

const { push } = useRouter()
const onClick = () => {
  if (props.push) {
    push(props.push)
  }
  emit('click')
}
</script>
<style scoped>
.item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.item:before {
  content: ' ';
  position: absolute;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms;
}

.item:before:hover {
  background-color: gray;
  background-color: var(--primary);
}

.item:before:active {
  color: var(--primary);
  background-color: var(--primary);
}
</style>
