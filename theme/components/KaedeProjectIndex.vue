<script setup lang="ts">
import type { ProjectRecord } from '../../data/site'
import { vViewportEntrance } from '../utils/viewport-entrance'

defineProps<{
  projects: readonly ProjectRecord[]
  showOwners?: boolean
  showDetails?: boolean
}>()
</script>

<template>
  <ul class="kaede-project-index" role="list">
    <li v-for="(project, index) in projects" :key="project.id" v-viewport-entrance:project-index="index === 0 ? 'feature' : 'editorial'" data-scene-card="row">
      <div data-scene-part="title"><a class="kaede-project-index-name" :href="project.url">{{ project.title }}</a></div>
      <p data-scene-part="body">{{ project.summary }}</p>
      <p data-scene-part="meta" class="kaede-project-index-meta">
        <template v-if="showOwners">{{ project.repositoryKind === 'personal' ? '个人仓库' : '组织项目' }} · </template>
        {{ project.stageLabel }}
      </p>
      <div v-if="showDetails" data-scene-part="meta">
        <p v-if="project.detail">{{ project.detail }}</p>
        <a v-if="project.more" :href="project.more.url">{{ project.more.label }}</a>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.kaede-project-index {
  display: grid;
  gap: 16px;
  padding: 0;
  list-style: none;
}

.kaede-project-index li {
  margin: 0;
  padding: 0 0 16px;
  border-bottom: 1px solid var(--line);
}

.kaede-project-index p {
  margin: 4px 0 0;
}

.kaede-project-index-name {
  font-weight: 650;
}

.kaede-project-index-meta {
  color: var(--muted);
  font-size: .875rem;
}
</style>
