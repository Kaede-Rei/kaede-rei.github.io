<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { useRoute } from 'vue-router'
import { vRouteMasthead } from '../utils/route-masthead'
import { vArticleEntrance } from '../utils/viewport-entrance'

const fm = useFrontmatter()
const route = useRoute()
</script>

<template>
  <section :key="route.path" v-route-masthead v-article-entrance="route.path" class="kaede-page content" data-route-masthead="profile">
    <header class="kaede-page-header">
      <nav class="kaede-breadcrumb" aria-label="面包屑"><RouterLink to="/">首页</RouterLink></nav>
      <KaedeMastheadTitle>{{ fm.title }}</KaedeMastheadTitle>
    </header>
    <RouterView />
  </section>
</template>
