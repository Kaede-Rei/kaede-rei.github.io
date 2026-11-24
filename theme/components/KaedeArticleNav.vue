<script setup lang="ts">
import { useRoute } from 'vue-router'
import { vViewportEntrance } from '../utils/viewport-entrance'
const route = useRoute()
const sections = [
  { to: '/archives', label: '归档' },
  { to: '/categories', label: '分类' },
  { to: '/tags', label: '标签' },
]
</script>

<template>
  <nav v-viewport-entrance.fade class="kaede-article-nav" aria-label="文章浏览方式">
    <RouterLink v-for="section in sections" :key="section.to" :to="section.to"
      :aria-current="route.path.replace(/\/$/, '') === section.to ? 'page' : undefined">{{ section.label }}</RouterLink>
  </nav>
</template>
