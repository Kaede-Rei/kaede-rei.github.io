<script lang="ts" setup>
import type { Article } from '@unhead/schema-org'
import { defineArticle, useSchemaOrg } from '@unhead/schema-org/vue'
import { formatDate, useFrontmatter, useFullUrl, useSiteConfig } from 'valaxy'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()
const route = useRoute()

const showSponsor = computed(() => {
  if (typeof frontmatter.value.sponsor === 'boolean')
    return frontmatter.value.sponsor

  return siteConfig.value.sponsor.enable
})

const article: Article = {
  '@type': 'BlogPosting',
  headline: frontmatter.value.title,
  description: frontmatter.value.description,
  author: [
    {
      name: siteConfig.value.author.name,
      url: siteConfig.value.author.link,
    },
  ],
  datePublished: formatDate(frontmatter.value.date || 0),
  dateModified: formatDate(frontmatter.value.updated || 0),
  image: frontmatter.value.image || frontmatter.value.cover,
}

useSchemaOrg(defineArticle(article))

const isTocOpen = ref(false)

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

function onDrawerClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target)
    return

  if (target.closest('a')) {
    requestAnimationFrame(() => {
      closeToc()
    })
  }
}

watch(() => route.fullPath, () => {
  closeToc()
})

watch(isTocOpen, (open) => {
  if (typeof document === 'undefined')
    return

  document.body.classList.toggle('toc-drawer-open', open)
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined')
    document.body.classList.remove('toc-drawer-open')
})
</script>

<template>
  <SakuraPost class="sakura-post-drawer-layout">
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-content-after>
          <SakuraSponsor v-if="showSponsor" />
          <ValaxyCopyright
            v-if="frontmatter.copyright || siteConfig.license.enabled"
            :url="url"
          />
        </template>

        <template #footer>
          <SakuraPostFooter />
        </template>
      </component>
    </RouterView>
  </SakuraPost>

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
      <div v-if="isTocOpen" class="toc-overlay" @click="closeToc" />
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

        <div class="toc-drawer-body" @click="onDrawerClick">
          <SakuraAside class="toc-aside">
            <SakuraToc :view-scroll="true" />
          </SakuraAside>
        </div>
      </div>
    </aside>
  </Teleport>
</template>

<style lang="scss" scoped>
.sakura-post-drawer-layout {
  :deep(.sakura-page-content) {
    width: 100% !important;
    max-width: none !important;
    padding-block: 24px;
  }

  :deep(.sakura-triple-columns) {
    grid-template-columns: 0 minmax(0, 1fr) 0 !important;
    gap: 0 !important;
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
  font-weight: 600;
}

.toc-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
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
}

.toc-aside {
  padding: 12px 12px 24px;
}

.toc-drawer :deep(.sakura-aside) {
  position: static !important;
  top: auto !important;
  max-height: none !important;
  height: auto !important;
  background: transparent !important;
}

.toc-drawer :deep(.toc),
.toc-drawer :deep(.sakura-toc) {
  max-height: none !important;
}

.toc-drawer :deep(.sakura-aside > h2) {
  margin: 0;
  padding: 10px 12px 8px;
  line-height: 1.4;
}

.toc-drawer :deep(.sakura-aside > .custom-container) {
  padding: 0 12px 12px;
}

.toc-overlay-fade-enter-active,
.toc-overlay-fade-leave-active {
  transition: opacity 0.18s ease;
}

.toc-overlay-fade-enter-from,
.toc-overlay-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .toc-toggle-btn {
    right: 14px;
    top: calc(var(--sakura-navbar-height) + 14px);
    padding: 0.48rem 0.78rem;
  }

  .toc-drawer {
    width: min(340px, 90vw);
  }
}
</style>