<script setup lang="ts">
import { usePostList } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { listValue } from '../utils/content'

const props = defineProps<{ type: 'tags' | 'categories' }>()
const posts = usePostList()
const route = useRoute()
const key = computed(() => props.type === 'tags' ? 'tag' : 'category')
const title = computed(() => props.type === 'tags' ? '标签' : '分类')
const hydrated = ref(false)
const selected = computed(() => hydrated.value ? String(route.query[key.value] || '') : '')
onMounted(() => { hydrated.value = true })
const values = computed(() => [...new Set(posts.value.flatMap(post => listValue(post[props.type])))])
const filtered = computed(() => selected.value ? posts.value.filter(post => listValue(post[props.type]).includes(selected.value)) : posts.value)
</script>

<template>
  <section class="kaede-page kaede-index content">
    <header class="kaede-page-header"><h1 class="kaede-page-title" tabindex="-1">文章{{ title }}</h1></header>
    <KaedeArticleNav />
    <nav class="kaede-taxonomy" :aria-label="`文章${title}`">
      <RouterLink :to="{ path: route.path }" :aria-current="!selected ? 'true' : undefined">全部 <small>{{ posts.length }}</small></RouterLink>
      <RouterLink v-for="value in values" :key="value" :to="{ path: route.path, query: { [key]: value } }"
        :aria-current="selected === value ? 'true' : undefined">{{ value }} <small>{{ posts.filter(post => listValue(post[type]).includes(value)).length }}</small></RouterLink>
    </nav>
    <h2 class="kaede-taxonomy-heading">{{ selected || '全部文章' }}</h2>
    <KaedePostCard v-for="post in filtered" :key="post.path" :post="post" text-only />
    <p v-if="!filtered.length" class="kaede-empty">暂无相关文章 <RouterLink :to="{ path: route.path }">查看全部</RouterLink></p>
  </section>
</template>
