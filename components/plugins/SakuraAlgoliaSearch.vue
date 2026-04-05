<script setup lang="ts">
import { ref } from 'vue'
import { getAddonModule, isEmptyAddon } from 'valaxy'
import * as addonAlgoliaNs from 'valaxy-addon-algolia'
import { algoliaRef } from 'valaxy-theme-sakura/plugins/algolia.ts'

defineProps<{
  open: boolean
}>()

const addonAlgolia = getAddonModule<typeof import('valaxy-addon-algolia')>(addonAlgoliaNs)

if (isEmptyAddon(addonAlgolia))
  throw new Error('Please install `valaxy-addon-algolia` to use this plugin.')

const addonAlgoliaState = addonAlgolia.useAddonAlgolia?.()

const loaded = addonAlgoliaState?.loaded ?? ref(false)
const load = addonAlgoliaState?.load ?? (() => {})
const dispatchEvent = addonAlgoliaState?.dispatchEvent ?? (() => {})

defineExpose({
  loaded,
  load,
  dispatchEvent,
})
</script>

<template>
  <AlgoliaSearchBox v-if="loaded" ref="algoliaRef" class="hidden" />
</template>