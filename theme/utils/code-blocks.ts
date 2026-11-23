import type { defineValaxyConfig } from 'valaxy'

type MarkdownOptions = NonNullable<Parameters<typeof defineValaxyConfig>[0]['markdown']>

export const copyFailure = '复制失败，请选择文本手动复制'

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function codeIcon(path: string, attributes: string) {
  return `<svg class="kaede-code-button-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ${attributes}>${path}</svg>`
}

const copyIcon = codeIcon('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', 'data-copy-icon')
const checkIcon = codeIcon('<path d="m5 12 4 4L19 6"/>', 'data-copy-check hidden')
const chevron = codeIcon('<path d="m6 9 6 6 6-6"/>', 'data-code-chevron')

export function codeToolbar(id: string, collapsible: boolean, language = '') {
  const languageLabel = language ? `<span class="kaede-code-language">${escapeHtml(language)}</span>` : ''
  const toggle = collapsible
    ? `<button type="button" data-code-toggle aria-controls="${escapeHtml(id)}" aria-expanded="false">${chevron}<span class="kaede-code-button-label">展开代码</span></button>`
    : ''

  return `<div class="kaede-code-actions" data-collapsed="${collapsible}">
  ${languageLabel}
  <button type="button" data-code-copy>${copyIcon}${checkIcon}<span class="kaede-code-button-label">复制代码</span></button>
  ${toggle}
  <span class="kaede-code-status" role="status"><span></span></span>
</div>`
}

// The fixed 23.1px line box and 32px vertical padding make 12 lines exceed 280px.
const collapsibleLines = 12

export const addCodeControls: NonNullable<MarkdownOptions['config']> = (md) => {
  for (const rule of ['fence', 'code_block'] as const) {
    const render = md.renderer.rules[rule]
    if (!render) continue

    // Valaxy's full renderer supports async fences, while Markdown-it's rule type is synchronous.
    md.renderer.rules[rule] = ((...args: Parameters<typeof render>) => {
      const [tokens, index, , env] = args
      const html = render(...args) as string | Promise<string>
      if (typeof env.id !== 'string'
        || (!['post', 'technical-doc'].includes(env.frontmatter?.layout) && !/[/\\]pages[/\\]posts[/\\]/.test(env.id)))
        return html

      const decorate = (markup: string) => markup.replace(
        /<pre(?=\s|>)([^>]*)>([\s\S]*?)<\/pre>/,
        (_, attrs: string, contents: string) => {
          const id = `kaede-code-${index}`
          const collapsible = tokens[index].content.trimEnd().split(/\r?\n/).length >= collapsibleLines
          const language = tokens[index].info.trim().split(/[\s{]/, 1)[0]
          return `<div class="kaede-code-panel">${codeToolbar(id, collapsible, language)}<div class="kaede-code-viewport"><pre${attrs} id="${id}" tabindex="0">${contents}</pre></div></div>`
        },
      )

      return typeof html === 'string' ? decorate(html) : html.then(decorate)
    }) as typeof render
  }
}
