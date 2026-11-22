<script setup lang="ts">
import type { ProjectRecord } from '../../data/site'

defineProps<{
  project: ProjectRecord
  priority: 'lead' | 'standard' | 'compact'
}>()
</script>

<template>
  <article class="kaede-project-card" :class="`kaede-project-card--${priority}`">
    <div class="kaede-project-card-copy">
      <h3>{{ project.title }}</h3>
      <p v-if="project.subtitle" class="kaede-project-subtitle">{{ project.subtitle }}</p>
      <p>{{ project.summary }}</p>
      <p class="kaede-project-status">{{ project.stageLabel }}</p>
      <ul v-if="project.modules?.length" class="kaede-project-modules" aria-label="SDK 公共层">
        <li v-for="module in project.modules" :key="module"><code>{{ module }}</code></li>
      </ul>
      <div class="kaede-project-actions">
        <a class="kaede-button kaede-button--primary" :href="project.url">{{ project.action || '查看项目' }}</a>
        <a v-if="project.more" class="kaede-button" :href="project.more.url">{{ project.more.label }}</a>
      </div>
      <p v-if="project.release || project.detail" class="kaede-project-detail">
        <template v-if="project.release">
          <a :href="project.release.url">{{ project.release.tag }}</a>
          · <time :datetime="project.release.publishedAt">{{ project.release.publishedAt }}</time>
          <br v-if="project.detail">
        </template>
        {{ project.detail }}
      </p>
    </div>
    <figure v-if="project.image" class="kaede-project-figure">
      <img
        :src="project.image.src"
        :alt="project.image.alt"
        :width="project.image.width"
        :height="project.image.height"
        loading="lazy"
        decoding="async"
      >
      <figcaption>{{ project.image.caption }}</figcaption>
    </figure>
  </article>
</template>

<style scoped>
.kaede-project-card {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 24px;
  padding: clamp(16px, 2.5vw, 28px);
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
}

.kaede-project-card--lead {
  align-items: center;
  border-radius: 16px;
}

.kaede-project-card--compact {
  background: var(--surface-soft);
}

.kaede-project-card-copy {
  display: grid;
  gap: 12px;
  min-width: 0;
  align-content: start;
}

.kaede-project-card h3,
.kaede-project-card p {
  margin: 0;
  overflow-wrap: anywhere;
}

.kaede-project-card h3 {
  font-size: clamp(1.25rem, 2.2vw, 1.5rem);
  line-height: 1.3;
}

.kaede-project-subtitle {
  font-weight: 600;
}

.kaede-project-status,
.kaede-project-detail,
.kaede-project-figure figcaption {
  color: var(--muted);
  font-size: .875rem;
}

.kaede-project-actions,
.kaede-project-modules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.kaede-project-modules {
  margin: 0;
  padding: 0;
  list-style: none;
}

.kaede-project-modules code {
  display: block;
  padding: 2px 8px;
  border-radius: 8px;
  color: var(--ink);
  background: var(--surface);
}

.kaede-project-detail a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: .16em;
}

.kaede-project-figure {
  min-width: 0;
  margin: 0;
}

.kaede-project-figure img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--line);
  border-radius: 8px;
}

.kaede-project-figure figcaption {
  margin-top: 8px;
}

@media (min-width: 900px) {
  .kaede-project-card--lead {
    grid-template-columns: minmax(0, 4fr) minmax(0, 6fr);
  }
}
</style>
