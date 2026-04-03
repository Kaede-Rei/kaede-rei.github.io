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

watch(() => route.fullPath, () => {
  isTocOpen.value = false
})

function closeToc() {
  isTocOpen.value = false
}

function toggleToc() {
  isTocOpen.value = !isTocOpen.value
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    isTocOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <SakuraPage class="sakura-post sakura-post-drawer-layout">
    <template #header>
      <SakuraPostHeader :fm="frontmatter" />
    </template>

    <template v-if="$slots.left" #left>
      <slot name="left" />
    </template>

    <template #content>
      <slot name="content">
        <RouterView v-slot="{ Component }">
          <component :is="Component">
            <template #main-content-after>
              <SakuraSponsor v-if="showSponsor" />
              <ValaxyCopyright v-if="frontmatter.copyright || siteConfig.license.enabled" :url="url" />
            </template>

            <template #footer>
              <SakuraPostFooter />
            </template>
          </component>
        </RouterView>
      </slot>
    </template>

    <template #right>
      <slot name="right">
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

        <aside class="toc-drawer" :class="{ open: isTocOpen }" @click.capture="closeToc">
          <div class="toc-drawer-inner" @click.stop>
            <div class="toc-drawer-header">
              <span>目录</span>
              <button class="toc-close-btn" type="button" aria-label="关闭目录" @click="closeToc">
                <span i-ri-close-line />
              </button>
            </div>
            <SakuraAside>
              <SakuraToc :view-scroll="true" />
            </SakuraAside>
          </div>
        </aside>
      </slot>
    </template>
  </SakuraPage>
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

.toc-toggle-btn {
  position: fixed;
  right: 18px;
  top: calc(var(--sakura-navbar-height) + 18px);
  z-index: 120;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  color: #2f3440;
}

.toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 128;
  background: rgba(0, 0, 0, 0.2);
}

.toc-drawer {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  z-index: 129;
  width: min(360px, 84vw);
  height: 100vh !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  transform: translateX(102%);
  transition: transform 0.28s ease;
  pointer-events: none;
}

.toc-drawer.open {
  transform: translateX(0);
  pointer-events: auto;
}

.toc-drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.96);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px 0 0 20px;
  box-shadow: -12px 0 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.toc-drawer > .toc-drawer-inner {
  margin-left: 0 !important;
}

.toc-drawer-header {
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
}

.toc-drawer :deep(.sakura-aside) {
  position: static !important;
  top: auto !important;
  max-height: none !important;
  height: calc(100vh - var(--sakura-navbar-height) - 10px);
  overflow-y: auto !important;
  background: transparent !important;
  padding: 12px 12px 24px;
}

.toc-overlay-fade-enter-active,
.toc-overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.toc-overlay-fade-enter-from,
.toc-overlay-fade-leave-to {
  opacity: 0;
}
</style>
