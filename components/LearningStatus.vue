<script setup lang="ts">
import { learningStatusLabels } from '../theme/utils/learning'

defineProps<{ status: keyof typeof learningStatusLabels }>()
</script>

<template>
  <span class="learning-status" :class="`is-${status}`">{{ learningStatusLabels[status] }}</span>
</template>

<style scoped>
.learning-status {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 999px;
  background: var(--kaede-soft);
  color: var(--kaede-muted);
  padding: 2px 10px;
  font-size: 0.8125rem;
  line-height: 1.5;
  white-space: nowrap;
}

.learning-status.is-ready {
  background: var(--kaede-accent-soft);
  color: var(--kaede-accent);
}

.learning-status.is-updating {
  color: var(--kaede-ink);
}
</style>
