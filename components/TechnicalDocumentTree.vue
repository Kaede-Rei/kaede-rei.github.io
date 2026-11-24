<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TechnicalDocumentSection } from '../theme/utils/technical-documents'
import { isPointerClick } from '../theme/utils/anchor-scroll'

const props = defineProps<{
  sections: TechnicalDocumentSection[]
  currentPath: string
  activeSection?: string
}>()
const emit = defineEmits<{ select: [event: MouseEvent, path: string] }>()
const expanded = ref<string[]>([])
const movingSection = ref('')

watch(() => props.activeSection, (section) => {
  const initial = section || props.sections[0]?.id
  if (initial && !expanded.value.includes(initial))
    expanded.value = [...expanded.value, initial]
}, { immediate: true })

function selectDocument(event: MouseEvent, path: string, navigate: (event?: MouseEvent) => unknown) {
  emit('select', event, path)
  if (!event.defaultPrevented) void navigate(event)
}

function toggleSection(id: string, event: MouseEvent) {
  movingSection.value = isPointerClick(event) ? id : ''
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter(item => item !== id)
    : [...expanded.value, id]
}
</script>

<template>
  <nav class="technical-tree" aria-label="机械臂文档">
    <ul>
      <li v-for="section in sections" :key="section.id">
        <div class="technical-tree-section" :class="{ 'is-current': section.path === currentPath, 'has-branch-motion': movingSection === section.id }">
          <button type="button" :aria-expanded="expanded.includes(section.id)"
            :aria-label="`${expanded.includes(section.id) ? '收起' : '展开'}${section.title}`"
            @click="toggleSection(section.id, $event)">
            <span class="i-ri-arrow-right-s-line" aria-hidden="true" />
          </button>
          <RouterLink :to="section.path" custom v-slot="{ href, navigate }">
            <a :href="href" :aria-current="section.path === currentPath ? 'page' : undefined"
              @click="selectDocument($event, section.path, navigate)">{{ section.title }}</a>
          </RouterLink>
        </div>
        <Transition name="technical-branch" :css="movingSection === section.id">
          <ul v-show="expanded.includes(section.id)" class="technical-tree-children" :inert="!expanded.includes(section.id)">
            <li v-for="entry in section.children" :key="entry.path">
              <RouterLink :to="entry.path" custom v-slot="{ href, navigate }">
                <a :href="href" :aria-current="entry.path === currentPath ? 'page' : undefined"
                  @click="selectDocument($event, entry.path, navigate)">
                  <span class="i-ri-file-text-line" aria-hidden="true" /><span>{{ entry.title }}</span>
                </a>
              </RouterLink>
            </li>
          </ul>
        </Transition>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.technical-tree ul { margin: 0; padding: 0; list-style: none; }
.technical-tree-section { display: grid; grid-template-columns: 30px minmax(0, 1fr); align-items: stretch; border-radius: 7px; }
.technical-tree-section button { display: grid; place-items: center; padding: 0; color: var(--muted); }
.technical-tree-section button[aria-expanded='true'] span { rotate: 90deg; }
.has-branch-motion button span { transition: rotate var(--hover-duration) var(--ease-out); }
.technical-branch-enter-active { transition: opacity 220ms var(--ease-out), translate 220ms var(--ease-out); }
.technical-branch-leave-active { transition: opacity 120ms ease, translate 120ms ease; }
.technical-branch-enter-from, .technical-branch-leave-to { opacity: 0; translate: 0 -7px; }
.technical-tree a { min-width: 0; min-height: 36px; padding: 7px 6px; color: var(--ink); font-size: .875rem; line-height: 1.4; overflow-wrap: anywhere; }
.technical-tree-section a { display: flex; align-items: center; font-weight: 600; }
.technical-tree .technical-tree-children { margin: 0 0 5px 13px; padding-left: 8px; border-inline-start: 1px solid var(--line); }
.technical-tree-children a { display: grid; grid-template-columns: 1rem minmax(0, 1fr); align-items: start; gap: 6px; border-radius: 6px; }
.technical-tree-children a > span:first-child { margin-top: .14em; color: var(--muted); }
.technical-tree-section.is-current, .technical-tree-children a[aria-current='page'] { background: var(--accent-soft); }
.technical-tree a[aria-current='page'] { font-weight: 650; }
.technical-tree-children a[aria-current='page'] { box-shadow: inset 2px 0 var(--accent); }
@media (hover: hover) and (pointer: fine) {
  .technical-tree-section:hover, .technical-tree-children a:hover { background: var(--accent-soft); }
}
@media (pointer: coarse) {
  .technical-tree a { min-height: 44px; padding-block: 10px; }
  .technical-tree-section { grid-template-columns: 44px minmax(0, 1fr); }
}
</style>
