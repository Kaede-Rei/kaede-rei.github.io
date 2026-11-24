<script setup lang="ts">
import { useRoute } from 'vue-router'
import { vArticleEntrance } from '../theme/utils/viewport-entrance'

const route = useRoute()
</script>

<template>
  <section v-article-entrance="route.path" class="kaede-page content">
    <ATILPageHeader />
    <RouterView />
  </section>
</template>
