import type { defineValaxyConfig } from 'valaxy'

type MarkdownOptions = NonNullable<Parameters<typeof defineValaxyConfig>[0]['markdown']>

export const copyFailure = '复制失败，请选择文本手动复制'

export function codeToolbar(id: string, collapsible: boolean) {
  const escapedId = id.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  const toggle = collapsible
    ? `<button type="button" data-code-toggle aria-controls="${escapedId}" aria-expanded="false">展开代码</button>`
    : ''

  return `<div class="kaede-code-actions" data-collapsed="${collapsible}">
  <button type="button" data-code-copy>复制代码</button>
  ${toggle}
  <span class="kaede-code-status" role="status" data-reserve="${copyFailure}"><span></span></span>
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
        || (env.frontmatter?.layout !== 'post' && !/[/\\]pages[/\\]posts[/\\]/.test(env.id)))
        return html

      const decorate = (markup: string) => markup.replace(
        /<pre(?=\s|>)([^>]*)>([\s\S]*?)<\/pre>/,
        (_, attrs: string, contents: string) => {
          const id = `kaede-code-${index}`
          const collapsible = tokens[index].content.trimEnd().split(/\r?\n/).length >= collapsibleLines
          return `${codeToolbar(id, collapsible)}<div class="kaede-code-viewport"><pre${attrs} id="${id}" tabindex="0">${contents}</pre></div>`
        },
      )

      return typeof html === 'string' ? decorate(html) : html.then(decorate)
    }) as typeof render
  }
}
