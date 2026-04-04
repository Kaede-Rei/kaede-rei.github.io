<script setup lang="ts">
import { usePrevNext, useThemeConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface NavItem {
  path: string
  slug: string
  title: string
  cover?: string
}

const route = useRoute()
const router = useRouter()
const themeConfig = useThemeConfig()
const [blogPrev, blogNext] = usePrevNext()

const navigationMerge = computed(() => themeConfig.value.postFooter?.navigationMerge || false)

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith('/'))
    return path.slice(0, -1)

  return path
}

function parseLearningPathArticle(path: string) {
  const normalizedPath = normalizePath(path)
  const match = normalizedPath.match(/^\/learning-path\/([^/]+)\/([^/]+)$/)
  if (!match)
    return null

  const [, track, slug] = match
  if (!slug || slug === 'index')
    return null

  return {
    track,
    slug,
    base: `/learning-path/${track}`,
  }
}

function isStepSlug(slug: string) {
  return /^\d+(?:[-.]\d+)*$/.test(slug)
}

function getStepParts(slug: string) {
  return slug
    .split(/[-.]/)
    .map(part => Number.parseInt(part, 10))
    .filter(part => Number.isFinite(part))
}

function compareLearningSlug(a: string, b: string) {
  const aIsStep = isStepSlug(a)
  const bIsStep = isStepSlug(b)

  if (aIsStep && bIsStep) {
    const aParts = getStepParts(a)
    const bParts = getStepParts(b)
    const maxLen = Math.max(aParts.length, bParts.length)

    for (let i = 0; i < maxLen; i++) {
      const av = aParts[i] ?? -1
      const bv = bParts[i] ?? -1
      if (av !== bv)
        return av - bv
    }

    return a.localeCompare(b, 'zh-CN')
  }

  if (aIsStep)
    return -1

  if (bIsStep)
    return 1

  return a.localeCompare(b, 'zh-CN')
}

const learningPathNav = computed(() => {
  const matched = parseLearningPathArticle(route.path)
  if (!matched)
    return null

  const sectionPrefix = `${matched.base}/`
  const currentPath = normalizePath(route.path)
  const itemMap = new Map<string, NavItem>()

  router
    .getRoutes()
    .filter(record => !record.aliasOf)
    .filter(record => normalizePath(record.path).startsWith(sectionPrefix))
    .filter((record) => {
      const path = normalizePath(record.path)
      return path !== matched.base && path !== `${matched.base}/`
    })
    .filter(record => /^\/learning-path\/[^/]+\/[^/]+$/.test(normalizePath(record.path)))
    .map((record) => {
      const path = normalizePath(record.path)
      const slug = path.slice(sectionPrefix.length)
      const frontmatter = (record.meta?.frontmatter || {}) as Record<string, unknown>
      const title = typeof frontmatter.title === 'string' && frontmatter.title.trim().length > 0
        ? frontmatter.title.trim()
        : (typeof record.meta?.title === 'string' && record.meta.title.trim().length > 0
            ? record.meta.title.trim()
            : slug)
      const cover = typeof frontmatter.cover === 'string' ? frontmatter.cover : undefined

      return {
        path,
        slug,
        title,
        cover,
      } satisfies NavItem
    })
    .filter(item => item.slug !== 'index')
    .filter(item => !/\.html?$/i.test(item.slug))
    .forEach((item) => {
      const existed = itemMap.get(item.path)
      if (!existed) {
        itemMap.set(item.path, item)
        return
      }

      const existedHasReadableTitle = existed.title !== existed.slug
      const itemHasReadableTitle = item.title !== item.slug

      if (!existedHasReadableTitle && itemHasReadableTitle)
        itemMap.set(item.path, item)
    })

  const items = Array.from(itemMap.values())
    .sort((a, b) => compareLearningSlug(a.slug, b.slug))

  const currentIndex = items.findIndex(item => item.path === currentPath)
  if (currentIndex < 0)
    return null

  return {
    prev: currentIndex > 0 ? items[currentIndex - 1] : null,
    next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
  }
})

const prev = computed(() => learningPathNav.value?.prev ?? blogPrev.value)
const next = computed(() => learningPathNav.value?.next ?? blogNext.value)

const prevLabel = computed(() => learningPathNav.value ? '上一节' : 'Previous Post')
const nextLabel = computed(() => learningPathNav.value ? '下一节' : 'Next Post')
</script>

<template>
  <div class="sakura-post-nav" :class="navigationMerge && 'flex'">
    <SakuraImageCard
      v-if="prev?.path"
      :src="prev.cover"
      :to="prev.path"
      class="card-prev"
      :class="{
        'mt-10': !navigationMerge,
        'w-1/2 rounded-l-$sakura-radius': next?.path && navigationMerge,
        'rounded-$sakura-radius': (navigationMerge && !next?.path) || !navigationMerge,
      }"
      :overlay="true"
      :overlay-opacity="0"
      :overlay-opacity-initial="0.5"
    >
      <div class="sakura-post-nav-content">
        <span class="sakura-post-nav-label">
          {{ prevLabel }}
        </span>
        <RouterLink :to="prev.path" class="sakura-post-nav-title">
          {{ prev.title }}
        </RouterLink>
      </div>
    </SakuraImageCard>

    <SakuraImageCard
      v-if="next?.path"
      :src="next.cover"
      :to="next.path"
      class="card-next"
      :class="{
        'w-1/2 rounded-r-$sakura-radius': prev?.path && navigationMerge,
        'rounded-$sakura-radius': (navigationMerge && !prev?.path) || !navigationMerge,
      }"
      :overlay="true"
      :overlay-opacity="0"
      :overlay-opacity-initial="0.5"
    >
      <div class="sakura-post-nav-content">
        <span flex justify-end class="sakura-post-nav-label">
          {{ nextLabel }}
        </span>
        <RouterLink :to="next.path" class="sakura-post-nav-title" flex justify-end>
          {{ next.title }}
        </RouterLink>
      </div>
    </SakuraImageCard>
  </div>
</template>

<style lang="scss" scoped>
.sakura-post-nav {
  width: 100%;

  &-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    margin-left: 2.5rem;
    margin-right: 2.5rem;
  }

  &-content > * {
    z-index: 2;
  }

  &-label {
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: oklch(100% 0 0 / 70%);
  }

  &-title {
    color: oklch(97.51% 0.01 244.25);
    font-weight: bold;
  }

  .sakura-image-card {
    height: var(--sakura-post-nav-height);
    width: 100%;
    border-radius: 0;

    &::before {
      content: '';
      transition: opacity 0.3s ease-in-out;
      background-color: var(--sakura-color-overlay-background);
      opacity: 0.6;
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    &:hover::before {
      opacity: 0.4;
    }
  }
}
</style>
