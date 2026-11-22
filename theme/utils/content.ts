const imageMap: Record<string, string> = {
  '/images/hero/ansy.png': 'hero-1920',
  '/images/soyo.png': 'avatar',
  '/images/bg/ansy-bg.png': 'background',
  '/images/pinned/about.png': 'entry-about',
  '/images/pinned/path.png': 'entry-path',
  '/images/pinned/github.png': 'entry-github',
}

export function imageUrl(source?: string) {
  if (!source) return '/images/optimized/cover-anon-png.webp'
  const cover = source.match(/^\/images\/covers\/(.+)\.(png|jpg)$/)
  const name = imageMap[source] || (cover ? `cover-${cover[1]}-${cover[2]}` : '')
  return name ? `/images/optimized/${name}.webp` : source
}

export function formatPostDate(value: unknown) {
  if (!value) return ''
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export function plainExcerpt(value: unknown, limit = 150) {
  if (typeof value !== 'string') return ''
  const text = value
    .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, ' ')
    .replace(/^[ \t]*```[^\n]*\n[\s\S]*?(?:^[ \t]*```[^\n]*|(?![\s\S]))/gm, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(?:#{1,6}|[>+*-]|\d+\.)\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/&(?:quot|amp|apos|lt|gt|nbsp);/g, entity => ({
      '&quot;': '"',
      '&amp;': '&',
      '&apos;': "'",
      '&lt;': '<',
      '&gt;': '>',
      '&nbsp;': ' ',
    })[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text
}

export function postSummary(post: { summary?: unknown, excerpt?: unknown }, limit = 150) {
  return plainExcerpt(post.summary, limit) || plainExcerpt(post.excerpt, limit)
}

export function postCoverRole(post: { coverRole?: unknown }) {
  return post.coverRole === 'informative' ? 'informative' : 'decorative'
}

export function listValue(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : value ? [String(value)] : []
}

type SearchType = 'article' | 'learning-path' | 'learning-chapter' | 'about' | 'association' | 'page'
type ContentStatus = 'ready' | 'updating' | 'planned'

export interface SearchRecord {
  id: string
  link: string
  title: string
  type: SearchType
  summary: string
  contentStatus?: ContentStatus
  keywords: string[]
}

export const searchTypeLabels: Record<SearchType, string> = {
  article: '文章',
  'learning-path': '技术积累',
  'learning-chapter': '技术文档',
  about: '关于',
  association: '协作项目',
  page: '页面',
}

function searchType(path: string, contentType: unknown): SearchType {
  if (path.startsWith('/posts/')) return 'article'
  if (path === '/about') return 'about'
  if (path === '/agrotech') return 'association'
  if (contentType === 'learning-chapter') return 'learning-chapter'
  if (path === '/learning-path' || path.startsWith('/learning-path/')) return 'learning-path'
  return 'page'
}

export function adaptSearchIndex(
  entries: unknown[],
  resolvePath: (link: string) => string | undefined,
): SearchRecord[] {
  const records = new Map<string, SearchRecord>()
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') {
      if (import.meta.env.DEV) console.warn('Ignored malformed search index entry', entry)
      continue
    }
    const { link, title, summary, excerpt, contentType, status, tags, categories } = entry as Record<string, unknown>
    if (typeof link !== 'string' || !/^\/(?![\\/])[^?#\\]*$/.test(link) ||
      typeof title !== 'string' || !title.trim()) {
      if (import.meta.env.DEV) console.warn('Ignored search index entry without a valid title or link', entry)
      continue
    }
    if (status === 'planned') continue
    const path = resolvePath(link)
    if (!path) {
      if (import.meta.env.DEV) console.warn('Ignored search index entry without a matching route', link)
      continue
    }
    if (records.has(path)) continue
    records.set(path, {
      id: path,
      link,
      title: title.trim(),
      type: searchType(path, contentType),
      summary: postSummary({ summary, excerpt }, 115),
      contentStatus: status === 'ready' || status === 'updating' ? status : undefined,
      keywords: [...listValue(tags), ...listValue(categories)],
    })
  }
  return [...records.values()]
}
