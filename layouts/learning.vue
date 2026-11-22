<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { learningContext, learningMeta, learningPath, learningTrack, learningTracks } from '../theme/utils/learning'

const route = useRoute()
const meta = computed(() => learningMeta(route.meta.frontmatter))
const track = computed(() => learningTrack(meta.value))
const context = computed(() => learningContext(meta.value))
const title = computed(() => context.value?.phase.title || track.value?.title || meta.value.title)
const summary = computed(() => context.value?.phase.description || track.value?.description || meta.value.summary)
</script>

<template>
  <section class="kaede-page learning-page">
    <header class="kaede-page-header">
      <nav class="kaede-breadcrumb" aria-label="面包屑">
        <RouterLink to="/">首页</RouterLink>
        <template v-if="track">
          <span aria-hidden="true">/</span><RouterLink :to="learningPath">学习路径</RouterLink>
        </template>
        <template v-if="context">
          <span aria-hidden="true">/</span><RouterLink :to="context.track.path">{{ context.track.title }}</RouterLink>
        </template>
      </nav>
      <h1 class="kaede-page-title" tabindex="-1">{{ title }}</h1>
      <p class="learning-description">{{ summary }}</p>
      <p v-if="context" class="learning-audience">适合：{{ context.phase.audience }}</p>
    </header>
    <nav v-if="!track" class="learning-track-links" aria-label="学习方向">
      <RouterLink v-for="entry in learningTracks" :key="entry.path" :to="entry.path">
        <strong>{{ entry.title }} <span aria-hidden="true">→</span></strong>
        <span>{{ entry.description }}</span>
      </RouterLink>
    </nav>
    <RouterView :key="route.path" />
    <LearningOutline v-if="track" />
  </section>
</template>

<style scoped>
.learning-description {
  max-width: 42rem;
  color: var(--kaede-ink);
}

.learning-audience {
  color: var(--kaede-muted);
}

.learning-track-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-block: 1.5rem 2rem;
}

.learning-track-links a {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--kaede-line);
  border-radius: 0.75rem;
}

.learning-track-links a:hover {
  border-color: var(--kaede-accent);
}

.learning-track-links strong {
  color: var(--kaede-accent);
}

.learning-track-links a > span {
  color: var(--kaede-muted);
}

@media (max-width: 640px) {
  .learning-track-links {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
