import type { ObjectDirective } from 'vue'
import { attachScrollScene, detachScrollScene } from './viewport-entrance'
import './route-masthead.css'

function masthead(element: HTMLElement) {
  return element.matches('.kaede-page-header') ? element : element.querySelector<HTMLElement>('.kaede-page-header')
}

export const vRouteMasthead: ObjectDirective<HTMLElement> = {
  mounted(element) {
    function settle() {
      element.removeAttribute('data-route-masthead')
      element.removeEventListener('focusin', settle)
      const header = masthead(element)
      if (header?.isConnected) attachScrollScene(header, 'masthead')
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
  beforeUnmount(element) {
    const header = masthead(element)
    if (header) detachScrollScene(header)
  },
}
