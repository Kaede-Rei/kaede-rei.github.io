<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isPlainClick, isPointerClick, navigateToAnchor } from '../utils/anchor-scroll'
import { dismissModal, presentModal } from '../utils/dialog-motion'
import KaedeTocItems from './KaedeTocItems.vue'

interface Heading {
  id: string
  number?: string
  text: string
  level: number
  element: HTMLElement
  root: string
  children: Heading[]
}

const props = withDefaults(defineProps<{ contentSelector?: string }>(), {
  contentSelector: '.kaede-post .prose',
})
const router = useRouter()
const dialog = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const desktopList = ref<HTMLElement>()
const dialogList = ref<HTMLElement>()
const selected = shallowRef<Heading>()
const headings = shallowRef<Heading[]>([])
const outline = shallowRef<Heading[]>([])
const showAll = ref(false)
const focusedRoot = ref('')
const hasChildren = computed(() => outline.value.some(heading => heading.children.length > 0))
let frame = 0
let topPositions: number[] = []
let scrollInset = 0
let scrollEnd = 0
let sizes: ResizeObserver | undefined
let outlineMotion: Animation | undefined

function updateLocation() {
  frame = 0
  const y = window.scrollY
  if (y > 0 && scrollEnd - y <= 1) {
    selected.value = headings.value.at(-1)
    return
  }
  let low = 0
  let high = topPositions.length
  while (low < high) {
    const middle = (low + high) >>> 1
    if (topPositions[middle] <= y + scrollInset) low = middle + 1
    else high = middle
  }
  selected.value = headings.value[Math.max(0, low - 1)]
}
function measureHeadings() {
  const root = document.documentElement
  const y = window.scrollY
  scrollInset = (Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + 12
  scrollEnd = root.scrollHeight - window.innerHeight
  topPositions = headings.value.map(heading => heading.element.getBoundingClientRect().top + y)
  queueUpdate()
}
function queueUpdate() {
  if (!frame) frame = requestAnimationFrame(updateLocation)
}
async function toggleOutline(event: MouseEvent, list?: HTMLElement) {
  showAll.value = !showAll.value
  outlineMotion?.cancel()
  if (!isPointerClick(event) || !list?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  await nextTick()
  outlineMotion = list.animate([{ opacity: .55, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], {
    duration: 210,
    easing: 'cubic-bezier(.23, 1, .32, 1)',
  })
}
function readHeadings() {
  const elements = document.querySelectorAll<HTMLElement>(`:is(${props.contentSelector}) :is(h2,h3,h4)[id]`)
  const roots: Heading[] = []
  const ancestors: Heading[] = []
  headings.value = Array.from(elements, element => {
    const copy = element.cloneNode(true) as HTMLElement
    copy.querySelectorAll('.header-anchor').forEach(anchor => anchor.remove())
    copy.querySelectorAll('.katex').forEach(formula => {
      const math = formula.querySelector('math')
      math?.querySelector('annotation')?.remove()
      if (math?.textContent) formula.replaceWith(math.textContent)
    })
    const label = (copy.textContent || '').trim()
    const numbered = label.match(/^(\d+(?:\.\d+)*[.、]?\s+|[一二三四五六七八九十]+、)\s*(.+)$/u)
    const level = Number(element.tagName[1])
    while (ancestors.length && ancestors[ancestors.length - 1].level >= level) ancestors.pop()
    const parent = ancestors.at(-1)
    const heading: Heading = {
      id: element.id,
      number: numbered?.[1].trim(),
      text: numbered?.[2] ?? label,
      level,
      element,
      root: parent?.root ?? element.id,
      children: [],
    }
    const siblings = parent?.children ?? roots
    siblings.push(heading)
    ancestors.push(heading)
    return heading
  })
  outline.value = roots
}

function revealCurrent(list?: HTMLElement) {
  if (!list?.clientHeight || list.contains(document.activeElement)) return
  const current = list.querySelector('[aria-current="location"]')
  if (!current) return
  const viewport = list.getBoundingClientRect()
  const item = current.getBoundingClientRect()
  const gutter = 6
  if (item.top < viewport.top + gutter) list.scrollTop += item.top - viewport.top - gutter
  else if (item.bottom > viewport.bottom - gutter) list.scrollTop += item.bottom - viewport.bottom + gutter
}

watch([selected, showAll], () => {
  revealCurrent(desktopList.value)
  if (dialog.value?.open) revealCurrent(dialogList.value)
}, { flush: 'post' })

function rememberFocusedRoot(event: FocusEvent) {
  const item = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-toc-root]') : null
  focusedRoot.value = item?.dataset.tocRoot ?? ''
}

function releaseFocusedRoot(event: FocusEvent) {
  if (event.currentTarget instanceof HTMLElement && event.relatedTarget instanceof Node
    && event.currentTarget.contains(event.relatedTarget)) return
  focusedRoot.value = ''
}

function close(restoreFocus = true, fromPointer = false) {
  dismissModal(dialog.value, fromPointer, () => {
    if (restoreFocus) trigger.value?.focus({ preventScroll: true })
  })
}
function closeFromClick(event: MouseEvent) {
  close(true, isPointerClick(event))
}
async function open(event: MouseEvent) {
  const panel = dialog.value
  if (!panel || panel.open) return
  presentModal(panel, isPointerClick(event))
  await nextTick()
  if (panel.open) revealCurrent(dialogList.value)
}
function jump(event: MouseEvent, id: string) {
  if (!isPlainClick(event)) return
  const heading = headings.value.find(item => item.id === id)
  if (!heading) return
  event.preventDefault()
  close(false)
  void navigateToAnchor(router, heading.element, isPointerClick(event), true)
}
onMounted(async () => {
  await nextTick()
  readHeadings()
  measureHeadings()
  sizes = new ResizeObserver(measureHeadings)
  sizes.observe(document.body)
  const content = document.querySelector(props.contentSelector)
  if (content) sizes.observe(content)
  window.addEventListener('scroll', queueUpdate, { passive: true })
  window.addEventListener('resize', measureHeadings, { passive: true })
})
onUnmounted(() => {
  outlineMotion?.cancel()
  sizes?.disconnect()
  window.removeEventListener('scroll', queueUpdate)
  window.removeEventListener('resize', measureHeadings)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <template v-if="headings.length">
    <aside class="kaede-toc-desktop" aria-label="本页目录">
      <nav aria-labelledby="kaede-toc-label">
        <header class="kaede-toc-heading">
          <h2 id="kaede-toc-label">本页目录</h2>
          <button v-if="hasChildren" class="kaede-toc-expand" type="button" :aria-expanded="showAll"
            aria-controls="kaede-toc-desktop-list" @click="toggleOutline($event, desktopList)">{{ showAll ? '收起其他' : '展开全部' }}</button>
        </header>
        <div id="kaede-toc-desktop-list" ref="desktopList" class="kaede-toc-scroll"
          @focusin="rememberFocusedRoot" @focusout="releaseFocusedRoot">
          <KaedeTocItems :items="outline" :current-id="selected?.id" :current-root="selected?.root"
            :focused-root="focusedRoot" :show-all="showAll" @jump="jump" />
        </div>
      </nav>
    </aside>
    <button ref="trigger" class="kaede-toc-toggle" type="button" aria-haspopup="dialog" aria-controls="kaede-toc-dialog" @click="open">
      <span class="i-ri-list-unordered" aria-hidden="true" />目录
    </button>
    <dialog id="kaede-toc-dialog" ref="dialog" class="kaede-toc-dialog kaede-modal-panel" aria-labelledby="kaede-toc-dialog-label"
      @cancel.prevent="close()" @click.self="closeFromClick">
      <div class="kaede-toc-panel">
        <header class="kaede-toc-heading">
          <h2 id="kaede-toc-dialog-label">本页目录</h2>
          <button v-if="hasChildren" class="kaede-toc-expand" type="button" :aria-expanded="showAll"
            aria-controls="kaede-toc-dialog-list" @click="toggleOutline($event, dialogList)">{{ showAll ? '收起其他' : '展开全部' }}</button>
          <button class="kaede-toc-close" type="button" aria-label="关闭目录" autofocus @click="closeFromClick"><span class="i-ri-close-line" aria-hidden="true" /></button>
        </header>
        <nav id="kaede-toc-dialog-list" ref="dialogList" class="kaede-toc-scroll" aria-labelledby="kaede-toc-dialog-label"
          @focusin="rememberFocusedRoot" @focusout="releaseFocusedRoot">
          <KaedeTocItems :items="outline" :current-id="selected?.id" :current-root="selected?.root"
            :focused-root="focusedRoot" :show-all="showAll" @jump="jump" />
        </nav>
      </div>
    </dialog>
  </template>
</template>
