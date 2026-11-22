import { nextTick } from 'vue'
import { defineAppSetup } from 'valaxy'

const COLLAPSED_HEIGHT = 280
const CODE_SELECTOR = '.kaede-post .prose pre'
let codeId = 0

function codeText(pre: HTMLPreElement, wrapper: HTMLElement) {
  const code = pre.querySelector('code') || pre
  const lines = Array.from(code.querySelectorAll('.line:not(.diff.remove)'))
  const text = lines.length ? lines.map(line => line.textContent || '').join('\n') : code.textContent || ''
  return /\blanguage-(shellscript|shell|bash|sh|zsh)\b/.test(wrapper.className)
    ? text.replace(/^ *(\$|>) /gm, '').trim()
    : text
}

function setupCodeBlock(pre: HTMLPreElement) {
  if (pre.dataset.kaedeCodeReady || !pre.parentElement) return
  pre.dataset.kaedeCodeReady = 'true'

  const parent = pre.parentElement
  const wrapper = parent.matches('div[class*="language-"], .shiki-container, figure')
    ? parent
    : document.createElement('div')
  if (wrapper !== parent) {
    pre.before(wrapper)
    wrapper.append(pre)
  }
  wrapper.classList.add('code-collapse-container')
  pre.id ||= `kaede-code-${++codeId}`
  pre.tabIndex = 0

  const toolbar = document.createElement('div')
  toolbar.className = 'kaede-code-actions'
  const copy = wrapper.querySelector<HTMLButtonElement>(':scope > button.copy') || document.createElement('button')
  copy.type = 'button'
  copy.textContent = '复制代码'
  copy.title = '复制代码'
  const status = document.createElement('span')
  status.className = 'kaede-code-status'
  status.setAttribute('role', 'status')
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeText(pre, wrapper))
      status.textContent = '已复制'
    }
    catch {
      status.textContent = '复制失败，请选择文本手动复制'
    }
  })
  toolbar.append(copy)
  wrapper.insertBefore(toolbar, pre)
  toolbar.append(status)

  if (pre.scrollHeight <= COLLAPSED_HEIGHT + 8) return
  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'code-collapse-toggle'
  toggle.setAttribute('aria-controls', pre.id)
  const fade = document.createElement('div')
  fade.className = 'code-collapse-fade'
  fade.setAttribute('aria-hidden', 'true')
  toolbar.insertBefore(toggle, status)
  wrapper.append(fade)
  wrapper.classList.add('is-code-collapsible')

  function setCollapsed(collapsed: boolean) {
    wrapper.classList.toggle('is-code-collapsed', collapsed)
    toggle.textContent = collapsed ? '展开代码' : '收起代码'
    toggle.setAttribute('aria-expanded', String(!collapsed))
    pre.style.maxHeight = collapsed ? `${COLLAPSED_HEIGHT}px` : ''
    pre.style.overflowY = collapsed ? 'hidden' : ''
    fade.hidden = !collapsed
  }
  setCollapsed(true)
  toggle.addEventListener('click', () => setCollapsed(toggle.getAttribute('aria-expanded') === 'true'))
}

export default defineAppSetup(({ isClient, router }) => {
  if (!isClient) return

  router.options.scrollBehavior = async (to, from, savedPosition) => {
    if (savedPosition) return savedPosition
    if (to.hash) {
      await nextTick()
      const anchor = document.getElementById(to.hash.slice(1))
      if (anchor) {
        anchor.scrollIntoView({ block: 'start', behavior: 'instant' })
        return false
      }
    }
    if (to.path !== from.path) return { top: 0 }
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
