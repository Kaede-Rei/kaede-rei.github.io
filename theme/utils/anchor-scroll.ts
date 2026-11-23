import type { Router } from 'vue-router'
import { useSpring } from '@vueuse/motion'
import { reactive, watch } from 'vue'
import { cancelHomeWheelScroll, scrollHomeImmediately } from './home-scroll'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const scrollPosition = reactive({ y: 0 })
let spring: ReturnType<typeof useSpring> | undefined
let activeScroll: AbortController | undefined
let destination = 0
let revision = 0
let pointerRequest: { target: HTMLElement } | undefined

export function isPointerClick(event: MouseEvent) {
  return event instanceof PointerEvent ? Boolean(event.pointerType) : event.detail > 0
}

export function samePagePath(left: string, right: string) {
  return left.replace(/\/$/, '') === right.replace(/\/$/, '')
}

export function isPlainClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export function stopAnchorScroll() {
  if (!activeScroll) return
  activeScroll.abort()
  activeScroll = undefined
  spring?.stop()
}

function scrollToY(top: number) {
  if (!scrollHomeImmediately(top))
    window.scrollTo({ top, left: window.scrollX, behavior: 'instant' })
}

function anchorTop(target: HTMLElement) {
  const root = document.documentElement
  const inset = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
  const max = (document.scrollingElement?.scrollHeight ?? root.scrollHeight) - root.clientHeight
  return Math.max(0, Math.min(max, window.scrollY + target.getBoundingClientRect().top - inset - margin))
}

function scrollToAnchor(target: HTMLElement, pointer: boolean) {
  cancelHomeWheelScroll()
  const reducedMotion = window.matchMedia(reducedMotionQuery)
  if (!pointer || reducedMotion.matches) {
    stopAnchorScroll()
    target.scrollIntoView({ block: 'start', behavior: 'instant' })
    return
  }

  destination = anchorTop(target)
  if (!activeScroll && Math.abs(destination - window.scrollY) < 1) return

  if (!spring) {
    spring = useSpring(scrollPosition, { stiffness: 420, damping: 41, mass: 1, restDelta: .5, restSpeed: 5 })
    watch(() => scrollPosition.y, scrollToY, { flush: 'sync' })
  }

  if (!activeScroll) {
    scrollPosition.y = window.scrollY
    activeScroll = new AbortController()
    const { signal } = activeScroll
    // Release the spring before Lenis reads this same wheel event.
    window.addEventListener('wheel', stopAnchorScroll, { capture: true, passive: true, signal })
    window.addEventListener('touchmove', stopAnchorScroll, { passive: true, signal })
    window.addEventListener('keydown', (event) => {
      if (!event.defaultPrevented && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key))
        stopAnchorScroll()
    }, { signal })
    reducedMotion.addEventListener('change', (event) => {
      if (event.matches) {
        stopAnchorScroll()
        scrollToY(destination)
      }
    }, { signal })
  }

  const turn = ++revision
  void Promise.resolve(spring.set({ y: destination })).then(() => {
    if (turn === revision) stopAnchorScroll()
  })
}

export function scrollToRouteAnchor(target: HTMLElement, samePage: boolean) {
  const pointer = samePage && pointerRequest?.target === target
  if (pointer || !samePage) pointerRequest = undefined
  scrollToAnchor(target, pointer)
}

export async function navigateToAnchor(router: Router, target: HTMLElement, pointer: boolean, replace = false) {
  const { path, hash, query } = router.currentRoute.value
  const nextHash = `#${target.id}`
  if (target.tabIndex < 0) target.tabIndex = -1
  target.focus({ preventScroll: true })

  if (hash === nextHash) {
    pointerRequest = undefined
    scrollToAnchor(target, pointer)
    return
  }

  const request = { target }
  pointerRequest = pointer ? request : undefined
  try {
    const location = { path, query, hash: nextHash }
    const failure = await (replace ? router.replace(location) : router.push(location))
    if (failure && pointerRequest === request) pointerRequest = undefined
  }
  catch (error) {
    if (pointerRequest === request) pointerRequest = undefined
    throw error
  }
}

export function handleSamePageAnchor(event: MouseEvent, router: Router) {
  if (event.defaultPrevented || !isPlainClick(event) || !(event.target instanceof Element)) return
  const link = event.target.closest<HTMLAnchorElement>('a[href]')
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')
    || link.hasAttribute('data-toc-link')) return
  if (link.classList.contains('kaede-skip-link')) {
    stopAnchorScroll()
    cancelHomeWheelScroll()
    return
  }

  const url = new URL(link.href, location.href)
  if (!url.hash || url.origin !== location.origin || !samePagePath(url.pathname, location.pathname)
    || url.search !== location.search) return

  let id: string
  try { id = decodeURIComponent(url.hash.slice(1)) }
  catch { return }
  const target = document.getElementById(id)
  if (!target) return

  event.preventDefault()
  void navigateToAnchor(router, target, isPointerClick(event))
}
