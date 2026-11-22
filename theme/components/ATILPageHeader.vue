<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { association, profile } from '../../data/site'
import ATILBrand from './ATILBrand.vue'

const frontmatter = useFrontmatter()
</script>

<template>
  <header class="kaede-page-header">
    <nav class="kaede-breadcrumb" aria-label="面包屑">
      <RouterLink to="/">首页</RouterLink>
      <span aria-hidden="true">/</span>
      <RouterLink to="/about">关于</RouterLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{{ association.shortName }}</span>
    </nav>
    <div class="atil-page-heading">
      <ATILBrand variant="compact" decorative />
      <div>
        <h1 id="我在-atil-的工作" class="kaede-page-title" tabindex="-1">{{ frontmatter.title }}</h1>
        <p>{{ association.name }} · {{ association.organization }}</p>
      </div>
    </div>
    <p id="公开工作方向" class="kaede-page-summary" tabindex="-1">
      我是 {{ association.organization }} 的{{ profile.associationRole }}，参与项目组织与开发，主要关注机械臂控制、嵌入式软件和系统集成，也为后续项目整理公共模块和接口文档
    </p>
  </header>
</template>

<style scoped>
.atil-page-heading {
  display: flex;
  align-items: center;
  gap: 16px;
}

.atil-page-heading :deep(.atil-brand-mark) {
  --mark-size: 52px;
}

.atil-page-heading p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: .875rem;
  overflow-wrap: anywhere;
}
</style>
