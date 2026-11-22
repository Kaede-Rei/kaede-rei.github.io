<script setup lang="ts">
import type { ProjectRecord } from '../../data/site'

defineProps<{
  projects: readonly ProjectRecord[]
  showOwners?: boolean
  showDetails?: boolean
}>()
</script>

<template>
  <ul class="kaede-project-index" role="list">
    <li v-for="project in projects" :key="project.id">
      <a class="kaede-project-index-name" :href="project.url">{{ project.title }}</a>
      <p>{{ project.summary }}</p>
      <p class="kaede-project-index-meta">
        <template v-if="showOwners">{{ project.repositoryKind === 'personal' ? '个人仓库' : '组织项目' }} · </template>
        {{ project.stageLabel }}
      </p>
      <template v-if="showDetails">
        <p v-if="project.detail">{{ project.detail }}</p>
        <a v-if="project.more" :href="project.more.url">{{ project.more.label }}</a>
      </template>
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
