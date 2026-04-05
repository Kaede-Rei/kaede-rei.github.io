<script lang="ts" setup>
import { computed } from 'vue'
import { getAddonModule, isEmptyAddon } from 'valaxy'
import * as addonWalineNs from 'valaxy-addon-waline'

const addonWaline = getAddonModule<typeof import('valaxy-addon-waline')>(addonWalineNs)

if (isEmptyAddon(addonWaline))
  throw new Error('Please install `valaxy-addon-waline` to use this plugin.')

const addonWalineState = addonWaline.useAddonWaline?.()
const walineOptions = computed(() => addonWalineState?.options ?? {})
</script>

<template>
  <WalineClient w="full" :options="walineOptions" />
</template>