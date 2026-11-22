<script setup lang="ts">
import { usePostList } from 'valaxy'
import { computed } from 'vue'
import { formatPostDate } from '../utils/content'

const posts = usePostList()
const dated = computed(() => [...posts.value].sort((a, b) => formatPostDate(b.date).localeCompare(formatPostDate(a.date))))
const years = computed(() => [...new Set(dated.value.map(post => formatPostDate(post.date).slice(0, 4)))])
</script>

<template>
  <section class="kaede-page kaede-index content">
    <header class="kaede-page-header">
      <h1 class="kaede-page-title" tabindex="-1">文章</h1>
      <p class="kaede-page-summary">记录设计取舍、调试过程和可以复用的工程方法</p>
    </header>
    <KaedeArticleNav />
    <p class="kaede-archive-count">共 {{ posts.length }} 篇文章</p>
    <section v-for="year in years" :key="year" class="kaede-archive-year">
      <h2>{{ year || '日期未标注' }}</h2>
      <RouterLink v-for="post in dated.filter(item => formatPostDate(item.date).slice(0, 4) === year && item.path)"
        :key="post.path" :to="post.path!" class="kaede-archive-item">
        <time v-if="year" :datetime="formatPostDate(post.date)">{{ formatPostDate(post.date).slice(5) }}</time>
        <span>{{ post.title }}</span><span class="kaede-link-arrow" aria-hidden="true">→</span>
      </RouterLink>
    </section>
    <p v-if="!posts.length" class="kaede-empty">暂无文章 <RouterLink to="/learning-path">查看学习路径</RouterLink></p>
  </section>
</template>
