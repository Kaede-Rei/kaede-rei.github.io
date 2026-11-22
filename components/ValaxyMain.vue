<script setup lang="ts">
import type { Post } from 'valaxy'
defineProps<{ frontmatter: Post }>()
</script>

<template>
  <div class="kaede-markdown-frame">
    <slot name="main-content">
      <ValaxyMd :frontmatter="frontmatter"><div class="prose"><slot name="main-content-md" /><slot /></div></ValaxyMd>
    </slot>
    <slot name="main-content-after" />
    <slot name="footer" />
  </div>
</template>
