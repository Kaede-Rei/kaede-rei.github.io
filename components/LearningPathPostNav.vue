<script setup lang="ts">
import { usePrevNext } from 'valaxy'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterFromRoute, learningChapters, learningContext } from '../theme/utils/learning'

const route = useRoute()
const router = useRouter()
const [blogPrev, blogNext] = usePrevNext()

const chapterNav = computed(() => {
  const chapter = chapterFromRoute(route.path, route.meta.frontmatter)
  const context = learningContext(route.meta.frontmatter)
  if (!chapter || !context)
    return undefined

  const routes = router.getRoutes()
  const { track, phase, nextPhase } = context
  const readable = learningChapters(routes, track, phase).filter(item => item.status !== 'planned')
  const prev = readable.findLast(item => item.order < chapter.order)
  const next = readable.find(item => item.order > chapter.order)
  const laterPhases = track.phases.slice(track.phases.indexOf(phase) + 1)
  const nextReadable = chapter.status === 'planned' && !next
    ? laterPhases.flatMap(item => learningChapters(routes, track, item)).find(item => item.status !== 'planned')
    : undefined

  return { track, phase, nextPhase, chapter, prev, next, nextReadable }
})
</script>

<template>
  <nav v-if="chapterNav" class="learning-chapter-nav" aria-label="章节导航">
    <p v-if="!chapterNav.next && chapterNav.chapter.status !== 'planned'">已到本阶段最后一个可读章节</p>
    <div v-if="chapterNav.prev || chapterNav.next || chapterNav.nextPhase" class="learning-chapter-neighbors">
      <RouterLink v-if="chapterNav.prev" :to="chapterNav.prev.path">
        <span>← 上一可读章节</span>
        <strong>{{ chapterNav.prev.title }}</strong>
      </RouterLink>
      <RouterLink v-if="chapterNav.next" :to="chapterNav.next.path">
        <span>下一可读章节 →</span>
        <strong>{{ chapterNav.next.title }}</strong>
      </RouterLink>
      <RouterLink v-else-if="chapterNav.nextPhase" :to="chapterNav.nextPhase.overviewLink">
        <span>进入下一阶段 →</span>
        <strong>{{ chapterNav.nextPhase.title }}</strong>
      </RouterLink>
    </div>
    <div class="learning-chapter-links">
      <RouterLink :to="chapterNav.phase.overviewLink">返回本阶段</RouterLink>
      <RouterLink :to="chapterNav.track.path">
        {{ chapterNav.nextPhase ? `返回${chapterNav.track.title}` : '返回本学习路径' }}
      </RouterLink>
      <RouterLink v-if="chapterNav.nextReadable" :to="chapterNav.nextReadable.path">
        下一可读章节：{{ chapterNav.nextReadable.title }}
      </RouterLink>
      <RouterLink v-if="!chapterNav.nextPhase" to="/agrotech">查看 ATIL 工程资料</RouterLink>
    </div>
  </nav>
  <nav v-else-if="blogPrev?.path || blogNext?.path" class="kaede-post-nav" aria-label="前后文章">
    <RouterLink v-if="blogPrev?.path" :to="blogPrev.path"><span>← 上一篇</span><strong>{{ blogPrev.title }}</strong></RouterLink>
    <RouterLink v-if="blogNext?.path" class="kaede-next" :to="blogNext.path"><span>下一篇 →</span><strong>{{ blogNext.title }}</strong></RouterLink>
  </nav>
</template>

<style scoped>
.learning-chapter-nav {
  border-top: 1px solid var(--kaede-line);
  margin-top: 2rem;
  padding-top: 1rem;
}

.learning-chapter-nav p {
  margin: 0 0 0.5rem;
  color: var(--kaede-muted);
}

.learning-chapter-neighbors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.learning-chapter-neighbors a {
  display: grid;
  align-content: start;
  gap: 0.25rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--kaede-line);
  border-radius: 0.5rem;
}

.learning-chapter-neighbors span {
  color: var(--kaede-muted);
  font-size: 0.875rem;
}

.learning-chapter-neighbors strong {
  color: var(--kaede-accent);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.learning-chapter-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1rem;
  margin-top: 0.5rem;
}

.learning-chapter-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--kaede-accent);
  text-decoration: underline;
}

@media (max-width: 520px) {
  .learning-chapter-neighbors {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.6rem;
  }
}
</style>
