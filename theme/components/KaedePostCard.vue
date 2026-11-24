<script setup lang="ts">
import type { Post } from 'valaxy'
import { computed } from 'vue'
import { formatPostDate, imageUrl, listValue, postSummary } from '../utils/content'

const props = defineProps<{ post: Post, reverse?: boolean, textOnly?: boolean }>()
const category = computed(() => listValue(props.post.categories).at(-1))
const excerpt = computed(() => postSummary(props.post))
const date = computed(() => formatPostDate(props.post.date))
const cover = computed(() => {
  const source = props.post.cover || props.post.image
  return source ? imageUrl(String(source)) : undefined
})
</script>

<template>
  <article v-if="post.path" class="kaede-post-card" :data-scene-card="cover && !textOnly ? 'panel' : 'row'" :class="{ 'is-reversed': reverse, 'is-text': textOnly, 'has-cover': cover }">
    <div class="kaede-post-preview">
      <h3 data-scene-part="title"><RouterLink :to="post.path">{{ post.title }}</RouterLink></h3>
      <p v-if="excerpt" data-scene-part="body">{{ excerpt }}</p>
      <div data-scene-part="meta" class="kaede-post-meta">
        <time v-if="date" :datetime="date">{{ date }}</time>
        <RouterLink v-if="category" :to="{ path: '/categories', query: { category } }">{{ category }}</RouterLink>
      </div>
    </div>
    <div v-if="cover && !textOnly" data-scene-part="media" class="kaede-post-cover">
      <img :src="cover" alt="" width="640" height="360" loading="lazy" decoding="async">
    </div>
  </article>
</template>
