<script setup lang="ts">
interface TocItem {
  id: string
  number?: string
  text: string
  children: TocItem[]
}

defineProps<{
  items: TocItem[]
  currentId?: string
  currentRoot?: string
  focusedRoot?: string
  showAll: boolean
  nested?: boolean
}>()

const emit = defineEmits<{ jump: [event: MouseEvent, id: string] }>()
</script>

<template>
  <ul class="kaede-toc-items" :class="{ 'is-nested': nested }">
    <li v-for="item in items" :key="item.id" :data-toc-root="nested ? undefined : item.id">
      <a data-toc-link :href="`#${encodeURIComponent(item.id)}`"
        :aria-current="currentId === item.id ? 'location' : undefined" @click="emit('jump', $event, item.id)">
        <span v-if="item.number" class="kaede-toc-number">{{ item.number }}</span>
        <span class="kaede-toc-text">{{ item.text }}</span>
      </a>
      <KaedeTocItems v-if="item.children.length && (nested || showAll || item.id === currentRoot || item.id === focusedRoot)"
        :items="item.children" :current-id="currentId" :show-all="showAll" nested
        @jump="(event, id) => emit('jump', event, id)" />
    </li>
  </ul>
</template>
