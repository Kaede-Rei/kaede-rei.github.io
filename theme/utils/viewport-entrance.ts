import type { ObjectDirective } from 'vue'
import './viewport-entrance.css'

const marker = 'data-viewport-entrance'
const pending = 'data-viewport-entrance-pending'
const viewportApproach = 36
const stagger = [0, 92, 158]
const waiting = new Map<HTMLElement, string | undefined>()
let observer: IntersectionObserver | undefined

function hasReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function containsDestination(element: HTMLElement) {
  if (element.contains(document.activeElement)) return true
  if (!location.hash) return false

  try {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    return target && (element.contains(target) || target.contains(element))
  }
  catch {
    return false
  }
}

function stopWatching(element: HTMLElement) {
  if (!waiting.delete(element)) return
  observer?.unobserve(element)
  if (!waiting.size) {
    observer?.disconnect()
    observer = undefined
  }
}

function finish(element: HTMLElement) {
  stopWatching(element)
  element.removeAttribute(marker)
  element.removeAttribute(pending)
  element.style.removeProperty('--viewport-entrance-delay')
  element.removeEventListener('focusin', onFinished)
  element.removeEventListener('animationend', onFinished)
  element.removeEventListener('animationcancel', onFinished)
}

function onFinished(event: Event) {
  if (event.type !== 'focusin' && (event.target !== event.currentTarget
    || !(event as AnimationEvent).animationName.startsWith('kaede-viewport-'))) return
  if (event.currentTarget instanceof HTMLElement) finish(event.currentTarget)
}

function reveal(entries: IntersectionObserverEntry[]) {
  const groupCounts = new Map<string, number>()
  const reduced = hasReducedMotion()
  for (const entry of entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top
    || a.boundingClientRect.left - b.boundingClientRect.left)) {
    const element = entry.target
    if (!entry.isIntersecting || !(element instanceof HTMLElement) || !waiting.has(element)) continue
    const group = waiting.get(element)
    if (reduced || containsDestination(element)) {
      finish(element)
      continue
    }

    stopWatching(element)
    const index = group ? groupCounts.get(group) ?? 0 : 0
    if (group) groupCounts.set(group, index + 1)
    element.style.setProperty('--viewport-entrance-delay', `${stagger[Math.min(index, stagger.length - 1)]}ms`)
    element.removeAttribute(pending)
  }
}

export const vViewportEntrance: ObjectDirective<HTMLElement, 'lead' | 'feature' | 'pair' | undefined> = {
  mounted(element, { arg, modifiers, value }) {
    if (typeof IntersectionObserver === 'undefined' || hasReducedMotion() || containsDestination(element)
      || element.getBoundingClientRect().top < window.innerHeight + viewportApproach) return

    waiting.set(element, arg)
    element.setAttribute(pending, '')
    element.setAttribute(marker, modifiers.fade ? 'fade' : value ?? 'rise')
    element.addEventListener('focusin', onFinished)
    element.addEventListener('animationend', onFinished)
    element.addEventListener('animationcancel', onFinished)
    observer ??= new IntersectionObserver(reveal, { rootMargin: `0px 0px ${viewportApproach}px 0px` })
    observer.observe(element)
  },
  beforeUnmount: finish,
}
