<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isPlainClick } from '../theme/utils/anchor-scroll'
import { learningPath, learningTitle } from '../theme/utils/learning'
import { robotArmDevelopmentPath, robotArmDevelopmentTrack } from '../theme/utils/robot-arm-development'
import { robotArmDocumentSections } from '../theme/utils/technical-documents'

const route = useRoute()
const router = useRouter()
const frontmatter = useFrontmatter()
const sidebar = ref<HTMLElement>()
const drawer = ref<HTMLDialogElement>()
const drawerTrigger = ref<HTMLButtonElement>()
const sections = computed(() => robotArmDocumentSections(router.getRoutes()))
const currentPath = computed(() => route.path.replace(/\/$/, ''))
const section = computed(() => sections.value.find(item => item.id === frontmatter.value.phase))
const listing = computed(() => {
  if (currentPath.value === robotArmDevelopmentPath) return sections.value
  if (section.value?.path === currentPath.value) return section.value.children
  return []
})
const documents = computed(() => [
  { title: robotArmDevelopmentTrack.title, path: robotArmDevelopmentPath },
  ...sections.value.flatMap(group => [group, ...group.children]),
])
const index = computed(() => documents.value.findIndex(entry => entry.path === currentPath.value))
const previous = computed(() => documents.value[index.value - 1])
const next = computed(() => documents.value[index.value + 1])

function revealSelected(scope?: HTMLElement) {
  const scroller = scope?.querySelector<HTMLElement>('.technical-doc-tree-scroll')
  const selected = scroller?.querySelector<HTMLElement>('a[aria-current="page"]')
  if (!scroller || !selected || !scroller.clientHeight) return

  const windowBounds = scroller.getBoundingClientRect()
  const row = selected.getBoundingClientRect()
  if (row.top < windowBounds.top) scroller.scrollTop += row.top - windowBounds.top
  else if (row.bottom > windowBounds.bottom) scroller.scrollTop += row.bottom - windowBounds.bottom
}
onMounted(() => revealSelected(sidebar.value))
watch(currentPath, () => revealSelected(sidebar.value), { flush: 'post' })

function showDocuments() {
  drawer.value?.showModal()
  revealSelected(drawer.value)
}

function closeDocuments(restoreFocus = true) {
  if (!drawer.value?.open) return
  drawer.value.close()
  if (restoreFocus) drawerTrigger.value?.focus({ preventScroll: true })
}

async function selectFromDrawer(event: MouseEvent, path: string) {
  if (!isPlainClick(event) || event.defaultPrevented || !drawer.value?.open) return
  event.preventDefault()
  if (path === currentPath.value) {
    closeDocuments()
    return
  }

  closeDocuments(false)
  await router.push(path)
  await nextTick()
  document.querySelector<HTMLElement>('.technical-doc-reader .kaede-page-title')?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="kaede-reader technical-doc-reader">
    <aside ref="sidebar" class="technical-doc-sidebar" aria-label="文档列表">
      <RouterLink class="technical-doc-tree-title" :to="robotArmDevelopmentPath">{{ robotArmDevelopmentTrack.title }}</RouterLink>
      <div class="technical-doc-tree-scroll">
        <TechnicalDocumentTree :sections="sections" :current-path="currentPath" :active-section="section?.id" />
      </div>
    </aside>

    <article class="kaede-post kaede-page content technical-document">
      <header class="kaede-page-header">
        <nav class="kaede-breadcrumb" aria-label="面包屑">
          <RouterLink :to="learningPath">{{ learningTitle }}</RouterLink>
          <template v-if="currentPath !== robotArmDevelopmentPath">
            <span aria-hidden="true">/</span>
            <RouterLink :to="robotArmDevelopmentPath">{{ robotArmDevelopmentTrack.title }}</RouterLink>
          </template>
          <template v-if="section && section.path !== currentPath">
            <span aria-hidden="true">/</span>
            <RouterLink :to="section.path">{{ section.title }}</RouterLink>
          </template>
        </nav>
        <h1 class="kaede-page-title" tabindex="-1">{{ frontmatter.title }}</h1>
        <p v-if="frontmatter.summary" class="kaede-page-summary">{{ frontmatter.summary }}</p>
      </header>
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="route.path" />
      </RouterView>
      <nav v-if="listing.length" class="technical-doc-index" aria-label="文档索引">
        <h2>{{ section ? '本分组文档' : '分组总览' }}</h2>
        <ul>
          <li v-for="entry in listing" :key="entry.path"><RouterLink :to="entry.path">{{ entry.title }}</RouterLink></li>
        </ul>
      </nav>
      <nav v-if="previous || next" class="kaede-post-nav" aria-label="前后文档">
        <RouterLink v-if="previous" :to="previous.path"><span>← 上一篇</span><strong>{{ previous.title }}</strong></RouterLink>
        <RouterLink v-if="next" class="kaede-next" :to="next.path"><span>下一篇 →</span><strong>{{ next.title }}</strong></RouterLink>
      </nav>
    </article>

    <ClientOnly><KaedeToc :key="route.path" /></ClientOnly>
    <button ref="drawerTrigger" type="button" class="technical-documents-toggle" aria-haspopup="dialog"
      aria-controls="technical-documents-dialog" @click="showDocuments">
      <span class="i-ri-file-list-3-line" aria-hidden="true" />文档
    </button>
    <dialog id="technical-documents-dialog" ref="drawer" class="technical-documents-dialog"
      aria-labelledby="technical-documents-title" @cancel.prevent="closeDocuments()" @click.self="closeDocuments()">
      <div class="technical-documents-panel">
        <header>
          <h2 id="technical-documents-title">文档</h2>
          <button type="button" aria-label="关闭文档列表" autofocus @click="closeDocuments()">
            <span class="i-ri-close-line" aria-hidden="true" />
          </button>
        </header>
        <div class="technical-doc-tree-scroll">
          <RouterLink :to="robotArmDevelopmentPath" custom v-slot="{ href }">
            <a :href="href" class="technical-doc-tree-title"
              @click="selectFromDrawer($event, robotArmDevelopmentPath)">{{ robotArmDevelopmentTrack.title }}</a>
          </RouterLink>
          <TechnicalDocumentTree :sections="sections" :current-path="currentPath" :active-section="section?.id"
            @select="selectFromDrawer" />
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.technical-doc-sidebar { display: none; }
.technical-doc-tree-title { display: block; padding: 10px 8px; font-size: .9375rem; font-weight: 650; }
.technical-doc-tree-scroll { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 3px 8px 8px; }
.technical-doc-index { margin-top: 2rem; }
.technical-doc-index h2 { margin: 0 0 .5rem; font-size: 1.25rem; }
.technical-doc-index ul { margin: 0; padding: 0; list-style: none; }
.technical-doc-index li { border-bottom: 1px solid var(--line); }
.technical-doc-index a { display: block; padding: .65rem 0; color: var(--accent); text-decoration: underline; }
.technical-documents-toggle {
  position: fixed;
  z-index: 20;
  inset: auto auto max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 6px 12px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
  font-size: 14px;
}
.technical-documents-dialog {
  width: min(420px, calc(100% - 32px));
  max-height: min(75dvh, 720px);
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
}
.technical-documents-dialog::backdrop { background: #20182785; }
.technical-documents-panel { display: flex; flex-direction: column; max-height: min(75dvh - 2px, 718px); }
.technical-documents-panel header { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px 6px 16px; border-bottom: 1px solid var(--line); }
.technical-documents-panel h2 { margin: 0; font-size: 1rem; }
.technical-documents-panel button { width: 44px; height: 44px; }
.technical-documents-panel .technical-doc-tree-scroll { padding: 8px; }
@media (min-width: 960px) {
  .technical-doc-reader {
    display: grid;
    grid-template-columns: minmax(200px, 223px) minmax(0, var(--reading-width));
    justify-content: center;
    align-items: start;
    gap: clamp(24px, 3vw, 36px);
    max-width: none;
  }
  .technical-doc-sidebar {
    position: sticky;
    top: calc(var(--nav-height) + 16px);
    display: flex;
    flex-direction: column;
    max-height: calc(100dvh - var(--nav-height) - 28px);
    border-inline-end: 1px solid var(--line);
  }
  .technical-documents-toggle { display: none; }
}
@media (min-width: 1080px) and (max-width: 1439px) {
  .technical-doc-reader :deep(.kaede-toc-desktop) { display: none; }
  .technical-doc-reader :deep(.kaede-toc-toggle) { display: flex; }
}
@media (min-width: 1440px) {
  .technical-doc-reader { grid-template-columns: minmax(210px, 230px) minmax(0, var(--reading-width)) minmax(240px, 270px); }
}
</style>
