import type { ObjectDirective } from 'vue'
import './route-masthead.css'

export const vRouteMasthead: ObjectDirective<HTMLElement> = {
  mounted(element) {
    function settle() {
      element.removeAttribute('data-route-masthead')
      element.removeEventListener('focusin', settle)
    }

    if (location.hash || element.contains(document.activeElement)) {
      settle()
      return
    }

    const animations = element.getAnimations({ subtree: true }).filter(animation =>
      'animationName' in animation && String(animation.animationName).startsWith('kaede-masthead-'),
    )
    if (!animations.length) {
      settle()
      return
    }

    element.addEventListener('focusin', settle)
    void Promise.allSettled(animations.map(animation => animation.finished)).then(settle)
  },
}
