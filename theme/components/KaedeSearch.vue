<script setup lang="ts">
import { useFuse } from '@vueuse/integrations/useFuse'
import { useSiteConfig } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { SearchRecord } from '../utils/content'
import { isPointerClick } from '../utils/anchor-scroll'
import { adaptSearchIndex, searchTypeLabels } from '../utils/content'
import { dismissModal, presentModal } from '../utils/dialog-motion'

const props = defineProps<{ pointerOpening?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const router = useRouter()
const site = useSiteConfig()
const dialog = ref<HTMLDialogElement>()
const input = ref<HTMLInputElement>()
const query = ref('')
const keyword = computed(() => query.value.trim())
const loading = ref(true)
const failed = ref(false)
const composing = ref(false)
const activeIndex = ref(0)
const records = shallowRef<SearchRecord[]>([])
const { results: hits } = useFuse(keyword, records, {
  fuseOptions: {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'summary', weight: 1 },
      { name: 'keywords', weight: 1 },
    ],
    includeMatches: true,
    ignoreLocation: true,
    threshold: 0.36,
  },
})
const activeId = computed(() => hits.value[activeIndex.value] ? optionId(activeIndex.value) : undefined)
let opener: HTMLElement | undefined
let request: AbortController | undefined
let viewport: VisualViewport | null = null

function optionId(index: number) {
  return `kaede-search-option-${index}`
}

function resolveIndexPath(link: string) {
  const matched = router.resolve(link).matched.at(-1)
  if (!matched?.name || matched.name === '/[...path]') return
  const path = (matched.aliasOf?.path ?? matched.path).replace(/\/+$/, '') || '/'
  return path === '/404' ? undefined : path
}

async function load() {
  if (failed.value) input.value?.focus()
  loading.value = true
  failed.value = false
  request = new AbortController()
  const { signal } = request
  try {
    const base = new URL(import.meta.env.BASE_URL, window.location.origin)
    const url = new URL(site.value.fuse.dataPath, base)
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`Search index request failed (${response.status})`)
    const data: unknown = await response.json()
    if (!Array.isArray(data)) throw new TypeError('Expected a Valaxy search index array')
    records.value = adaptSearchIndex(data, resolveIndexPath)
  }
  catch (error) {
    if (signal.aborted) return
    failed.value = true
    if (import.meta.env.DEV) console.warn('Could not load Valaxy search index', error)
  }
  finally {
    if (!signal.aborted) loading.value = false
  }
}

function fitViewport() {
  if (!viewport || !dialog.value) return
  const bottom = Math.max(0, document.documentElement.clientHeight - viewport.offsetTop - viewport.height)
  dialog.value.style.setProperty('--search-viewport-height', `${viewport.height}px`)
  dialog.value.style.setProperty('--search-viewport-top', `${viewport.offsetTop}px`)
  dialog.value.style.setProperty('--search-viewport-bottom', `${bottom}px`)
}

function dismiss(event?: MouseEvent) {
  dismissModal(dialog.value, !!event && isPointerClick(event))
}

function onCancel(event: Event) {
  event.preventDefault()
  if (!composing.value) dismiss()
}

function restoreFocus() {
  emit('close')
  if (opener?.isConnected) opener.focus({ preventScroll: true })
}

async function openResult(link: string, event?: MouseEvent) {
  if (event?.metaKey || event?.ctrlKey || event?.altKey || event?.shiftKey || (event && event.button !== 0)) return
  event?.preventDefault()
  // Unmount the modal before navigating so native close does not refocus the old trigger.
  emit('close')
  await router.push(link)
  await nextTick()
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>('#main-content h1')
      ?? document.getElementById('main-content')
    target?.setAttribute('tabindex', '-1')
    target?.focus({ preventScroll: true })
  })
}

function onKeydown(event: KeyboardEvent) {
  if (composing.value || event.isComposing || event.keyCode === 229) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    dismiss()
  }
}

function onInputKeydown(event: KeyboardEvent) {
  if (composing.value || event.isComposing || event.keyCode === 229 ||
    event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || !hits.value.length) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + step + hits.value.length) % hits.value.length
    document.getElementById(optionId(activeIndex.value))?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }
  else if (event.key === 'Enter') {
    const hit = hits.value[activeIndex.value]
    if (hit) {
      event.preventDefault()
      void openResult(hit.item.link)
    }
  }
}

function textParts(text: string, ranges: readonly (readonly [number, number])[] = []) {
  const parts: { text: string, marked: boolean }[] = []
  let offset = 0
  for (const [start, end] of ranges) {
    if (start > offset) parts.push({ text: text.slice(offset, start), marked: false })
    parts.push({ text: text.slice(start, end + 1), marked: true })
    offset = end + 1
  }
  if (offset < text.length) parts.push({ text: text.slice(offset), marked: false })
  return parts
}

watch(keyword, () => {
  activeIndex.value = 0
  if (dialog.value) {
    const results = dialog.value.querySelector('.kaede-search-results')
    results?.scrollTo({ top: 0, behavior: 'instant' })
  }
})

onMounted(() => {
  const active = document.activeElement
  if (active instanceof HTMLElement && active !== document.body) opener = active
  viewport = window.visualViewport
  viewport?.addEventListener('resize', fitViewport)
  viewport?.addEventListener('scroll', fitViewport)
  fitViewport()
  if (dialog.value) presentModal(dialog.value, props.pointerOpening)
  input.value?.focus({ preventScroll: true })
  void load()
})

onUnmounted(() => {
  request?.abort()
  viewport?.removeEventListener('resize', fitViewport)
  viewport?.removeEventListener('scroll', fitViewport)
})

defineExpose({ dismiss })
</script>

<template>
  <dialog
    ref="dialog"
    class="kaede-search-dialog kaede-modal-panel"
    aria-labelledby="kaede-search-title"
    @keydown="onKeydown"
    @cancel="onCancel"
    @close="restoreFocus"
    @click.self="dismiss"
  >
    <div class="kaede-search-box">
      <header>
        <h2 id="kaede-search-title">搜索文章与学习内容</h2>
        <button type="button" aria-label="关闭搜索" @click="dismiss">
          <span class="i-ri-close-line" aria-hidden="true" />
        </button>
      </header>
      <div class="kaede-search-input">
        <span class="i-ri-search-line" aria-hidden="true" />
        <input
          ref="input"
          v-model="query"
          autofocus
          type="search"
          role="combobox"
          aria-label="搜索文章、技术积累与项目介绍"
          aria-autocomplete="list"
          aria-controls="kaede-search-options"
          :aria-expanded="hits.length > 0"
          :aria-activedescendant="activeId"
          placeholder="搜索文章、技术积累与项目介绍"
          autocomplete="off"
          enterkeyhint="search"
          @keydown="onInputKeydown"
          @compositionstart="composing = true"
          @compositionend="composing = false"
        >
      </div>
      <div class="kaede-search-results">
        <div class="kaede-search-feedback" role="status">
          <p v-if="loading">正在加载搜索内容</p>
          <p v-else-if="failed">搜索内容加载失败</p>
          <p v-else-if="!keyword">可以试试 Pinocchio、状态机或机械臂</p>
          <p v-else-if="!hits.length">没有找到与“{{ keyword }}”相关的内容，试试更短的关键词</p>
          <p v-else>找到 {{ hits.length }} 项结果</p>
        </div>
        <div v-if="failed || (!loading && keyword && !hits.length)" class="kaede-search-links">
          <button v-if="failed" type="button" @click="load">重新加载</button>
          <RouterLink to="/archives" custom v-slot="{ href }">
            <a :href="href" @click="openResult('/archives', $event)">文章</a>
          </RouterLink>
          <RouterLink v-if="!failed" to="/learning-path" custom v-slot="{ href }">
            <a :href="href" @click="openResult('/learning-path', $event)">技术积累</a>
          </RouterLink>
        </div>
        <div v-show="hits.length" id="kaede-search-options" role="listbox" aria-label="搜索结果">
          <RouterLink v-for="(hit, index) in hits" :key="hit.item.id" :to="hit.item.link" custom v-slot="{ href }">
            <a
              :id="optionId(index)"
              :href="href"
              role="option"
              tabindex="-1"
              :aria-selected="activeIndex === index"
              @click="openResult(hit.item.link, $event)"
              @pointermove="$event.pointerType === 'mouse' && (activeIndex = index)"
            >
              <span class="kaede-search-result-heading">
                <span>
                  <template v-for="(part, partIndex) in textParts(hit.item.title, hit.matches?.find(match => match.key === 'title')?.indices)" :key="partIndex">
                    <mark v-if="part.marked">{{ part.text }}</mark><template v-else>{{ part.text }}</template>
                  </template>
                </span>
                <small>{{ searchTypeLabels[hit.item.type] }}</small>
              </span>
              <span v-if="hit.item.summary" class="kaede-search-summary">
                <template v-for="(part, partIndex) in textParts(hit.item.summary, hit.matches?.find(match => match.key === 'summary')?.indices)" :key="partIndex">
                  <mark v-if="part.marked">{{ part.text }}</mark><template v-else>{{ part.text }}</template>
                </template>
              </span>
            </a>
          </RouterLink>
        </div>
      </div>
      <footer>
        <span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span>
        <span><kbd>Enter</kbd> 打开</span>
        <span><kbd>Esc</kbd> 关闭</span>
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.kaede-search-dialog {
  --search-top: min(72px, calc(var(--search-viewport-height, 100dvh) * 0.1));
  --search-max-height: calc(var(--search-viewport-height, 100dvh) - 2 * var(--search-top));
  position: fixed;
  inset: calc(var(--search-viewport-top, 0px) + var(--search-top)) 0 auto;
  margin: 0 auto;
  width: min(620px, calc(100% - 24px));
  max-height: var(--search-max-height);
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 16px 60px #0003;
  overflow: hidden;
}

@media (min-width: 681px) {
  .kaede-search-dialog {
    --modal-enter-y: -28px;
    --modal-exit-y: -14px;
    transform-origin: top center;
  }
}
@media (max-width: 680px) {
  .kaede-search-dialog {
    --search-max-height: min(78dvh, calc(var(--search-viewport-height, 100dvh) - 12px));
    inset: auto 0 var(--search-viewport-bottom, 0px);
    margin: 0;
    width: 100%;
    border-radius: 18px 18px 0 0;
  }
  .kaede-search-box { padding-bottom: env(safe-area-inset-bottom); }
}

.kaede-search-box {
  display: flex;
  flex-direction: column;
  max-height: calc(var(--search-max-height) - 2px);
}

header, footer { display: flex; align-items: center; justify-content: space-between; }
header, footer, .kaede-search-input { flex-shrink: 0; }
header { gap: 12px; padding: 8px 16px 8px 20px; }
h2 { margin: 0; font-size: 1rem; font-weight: 650; }

header button {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: 8px;
}

.kaede-search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 6px;
  border: 1px solid var(--muted);
  border-radius: 8px;
  padding: 0 12px;
  color: var(--accent);
}

.kaede-search-input:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }
.kaede-search-input input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 1rem;
}
.kaede-search-input input:focus-visible { outline: 0; }
.kaede-search-input input::placeholder { color: var(--muted); opacity: 1; }

.kaede-search-results {
  min-height: 0;
  padding: 4px 16px 12px;
  overflow: auto;
  overscroll-behavior: contain;
}
.kaede-search-feedback p { margin: 9px 4px; color: var(--muted); font-size: 0.875rem; overflow-wrap: anywhere; }
.kaede-search-links { display: flex; flex-wrap: wrap; gap: 0 16px; margin-inline: 4px; }
.kaede-search-links :is(a, button) {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
[role='option'] {
  display: grid;
  gap: 3px;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--ink);
  text-decoration: none;
  overflow-wrap: anywhere;
}
[role='option'][aria-selected='true'] { border-color: var(--accent); background: var(--accent-soft); }
.kaede-search-result-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 6px 14px; }
.kaede-search-result-heading > span { min-width: 0; font-weight: 650; }
small { flex-shrink: 0; color: var(--muted); font-size: 0.75rem; }
.kaede-search-summary { color: var(--muted); font-size: 0.875rem; }
mark {
  background: transparent;
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-underline-offset: 2px;
}
footer {
  justify-content: flex-start;
  gap: 16px;
  padding: 9px 20px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.75rem;
}
kbd { color: var(--ink); }

@media (hover: hover) {
  header button:hover { background: var(--surface-soft); }
}

@media (hover: none), (max-height: 500px) {
  footer { display: none; }
}

@media (max-width: 350px) {
  .kaede-search-result-heading { flex-wrap: wrap; }
}
</style>
