<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent } from 'vue'
import { useSakuraAppStore } from 'valaxy-theme-sakura/stores/app.ts'

const sakura = useSakuraAppStore()
const siteConfig = useSiteConfig()

const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')
const isFuse = computed(() => siteConfig.value.search.type === 'fuse')

const SakuraAlgoliaSearch = isAlgolia.value
  ? defineAsyncComponent(() => import('./plugins/SakuraAlgoliaSearch.vue'))
  : null
</script>

<template>
  <div flex="center">
    <SakuraSearchBtn :open="sakura.search.isOpen && !isAlgolia" @open="sakura.search.open" @close="sakura.search.close" />

    <SakuraAlgoliaSearch v-if="isAlgolia" :open="sakura.search.isOpen" @close="sakura.search.close" />
    <SakuraSearch v-else-if="isFuse" :open="sakura.search.isOpen" @close="sakura.search.close" />
  </div>
</template>