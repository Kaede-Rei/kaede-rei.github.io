<script setup lang="ts">
import { association } from '../../data/site'
import ATILBrand from './ATILBrand.vue'
</script>

<template>
  <header class="atil-page-header">
    <nav class="atil-breadcrumb" aria-label="面包屑">
      <RouterLink to="/">首页</RouterLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{{ association.shortName }}</span>
    </nav>
    <div class="atil-page-heading">
      <p class="atil-name">{{ association.shortName }} · {{ association.organization }}</p>
      <h1 class="kaede-page-title" tabindex="-1">{{ association.name }}</h1>
      <p>{{ association.description }}</p>
      <div class="atil-page-actions">
        <a class="kaede-button atil-primary-action" :href="association.githubOrg">访问 GitHub 组织</a>
        <RouterLink class="kaede-button atil-secondary-action" to="/learning-path">查看学习路径</RouterLink>
      </div>
    </div>
    <ATILBrand variant="banner" decorative />
  </header>
</template>

<style scoped>
.atil-page-header {
  display: grid;
  gap: clamp(24px, 4vw, 48px);
  width: min(1180px, calc(100% - 2 * var(--gutter, 24px)));
  box-sizing: border-box;
  margin: clamp(16px, 3vw, 32px) auto 0;
  padding: clamp(16px, 4vw, 48px);
  border-radius: 16px;
  background: linear-gradient(160deg, var(--atil-bg), var(--atil-bg-deep));
  color: var(--atil-fg);
}

.atil-breadcrumb,
.atil-page-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.atil-breadcrumb {
  color: var(--atil-muted);
  font-size: .875rem;
}

.atil-breadcrumb a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: .16em;
}

.atil-page-heading {
  display: grid;
  gap: 16px;
  max-width: 760px;
}

.atil-page-heading h1,
.atil-page-heading p {
  margin: 0;
  color: inherit;
  overflow-wrap: anywhere;
}

.atil-page-heading .atil-name {
  color: var(--atil-gold);
  font-size: .875rem;
  font-weight: 600;
}

.atil-page-actions .atil-primary-action {
  color: var(--atil-bg-deep);
  background: var(--atil-gold);
  border-color: var(--atil-gold);
}

.atil-page-actions .atil-secondary-action {
  color: var(--atil-fg);
  background: transparent;
  border-color: var(--atil-muted);
}

.atil-page-actions a:hover {
  text-decoration: underline;
  text-underline-offset: .16em;
}

.atil-page-header :focus-visible {
  outline-color: var(--atil-gold);
}
</style>
