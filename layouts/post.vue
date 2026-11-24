<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatPostDate, imageUrl, listValue, postCoverRole, postSummary } from '../theme/utils/content'
import { learningContext, learningTitle } from '../theme/utils/learning'
import { vRouteMasthead } from '../theme/utils/route-masthead'
import { vArticleEntrance, vViewportEntrance } from '../theme/utils/viewport-entrance'

const route = useRoute()
const fm = useFrontmatter()
const chapter = computed(() => learningContext(fm.value))
const summary = computed(() => postSummary(fm.value))
const date = computed(() => formatPostDate(fm.value.date))
const updated = computed(() => formatPostDate(fm.value.updated))
const category = computed(() => listValue(fm.value.categories).at(-1))
const cover = computed(() => {
  const source = fm.value.cover || fm.value.image
  return source && postCoverRole(fm.value) === 'informative' ? imageUrl(String(source)) : undefined
})
</script>

<template>
  <div class="kaede-reader" :class="{ 'has-no-toc': fm.status === 'planned' }">
    <article v-article-entrance="route.path" class="kaede-post kaede-page content">
      <header :key="route.path" v-route-masthead class="kaede-page-header" data-route-masthead="article">
        <nav class="kaede-breadcrumb" aria-label="面包屑">
          <template v-if="chapter">
            <RouterLink to="/learning-path">{{ learningTitle }}</RouterLink><span aria-hidden="true">/</span>
            <RouterLink :to="chapter.track.path">{{ chapter.track.title }}</RouterLink><span aria-hidden="true">/</span>
            <RouterLink :to="chapter.phase.overviewLink">{{ chapter.phase.title }}</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/archives">文章</RouterLink>
            <template v-if="category">
              <span aria-hidden="true">/</span><RouterLink :to="{ path: '/categories', query: { category } }">{{ category }}</RouterLink>
            </template>
          </template>
        </nav>
        <KaedeMastheadTitle>{{ fm.title }}</KaedeMastheadTitle>
        <p v-if="summary && fm.status !== 'planned'" data-masthead-copy class="kaede-page-summary">{{ summary }}</p>
        <div v-if="!chapter" data-masthead-copy="detail" class="kaede-post-meta">
          <time v-if="date" :datetime="date">发布于 {{ date }}</time>
          <time v-if="updated && updated !== date" :datetime="updated">更新于 {{ updated }}</time>
          <span v-if="fm.readingTime">约 {{ fm.readingTime }} 分钟</span>
        </div>
        <LearningChapterHeader v-if="chapter" />
      </header>
      <figure v-if="cover" :key="route.path" v-viewport-entrance="'feature'" data-scene-card="panel" class="kaede-reading-cover">
        <img :src="cover" data-scene-part="media" :alt="fm.coverAlt || ''" decoding="async">
        <figcaption v-if="fm.coverCaption" data-scene-part="meta">{{ fm.coverCaption }}</figcaption>
      </figure>
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="route.path" />
      </RouterView>
      <LearningPathPostNav />
    </article>
    <ClientOnly><KaedeToc v-if="fm.status !== 'planned'" :key="route.path" /></ClientOnly>
  </div>
</template>
