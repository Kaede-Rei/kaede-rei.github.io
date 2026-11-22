import { rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineValaxyConfig } from 'valaxy'
import { addCodeControls } from './theme/utils/code-blocks'
import { learningContentHooks } from './theme/utils/learning-content'

const encodedPages = new Map<string, string>()

export default defineValaxyConfig({
  theme: './theme',
  build: { ssgForPagination: true },
  hooks: { ...learningContentHooks },
  fuse: { extendKeys: ['summary', 'contentType', 'status'] },
  markdown: { config: addCodeControls },
  themeConfig: {
    colors: { primary: '#965A70' },
    postFooter: { navigationMerge: true },
  },
  vite: {
    ssgOptions: {
      onPageRendered(route: string, html: string) {
        const decoded = decodeURI(route)
        if (decoded !== route && route.startsWith('/posts/'))
          encodedPages.set(route, decoded)
        // KaTeX CSS requests the font faces used by an article; preloading every
        // bundled fallback font also downloads them on the illustration homepage.
        return html.replace(/<link\b[^>]*>/gi, tag =>
          /\bas=["']font["']/i.test(tag) && /KaTeX_/.test(tag) ? '' : tag,
        )
      },
      async onFinished() {
        // HTTP servers decode URL escapes before looking up the static file.
        for (const [route, decoded] of encodedPages) {
          const extension = route.endsWith('/') ? 'index.html' : '.html'
          await rename(resolve('dist', `.${route}${extension}`), resolve('dist', `.${decoded}${extension}`))
        }
        encodedPages.clear()
      },
    },
    build: {
      rolldownOptions: { checks: { pluginTimings: false } },
    },
  },
})
