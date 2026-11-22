<script setup lang="ts">
import { association } from '../../data/site'

defineProps<{
  variant: 'compact' | 'banner'
  decorative?: boolean
}>()

const bannerSrcset = [480, 840, 1260, 1672]
  .map(width => `/images/brand/atil-banner-${width}.webp ${width}w`)
  .join(', ')
</script>

<template>
  <picture v-if="variant === 'compact'" class="atil-brand-mark">
    <source
      type="image/webp"
      srcset="/images/brand/atil-mark-256.webp 256w, /images/brand/atil-mark-512.webp 512w"
      sizes="(max-width: 640px) 56px, 72px"
    >
    <img
      :src="association.brand.mark"
      :alt="decorative ? '' : association.name"
      width="1254"
      height="1254"
      loading="lazy"
      decoding="async"
    >
  </picture>
  <picture v-else class="atil-brand-banner">
    <source type="image/webp" :srcset="bannerSrcset" sizes="(min-width: 920px) 840px, calc(100vw - 64px)">
    <img
      :src="association.brand.banner"
      :alt="decorative ? '' : `${association.name} 绿金品牌横图`"
      width="1672"
      height="941"
      fetchpriority="high"
      decoding="async"
    >
  </picture>
</template>

<style scoped>
.atil-brand-mark {
  --mark-size: clamp(64px, 8vw, 96px);
  box-sizing: border-box;
  display: grid;
  flex: none;
  place-items: center;
  inline-size: var(--mark-size);
  aspect-ratio: 1;
  padding: calc(var(--mark-size) * .12);
  border-radius: 8px;
  background: var(--atil-bg, #073e34);
}

.atil-brand-mark img,
.atil-brand-banner img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.atil-brand-banner {
  display: block;
  width: 100%;
  max-width: 840px;
}

.atil-brand-banner img {
  border-radius: 12px;
}
</style>
