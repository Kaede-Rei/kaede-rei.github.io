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
const motionReady = ref(false)
const feedStyle = computed(() => motionReady.value ? {
  '--feed-mode-slot': motion.x,
  '--feed-layout-offset': `${Math.max(-8, Math.min(8, (motion.x - modeSlot.value) * 4))}px`,
} : undefined)
let movingCards: HTMLElement[] = []
let layoutChange = 0

const learning = [
  { ...currentLearningTracks[0], label: '查看电控笔记', icon: 'i-ri-cpu-line' },
  { ...currentLearningTracks[1], label: '查看机械臂文档', icon: 'i-ri-node-tree' },
]

onMounted(() => {
  preferences.value = readPostLayouts()
  applyPostLayouts(preferences.value)
  snapIndicator()
  motionReady.value = true
})
watch([isMobile, reduceMotion], snapIndicator)
onUnmounted(clearMovingCards)

function clearMovingCards() {
  for (const card of movingCards) card.classList.remove('is-layout-settling')
  movingCards = []
}

function snapIndicator() {
  spring.stop()
  motion.x = modeSlot.value
  clearMovingCards()
}

async function changeLayout(value: LayoutMode, event: MouseEvent) {
  if (value === mode.value || (value === 'alternate' && isMobile.value)) return
  const change = ++layoutChange
  const cards = Array.from(feed.value?.querySelectorAll<HTMLElement>('.kaede-post-card') || [], card => ({
    card,
    bounds: card.getBoundingClientRect(),
  }))
  const anchor = cards.find(({ bounds }) => bounds.top >= 72 && bounds.top < window.innerHeight)
  const animate = isPointerClick(event) && !reduceMotion.value

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
    clearMovingCards()
    movingCards = cards
      .filter(({ bounds }) => bounds.top < window.innerHeight && bounds.bottom > 72)
      .map(({ card }) => card)
    for (const card of movingCards) card.classList.add('is-layout-settling')
    // Retarget the same spring so the current motion and velocity carry through rapid switches.
    void Promise.resolve(spring.set({ x: modeSlot.value })).then(() => {
      if (change === layoutChange) clearMovingCards()
    })
  }
  else {
    snapIndicator()
  }

  await nextTick()
  if (anchor && change === layoutChange)
    window.scrollBy({ top: anchor.card.getBoundingClientRect().top - anchor.bounds.top, behavior: 'instant' })
}
</script>

<template>
  <KaedeHero v-if="isHome" />
  <header v-else class="kaede-page-header">
    <nav class="kaede-breadcrumb" aria-label="面包屑"><RouterLink to="/archives">文章</RouterLink><span aria-hidden="true">/</span><span>第 {{ page }} 页</span></nav>
    <h1 class="kaede-page-title" tabindex="-1">文章 · 第 {{ page }} 页</h1>
  </header>

  <template v-if="isHome">
    <div class="kaede-home-entries">
      <section class="kaede-path-entry" aria-labelledby="learning-title">
        <div class="kaede-section-heading">
          <h2 id="learning-title"><RouterLink to="/learning-path">{{ learningTitle }}</RouterLink></h2>
          <p>我的嵌入式电控与机械臂开发笔记，按主题整理基础知识、工具和工程实践</p>
        </div>
        <div class="kaede-path-entry-links">
          <RouterLink v-for="track in learning" :key="track.path" class="kaede-track-entry" :to="track.path">
            <span :class="track.icon" class="kaede-track-icon" aria-hidden="true" />
            <strong>{{ track.title }}</strong>
            <span class="kaede-track-description">{{ track.description }}</span>
            <span class="kaede-entry-action">{{ track.label }} <span class="kaede-link-arrow" aria-hidden="true">→</span></span>
          </RouterLink>
        </div>
      </section>
      <KaedeSidebar />
    </div>

    <section id="projects" class="kaede-home-section" aria-labelledby="projects-title">
      <div class="kaede-section-heading">
        <h2 id="projects-title" tabindex="-1">机器人开发项目</h2>
      </div>
      <div class="kaede-project-grid">
        <KaedeProjectCard v-for="(project, index) in featuredProjects" :key="project.id" :project="project"
          :priority="index === 0 ? 'lead' : index === 2 ? 'compact' : 'standard'" />
      </div>
    </section>
  </template>

  <section ref="feed" class="kaede-home-section kaede-feed" aria-labelledby="recent-title" :style="feedStyle">
    <div class="kaede-feed-toolbar">
      <div class="kaede-section-heading">
        <h2 id="recent-title">{{ isHome ? '最近文章' : '文章列表' }}</h2>
        <p v-if="isHome">设计取舍、调试记录和可复用的工程方法</p>
      </div>
      <div class="kaede-feed-modes" role="group" aria-label="文章排列方式">
        <span class="kaede-feed-mode-indicator" aria-hidden="true" />
        <button v-for="item in modes" :key="item.id" type="button"
          :class="{ 'kaede-desktop-mode': item.id === 'alternate' }" :aria-label="item.name"
          :title="item.name" :aria-pressed="mode === item.id" @click="changeLayout(item.id, $event)">
          <span :class="item.icon" aria-hidden="true" />
        </button>
      </div>
    </div>
    <KaedePostCard v-for="(post, index) in visible" :key="post.path" :post="post" :reverse="index % 2 === 1" />
    <p v-if="!visible.length" class="kaede-empty">这一页暂无文章 <RouterLink to="/archives">返回文章列表</RouterLink></p>
    <RouterLink v-if="isHome" class="kaede-button kaede-all-articles" to="/archives">查看全部文章 <span class="kaede-link-arrow" aria-hidden="true">→</span></RouterLink>
    <nav v-else-if="numberOfPages > 1 || page !== 1" class="kaede-pagination" aria-label="文章分页">
      <RouterLink v-for="index in Math.max(numberOfPages, 1)" :key="index" :to="index === 1 ? '/' : `/page/${index}`" :aria-current="page === index ? 'page' : undefined">{{ index }}</RouterLink>
    </nav>
  </section>
</template>
