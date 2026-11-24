import type Lenis from 'lenis'
import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import { watch } from 'vue'

const desktopMotion = '(min-width: 801px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
let lenis: Lenis | undefined

export function cancelHomeWheelScroll() {
  if (lenis?.isScrolling !== 'smooth') return
  lenis.stop()
  lenis.start()
}

export function scrollHomeImmediately(top: number) {
  if (!lenis) return false
  lenis.scrollTo(top, { immediate: true })
  return true
}

export function installHomeScroll(router: Router, modalOpen: Readonly<Ref<boolean>>) {
  const media = window.matchMedia(desktopMotion)
  const listeners = new AbortController()
  const { signal } = listeners
  const eligible = () => !signal.aborted && media.matches && router.currentRoute.value.path === '/' && !modalOpen.value
  let loading = false
  let frame = 0

  function advance(time: number) {
    frame = 0
    if (lenis?.isScrolling !== 'smooth') return
    lenis.raf(time)
    if (lenis.isScrolling === 'smooth') frame = requestAnimationFrame(advance)
  }

  function destroy() {
    cancelAnimationFrame(frame)
    frame = 0
    if (!lenis) return
    // Clear the scrolling state before Lenis's pending native-scroll timer can touch the root.
    lenis.stop()
    lenis.destroy()
    lenis = undefined
  }

  async function sync() {
    if (!eligible()) {
      destroy()
      return
    }
    if (lenis || loading) return

    loading = true
    const { default: Lenis } = await import('lenis').catch(() => ({ default: undefined }))
    loading = false
    if (!Lenis || !eligible()) return

    lenis = new Lenis({
      lerp: .12,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
      allowNestedScroll: true,
      virtualScroll({ deltaY, event }) {
        if (!frame && event.type === 'wheel' && deltaY && !event.ctrlKey) {
          // Prime Lenis's clock before it handles the wheel delta after an idle spell.
          lenis?.raf(performance.now())
          frame = requestAnimationFrame(advance)
        }
        return true
      },
    })
  }

  const stopWatching = watch([() => router.currentRoute.value.fullPath, modalOpen], () => {
    cancelHomeWheelScroll()
    void sync()
  }, { flush: 'sync' })
  media.addEventListener('change', sync, { signal })
  window.addEventListener('keydown', cancelHomeWheelScroll, { signal })
  window.addEventListener('pointerdown', cancelHomeWheelScroll, { capture: true, passive: true, signal })
  void sync()

  return () => {
    listeners.abort()
    stopWatching()
    destroy()
  }
}
