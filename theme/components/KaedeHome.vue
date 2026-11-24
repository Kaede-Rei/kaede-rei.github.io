<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { useSpring } from '@vueuse/motion'
import { usePostList, useSiteConfig } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { featuredProjects } from '../../data/site'
import { isPointerClick } from '../utils/anchor-scroll'
import { formatPostDate } from '../utils/content'
import { currentLearningTracks, learningTitle } from '../utils/learning'
import { applyPostLayouts, readPostLayouts, type LayoutMode, type PostLayouts } from '../utils/post-layout'
import { vRouteMasthead } from '../utils/route-masthead'
import { sampleSpring } from '../utils/spring-frames'
import { vViewportEntrance } from '../utils/viewport-entrance'

const allPosts = usePostList()
const posts = computed(() => [...allPosts.value].sort((a, b) => formatPostDate(b.date).localeCompare(formatPostDate(a.date))))
const route = useRoute()
const pageSize = useSiteConfig().value.pageSize
const numberOfPages = computed(() => Math.ceil(posts.value.length / pageSize))
const page = computed(() => Number(route.params.page || 1))
const isHome = computed(() => route.path === '/')
const visible = computed(() => posts.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const isMobile = useMediaQuery('(max-width: 680px)')
const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const preferences = ref<PostLayouts>({ version: 2, desktop: 'image', mobile: 'image' })
const mode = computed(() => isMobile.value ? preferences.value.mobile : preferences.value.desktop)
const feed = ref<HTMLElement>()
const modes: { id: LayoutMode, name: string, icon: string }[] = [
  { id: 'image', name: '图文列表', icon: 'i-ri-layout-left-line' },
  { id: 'text', name: '文字列表', icon: 'i-ri-list-check' },
  { id: 'alternate', name: '交错图文', icon: 'i-ri-layout-row-line' },
]
const modeSlot = computed(() => modes.findIndex(item => item.id === mode.value))
const motion = reactive({ x: 0 })
const spring = useSpring(motion, { stiffness: 440, damping: 32, mass: 0.85, restDelta: 0.001 })
const feedIndicator = ref<HTMLElement>()
const layoutDuration = 520
const layoutFrames = sampleSpring({ duration: layoutDuration, stiffness: 310, damping: 26 })
let layoutAnimations: Animation[] = []
let layoutChange = 0

const learning = [
  { ...currentLearningTracks[0], label: '查看电控笔记', icon: 'i-ri-cpu-line' },
  { ...currentLearningTracks[1], label: '查看机械臂文档', icon: 'i-ri-node-tree' },
]

onMounted(() => {
  preferences.value = readPostLayouts()
  applyPostLayouts(preferences.value)
  snapIndicator()
})
watch([isMobile, reduceMotion], snapIndicator)
watch(() => [feedIndicator.value, motion.x] as const, ([element, x]) => {
  element?.style.setProperty('--feed-mode-slot', String(x))
}, { flush: 'post' })
onUnmounted(clearLayoutOffsets)

function clearLayoutOffsets() {
  for (const animation of layoutAnimations) animation.cancel()
  layoutAnimations = []
}

function animateLayoutOffset(element: HTMLElement, x: number, y: number, cover?: 'move' | 'show') {
  if (!element.animate) return
  const frames = layoutFrames.map((progress) => {
    const visible = Math.min(1, Math.max(0, progress))
    const opacity = cover === 'show' ? .2 + .8 * visible : 1 - .7 * Math.sin(Math.PI * visible)
    return {
      transform: `translate3d(${x * (1 - progress)}px, ${y * (1 - progress)}px, 0)`,
      ...(cover && { opacity }),
    }
  })
  layoutAnimations.push(element.animate(frames, layoutDuration))
}

function snapIndicator() {
  spring.stop()
  motion.x = modeSlot.value
  clearLayoutOffsets()
}

async function changeLayout(value: LayoutMode, event: MouseEvent) {
  if (value === mode.value || (value === 'alternate' && isMobile.value)) return
  const change = ++layoutChange
  const animate = isPointerClick(event) && !reduceMotion.value
  const rows = Array.from(feed.value?.querySelectorAll<HTMLElement>('.kaede-post-card') || [], card => ({ card, bounds: card.getBoundingClientRect() }))
  const cards = rows.filter(({ bounds }) => animate && bounds.top < window.innerHeight && bounds.bottom > 72).map(({ card, bounds }) => {
    const preview = card.querySelector<HTMLElement>('.kaede-post-preview')
    const cover = card.querySelector<HTMLElement>('.kaede-post-cover')
    return {
      card,
      bounds,
      preview,
      previewLeft: preview?.getBoundingClientRect().left,
      cover,
      coverBounds: cover?.getBoundingClientRect(),
    }
  })
  const anchor = rows.find(({ bounds }) => bounds.top >= 72 && bounds.top < window.innerHeight)
  clearLayoutOffsets()

  if (isMobile.value) {
    if (value !== 'alternate') preferences.value.mobile = value
  }
  else {
    preferences.value.desktop = value
  }

  applyPostLayouts(preferences.value)
  try { localStorage.setItem('kaede-post-layout-v2', JSON.stringify(preferences.value)) }
  catch {}
  if (animate) {
    void spring.set({ x: modeSlot.value })
  }
  else {
    snapIndicator()
  }

  await nextTick()
  if (change !== layoutChange) return
  if (anchor)
    window.scrollBy({ top: anchor.card.getBoundingClientRect().top - anchor.bounds.top, behavior: 'instant' })
  if (!animate || reduceMotion.value) return

  const offsets: Parameters<typeof animateLayoutOffset>[] = []
  // Measure every new position before starting any animation, so siblings share a single layout pass.
  for (const { card, bounds, preview, previewLeft, cover, coverBounds } of cards) {
    const y = bounds.top - card.getBoundingClientRect().top
    if (Math.abs(y) > .5) offsets.push([card, 0, y])
    if (preview && previewLeft !== undefined) {
      const x = previewLeft - preview.getBoundingClientRect().left
      if (Math.abs(x) > .5) offsets.push([preview, x, 0])
    }
    if (cover && coverBounds) {
      const next = cover.getBoundingClientRect()
      const x = coverBounds.width ? coverBounds.left - next.left : 0
      if (next.width && (!coverBounds.width || Math.abs(x) > .5))
        offsets.push([cover, x, 0, coverBounds.width ? 'move' : 'show'])
    }
  }
  for (const offset of offsets) animateLayoutOffset(...offset)
}
</script>

<template>
  <KaedeHero v-if="isHome" />
  <header v-else :key="route.path" v-route-masthead class="kaede-page-header" data-route-masthead="archive">
    <nav class="kaede-breadcrumb" aria-label="面包屑"><RouterLink to="/archives">文章</RouterLink><span aria-hidden="true">/</span><span>第 {{ page }} 页</span></nav>
    <KaedeMastheadTitle>文章 · 第 {{ page }} 页</KaedeMastheadTitle>
  </header>

  <template v-if="isHome">
    <div class="kaede-home-entries">
      <section class="kaede-path-entry" aria-labelledby="learning-title">
        <div v-viewport-entrance:home-overview="'lead'" class="kaede-section-heading">
          <h2 id="learning-title"><RouterLink to="/learning-path">{{ learningTitle }}</RouterLink></h2>
          <p>我的嵌入式电控与机械臂开发笔记，按主题整理基础知识、工具和工程实践</p>
        </div>
        <div class="kaede-path-entry-links">
          <RouterLink v-for="track in learning" :key="track.path" v-viewport-entrance:home-tracks="'pair'" data-scene-card="panel" class="kaede-track-entry" :to="track.path">
            <span :class="track.icon" data-scene-part="media" class="kaede-track-icon" aria-hidden="true" />
            <strong data-scene-part="title">{{ track.title }}</strong>
            <span data-scene-part="body" class="kaede-track-description">{{ track.description }}</span>
            <span data-scene-part="meta" class="kaede-entry-action">{{ track.label }} <span class="kaede-link-arrow" aria-hidden="true">→</span></span>
          </RouterLink>
        </div>
      </section>
      <KaedeSidebar v-viewport-entrance:home-overview="'pair'" />
    </div>

    <section id="projects" class="kaede-home-section" aria-labelledby="projects-title">
      <div v-viewport-entrance:home-projects="'lead'" class="kaede-section-heading">
        <h2 id="projects-title" tabindex="-1">机器人开发项目</h2>
      </div>
      <div class="kaede-project-grid">
        <KaedeProjectCard v-for="(project, index) in featuredProjects" :key="project.id"
          v-viewport-entrance:home-projects="index === 0 ? 'feature' : 'pair'" :project="project"
          :priority="index === 0 ? 'lead' : index === 2 ? 'compact' : 'standard'" />
      </div>
    </section>
  </template>

  <section ref="feed" class="kaede-home-section kaede-feed" aria-labelledby="recent-title">
    <div v-viewport-entrance:home-articles.fade class="kaede-feed-toolbar">
      <div class="kaede-section-heading">
        <h2 id="recent-title">{{ isHome ? '最近文章' : '文章列表' }}</h2>
        <p v-if="isHome">设计取舍、调试记录和可复用的工程方法</p>
      </div>
      <div class="kaede-feed-modes" role="group" aria-label="文章排列方式">
        <span ref="feedIndicator" class="kaede-feed-mode-indicator" aria-hidden="true" />
        <button v-for="item in modes" :key="item.id" type="button"
          :class="{ 'kaede-desktop-mode': item.id === 'alternate' }" :aria-label="item.name"
          :title="item.name" :aria-pressed="mode === item.id" @click="changeLayout(item.id, $event)">
          <span :class="item.icon" aria-hidden="true" />
        </button>
      </div>
    </div>
    <KaedePostCard v-for="(post, index) in visible" :key="post.path" v-viewport-entrance:home-articles="'editorial'"
      :post="post" :reverse="index % 2 === 1" />
    <p v-if="!visible.length" class="kaede-empty">这一页暂无文章 <RouterLink to="/archives">返回文章列表</RouterLink></p>
    <RouterLink v-if="isHome" v-viewport-entrance="'pair'" class="kaede-button kaede-all-articles" to="/archives">查看全部文章 <span class="kaede-link-arrow" aria-hidden="true">→</span></RouterLink>
    <nav v-else-if="numberOfPages > 1 || page !== 1" v-viewport-entrance="'pair'" class="kaede-pagination" aria-label="文章分页">
      <RouterLink v-for="index in Math.max(numberOfPages, 1)" :key="index" :to="index === 1 ? '/' : `/page/${index}`" :aria-current="page === index ? 'page' : undefined">{{ index }}</RouterLink>
    </nav>
  </section>
</template>
