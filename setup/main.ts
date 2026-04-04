import { defineAppSetup } from 'valaxy'

const CODE_COLLAPSE_HEIGHT = 280
const CODE_BLOCK_SELECTOR = '.markdown-body div[class*="language-"], .prose div[class*="language-"]'

function applyCodeCollapseState(block: HTMLElement, pre: HTMLElement, button: HTMLButtonElement, collapsed: boolean) {
  block.classList.toggle('is-code-collapsed', collapsed)
  button.textContent = collapsed ? '展开' : '收起'
  button.setAttribute('aria-expanded', collapsed ? 'false' : 'true')

  if (collapsed) {
    pre.style.maxHeight = `${CODE_COLLAPSE_HEIGHT}px`
    pre.style.overflowY = 'hidden'
  }
  else {
    pre.style.maxHeight = ''
    pre.style.overflowY = ''
  }
}

function setupCodeBlock(block: HTMLElement) {
  const pre = block.querySelector<HTMLElement>('pre')
  if (!pre)
    return

  let button = block.querySelector<HTMLButtonElement>('button.code-collapse-toggle')
  if (!button) {
    button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-collapse-toggle'
    block.appendChild(button)
  }

  const canCollapse = pre.scrollHeight > CODE_COLLAPSE_HEIGHT + 8
  block.classList.toggle('is-code-collapsible', canCollapse)

  if (!canCollapse) {
    block.classList.remove('is-code-collapsed')
    pre.style.maxHeight = ''
    pre.style.overflowY = ''
    button.setAttribute('aria-expanded', 'true')
    button.textContent = '收起'
    return
  }

  if (!block.dataset.codeCollapseState)
    block.dataset.codeCollapseState = 'collapsed'

  const isCollapsed = block.dataset.codeCollapseState === 'collapsed'
  applyCodeCollapseState(block, pre, button, isCollapsed)

  if (button.dataset.bound !== 'true') {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      const currentlyCollapsed = block.classList.contains('is-code-collapsed')
      const nextCollapsed = !currentlyCollapsed
      block.dataset.codeCollapseState = nextCollapsed ? 'collapsed' : 'expanded'
      applyCodeCollapseState(block, pre, button!, nextCollapsed)
    })
    button.dataset.bound = 'true'
  }
}

function setupAllCodeBlocks() {
  const blocks = document.querySelectorAll<HTMLElement>(CODE_BLOCK_SELECTOR)
  for (const block of blocks)
    setupCodeBlock(block)
}

export default defineAppSetup(({ isClient, router }) => {
  if (!isClient)
    return

  const refreshCodeBlocks = () => {
    requestAnimationFrame(() => {
      setupAllCodeBlocks()
    })
  }

  router.isReady().then(() => {
    refreshCodeBlocks()
  })

  router.afterEach(() => {
    refreshCodeBlocks()
  })

  window.addEventListener('resize', refreshCodeBlocks, { passive: true })
})
