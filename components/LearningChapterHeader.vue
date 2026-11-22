<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { chapterFromRoute } from '../theme/utils/learning'

const route = useRoute()
const chapter = computed(() => chapterFromRoute(route.path, route.meta.frontmatter))
</script>

<template>
  <div v-if="chapter" class="learning-chapter-status">
    <LearningStatus :status="chapter.status" />
    <template v-if="chapter.status === 'planned'">
      <h2>本节仍在整理</h2>
      <p>正文暂未公开，可返回阶段目录或继续阅读其他章节</p>
    </template>
    <p v-else-if="chapter.status === 'updating'">{{ chapter.updateNote }}</p>
  </div>
</template>

<style scoped>
.learning-chapter-status {
  margin-block: 1rem;
}

.learning-chapter-status h2 {
  margin: 0.75rem 0 0;
  font-weight: 600;
}

.learning-chapter-status p {
  margin: 0.3rem 0 0;
  color: var(--kaede-muted);
}
</style>
