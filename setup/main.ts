import { defineAppSetup } from 'valaxy'

const CODE_COLLAPSE_HEIGHT = 280
const CODE_PRE_SELECTOR = '.markdown-body pre, .prose pre'

function getCodeContainer(pre: HTMLElement) {
  const parent = pre.parentElement
  if (!parent)
    return pre

  const isLikelyCodeWrapper = parent.matches(
    'div[class*="language-"], .shiki-container, .expressive-code, figure',
  )

  if (isLikelyCodeWrapper)
    return parent

  if (parent.tagName === 'DIV' && parent.children.length === 1 && parent.firstElementChild === pre)
    return parent

  return pre
}

function getMeasuredCodeHeight(pre: HTMLElement) {
  const code = pre.querySelector('code')
  const lineCount = code?.querySelectorAll('.line').length || 0
  const style = window.getComputedStyle(pre)
  const lineHeight = Number.parseFloat(style.lineHeight) || 22
  const paddingTop = Number.parseFloat(style.paddingTop) || 0
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0
  const estimatedByLines = lineCount > 0 ? lineCount * lineHeight + paddingTop + paddingBottom : 0

  return Math.max(pre.scrollHeight, pre.clientHeight, estimatedByLines)
}

function applyCodeCollapseState(
  block: HTMLElement,
  pre: HTMLElement,
  button: HTMLButtonElement,
  fade: HTMLDivElement,
  collapsed: boolean,
) {
  block.classList.toggle('is-code-collapsed', collapsed)
  button.textContent = collapsed ? '展开' : '收起'
  button.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
  fade.style.display = collapsed ? 'block' : 'none'

  if (collapsed) {
    pre.style.maxHeight = `${CODE_COLLAPSE_HEIGHT}px`
    pre.style.overflowY = 'hidden'
  }
  else {
    pre.style.maxHeight = ''
    pre.style.overflowY = ''
  }
}

function setupCodeBlock(pre: HTMLElement) {
  const block = getCodeContainer(pre)
  block.classList.add('code-collapse-container')

  let button = block.querySelector<HTMLButtonElement>('button.code-collapse-toggle')
  if (!button) {
    button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-collapse-toggle'
    block.appendChild(button)
  }

  let fade = block.querySelector<HTMLDivElement>(':scope > .code-collapse-fade')
  if (!fade) {
    fade = document.createElement('div')
    fade.className = 'code-collapse-fade'
    fade.setAttribute('aria-hidden', 'true')
    block.appendChild(fade)
  }

  const canCollapse = getMeasuredCodeHeight(pre) > CODE_COLLAPSE_HEIGHT + 8
  block.classList.toggle('is-code-collapsible', canCollapse)

  if (!canCollapse) {
    block.classList.remove('is-code-collapsed')
    pre.style.maxHeight = ''
    pre.style.overflowY = ''
    button.setAttribute('aria-expanded', 'true')
    button.textContent = '收起'
    fade.style.display = 'none'
    return
  }

  if (!block.dataset.codeCollapseState)
    block.dataset.codeCollapseState = 'collapsed'

  const isCollapsed = block.dataset.codeCollapseState === 'collapsed'
  applyCodeCollapseState(block, pre, button, fade, isCollapsed)

  if (button.dataset.bound !== 'true') {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      const currentlyCollapsed = block.classList.contains('is-code-collapsed')
      const nextCollapsed = !currentlyCollapsed
      block.dataset.codeCollapseState = nextCollapsed ? 'collapsed' : 'expanded'
      applyCodeCollapseState(block, pre, button!, fade!, nextCollapsed)
    })
    button.dataset.bound = 'true'
  }
}

function setupAllCodeBlocks() {
  const pres = document.querySelectorAll<HTMLElement>(CODE_PRE_SELECTOR)
  const handled = new Set<HTMLElement>()

  for (const pre of pres) {
    const block = getCodeContainer(pre)
    if (handled.has(block))
      continue

    handled.add(block)
    setupCodeBlock(pre)
  }
}

export default defineAppSetup(({ isClient, router }) => {
  if (!isClient)
    return

  let mutationObserver: MutationObserver | null = null
  let mutationRefreshTimer: number | null = null

  const refreshCodeBlocks = () => {
    requestAnimationFrame(() => {
      setupAllCodeBlocks()
    })

    // Route/component hydration can finish slightly later than the first frame.
    window.setTimeout(setupAllCodeBlocks, 140)
    window.setTimeout(setupAllCodeBlocks, 420)
  }

  const ensureCodeObserver = () => {
    if (mutationObserver)
      return

    mutationObserver = new MutationObserver(() => {
      if (mutationRefreshTimer)
        clearTimeout(mutationRefreshTimer)

      mutationRefreshTimer = window.setTimeout(() => {
        setupAllCodeBlocks()
      }, 90)
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  router.isReady().then(() => {
    refreshCodeBlocks()
    ensureCodeObserver()
  })

  router.afterEach(() => {
    refreshCodeBlocks()
  })

  window.addEventListener('load', refreshCodeBlocks, { once: true })
  window.addEventListener('resize', refreshCodeBlocks, { passive: true })

  window.addEventListener('beforeunload', () => {
    mutationObserver?.disconnect()
    mutationObserver = null

    if (mutationRefreshTimer) {
      clearTimeout(mutationRefreshTimer)
      mutationRefreshTimer = null
    }
  }, { once: true })
})
