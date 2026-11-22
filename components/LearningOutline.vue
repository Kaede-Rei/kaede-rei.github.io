<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { learningChapters, learningContext, learningTrack } from '../theme/utils/learning'

const route = useRoute()
const router = useRouter()
const track = computed(() => learningTrack(route.meta.frontmatter))
const context = computed(() => learningContext(route.meta.frontmatter))
const sections = computed(() => {
  if (!track.value)
    return []

  const currentTrack = track.value
  const phases = context.value ? [context.value.phase] : currentTrack.phases
  const routes = router.getRoutes()
  return phases.map((phase) => {
    const chapters = learningChapters(routes, currentTrack, phase)
    return {
      ...phase,
      chapters,
      readable: chapters.filter(chapter => chapter.status !== 'planned').length,
    }
  })
})
const showChapters = computed(() => context.value || track.value?.path.endsWith('/electrical-control'))
</script>

<template>
  <div v-if="track" class="learning-outline">
    <nav v-if="!context" class="learning-stage-links" aria-label="学习阶段">
      <RouterLink v-for="section in sections" :key="section.id" :to="section.overviewLink">
        {{ section.title }}
      </RouterLink>
    </nav>

    <section v-for="(section, index) in sections" :key="section.id" class="learning-stage">
      <h2 :id="context ? 'chapters' : section.id" tabindex="-1">
        {{ context ? '章节目录' : section.title }}
      </h2>
      <template v-if="!context">
        <p>{{ section.description }}</p>
        <p class="learning-audience">适合：{{ section.audience }}</p>
      </template>
      <p class="learning-count">{{ section.readable }} 个章节可阅读</p>

      <ul v-if="showChapters" class="learning-chapters">
        <li v-for="chapter in section.chapters" :key="chapter.path">
          <div>
            <RouterLink v-if="chapter.status !== 'planned'" :to="chapter.path" class="learning-chapter-link">
              {{ chapter.title }}
            </RouterLink>
            <span v-else>{{ chapter.title }}</span>
            <p v-if="chapter.status === 'updating'" class="learning-update-note">{{ chapter.updateNote }}</p>
          </div>
          <LearningStatus :status="chapter.status" />
        </li>
      </ul>
      <RouterLink v-else :to="section.overviewLink" class="learning-action">查看阶段目录 →</RouterLink>

      <RouterLink v-if="showChapters && !context && sections[index + 1]" :to="sections[index + 1].overviewLink" class="learning-action">
        查看下一阶段 →
      </RouterLink>
    </section>

    <div class="learning-outline-actions">
      <RouterLink v-if="context?.nextPhase" :to="context.nextPhase.overviewLink" class="learning-action">
        查看下一阶段 →
      </RouterLink>
      <RouterLink v-if="context" :to="track.path" class="learning-action">返回{{ track.title }}</RouterLink>
      <RouterLink to="/agrotech" class="learning-action">查看 ATIL 工程资料</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.learning-stage-links,
.learning-outline-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.25rem;
}

.learning-stage-links a,
.learning-action {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--kaede-accent);
  text-decoration: underline;
}

.learning-stage {
  border-top: 1px solid var(--kaede-line);
  margin-top: 1.5rem;
  padding-block: 1.25rem 0.5rem;
}

.learning-stage h2 {
  margin: 0 0 0.5rem;
  color: var(--kaede-ink);
  font-size: 1.3rem;
  font-weight: 650;
}

.learning-stage p {
  margin: 0 0 0.5rem;
}

.learning-audience,
.learning-count,
.learning-update-note {
  color: var(--kaede-muted);
}

.learning-count,
.learning-update-note {
  font-size: 0.875rem;
}

.learning-chapters {
  padding: 0;
  margin: 0;
  list-style: none;
}

.learning-chapters li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  column-gap: 0.65rem;
  padding-block: 0.35rem;
  border-bottom: 1px solid var(--kaede-line);
  overflow-wrap: anywhere;
}

.learning-chapters li:last-child {
  border-bottom: 0;
}

.learning-chapters .learning-update-note {
  margin-top: -0.15rem;
}

.learning-chapter-link {
  display: flex;
  align-items: center;
  min-height: 44px;
  color: var(--kaede-accent);
  text-decoration: underline;
}

.learning-outline-actions {
  margin-top: 1rem;
}
</style>
