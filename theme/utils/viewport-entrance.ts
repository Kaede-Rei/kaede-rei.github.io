import type { ObjectDirective } from 'vue'
import './viewport-entrance.css'

const marker = 'data-viewport-entrance'
const pending = 'data-viewport-entrance-pending'
const scene = 'data-scroll-scene'
const activeScene = 'data-scroll-scene-active'
const cardIntro = 'data-scene-intro'
const activeParts = 'data-scene-parts-active'
const viewportApproach = 36
const stagger = [0, 105, 186]
const waiting = new Map<HTMLElement, string | undefined>()
const queued = new Map<HTMLElement, { group?: string, variant: string }>()
let observer: IntersectionObserver | undefined
let frame = 0
let nativeScenes: boolean | undefined
let sceneObserver: IntersectionObserver | undefined
const newCards = new WeakSet<Element>()
const cardEdges = new Map<HTMLElement, number>()
let edgeObservers: IntersectionObserver[] = []
let observingHomeCards = false

function resetCardEdges() {
  for (const observer of edgeObservers) observer.disconnect()
  const height = window.innerHeight
  observingHomeCards = location.pathname === '/'
  const topBand = (observingHomeCards ? Math.min(height * .28, 254) : Math.min(height * .36, 368)) + 32
  const bottomBand = (observingHomeCards ? Math.min(height * .34, 318) : Math.min(height * .47, 455)) + 32
  edgeObservers = [
    `30px 0px -${Math.max(0, height - topBand)}px`,
    `-${Math.max(0, height - bottomBand)}px 0px 30px`,
  ].map((rootMargin, i) => new IntersectionObserver((entries) => {
    const edge = 1 << i
    for (const { target, isIntersecting } of entries) {
      if (!(target instanceof HTMLElement)) continue
      const current = cardEdges.get(target)
      if (current === undefined) continue
      const next = isIntersecting ? current | edge : current & ~edge
      if (current === next) continue
      cardEdges.set(target, next)
      if (next) target.setAttribute(activeParts, String(next))
      else target.removeAttribute(activeParts)
    }
  }, { rootMargin }))

  for (const element of cardEdges.keys()) {
    cardEdges.set(element, 0)
    element.removeAttribute(activeParts)
    for (const observer of edgeObservers) observer.observe(element)
  }
}

function watchCardEdges(element: HTMLElement) {
  if (cardEdges.has(element)) return
  if (!edgeObservers.length) {
    resetCardEdges()
    window.addEventListener('resize', resetCardEdges, { passive: true })
  }
  else if (observingHomeCards !== (location.pathname === '/')) resetCardEdges()
  cardEdges.set(element, 0)
  for (const observer of edgeObservers) observer.observe(element)
}

function stopCardIntro(element: HTMLElement) {
  element.removeAttribute(cardIntro)
  element.style.removeProperty('--card-delay')
  element.removeEventListener('animationend', finishCardIntro)
  element.removeEventListener('animationcancel', finishCardIntro)
  element.removeEventListener('focusin', finishCardIntro)
}

function finishCardIntro(event: Event) {
  if (event.type !== 'focusin' && (event.target !== event.currentTarget
    || (event as AnimationEvent).animationName !== 'kaede-card-opening')) return
  if (event.currentTarget instanceof HTMLElement) stopCardIntro(event.currentTarget)
}

function updateScenes(entries: IntersectionObserverEntry[]) {
  let order = 0
  let documentBottom: number | undefined
  for (const { target, isIntersecting, boundingClientRect } of entries) {
    if (!(target instanceof HTMLElement) || !target.hasAttribute(scene)) continue
    if (isIntersecting) {
      documentBottom ??= document.documentElement.scrollHeight - window.scrollY
      // Finish before the last reachable scroll position, including on short pages.
      const reachable = documentBottom - boundingClientRect.top - 16
      if (reachable < window.innerHeight) target.style.setProperty('--scene-reachable', `${Math.max(1, reachable)}px`)
      else if (target.style.getPropertyValue('--scene-reachable')) target.style.removeProperty('--scene-reachable')
    }
    target.toggleAttribute(activeScene, isIntersecting)
    if (!newCards.delete(target) || !isIntersecting || order >= 3 || window.scrollY > 24
      || boundingClientRect.top < 50 || boundingClientRect.bottom > window.innerHeight - 30
      || hasReducedMotion() || containsDestination(target)) continue

    target.style.setProperty('--card-delay', `${order++ * 64}ms`)
    target.setAttribute(cardIntro, '')
    target.addEventListener('animationend', finishCardIntro)
    target.addEventListener('animationcancel', finishCardIntro)
    target.addEventListener('focusin', finishCardIntro)
  }
}

function hasReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function installScrollSceneFade() {
  const root = document.documentElement
  const scrolling = 'data-kaede-scrolling'
  const idleDelay = 140
  let lastScroll = 0
  let timer: number | undefined

  function settle() {
    // Lenis can still be easing between the final pixel-sized scroll steps.
    const remaining = root.classList.contains('lenis-smooth')
      ? idleDelay
      : idleDelay - (performance.now() - lastScroll)
    if (remaining > 0) {
      timer = window.setTimeout(settle, remaining)
      return
    }

    timer = undefined
    root.removeAttribute(scrolling)
  }

  function onScroll() {
    lastScroll = performance.now()
    if (timer !== undefined) return
    root.setAttribute(scrolling, '')
    timer = window.setTimeout(settle, idleDelay)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    window.clearTimeout(timer)
    root.removeAttribute(scrolling)
  }
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
  queued.delete(element)
  stopWatching(element)
  element.removeAttribute(marker)
  element.removeAttribute(pending)
  detachScrollScene(element)
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

function prepare() {
  frame = 0
  const edge = window.innerHeight + viewportApproach
  // Collect geometry before changing any selector or animation state.
  const batch = !hasReducedMotion() && [...queued].filter(([element]) =>
    !containsDestination(element) && element.getBoundingClientRect().top >= edge,
  )
  queued.clear()
  if (!batch || !batch.length) return
  observer ??= new IntersectionObserver(reveal, { rootMargin: `0px 0px ${viewportApproach}px 0px` })
  for (const [element, { group, variant }] of batch) {
    waiting.set(element, group)
    element.setAttribute(pending, '')
    element.setAttribute(marker, variant)
    element.addEventListener('focusin', onFinished)
    element.addEventListener('animationend', onFinished)
    element.addEventListener('animationcancel', onFinished)
    observer.observe(element)
  }
}

type EntranceVariant = 'lead' | 'feature' | 'pair' | 'editorial' | 'section'

export function attachScrollScene(element: HTMLElement, variant: string) {
  nativeScenes ??= typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()')
    && CSS.supports('animation-range', 'cover 0px cover 120px')
    && CSS.supports('view-timeline-name', '--kaede-scene')
  if (!nativeScenes) return false
  element.setAttribute(scene, variant)
  if (typeof IntersectionObserver === 'undefined') {
    element.setAttribute(activeScene, '')
    if (element.hasAttribute('data-scene-card')) element.setAttribute(activeParts, '3')
  }
  else {
    // Only allocate native timelines near the viewport. The browser drives every frame inside them.
    if (element.hasAttribute('data-scene-card')) {
      newCards.add(element)
      watchCardEdges(element)
    }
    sceneObserver ??= new IntersectionObserver(updateScenes, { rootMargin: '150px 0px' })
    sceneObserver.observe(element)
  }
  return true
}

export function detachScrollScene(element: HTMLElement) {
  newCards.delete(element)
  if (cardEdges.delete(element)) {
    for (const observer of edgeObservers) observer.unobserve(element)
    element.removeAttribute(activeParts)
    if (!cardEdges.size) {
      for (const observer of edgeObservers) observer.disconnect()
      edgeObservers = []
      window.removeEventListener('resize', resetCardEdges)
    }
  }
  if (element.hasAttribute(cardIntro)) stopCardIntro(element)
  sceneObserver?.unobserve(element)
  element.removeAttribute(activeScene)
  element.style.removeProperty('--scene-reachable')
  element.removeAttribute(scene)
}

function enqueue(element: HTMLElement, variant: string, group?: string) {
  if (attachScrollScene(element, variant) || typeof IntersectionObserver === 'undefined' || hasReducedMotion()) return
  queued.set(element, { group, variant })
  if (!frame) frame = requestAnimationFrame(prepare)
}

export const vViewportEntrance: ObjectDirective<HTMLElement, EntranceVariant | undefined> = {
  mounted(element, { arg, modifiers, value }) {
    enqueue(element, modifiers.fade ? 'fade' : value ?? 'rise', arg)
  },
  beforeUnmount: finish,
}

const articleScenes = new WeakMap<HTMLElement, HTMLElement[]>()

function clearArticle(element: HTMLElement) {
  articleScenes.get(element)?.forEach(finish)
  articleScenes.delete(element)
}

function registerArticle(element: HTMLElement) {
  const prose = '.kaede-markdown-frame .prose'
  const children = [...element.querySelectorAll<HTMLElement>(
    `${prose} :is(h2,h3,h4)[id], ${prose} > :is(figure, blockquote, table), ${prose} .kaede-code-panel, ${prose} > :is(h2,h3,h4) + :is(p,ul,ol), ${prose} > :is(p,ul,ol,details):has(a[href],button,input,textarea,summary,select)`,
  )].filter(child => !child.closest('[data-scroll-scene]'))
  articleScenes.set(element, children)
  for (const child of children) {
    if (child.matches('h2,h3,h4')) enqueue(child, 'section', 'article-sections')
    else attachScrollScene(child, child.matches('p,ul,ol,details') ? 'article-copy' : 'reading')
  }
}

export const vArticleEntrance: ObjectDirective<HTMLElement, string> = {
  mounted: registerArticle,
  updated(element, { oldValue, value }) {
    if (value === oldValue) return
    clearArticle(element)
    registerArticle(element)
  },
  beforeUnmount: clearArticle,
}
