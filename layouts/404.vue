<script setup lang="ts">
import { inject } from 'vue'
import { vRouteMasthead } from '../theme/utils/route-masthead'
const openSearch = inject<(event?: MouseEvent) => void>('kaedeOpenSearch')
</script>

<template>
  <section class="kaede-page kaede-missing">
    <header v-route-masthead class="kaede-page-header" data-route-masthead="profile">
      <KaedeMastheadTitle>这里还没有内容</KaedeMastheadTitle>
      <p data-masthead-copy class="kaede-page-summary">返回首页，或搜索文章与学习内容</p>
    </header>
    <div class="kaede-actions">
      <RouterLink class="kaede-button kaede-button--primary" to="/">返回首页</RouterLink>
      <button class="kaede-button" type="button" @click="openSearch?.($event)">打开搜索</button>
    </div>
  </section>
</template>
