<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { usePostList, useSiteConfig } from 'valaxy'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { association, featuredProjects } from '../../data/site'
import { formatPostDate } from '../utils/content'
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
const preferences = ref<PostLayouts>({ version: 2, desktop: 'image', mobile: 'image' })
const mode = computed(() => isMobile.value ? preferences.value.mobile : preferences.value.desktop)
const feed = ref<HTMLElement>()
const modes: { id: LayoutMode, name: string, icon: string }[] = [
  { id: 'image', name: '图文列表', icon: 'i-ri-layout-left-line' },
  { id: 'text', name: '文字列表', icon: 'i-ri-list-check' },
  { id: 'alternate', name: '交错图文', icon: 'i-ri-layout-row-line' },
]
const learning = [
  { title: '电控', description: '从 C 语言与单片机开始，逐步学习控制、通信、RTOS 与工程组织', label: '查看电控路线', path: '/learning-path/electrical-control', icon: 'i-ri-cpu-line' },
  { title: '机械臂运控', description: '从空间几何与建模出发，连接 ROS 2、运动规划与模仿学习实践', label: '查看机械臂路线', path: '/learning-path/arm-motion-control', icon: 'i-ri-node-tree' },
]

onMounted(() => {
  preferences.value = readPostLayouts()
  applyPostLayouts(preferences.value)
})
async function changeLayout(value: LayoutMode) {
  if (value === mode.value) return
  const cards = Array.from(feed.value?.querySelectorAll<HTMLElement>('.kaede-post-card') || [])
  const anchor = cards.find(card => card.getBoundingClientRect().top >= 72 && card.getBoundingClientRect().top < window.innerHeight)
  const offset = anchor?.getBoundingClientRect().top ?? 0

  if (isMobile.value) {
    if (value === 'alternate') return
    preferences.value.mobile = value
  }
  else {
    preferences.value.desktop = value
  }

  applyPostLayouts(preferences.value)
  try { localStorage.setItem('kaede-post-layout-v2', JSON.stringify(preferences.value)) }
  catch {}
  await nextTick()
  if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - offset, behavior: 'instant' })
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
          <h2 id="learning-title"><RouterLink to="/learning-path">学习路径</RouterLink></h2>
          <p>按阶段查看基础知识、开发工具和项目实践，大纲标明可阅读的章节</p>
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
      <RouterLink class="kaede-agrotech-entry" :to="association.path">
        <ATILBrand variant="compact" decorative />
        <div>
          <span class="kaede-agrotech-label">ATIL · AgroTech-SCAU</span>
          <h2>{{ association.name }}</h2>
        </div>
        <p>{{ association.homeIntro }}</p>
        <span class="kaede-entry-action">了解 ATIL <span class="kaede-link-arrow" aria-hidden="true">→</span></span>
      </RouterLink>
    </div>

    <section id="projects" class="kaede-home-section" aria-labelledby="projects-title">
      <div class="kaede-section-heading">
        <h2 id="projects-title" tabindex="-1">精选项目</h2>
      </div>
      <div class="kaede-project-grid">
        <KaedeProjectCard v-for="(project, index) in featuredProjects" :key="project.id" :project="project"
          :priority="index === 0 ? 'lead' : index === 2 ? 'compact' : 'standard'" />
      </div>
    </section>
  </template>

  <section ref="feed" class="kaede-home-section kaede-feed" aria-labelledby="recent-title">
    <div class="kaede-feed-toolbar">
      <div class="kaede-section-heading">
        <h2 id="recent-title">{{ isHome ? '最近文章' : '文章列表' }}</h2>
        <p v-if="isHome">设计取舍、调试记录和可复用的工程方法</p>
      </div>
      <div class="kaede-feed-modes" role="group" aria-label="文章排列方式">
        <button v-for="item in modes" :key="item.id" type="button"
          :class="{ 'kaede-desktop-mode': item.id === 'alternate' }" :aria-label="item.name"
          :title="item.name" :aria-pressed="mode === item.id" @click="changeLayout(item.id)">
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
  <KaedeSidebar v-if="isHome" />
</template>
