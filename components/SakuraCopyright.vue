<script lang="ts" setup>
import { useSiteConfig, useThemeConfig } from 'valaxy'
import { computed } from 'vue'
import type { Footer } from 'valaxy-theme-sakura'

const props = defineProps<{
  footer?: Footer
}>()

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const footer = computed(() => props.footer || themeConfig.value.footer)

const year = new Date().getFullYear()

const copyrightText = computed(() => {
  if (year === footer.value.since)
    return `${footer.value.since} - 至今`

  return `${footer.value.since} - ${year}`
})

const footerIcon = computed(() => footer.value.icon!)
</script>

<template>
  <div class="sakura-copyright copyright flex items-center justify-center gap-2 px-1 text-center">
    <span>
      Copyright &copy;
      <span itemprop="copyrightYear">{{ copyrightText }}</span>
    </span>

    <a v-if="footer.icon?.enable" class="inline-flex animate-pulse" :href="footerIcon.url" target="_blank" :title="footerIcon.title">
      <div :class="footerIcon.name" />
    </a>
    <img v-if="!footer.icon?.enable && footerIcon.img" class="h-6 w-6 inline-flex animate-pulse" :src="footerIcon.img" title="Footer Icon Description">

    <span itemprop="copyrightHolder">{{ siteConfig.author.name }}</span>
  </div>
</template>