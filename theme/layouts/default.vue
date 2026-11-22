<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
const fm = useFrontmatter()
</script>

<template>
  <section class="kaede-page content">
    <header class="kaede-page-header">
      <nav class="kaede-breadcrumb" aria-label="面包屑"><RouterLink to="/">首页</RouterLink></nav>
      <h1 class="kaede-page-title" tabindex="-1">{{ fm.title }}</h1>
    </header>
    <RouterView />
  </section>
</template>
