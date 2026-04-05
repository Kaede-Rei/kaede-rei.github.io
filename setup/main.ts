import { defineAppSetup } from 'valaxy'

const CODE_COLLAPSE_HEIGHT = 280
const CODE_PRE_SELECTOR = '.markdown-body pre, .prose pre'
const CODE_CONTAINER_SELECTOR = '.markdown-body, .prose'
const ARTICLE_ROUTE_PREFIXES = ['/posts/', '/learning-path/']

function isArticleRoute(path: string) {
  return ARTICLE_ROUTE_PREFIXES.some(prefix => path.startsWith(prefix))
}

function syncBodyPerformanceMode(path: string) {
  document.body.classList.toggle('post-performance-mode', isArticleRoute(path))
}

function nodeContainsCodePre(node: Node) {
  if (!(node instanceof HTMLElement))
    return false

  return node.matches(CODE_PRE_SELECTOR) || Boolean(node.querySelector(CODE_PRE_SELECTOR))
}

function shouldRefreshFromMutations(records: MutationRecord[]) {
  for (const record of records) {
    if (record.type !== 'childList')
      continue

    for (const node of record.addedNodes) {
      if (nodeContainsCodePre(node))
        return true
    }

    for (const node of record.removedNodes) {
      if (nodeContainsCodePre(node))
        return true
    }
  }

  return false
}

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
  let resizeRefreshTimer: number | null = null
  let isCodeCollapseEnabled = false

  const refreshCodeBlocks = () => {
    if (!isCodeCollapseEnabled)
      return

    requestAnimationFrame(() => {
      setupAllCodeBlocks()
    })

    // Route/component hydration can finish slightly later than the first frame.
    window.setTimeout(setupAllCodeBlocks, 180)
  }

  const cleanupMutationTimer = () => {
    if (!mutationRefreshTimer)
      return

    clearTimeout(mutationRefreshTimer)
    mutationRefreshTimer = null
  }

  const stopCodeObserver = () => {
    mutationObserver?.disconnect()
    mutationObserver = null
    cleanupMutationTimer()
  }

  const ensureCodeObserver = () => {
    if (mutationObserver)
      return

    mutationObserver = new MutationObserver((records) => {
      if (!isCodeCollapseEnabled || !shouldRefreshFromMutations(records))
        return

      cleanupMutationTimer()

      mutationRefreshTimer = window.setTimeout(() => {
        setupAllCodeBlocks()
      }, 120)
    })

    const observeTarget = document.querySelector(CODE_CONTAINER_SELECTOR) ?? document.body
    mutationObserver.observe(observeTarget, {
      childList: true,
      subtree: true,
    })
  }

  const updateCodeCollapseMode = (path: string) => {
    syncBodyPerformanceMode(path)
    const nextEnabled = isArticleRoute(path)
    if (nextEnabled === isCodeCollapseEnabled)
      return

    isCodeCollapseEnabled = nextEnabled

    if (!isCodeCollapseEnabled) {
      stopCodeObserver()
      return
    }

    refreshCodeBlocks()
    ensureCodeObserver()
  }

  const onResize = () => {
    if (!isCodeCollapseEnabled)
      return

    if (resizeRefreshTimer)
      clearTimeout(resizeRefreshTimer)

    resizeRefreshTimer = window.setTimeout(() => {
      refreshCodeBlocks()
    }, 160)
  }

  router.isReady().then(() => {
    updateCodeCollapseMode(router.currentRoute.value.path)
    refreshCodeBlocks()
  })

  router.afterEach((to) => {
    updateCodeCollapseMode(to.path)
    refreshCodeBlocks()
  })

  window.addEventListener('load', refreshCodeBlocks, { once: true })
  window.addEventListener('resize', onResize, { passive: true })

  window.addEventListener('beforeunload', () => {
    stopCodeObserver()
    document.body.classList.remove('post-performance-mode')

    if (resizeRefreshTimer) {
      clearTimeout(resizeRefreshTimer)
      resizeRefreshTimer = null
    }
  }, { once: true })
})
