<script setup lang="ts">
import { getAddonModule, isEmptyAddon } from 'valaxy'
import * as addonTwikooNs from 'valaxy-addon-twikoo'
import 'valaxy-addon-twikoo/client/styles/index.scss'

const addonTwikoo = getAddonModule<typeof import('valaxy-addon-twikoo')>(addonTwikooNs)

if (isEmptyAddon(addonTwikoo))
  throw new Error('Please install `valaxy-addon-twikoo` to use this plugin.')

addonTwikoo.useTwikooWithOptions?.()
</script>

<template>
  <div id="twikoo" />
</template>