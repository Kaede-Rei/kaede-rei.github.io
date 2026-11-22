import { useSpring } from '@vueuse/motion'
import { reactive, watch } from 'vue'

const pressable = [
  '.kaede-button', '.kaede-track-entry', '.kaede-nav-tools button',
  '.kaede-toc-toggle', '.kaede-toc-panel button', '.kaede-feed-modes button',
  '.kaede-search-dialog button', '.kaede-code-actions button',
].join(', ')

export function installPointerSprings() {
  const events = new AbortController()
  const { signal } = events
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const motions = new Map<HTMLElement, ReturnType<typeof elementMotion>>()
  let pressed: { element: HTMLElement, pointerId: number } | undefined

  function elementMotion(element: HTMLElement, rest: number, draw: (value: number) => void, clear: () => void) {
    const state = reactive({ x: rest })
    const spring = useSpring(state, { stiffness: 640, damping: 42, mass: 1, restDelta: .001, restSpeed: .1 })
    const unwatch = watch(() => state.x, draw, { flush: 'sync' })
    let revision = 0

    function dispose() {
      revision++
      spring.stop()
      unwatch()
      clear()
      motions.delete(element)
    }

    return {
      dispose,
      move(value: number) {
        const turn = ++revision
        void Promise.resolve(spring.set({ x: value })).then(() => {
          if (turn === revision && value === rest) dispose()
        })
      },
    }
  }

  function press(event: PointerEvent) {
    if (reduced.matches || !event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return
    const element = event.target.closest<HTMLElement>(pressable)
    if (!element || element.matches(':disabled')) return
    if (pressed) motions.get(pressed.element)?.move(1)
    pressed = { element, pointerId: event.pointerId }

    if (!motions.has(element)) {
      motions.set(element, elementMotion(element, 1,
        value => { element.style.scale = String(value) },
        () => { element.style.removeProperty('scale') },
      ))
    }
    motions.get(element)?.move(.97)
  }

  function release(event: PointerEvent) {
    if (pressed?.pointerId !== event.pointerId) return
    motions.get(pressed.element)?.move(1)
    pressed = undefined
  }

  function hover(event: PointerEvent) {
    if (reduced.matches || !finePointer.matches || event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
    const link = event.target.closest('a')
    if (!link || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) return
    const arrow = link.querySelector<HTMLElement>('.kaede-link-arrow')
    if (!arrow) return

    const entering = event.type === 'pointerover'
    if (entering && !motions.has(arrow)) {
      const vertical = link.matches('.kaede-hero .kaede-button--primary')
      motions.set(arrow, elementMotion(arrow, 0,
        value => { arrow.style.translate = vertical ? `0 ${value}px` : `${value}px` },
        () => { arrow.style.removeProperty('translate') },
      ))
    }
    motions.get(arrow)?.move(entering ? 3 : 0)
  }

  function reset() {
    pressed = undefined
    for (const motion of motions.values()) motion.dispose()
  }

  document.addEventListener('pointerdown', press, { signal })
  window.addEventListener('pointerup', release, { signal })
  window.addEventListener('pointercancel', release, { signal })
  window.addEventListener('blur', reset, { signal })
  window.addEventListener('dragstart', reset, { signal })
  document.addEventListener('pointerover', hover, { signal })
  document.addEventListener('pointerout', hover, { signal })
  reduced.addEventListener('change', reset, { signal })
  finePointer.addEventListener('change', reset, { signal })

  return {
    reset,
    dispose() {
      events.abort()
      reset()
    },
  }
}
