import type { EditableTreeNode } from 'vue-router/unplugin'
import { chapterFromRoute, learningContext, learningMeta, learningPath, learningTracks } from './learning'
import { robotArmDevelopmentPath, robotArmDevelopmentReferencesPath } from './robot-arm-development'

type MarkdownPage = {
  content: string
  data: unknown
  path: string
  route: { fullPath: string }
}

function validateChapter({ data, content, path, route }: MarkdownPage) {
  if (!route.fullPath.startsWith(`${learningPath}/`) || /(?:^|[/\\])index\.md$/.test(path))
    return

  const chapter = chapterFromRoute(route.fullPath, data)
  const context = learningContext(data)
  if (!chapter || !context)
    throw new Error(`${path}: 学习章节的字段或阶段无效`)

  const slug = chapter.path.slice(chapter.path.lastIndexOf('/') + 1)
  const chapterNumber = slug.match(/^(\d+)(?:-(\d+))?$/)
  const titleNumber = chapter.title.match(/^(\d+(?:\.\d+)?)\.\s/)
  const major = Number(chapterNumber?.[1])
  const phaseNumber = chapter.track === 'electrical-control' ? Math.max(major - 1, 1) : major
  const order = Number(chapterNumber?.[2] ?? (phaseNumber === 1 ? major : 1))
  const expectedPath = context.track.path + (chapter.track === 'electrical-control' ? '' : `/phase-${phaseNumber}`)
  if (chapter.path !== `${expectedPath}/${slug}` || chapter.phase !== `phase-${phaseNumber}`
    || order !== chapter.order || titleNumber?.[1] !== slug.replace('-', '.'))
    throw new Error(`${path}: 章节标题、编号、顺序或阶段与路由不一致`)

  const hasBody = content.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)
    .some(line => line.trim() && !/^\s*#{1,6}(?:\s|$)/.test(line))
  if (hasBody === (chapter.status === 'planned'))
    throw new Error(`${path}: 学习章节的状态与正文不匹配`)
  if (chapter.status === 'updating' && !chapter.updateNote?.trim())
    throw new Error(`${path}: 更新中的章节需要说明更新范围`)
}

function validateOutline(root: EditableTreeNode) {
  const paths = new Set<string>()
  const chapterOrders = new Map<string, string>()
  for (const route of root) {
    if (!route.component)
      continue

    const path = route.fullPath.replace(/\/$/, '')
    paths.add(path)
    const meta = learningMeta(route.meta.frontmatter)
    if (meta.track === 'robot-arm-development') {
      const expectedParent = meta.contentType === 'learning-route' ? learningPath
        : meta.contentType === 'learning-phase' ? robotArmDevelopmentPath
          : learningContext(meta)?.phase.overviewLink
      if (!expectedParent || expectedParent !== meta.parentLink)
        throw new Error(`${path}: 机械臂文档的父级与分组不一致`)
    }
    if (meta.contentType !== 'learning-chapter')
      continue

    const chapter = chapterFromRoute(route.fullPath, route.meta.frontmatter)
    if (!chapter)
      throw new Error(`${route.fullPath}: 学习章节的元数据无效`)

    const key = `${chapter.track}/${chapter.phase}/${chapter.order}`
    const duplicate = chapterOrders.get(key)
    if (duplicate && duplicate !== chapter.path)
      throw new Error(`${chapter.path}: 与 ${duplicate} 的章节顺序重复`)
    chapterOrders.set(key, chapter.path)
  }

  for (const path of [learningPath, robotArmDevelopmentPath, robotArmDevelopmentReferencesPath]) {
    if (!paths.has(path)) throw new Error(`${path}: 技术积累入口不存在`)
  }
  for (const track of Object.values(learningTracks)) {
    for (const phase of track.phases) {
      if (!paths.has(phase.overviewLink.split('#')[0]))
        throw new Error(`${phase.overviewLink}: 阶段概览路由不存在`)
    }
  }
}

export const learningContentHooks = {
  'md:afterRender': validateChapter,
  'vue-router:beforeWriteFiles': validateOutline,
}
