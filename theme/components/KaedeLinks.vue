<script setup lang="ts">
import { onMounted, ref } from 'vue'
const props = defineProps<{ links: string }>()
const links = ref<{ name: string, url: string, avatar?: string, desc?: string }[]>([])
const status = ref('正在加载友情链接...')
function http(value: unknown) { try { const url = new URL(String(value)); return ['https:', 'http:'].includes(url.protocol) ? url.href : '' } catch { return '' } }
onMounted(async () => {
  try {
    const response = await fetch(props.links)
    if (!response.ok) throw new Error('Unable to load links')
    const data = await response.json()
    const items = Array.isArray(data) ? data : data.links || []
    links.value = items.map((item: Record<string, unknown>) => ({ name: String(item.name || item.title || ''), url: http(item.url || item.link), avatar: http(item.avatar), desc: String(item.desc || item.description || '') })).filter((item: { url: string }) => item.url)
    status.value = links.value.length ? '' : '暂时没有友情链接'
  } catch { status.value = '友情链接暂时无法加载' }
})
</script>
<template><p v-if="status" aria-live="polite">{{ status }}</p><div class="kaede-friend-links"><a v-for="link in links" :key="link.url" :href="link.url" target="_blank" rel="noopener noreferrer"><img v-if="link.avatar" :src="link.avatar" :alt="link.name" width="48" height="48" loading="lazy" decoding="async"><span><strong>{{ link.name }}</strong><small>{{ link.desc }}</small></span></a></div></template>
