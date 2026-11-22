<script setup lang="ts">
import { useMotionProperties, useReducedMotion, useSpring } from '@vueuse/motion'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isPlainClick, isPointerClick, navigateToAnchor } from '../utils/anchor-scroll'

interface Heading {
  id: string
  text: string
  level: number
  element: HTMLElement
}

const route = useRoute()
const router = useRouter()
const dialog = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const reducedMotion = useReducedMotion()
const closedScale = .98
const { motionProperties: panelMotion } = useMotionProperties(dialog, { scale: closedScale })
const panelSpring = useSpring(panelMotion, {
  stiffness: 550,
  damping: 42,
  mass: 1,
  restDelta: .0001,
  restSpeed: .001,
})
const selected = ref<Heading>()
const headings = ref<Heading[]>([])
const includeDetails = ref(false)
let frame = 0

function updateLocation() {
  frame = 0
  const visible = headings.value.filter(heading => includeDetails.value || heading.level < 4)
  const beforeTop = visible.filter(heading => heading.element.getBoundingClientRect().top <= 120)
  selected.value = beforeTop.at(-1) || visible[0]
}
function queueUpdate() {
  if (!frame) frame = requestAnimationFrame(updateLocation)
}
function readHeadings() {
  headings.value = Array.from(document.querySelectorAll<HTMLElement>('.kaede-post .prose :is(h2,h3,h4)[id]'))
    .map(element => {
      const copy = element.cloneNode(true) as HTMLElement
      copy.querySelectorAll('.header-anchor').forEach(anchor => anchor.remove())
      copy.querySelectorAll('.katex').forEach(formula => {
        const math = formula.querySelector('math')
        math?.querySelector('annotation')?.remove()
        if (math?.textContent) formula.replaceWith(math.textContent)
      })
      return { id: element.id, text: (copy.textContent || '').trim(), level: Number(element.tagName[1]), element }
    })
  updateLocation()
}
function setPanelMotion(panel: HTMLDialogElement, opening: boolean, fromPointer = false) {
  const target = opening ? 1 : closedScale
  const animate = fromPointer && !reducedMotion.value && (opening || CSS.supports('overlay: auto'))
  panel.toggleAttribute('data-pointer-motion', animate)
  if (animate) {
    void panelSpring.set({ scale: target })
    return
  }
  panelSpring.stop()
  panelMotion.scale = target
}
watch(reducedMotion, (reduced) => {
  const panel = dialog.value
  if (reduced && panel) setPanelMotion(panel, panel.open)
})
function close(restoreFocus = true, fromPointer = false) {
  const panel = dialog.value
  if (!panel?.open) return
  setPanelMotion(panel, false, fromPointer)
  panel.close()
  panel.inert = true
  if (restoreFocus) trigger.value?.focus({ preventScroll: true })
}
function closeFromClick(event: MouseEvent) {
  close(true, isPointerClick(event))
}
async function open(event: MouseEvent) {
  const panel = dialog.value
  if (!panel || panel.open) return
  setPanelMotion(panel, true, isPointerClick(event))
  panel.inert = false
  panel.showModal()
  await nextTick()
  if (panel.open)
    panel.querySelector<HTMLElement>('[aria-current="location"]')?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
}
function jump(event: MouseEvent, heading: Heading) {
  if (!isPlainClick(event)) return
  event.preventDefault()
  close(false)
  selected.value = heading
  void navigateToAnchor(router, heading.element, isPointerClick(event), true)
}
function toggleDetails() {
  includeDetails.value = !includeDetails.value
  updateLocation()
}
onMounted(async () => {
  await nextTick()
  readHeadings()
  window.addEventListener('scroll', queueUpdate, { passive: true })
  window.addEventListener('resize', queueUpdate, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', queueUpdate)
  window.removeEventListener('resize', queueUpdate)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <template v-if="headings.length">
    <aside class="kaede-toc-desktop" aria-label="本页目录">
      <nav aria-labelledby="kaede-toc-label">
        <h2 id="kaede-toc-label">本页目录</h2>
        <ul>
          <li v-for="heading in headings.filter(item => includeDetails || item.level < 4)" :key="heading.id" :class="`level-${heading.level}`">
            <a data-toc-link :href="`#${encodeURIComponent(heading.id)}`" :aria-current="selected?.id === heading.id ? 'location' : undefined" @click="jump($event, heading)">{{ heading.text }}</a>
          </li>
        </ul>
        <button v-if="headings.some(heading => heading.level === 4)" type="button" :aria-expanded="includeDetails" @click="toggleDetails">{{ includeDetails ? '收起小节' : '展开小节' }}</button>
      </nav>
    </aside>
    <button ref="trigger" class="kaede-toc-toggle" type="button" aria-haspopup="dialog" aria-controls="kaede-toc-dialog" @click="open">
      <span class="i-ri-list-unordered" aria-hidden="true" />目录<span v-if="selected" class="kaede-toc-position">{{ selected.text }}</span>
    </button>
    <dialog id="kaede-toc-dialog" ref="dialog" class="kaede-toc-dialog" aria-labelledby="kaede-toc-dialog-label"
      @cancel.prevent="close()" @click.self="closeFromClick">
      <div class="kaede-toc-panel">
        <header><h2 id="kaede-toc-dialog-label">本页目录</h2><button type="button" aria-label="关闭目录" autofocus @click="closeFromClick"><span class="i-ri-close-line" aria-hidden="true" /></button></header>
        <nav aria-labelledby="kaede-toc-dialog-label">
          <ul>
            <li v-for="heading in headings.filter(item => includeDetails || item.level < 4)" :key="heading.id" :class="`level-${heading.level}`">
              <a data-toc-link :href="`#${encodeURIComponent(heading.id)}`" :aria-current="selected?.id === heading.id ? 'location' : undefined" @click="jump($event, heading)">{{ heading.text }}</a>
            </li>
          </ul>
          <button v-if="headings.some(heading => heading.level === 4)" type="button" :aria-expanded="includeDetails" @click="toggleDetails">{{ includeDetails ? '收起小节' : '展开小节' }}</button>
        </nav>
      </div>
    </dialog>
  </template>
</template>
