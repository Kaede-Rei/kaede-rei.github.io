<script lang="ts" setup>
import type { Article } from '@unhead/schema-org'
import { defineArticle, useSchemaOrg } from '@unhead/schema-org/vue'
import { formatDate, useFrontmatter, useFullUrl, useSiteConfig } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface TocItem {
  id: string
  text: string
  level: number
  top: number
}

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()
const route = useRoute()

const showSponsor = computed(() => {
  if (typeof frontmatter.value?.sponsor === 'boolean')
    return frontmatter.value.sponsor

  return !!siteConfig.value?.sponsor?.enable
})

const showCopyright = computed(() => {
  return !!frontmatter.value?.copyright || !!siteConfig.value?.license?.enabled
})

const article: Article = {
  '@type': 'BlogPosting',
  headline: frontmatter.value?.title,
  description: frontmatter.value?.description,
  author: [
    {
      name: siteConfig.value?.author?.name,
      url: siteConfig.value?.author?.link,
    },
  ],
  datePublished: formatDate(frontmatter.value?.date || 0),
  dateModified: formatDate(frontmatter.value?.updated || 0),
  image: frontmatter.value?.image || frontmatter.value?.cover,
}

useSchemaOrg(defineArticle(article))

const isTocOpen = ref(false)
const tocItems = ref<TocItem[]>([])
const activeHeadingId = ref('')
let activeHeadingRafId: number | null = null
let resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null
let tocTrackingAttached = false

function closeToc() {
  isTocOpen.value = false
}

function toggleToc() {
  isTocOpen.value = !isTocOpen.value
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    closeToc()
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getArticleRoot(): HTMLElement | null {
  const selectors = [
    '.post .markdown-body',
    '.post .prose',
    'article .markdown-body',
    'article .prose',
    '.page .markdown-body',
    '.page .prose',
    '.markdown-body',
    '.prose',
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el instanceof HTMLElement)
      return el
  }

  return null
}

function getElementTop(el: HTMLElement) {
  return el.getBoundingClientRect().top + window.scrollY
}

function optimizeArticleImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]

  images.forEach((img, index) => {
    if (!img.getAttribute('loading'))
      img.loading = index === 0 ? 'eager' : 'lazy'

    img.decoding = 'async'

    if (!img.getAttribute('fetchpriority'))
      (img as any).fetchPriority = index === 0 ? 'high' : 'low'
  })
}

function refreshTocOffsets() {
  if (typeof document === 'undefined' || tocItems.value.length === 0)
    return

  tocItems.value = tocItems.value.map((item) => {
    const el = document.getElementById(item.id)

    if (!el)
      return item

    return {
      ...item,
      top: getElementTop(el),
    }
  })
}

function scheduleActiveHeadingUpdate() {
  if (activeHeadingRafId !== null)
    return

  activeHeadingRafId = requestAnimationFrame(() => {
    activeHeadingRafId = null
    updateActiveHeading()
  })
}

function onScroll() {
  if (!isTocOpen.value)
    return

  scheduleActiveHeadingUpdate()
}

function onResize() {
  if (!isTocOpen.value)
    return

  if (resizeDebounceTimer)
    clearTimeout(resizeDebounceTimer)

  resizeDebounceTimer = setTimeout(() => {
    refreshTocOffsets()
    scheduleActiveHeadingUpdate()
  }, 120)
}

function attachTocTracking() {
  if (tocTrackingAttached)
    return

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  tocTrackingAttached = true
}

function detachTocTracking() {
  if (!tocTrackingAttached)
    return

  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  tocTrackingAttached = false

  if (activeHeadingRafId !== null) {
    cancelAnimationFrame(activeHeadingRafId)
    activeHeadingRafId = null
  }

  if (resizeDebounceTimer) {
    clearTimeout(resizeDebounceTimer)
    resizeDebounceTimer = null
  }
}

async function buildToc() {
  if (typeof document === 'undefined')
    return

  await nextTick()

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })

  const root = getArticleRoot()

  if (!root) {
    tocItems.value = []
    activeHeadingId.value = ''
    return
  }

  optimizeArticleImages(root)

  let headings = Array.from(root.querySelectorAll('h2, h3, h4')) as HTMLElement[]

  if (headings.length === 0)
    headings = Array.from(root.querySelectorAll('h1, h2, h3, h4')) as HTMLElement[]

  const usedIds = new Map<string, number>()

  const items: TocItem[] = headings
    .map((heading, index) => {
      const text = (heading.textContent || '')
        .replace(/#/g, '')
        .replace(/¶/g, '')
        .trim()

      if (!text)
        return null

      let id = heading.id?.trim()

      if (!id) {
        const base = slugify(text) || `section-${index + 1}`
        const count = usedIds.get(base) || 0
        usedIds.set(base, count + 1)
        id = count > 0 ? `${base}-${count + 1}` : base
        heading.id = id
      }
      else {
        const count = usedIds.get(id) || 0
        usedIds.set(id, count + 1)
        if (count > 0) {
          id = `${id}-${count + 1}`
          heading.id = id
        }
      }

      return {
        id,
        text,
        level: Number(heading.tagName.slice(1)),
        top: getElementTop(heading),
      }
    })
    .filter((item): item is TocItem => item !== null)

  tocItems.value = items
  scheduleActiveHeadingUpdate()

  // Late image decode may shift heading offsets, refresh once after mount.
  setTimeout(() => {
    refreshTocOffsets()
    scheduleActiveHeadingUpdate()
  }, 220)
}

function updateActiveHeading() {
  if (typeof document === 'undefined' || tocItems.value.length === 0) {
    activeHeadingId.value = ''
    return
  }

  const offset = 120
  const items = tocItems.value
  const currentY = window.scrollY + offset

  if (currentY < items[0].top) {
    activeHeadingId.value = items[0].id
    return
  }

  let left = 0
  let right = items.length - 1
  let answer = 0

  while (left <= right) {
    const mid = (left + right) >> 1

    if (items[mid].top <= currentY) {
      answer = mid
      left = mid + 1
    }
    else {
      right = mid - 1
    }
  }

  const currentId = items[answer]?.id || items[0]?.id || ''

  activeHeadingId.value = currentId
}

function scrollToHeading(id: string) {
  if (typeof document === 'undefined')
    return

  const el = document.getElementById(id)
  if (!el)
    return

  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({
    top,
    behavior: 'smooth',
  })

  closeToc()
}

watch(() => route.fullPath, () => {
  closeToc()
  tocItems.value = []
  activeHeadingId.value = ''
})

watch(isTocOpen, async (open) => {
  if (typeof document !== 'undefined')
    document.body.classList.toggle('toc-drawer-open', open)

  if (!open) {
    detachTocTracking()
    return
  }

  attachTocTracking()

  if (tocItems.value.length === 0)
    await buildToc()
  else {
    refreshTocOffsets()
    scheduleActiveHeadingUpdate()
  }
})

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)

  await nextTick()

  const root = getArticleRoot()
  if (root)
    optimizeArticleImages(root)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  detachTocTracking()

  if (activeHeadingRafId !== null)
    cancelAnimationFrame(activeHeadingRafId)

  if (resizeDebounceTimer)
    clearTimeout(resizeDebounceTimer)

  if (typeof document !== 'undefined')
    document.body.classList.remove('toc-drawer-open')
})
</script>

<template>
  <div class="sakura-post-drawer-layout sakura-post-shell">
    <header class="sakura-post-shell-header">
      <SakuraPostHeader :key="route.fullPath" :fm="frontmatter" />
    </header>

    <section class="sakura-post-shell-main">
      <div class="sakura-post-shell-content">
        <RouterView v-slot="{ Component }">
          <component :is="Component" :key="route.fullPath">
            <template #main-content-after>
              <SakuraSponsor v-if="showSponsor" />
              <ValaxyCopyright
                v-if="showCopyright"
                :url="url"
              />
            </template>

            <template #footer>
              <SakuraPostFooter>
                <template #nav>
                  <LearningPathPostNav />
                </template>
              </SakuraPostFooter>
            </template>
          </component>
        </RouterView>
      </div>
    </section>
  </div>

  <ClientOnly>
    <Teleport to="body">
      <button
        class="toc-toggle-btn"
        type="button"
        aria-label="切换目录"
        :aria-expanded="isTocOpen"
        @click="toggleToc"
      >
        <span i-ri-menu-2-line />
        <span>目录</span>
      </button>

      <Transition name="toc-overlay-fade">
        <div
          v-if="isTocOpen"
          class="toc-overlay"
          @click="closeToc"
        />
      </Transition>

      <aside
        class="toc-drawer"
        :class="{ open: isTocOpen }"
        :aria-hidden="!isTocOpen"
      >
        <div class="toc-drawer-inner">
          <div class="toc-drawer-header">
            <span>目录</span>
            <button
              class="toc-close-btn"
              type="button"
              aria-label="关闭目录"
              @click="closeToc"
            >
              <span i-ri-close-line />
            </button>
          </div>

          <div class="toc-drawer-body">
            <div class="toc-title">
              文章目录
            </div>

            <nav
              v-if="tocItems.length > 0"
              class="toc-nav"
              aria-label="文章目录"
            >
              <button
                v-for="item in tocItems"
                :key="item.id"
                type="button"
                class="toc-link"
                :class="[
                  `level-${item.level}`,
                  { active: activeHeadingId === item.id },
                ]"
                @click="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </button>
            </nav>

            <div v-else class="toc-empty">
              暂无目录
            </div>
          </div>
        </div>
      </aside>
    </Teleport>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.sakura-post-shell {
  width: 100%;
}

.sakura-post-shell-header {
  width: 100%;
  max-width: 100%;
  margin-inline: auto;
  padding-block: 24px;
  contain: layout;
}

.sakura-post-shell-main {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.sakura-post-shell-content {
  width: 90%;
  max-width: 90%;
  margin-inline: auto;
  padding-block: 24px;
  contain: layout;
}

.sakura-post-drawer-layout {
  :deep(.sakura-post-footer),
  :deep(.sakura-comment),
  :deep(.sakura-post-nav) {
    content-visibility: auto;
    contain-intrinsic-size: 220px;
  }
}

:global(body.toc-drawer-open) {
  overflow: hidden;
}

.toc-toggle-btn {
  position: fixed;
  right: 18px;
  top: calc(var(--sakura-navbar-height) + 18px);
  z-index: 1200;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  padding: 0.5rem 0.85rem;
  background: rgba(255, 255, 255, 0.92);
  color: #2f3440;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 1280;
  background: rgba(0, 0, 0, 0.18);
}

.toc-drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1290;
  width: min(360px, 86vw);
  height: 100dvh;
  transform: translate3d(102%, 0, 0);
  transition: transform 0.22s ease;
  will-change: transform;
  pointer-events: none;
}

.toc-drawer.open {
  transform: translate3d(0, 0, 0);
  pointer-events: auto;
}

.toc-drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  border-left: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px 0 0 20px;
  box-shadow: -10px 0 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toc-drawer-header {
  flex: 0 0 auto;
  height: calc(var(--sakura-navbar-height) + 10px);
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-weight: 700;
  font-size: 1.05rem;
}

.toc-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.toc-drawer-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 18px 16px 24px;
}

.toc-title {
  margin-bottom: 14px;
  font-size: 1.65rem;
  font-weight: 800;
  color: #28303f;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-link {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 10px;
  border-radius: 10px;
  color: #3b4352;
  cursor: pointer;
  line-height: 1.5;
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.toc-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

.toc-link.active {
  background: rgba(255, 165, 0, 0.12);
  color: #c97900;
  font-weight: 700;
}

.toc-link.level-2 {
  padding-left: 10px;
  font-size: 1rem;
}

.toc-link.level-3 {
  padding-left: 24px;
  font-size: 0.96rem;
}

.toc-link.level-4 {
  padding-left: 38px;
  font-size: 0.92rem;
  opacity: 0.92;
}

.toc-empty {
  padding: 8px 2px;
  color: #7d8592;
  font-size: 0.95rem;
}

.toc-overlay-fade-enter-active,
.toc-overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.toc-overlay-fade-enter-from,
.toc-overlay-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .toc-toggle-btn {
    right: 14px;
    top: calc(var(--sakura-navbar-height) + 14px);
  }

  .toc-drawer {
    width: min(340px, 92vw);
  }

  .toc-title {
    font-size: 1.45rem;
  }
}
</style>