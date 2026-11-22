import { nextTick } from 'vue'
import { defineAppSetup } from 'valaxy'
import { codeToolbar, copyFailure } from '../theme/utils/code-blocks'
import { samePagePath, scrollToRouteAnchor, stopAnchorScroll } from '../theme/utils/anchor-scroll'

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
  pre.id ||= `kaede-html-code-${++codeId}`
  pre.tabIndex = 0
  const fallbackViewport = document.createElement('div')
  fallbackViewport.className = 'kaede-code-viewport'
  pre.before(fallbackViewport)
  fallbackViewport.append(pre)
  fallbackViewport.insertAdjacentHTML('beforebegin', codeToolbar(pre.id, collapsible))
  return fallbackViewport.previousElementSibling
}

function setupCodeBlock(pre: HTMLPreElement) {
  if (pre.dataset.kaedeCodeReady || !pre.parentElement) return
  const toolbar = prepareCodeBlock(pre)
  if (!(toolbar instanceof HTMLElement)) return
  const copy = toolbar.querySelector<HTMLButtonElement>('[data-code-copy]')
  const status = toolbar.querySelector<HTMLElement>('.kaede-code-status > span')
  if (!copy || !status) return
  pre.dataset.kaedeCodeReady = 'true'

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeText(pre))
      status.textContent = '已复制'
    }
    catch {
      status.textContent = copyFailure
    }
  })

  const toggle = toolbar.querySelector<HTMLButtonElement>('[data-code-toggle]')
  toggle?.addEventListener('click', () => {
    const collapsed = toggle.getAttribute('aria-expanded') === 'true'
    toolbar.dataset.collapsed = String(collapsed)
    toggle.textContent = collapsed ? '展开代码' : '收起代码'
    toggle.setAttribute('aria-expanded', String(!collapsed))
    if (collapsed) pre.scrollTop = 0
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
