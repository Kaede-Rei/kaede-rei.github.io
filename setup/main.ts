import { useSpring } from '@vueuse/motion'
import { nextTick, reactive, watch } from 'vue'
import { defineAppSetup } from 'valaxy'
import { codeToolbar, copyFailure } from '../theme/utils/code-blocks'
import { isPointerClick, samePagePath, scrollToRouteAnchor, stopAnchorScroll } from '../theme/utils/anchor-scroll'

const COLLAPSED_HEIGHT = 280
const CODE_SELECTOR = '.kaede-post .prose pre'
let codeId = 0

function codeText(pre: HTMLPreElement) {
  const code = pre.querySelector('code') || pre
  const lines = Array.from(code.querySelectorAll('.line:not(.diff.remove)'))
  const text = lines.length ? lines.map(line => line.textContent || '').join('\n') : code.textContent || ''
  const language = pre.closest('[class*="language-"]')
  return /\blanguage-(shellscript|shell|bash|sh|zsh)\b/.test(language?.className ?? '')
    ? text.replace(/^ *(\$|>) /gm, '').trim()
    : text
}

function prepareCodeBlock(pre: HTMLPreElement) {
  const viewport = pre.parentElement
  if (viewport?.classList.contains('kaede-code-viewport'))
    return viewport.previousElementSibling

  // Raw authored HTML does not pass through the Markdown renderer.
  const collapsible = pre.scrollHeight > COLLAPSED_HEIGHT + 8
  const language = pre.parentElement?.querySelector(':scope > .lang')?.textContent?.trim()
  pre.id ||= `kaede-html-code-${++codeId}`
  pre.tabIndex = 0
  const panel = document.createElement('div')
  panel.className = 'kaede-code-panel'
  panel.innerHTML = codeToolbar(pre.id, collapsible, language)
  const fallbackViewport = document.createElement('div')
  fallbackViewport.className = 'kaede-code-viewport'
  pre.before(panel)
  fallbackViewport.append(pre)
  panel.append(fallbackViewport)
  return panel.firstElementChild
}

function setupCodeBlock(pre: HTMLPreElement) {
  if (pre.dataset.kaedeCodeReady || !pre.parentElement) return
  const toolbar = prepareCodeBlock(pre)
  if (!(toolbar instanceof HTMLElement)) return
  const copy = toolbar.querySelector<HTMLButtonElement>('[data-code-copy]')
  const copyLabel = copy?.querySelector('.kaede-code-button-label')
  const copyIcon = copy?.querySelector('[data-copy-icon]')
  const checkIcon = copy?.querySelector('[data-copy-check]')
  const status = toolbar.querySelector<HTMLElement>('.kaede-code-status > span')
  if (!copy || !copyLabel || !copyIcon || !checkIcon || !status) return
  pre.dataset.kaedeCodeReady = 'true'

  let copyRevision = 0
  let copyFeedback: number | undefined
  const showCopyState = (state: 'idle' | 'copied' | 'error') => {
    const copied = state === 'copied'
    copy.dataset.copyState = state
    copyLabel.textContent = copied ? '已复制' : '复制代码'
    copyIcon.toggleAttribute('hidden', copied)
    checkIcon.toggleAttribute('hidden', !copied)
    status.textContent = state === 'error' ? copyFailure : copied ? '已复制' : ''
  }

  copy.addEventListener('click', async (event) => {
    const revision = ++copyRevision
    copy.toggleAttribute('data-code-motion', isPointerClick(event))
    window.clearTimeout(copyFeedback)
    showCopyState('idle')
    try {
      await navigator.clipboard.writeText(codeText(pre))
      if (revision !== copyRevision) return
      showCopyState('copied')
      copyFeedback = window.setTimeout(() => showCopyState('idle'), 1800)
    }
    catch {
      if (revision === copyRevision) showCopyState('error')
    }
  })

  const toggle = toolbar.querySelector<HTMLButtonElement>('[data-code-toggle]')
  const toggleLabel = toggle?.querySelector('.kaede-code-button-label')
  const chevron = toggle?.querySelector<SVGSVGElement>('[data-code-chevron]')
  if (!toggle || !toggleLabel || !chevron) return

  const rotation = reactive({ x: 0 })
  let spring: ReturnType<typeof useSpring> | undefined
  watch(() => rotation.x, angle => { chevron.style.rotate = `${angle}deg` }, { flush: 'sync' })
  toggle.addEventListener('click', (event) => {
    const collapsed = toggle.getAttribute('aria-expanded') === 'true'
    toolbar.toggleAttribute('data-code-motion', isPointerClick(event))
    toolbar.dataset.collapsed = String(collapsed)
    toggleLabel.textContent = collapsed ? '展开代码' : '收起代码'
    toggle.setAttribute('aria-expanded', String(!collapsed))
    if (collapsed) pre.scrollTop = 0

    const angle = collapsed ? 0 : 180
    if (isPointerClick(event) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spring ??= useSpring(rotation, { stiffness: 640, damping: 42, mass: 1, restDelta: .01, restSpeed: .1 })
      void spring.set({ x: angle })
    }
    else {
      spring?.stop()
      rotation.x = angle
    }
  })
}

export default defineAppSetup(({ isClient, router }) => {
  if (!isClient) return

  router.options.scrollBehavior = async (to, from, savedPosition) => {
    const samePage = samePagePath(to.path, from.path)
    if (savedPosition || !samePage) stopAnchorScroll()
    if (savedPosition) return savedPosition
    if (to.hash) {
      await nextTick()
      if (to.fullPath !== router.currentRoute.value.fullPath) return false
      const anchor = document.getElementById(to.hash.slice(1))
      if (anchor) {
        scrollToRouteAnchor(anchor, samePage)
        return false
      }
    }
    if (!samePage) return { top: 0 }
  }

  function refreshCodeBlocks() {
    document.querySelectorAll<HTMLPreElement>(CODE_SELECTOR).forEach(setupCodeBlock)
  }
  router.isReady().then(() => nextTick()).then(() => requestAnimationFrame(refreshCodeBlocks))
  router.afterEach((to, from, failure) => {
    if (!failure && to.path !== from.path)
      nextTick(() => requestAnimationFrame(refreshCodeBlocks))
  })
})
