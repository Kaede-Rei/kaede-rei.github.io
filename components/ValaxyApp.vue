<script setup lang="ts">
import { useHead, useSeoMeta } from '@unhead/vue'
import { useColorMode, useMediaQuery } from '@vueuse/core'
import { useMotionProperties, useSpring } from '@vueuse/motion'
import { useAppStore, useFrontmatter, useLayout, useSiteConfig, useValaxyApp } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { profile } from '../data/site'
import KaedeSearch from '../theme/components/KaedeSearch.vue'
import { imageUrl, postSummary } from '../theme/utils/content'
import { learningTitle } from '../theme/utils/learning'
import { postLayoutBootstrap } from '../theme/utils/post-layout'
import { handleSamePageAnchor, isPointerClick, stopAnchorScroll } from '../theme/utils/anchor-scroll'
import { vViewportEntrance } from '../theme/utils/viewport-entrance'
import { installHomeScroll } from '../theme/utils/home-scroll'
import { installPointerSprings } from '../theme/utils/pointer-springs'

useValaxyApp()
const app = useAppStore()
const site = useSiteConfig()
const fm = useFrontmatter()
const route = useRoute()
const router = useRouter()
const layout = useLayout()
const navbar = ref<HTMLElement>()
const navbarPanel = ref<HTMLElement>()
const navbarHidden = ref(false)
const navbarRest = { y: 0, scale: 1, opacity: 1 }
const { motionProperties: navbarMotion } = useMotionProperties(navbarPanel, navbarRest)
const navbarSpring = useSpring(navbarMotion, { stiffness: 440, damping: 28, mass: 1 })
const navLinks = ref<HTMLElement>()
const navIndicatorReady = ref(false)
const indicatorMotion = reactive({ x: 0, scaleX: 1 })
const indicatorSpring = useSpring(indicatorMotion, { stiffness: 440, damping: 28, mass: 1 })
let scrollEdge = 0
let navbarResetFrame = 0
const menuOpen = ref(false)
const menuVisible = ref(false)
const menuUsesMotion = ref(false)
const menuToggle = ref<HTMLButtonElement>()
const menuPanel = ref<HTMLElement>()
const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const mobileNavigation = useMediaQuery('(max-width: 800px)')
const menuClosedOffset = -6
const { motionProperties: menuMotion } = useMotionProperties(menuPanel, { y: menuClosedOffset })
const menuSpring = useSpring(menuMotion, { stiffness: 550, damping: 42, mass: 1 })
let menuTransition = 0
let pointerSprings: ReturnType<typeof installPointerSprings> | undefined
let disposeHomeScroll: ReturnType<typeof installHomeScroll> | undefined
const searchOpen = ref(false)
const searchPointerOpen = ref(false)
const searchRef = ref<{ dismiss: () => void }>()
const themeReady = ref(false)
const theme = useColorMode({ emitAuto: true, modes: { light: '' } })
let keyboardDestination = ''
const isHome = computed(() => route.path === '/')
const isPost = computed(() => route.path.startsWith('/posts/'))
const nav = [
  { text: '首页', to: '/', sections: ['/'] },
  { text: '文章', to: '/archives', sections: ['/archives', '/posts', '/categories', '/tags', '/page'] },
  { text: learningTitle, to: '/learning-path', sections: ['/learning-path'] },
  { text: '关于', to: '/about', sections: ['/about', '/agrotech'] },
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

function navbarScrollPosition() {
  const root = document.scrollingElement
  const maximum = root ? Math.max(0, root.scrollHeight - root.clientHeight) : window.scrollY
  return Math.max(0, Math.min(window.scrollY, maximum))
}
function setNavbarHidden(hidden: boolean, instant = false) {
  if (hidden === navbarHidden.value && (!instant || navbarMotion.y === 0 && navbarMotion.scale === 1 && navbarMotion.opacity === 1)) return
  navbarHidden.value = hidden
  const target = hidden ? { y: -(navbar.value?.offsetHeight ?? 0) - 24, scale: .94, opacity: .15 } : navbarRest
  if (instant || reduceMotion.value) {
    navbarSpring.stop()
    Object.assign(navbarMotion, target)
  }
  else {
    void navbarSpring.set(target)
  }
}
function revealNavbar() {
  setNavbarHidden(false, true)
  scrollEdge = navbarScrollPosition()
}
function resetNavbarPosition() {
  if (!navbar.value) return
  revealNavbar()
  cancelAnimationFrame(navbarResetFrame)
  // Read the position after Vue Router restores the destination page's scroll.
  navbarResetFrame = requestAnimationFrame(() => {
    scrollEdge = navbarScrollPosition()
    navbarResetFrame = 0
  })
}
function updateNavbar() {
  const header = navbar.value
  if (!header) return
  const y = navbarScrollPosition()
  const focus = document.activeElement
  if (navbarResetFrame || reduceMotion.value || menuVisible.value || searchOpen.value
    || (header.contains(focus) && focus?.matches(':focus-visible'))) {
    scrollEdge = y
    setNavbarHidden(false, true)
    return
  }
  if (y <= header.offsetHeight + 12) {
    scrollEdge = y
    setNavbarHidden(false)
    return
  }

  // Accumulate a direction change across small deltas so a trackpad never chatters.
  scrollEdge = navbarHidden.value ? Math.max(scrollEdge, y) : Math.min(scrollEdge, y)
  if (navbarHidden.value ? scrollEdge - y < 8 : y - scrollEdge < 16) return
  setNavbarHidden(!navbarHidden.value)
  scrollEdge = y
}

function syncNavIndicator(animate = false) {
  const current = navLinks.value?.querySelector<HTMLElement>('[aria-current]')
  if (!current?.offsetWidth) {
    indicatorSpring.stop()
    navIndicatorReady.value = false
    return
  }

  const target = { x: current.offsetLeft, scaleX: current.offsetWidth / 100 }
  if (animate && navIndicatorReady.value && !reduceMotion.value) {
    void indicatorSpring.set(target)
  }
  else {
    indicatorSpring.stop()
    Object.assign(indicatorMotion, target)
  }
  navIndicatorReady.value = true
}
function refreshNavIndicator() {
  syncNavIndicator()
}

function setMenuOpen(open: boolean, fromPointer = false) {
  const transition = ++menuTransition
  const target = open ? 0 : menuClosedOffset
  const animate = fromPointer && !reduceMotion.value
  menuOpen.value = open
  menuUsesMotion.value = animate

  if (!animate) {
    menuSpring.stop()
    menuMotion.y = target
    menuVisible.value = open
    return
  }

  menuVisible.value = true
  // Retarget the existing motion value so its current velocity carries through.
  void Promise.resolve(menuSpring.set({ y: target })).then(() => {
    if (transition === menuTransition && !menuOpen.value)
      menuVisible.value = false
  })
}
function toggleMobileMenu(event: MouseEvent) {
  setMenuOpen(!menuOpen.value, isPointerClick(event))
}
watch(reduceMotion, (reduced) => {
  if (reduced && menuUsesMotion.value) setMenuOpen(menuOpen.value)
  if (reduced) {
    resetNavbarPosition()
    refreshNavIndicator()
  }
})
watch(mobileNavigation, (mobile) => {
  if (!mobile && menuVisible.value) setMenuOpen(false)
  resetNavbarPosition()
})

function openSearch(event?: MouseEvent) {
  revealNavbar()
  searchPointerOpen.value = !!event && isPointerClick(event)
  if (event?.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true })
  setMenuOpen(false)
  searchOpen.value = true
}
provide('kaedeOpenSearch', openSearch)

function shortcut(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229 || event.repeat) return
  if (event.key === 'Tab' && (navbarHidden.value || (navbarMotion.y ?? 0) !== 0)) {
    revealNavbar()
    // Tab's native focus scroll needs the bar in view before Vue's next render.
    navbarPanel.value?.style.removeProperty('transform')
    navbarPanel.value?.style.removeProperty('opacity')
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (searchOpen.value) searchRef.value?.dismiss()
    else openSearch()
  }
}
function closeMenuFromKeyboard(event: KeyboardEvent) {
  if (!menuVisible.value) return
  event.preventDefault()
  setMenuOpen(false)
  menuToggle.value?.focus({ preventScroll: true })
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
  setMenuOpen(false)
  if (to === cleanPath(route.path)) menuToggle.value?.focus()
  else keyboardDestination = to
}
watch(() => route.path, async () => {
  const keyboardNavigation = keyboardDestination === destination(route.path, route.hash)
  if (menuVisible.value) setMenuOpen(false)
  resetNavbarPosition()
  pointerSprings?.reset()
  await nextTick()
  syncNavIndicator(!keyboardNavigation)
})
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
function activateAnchor(event: MouseEvent) {
  handleSamePageAnchor(event, router)
}
onMounted(() => {
  resetNavbarPosition()
  refreshNavIndicator()
  window.addEventListener('scroll', updateNavbar, { passive: true })
  window.addEventListener('resize', refreshNavIndicator)
  document.fonts?.addEventListener('loadingdone', refreshNavIndicator)
  pointerSprings = installPointerSprings()
  disposeHomeScroll = installHomeScroll(router, searchOpen)
  themeReady.value = true
  app.showLoading = false
  window.addEventListener('keydown', shortcut)
  document.addEventListener('click', activateAnchor, { capture: true })
  document.addEventListener('click', rememberKeyboardLink, { capture: true })
  document.addEventListener('keydown', rememberKeyboardLink, { capture: true })
})
onUnmounted(() => {
  cancelAnimationFrame(navbarResetFrame)
  indicatorSpring.stop()
  window.removeEventListener('scroll', updateNavbar)
  window.removeEventListener('resize', refreshNavIndicator)
  document.fonts?.removeEventListener('loadingdone', refreshNavIndicator)
  window.removeEventListener('keydown', shortcut)
  stopAnchorScroll()
  disposeHomeScroll?.()
  pointerSprings?.dispose()
  document.removeEventListener('click', activateAnchor, { capture: true })
  document.removeEventListener('click', rememberKeyboardLink, { capture: true })
  document.removeEventListener('keydown', rememberKeyboardLink, { capture: true })
})
</script>

<template>
  <template v-if="layout !== 'empty'">
    <a class="kaede-skip-link" href="#main-content">跳转到正文</a>
    <header ref="navbar" class="kaede-navbar" :class="{ 'is-tucked': navbarHidden }" @focusin="revealNavbar" @keydown.esc="closeMenuFromKeyboard">
      <div ref="navbarPanel" class="kaede-navbar-inner">
        <RouterLink class="kaede-brand" to="/">
          <img :src="site.author.avatar" alt="" width="36" height="36">
          <span>Kaede Rei</span>
        </RouterLink>
        <nav ref="navLinks" class="kaede-nav-links" :class="{ 'has-active-indicator': navIndicatorReady }" aria-label="主导航">
          <RouterLink v-for="item in nav" :key="item.to" :to="item.to"
            :class="{ 'is-current': isInSection(item.sections) }"
            :aria-current="cleanPath(route.path) === item.to ? 'page' : isInSection(item.sections) ? 'location' : undefined">
            {{ item.text }}
          </RouterLink>
          <span class="kaede-nav-indicator" aria-hidden="true"
            :style="{ transform: `translateX(${indicatorMotion.x}px) scaleX(${indicatorMotion.scaleX})` }" />
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
          <button ref="menuToggle" type="button" class="kaede-menu-toggle" :class="{ 'has-menu-motion': menuUsesMotion }"
            :aria-label="menuOpen ? '关闭导航菜单' : '打开导航菜单'" :aria-expanded="menuOpen"
            aria-controls="kaede-mobile-nav" @click="toggleMobileMenu">
            <span class="kaede-menu-symbol kaede-menu-symbol--open i-ri-menu-line" aria-hidden="true" />
            <span class="kaede-menu-symbol kaede-menu-symbol--close i-ri-close-line" aria-hidden="true" />
          </button>
        </div>
        <nav id="kaede-mobile-nav" ref="menuPanel" class="kaede-mobile-nav"
          :class="{ 'is-visible': menuVisible, 'is-open': menuOpen, 'has-menu-motion': menuUsesMotion }"
          :inert="!menuOpen || undefined" aria-label="移动导航">
          <RouterLink v-for="(item, index) in nav" :key="item.to" :to="item.to" :style="{ '--menu-step': index }"
            :class="{ 'is-current': isInSection(item.sections) }"
            :aria-current="cleanPath(route.path) === item.to ? 'page' : isInSection(item.sections) ? 'location' : undefined"
            @click="chooseMobileLink(item.to)">
            {{ item.text }}
          </RouterLink>
        </nav>
      </div>
    </header>
    <main id="main-content" class="kaede-main" tabindex="-1" :class="`has-${layout}-layout`"><RouterView /></main>
    <footer v-viewport-entrance.fade class="kaede-footer">
      <div><RouterLink class="kaede-footer-name" to="/">Kaede Rei の 小窝</RouterLink><p>{{ profile.footerText }}</p></div>
      <div class="kaede-footer-links">
        <RouterLink to="/links">友情链接</RouterLink>
        <a :href="profile.github">GitHub</a>
        <a :href="'mailto:' + profile.email">邮箱</a>
        <a :href="profile.rss">RSS</a>
      </div>
      <small>© 2026 Kaede Rei · 由 Valaxy 驱动 · 布局参考 <a href="https://github.com/hairyf/valaxy-theme-hairy">Hairy</a></small>
    </footer>
    <KaedeSearch v-if="searchOpen" ref="searchRef" :pointer-opening="searchPointerOpen" @close="searchOpen = false" />
    <ValaxyAddons />
  </template>
</template>

<style scoped>
.kaede-navbar {
  --navbar-inset: 8px;
  min-height: calc(var(--nav-height) + 1px);
  border: 0;
  background: transparent;
  pointer-events: none;
}

.kaede-navbar-inner {
  top: var(--navbar-inset);
  width: min(calc(var(--content-width) + 28px), calc(100% - 24px));
  min-height: calc(var(--nav-height) - var(--navbar-inset));
  padding-inline: clamp(8px, 1.5vw, 16px);
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: 0 6px 22px rgb(29 22 27 / 12%);
  pointer-events: auto;
}

.kaede-nav-links a {
  min-height: calc(var(--nav-height) - var(--navbar-inset) - 2px);
}

.kaede-nav-links {
  position: relative;
}

.kaede-nav-links.has-active-indicator a.is-current {
  border-color: transparent;
}

.kaede-nav-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 2px;
  background: var(--accent);
  pointer-events: none;
  transform-origin: left center;
  visibility: hidden;
}

.has-active-indicator .kaede-nav-indicator {
  visibility: visible;
}

.kaede-navbar.is-tucked .kaede-navbar-inner {
  pointer-events: none;
}

@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .kaede-navbar-inner {
    background: color-mix(in srgb, var(--surface) 86%, transparent);
    -webkit-backdrop-filter: blur(14px) saturate(125%);
    backdrop-filter: blur(14px) saturate(125%);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .kaede-navbar-inner {
    background: var(--surface);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (max-width: 800px) {
  .kaede-mobile-nav {
    top: calc(100% + 8px);
    inset-inline: -1px;
    padding-inline: 8px;
    border: 1px solid var(--line);
    border-radius: 14px;
  }
}

@media (max-width: 800px) and (prefers-reduced-motion: no-preference) {
  .kaede-mobile-nav:not(.is-open) a {
    opacity: 0;
    translate: -10px -14px;
  }

  .kaede-mobile-nav.has-menu-motion a {
    transition: translate 190ms var(--ease-out), opacity 150ms var(--ease-out);
  }

  .kaede-mobile-nav.is-open.has-menu-motion a {
    transition-delay: calc(24ms + 32ms * var(--menu-step));
  }

  .kaede-mobile-nav.is-open.has-menu-motion a:focus-visible {
    transition: none;
  }
}
</style>
