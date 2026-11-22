<script setup lang="ts">
import { useHead, useSeoMeta } from '@unhead/vue'
import { useColorMode } from '@vueuse/core'
import { useAppStore, useFrontmatter, useLayout, useSiteConfig, useValaxyApp } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { profile } from '../data/site'
import KaedeSearch from '../theme/components/KaedeSearch.vue'
import { imageUrl, postSummary } from '../theme/utils/content'
import { postLayoutBootstrap } from '../theme/utils/post-layout'

useValaxyApp()
const app = useAppStore()
const site = useSiteConfig()
const fm = useFrontmatter()
const route = useRoute()
const layout = useLayout()
const menuOpen = ref(false)
const menuToggle = ref<HTMLButtonElement>()
const searchOpen = ref(false)
const searchRef = ref<{ dismiss: () => void }>()
const themeReady = ref(false)
const theme = useColorMode({ emitAuto: true, modes: { light: '' } })
let keyboardDestination = ''
const isHome = computed(() => route.path === '/')
const isPost = computed(() => route.path.startsWith('/posts/'))
const nav = [
  { text: '首页', to: '/', sections: ['/'] },
  { text: '文章', to: '/archives', sections: ['/archives', '/posts', '/categories', '/tags', '/page'] },
  { text: '学习路径', to: '/learning-path', sections: ['/learning-path'] },
  { text: 'ATIL', to: '/agrotech', sections: ['/agrotech'] },
  { text: '关于', to: '/about', sections: ['/about'] },
]
const cleanPath = (path: string) => path.replace(/\/$/, '') || '/'
const isInSection = (sections: string[]) => sections.some(section =>
  cleanPath(route.path) === section || (section !== '/' && route.path.startsWith(section + '/')),
)

const pageTitle = computed(() => {
  if (isHome.value) return profile.siteTitle
  if (fm.value.titleTemplate) return String(fm.value.titleTemplate).replace('%s', String(fm.value.title || ''))
  const name = fm.value.title || (route.path.startsWith('/page/') ? '文章 · 第 ' + route.params.page + ' 页' : '这里还没有内容')
  return `${name} · Kaede Rei`
})
const description = computed(() => String(
  fm.value.summary || fm.value.description || (isPost.value && postSummary(fm.value)) || site.value.description,
))
const shareImage = computed(() => new URL(
  String(fm.value.shareImage || fm.value.ogImage || (isPost.value && fm.value.cover && imageUrl(fm.value.cover)) || profile.shareImage),
  site.value.url,
).href)
const canonical = computed(() => new URL(cleanPath(route.path), site.value.url).href)
useHead(() => ({
  title: pageTitle.value,
  titleTemplate: '%s',
  meta: [{ name: 'theme-color', content: app.themeColor }],
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [{ key: 'post-layout', innerHTML: postLayoutBootstrap }],
}))
useSeoMeta({
  description,
  ogDescription: description,
  ogTitle: pageTitle,
  ogImage: shareImage,
  ogUrl: canonical,
  ogType: () => isPost.value ? 'article' : 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: description,
  twitterImage: shareImage,
})

function openSearch(event?: MouseEvent) {
  if (event?.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true })
  menuOpen.value = false
  searchOpen.value = true
}
provide('kaedeOpenSearch', openSearch)

function shortcut(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229 || event.repeat) return
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (searchOpen.value) searchRef.value?.dismiss()
    else openSearch()
  }
}
function closeMenuFromKeyboard(event: KeyboardEvent) {
  if (!menuOpen.value) return
  event.preventDefault()
  menuOpen.value = false
  menuToggle.value?.focus()
}
function decodeAddress(value: string) {
  try { return decodeURIComponent(value) }
  catch { return value }
}
function destination(path: string, hash: string) {
  return cleanPath(decodeAddress(path)) + decodeAddress(hash)
}
function rememberKeyboardLink(event: MouseEvent | KeyboardEvent) {
  if (event instanceof KeyboardEvent ? event.key !== 'Enter' || event.isComposing : event.detail !== 0) return
  if (!(event.target instanceof Element)) return
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  const link = event.target.closest('a[href]') as HTMLAnchorElement | null
  if (link?.origin !== location.origin || link.target) return
  const next = destination(link.pathname, link.hash)
  if (next !== destination(route.path, route.hash)) keyboardDestination = next
}
function chooseMobileLink(to: string) {
  menuOpen.value = false
  if (to === cleanPath(route.path)) menuToggle.value?.focus()
  else keyboardDestination = to
}
watch(() => route.path, () => { menuOpen.value = false })
watch(() => route.fullPath, async () => {
  if (keyboardDestination === destination(route.path, route.hash)) {
    await nextTick()
    const anchor = route.hash && document.getElementById(route.hash.slice(1))
    const heading = anchor || document.querySelector<HTMLElement>('#main-content h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }
  keyboardDestination = ''
})
onMounted(() => {
  themeReady.value = true
  app.showLoading = false
  window.addEventListener('keydown', shortcut)
  document.addEventListener('click', rememberKeyboardLink, { capture: true })
  document.addEventListener('keydown', rememberKeyboardLink, { capture: true })
})
onUnmounted(() => {
  window.removeEventListener('keydown', shortcut)
  document.removeEventListener('click', rememberKeyboardLink, { capture: true })
  document.removeEventListener('keydown', rememberKeyboardLink, { capture: true })
})
</script>

<template>
  <template v-if="layout !== 'empty'">
    <a class="kaede-skip-link" href="#main-content">跳转到正文</a>
    <header class="kaede-navbar" @keydown.esc="closeMenuFromKeyboard">
      <div class="kaede-navbar-inner">
        <RouterLink class="kaede-brand" to="/">
          <img :src="site.author.avatar" alt="" width="36" height="36">
          <span>Kaede Rei</span>
        </RouterLink>
        <nav class="kaede-nav-links" aria-label="主导航">
          <RouterLink v-for="item in nav" :key="item.to" :to="item.to"
            :class="{ 'is-current': isInSection(item.sections) }"
            :aria-current="cleanPath(route.path) === item.to ? 'page' : isInSection(item.sections) ? 'location' : undefined">
            {{ item.text }}
          </RouterLink>
        </nav>
        <div class="kaede-nav-tools">
          <button type="button" class="kaede-search-trigger" aria-label="搜索文章与学习内容" aria-keyshortcuts="Control+K Meta+K" title="搜索文章与学习内容（Ctrl / ⌘ + K）" @click="openSearch">
            <span class="i-ri-search-line" aria-hidden="true" /><kbd>Ctrl K</kbd>
          </button>
          <label class="kaede-theme-control">
            <span :class="themeReady && theme === 'dark' ? 'i-ri-moon-line' : themeReady && theme === 'light' ? 'i-ri-sun-line' : 'i-ri-contrast-2-line'" aria-hidden="true" />
            <select v-model="theme" aria-label="显示主题" title="显示主题">
              <option value="auto">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>
          <button ref="menuToggle" type="button" class="kaede-menu-toggle"
            :aria-label="menuOpen ? '关闭导航菜单' : '打开导航菜单'" :aria-expanded="menuOpen"
            aria-controls="kaede-mobile-nav" @click="menuOpen = !menuOpen">
            <span :class="menuOpen ? 'i-ri-close-line' : 'i-ri-menu-line'" aria-hidden="true" />
          </button>
        </div>
        <nav id="kaede-mobile-nav" class="kaede-mobile-nav" :hidden="!menuOpen" aria-label="移动导航">
          <RouterLink v-for="item in nav" :key="item.to" :to="item.to"
            :class="{ 'is-current': isInSection(item.sections) }"
            :aria-current="cleanPath(route.path) === item.to ? 'page' : isInSection(item.sections) ? 'location' : undefined"
            @click="chooseMobileLink(item.to)">
            {{ item.text }}
          </RouterLink>
        </nav>
      </div>
    </header>
    <main id="main-content" class="kaede-main" tabindex="-1" :class="`has-${layout}-layout`"><RouterView /></main>
    <footer class="kaede-footer">
      <div><RouterLink class="kaede-footer-name" to="/">Kaede Rei の 小窝</RouterLink><p>{{ profile.footerText }}</p></div>
      <div class="kaede-footer-links">
        <RouterLink to="/links">友情链接</RouterLink>
        <a :href="profile.github">GitHub</a>
        <a :href="'mailto:' + profile.email">邮箱</a>
        <a :href="profile.rss">RSS</a>
      </div>
      <small>© 2026 Kaede Rei · 由 Valaxy 驱动 · 布局参考 <a href="https://github.com/hairyf/valaxy-theme-hairy">Hairy</a></small>
    </footer>
    <KaedeSearch v-if="searchOpen" ref="searchRef" @close="searchOpen = false" />
    <ValaxyAddons />
  </template>
</template>
