import { sampleSpring } from './spring-frames'

const controls = 'a[href], button, summary, select, input:not([type=hidden]), textarea, [role=button], [role=link], [role=tab], [role=option], [role=checkbox], [role=radio], [role=switch], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=slider], [role=spinbutton], [role=combobox]'
const rest = { scale: 1, opacity: 1, x: 0, y: 0 }
const duration = 330
const frames = sampleSpring({ duration, stiffness: 550, damping: 30 })

type Channel = keyof typeof rest

export function installPointerSprings() {
  const events = new AbortController()
  const { signal } = events
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const motions = new Map<HTMLElement, Animation>()
  let pressed: { element: HTMLElement, channel: Channel, pointerId: number } | undefined

  function move(element: HTMLElement, channel: Channel, target: number, style = getComputedStyle(element)) {
    if (typeof element.animate !== 'function') return
    const translation = channel === 'x' || channel === 'y'
    const start = translation
      ? (parseFloat((style.translate || '').split(' ')[channel === 'x' ? 0 : 1]) || 0)
      : (parseFloat(style[channel]) || rest[channel])

    motions.get(element)?.cancel()
    const property = translation ? 'translate' : channel
    const animation = element.animate(frames.map((progress) => {
      const value = start + (target - start) * progress
      return { [property]: channel === 'x' ? `${value}px 0` : channel === 'y' ? `0 ${value}px` : value }
    }), { duration, fill: 'both' })
    motions.set(element, animation)

    if (target === rest[channel]) {
      animation.onfinish = () => {
        if (motions.get(element) !== animation) return
        animation.cancel()
        motions.delete(element)
      }
    }
  }

  function releasePressed() {
    if (!pressed) return
    const { element, channel } = pressed
    pressed = undefined
    move(element, channel, rest[channel])
  }

  function press(event: PointerEvent) {
    if (reduced.matches || !event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return
    const label = event.target.closest<HTMLLabelElement>('label')
    const control = event.target.closest<HTMLElement>(controls) ?? label?.control
    if (!control || control.matches(':disabled, [aria-disabled=true]') || control.closest('[inert], [aria-disabled=true]')) return
    const element = label?.control === control && label.classList.contains('kaede-theme-control') ? label : control
    releasePressed()
    const style = getComputedStyle(element)
    const channel = style.display === 'inline' && !element.matches('input,select,textarea') ? 'opacity' : 'scale'
    const field = control.matches('input:not([type=button], [type=submit], [type=reset]), select, textarea')
    const emphasized = element.matches('.kaede-button, .kaede-track-entry, .kaede-contact-links a, .kaede-feed-modes button')
    pressed = { element, channel, pointerId: event.pointerId }
    move(element, channel, channel === 'opacity' ? .57 : field ? .975 : emphasized ? .91 : .95, style)
  }

  function release(event: PointerEvent) {
    if (pressed?.pointerId === event.pointerId) releasePressed()
  }

  function hover(event: PointerEvent) {
    if (reduced.matches || !finePointer.matches || event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
    const link = event.target.closest('a[href]')
    if (!link || link.closest('[inert], [aria-disabled=true]')
      || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) return
    const arrow = link.querySelector<HTMLElement>('.kaede-link-arrow')
    if (!arrow) return
    const entering = event.type === 'pointerover'
    if (entering ? document.documentElement.classList.contains('lenis-smooth') : !motions.has(arrow)) return
    move(arrow, link.matches('.kaede-hero .kaede-button--primary') ? 'y' : 'x', entering ? 9 : 0)
  }

  function reset() {
    pressed = undefined
    for (const animation of motions.values()) animation.cancel()
    motions.clear()
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
