import type { RouteRecordNormalized } from 'vue-router'

export const learningPath = '/learning-path'

interface LearningPhase {
  id: string
  title: string
  overviewLink: string
  audience: string
  description: string
}

interface LearningTrack {
  title: string
  path: string
  description: string
  phases: LearningPhase[]
}

const electricalPath = `${learningPath}/electrical-control`
const armPath = `${learningPath}/arm-motion-control`

export const learningTracks = {
  'electrical-control': {
    title: '电控学习路径',
    path: electricalPath,
    description: '从 C 语言与单片机入门，逐步学习 STM32、控制算法、RTOS 与工程组织，也可按基础和项目需求选学通信、电路和图形界面等方向',
    phases: [
      {
        id: 'phase-1',
        title: '第一阶段 · 基础入门',
        overviewLink: `${electricalPath}#phase-1`,
        audience: '刚接触 C 语言和单片机，想从小型硬件实验开始的读者',
        description: '建立 C 语言、单片机与基础电路的开发经验，开始使用具体硬件完成小型实验',
      },
      {
        id: 'phase-2',
        title: '第二阶段 · 能力扩展',
        overviewLink: `${electricalPath}#phase-2`,
        audience: '已能使用单片机完成基础实验，希望把控制、通信或视觉接入系统的读者',
        description: '学习控制、通信、嵌入式视觉与 RTOS，并理解各模块在系统中的职责',
      },
      {
        id: 'phase-3',
        title: '第三阶段 · 综合提升',
        overviewLink: `${electricalPath}#phase-3`,
        audience: '有嵌入式开发基础，正按项目需求选择扩展方向的读者',
        description: '根据项目需要继续学习控制理论、嵌入式图形界面、物联网与 AI 相关内容',
      },
      {
        id: 'phase-4',
        title: '第四阶段 · 工程能力',
        overviewLink: `${electricalPath}#phase-4`,
        audience: '已经写过外设或控制模块，希望改善项目结构与调试流程的读者',
        description: '关注代码组织、架构思维与工具使用，把分散的功能整理为可以维护的工程',
      },
    ],
  },
  'arm-motion-control': {
    title: '机械臂运控学习路径',
    path: armPath,
    description: '从机器人空间几何与建模开始，进入 ROS 2、MoveIt 2 与任务规划，再延伸到示教数据和模仿学习实践',
    phases: [
      {
        id: 'phase-1',
        title: '第一阶段 · 理论与编程基础',
        overviewLink: `${armPath}/phase-1`,
        audience: '具备基础编程与线性代数知识，想学习机械臂建模的读者',
        description: '先理解空间几何、运动学和模型，再结合编程与数值工具验证基本概念',
      },
      {
        id: 'phase-2',
        title: '第二阶段 · ROS 2 与 MoveIt 2',
        overviewLink: `${armPath}/phase-2`,
        audience: '了解坐标变换和运动学基础，准备实践机器人建模与规划的读者',
        description: '从环境和模型开始，学习规划、约束、末端控制与任务组织',
      },
      {
        id: 'phase-3',
        title: '第三阶段 · 具身智能实践',
        overviewLink: `${armPath}/phase-3`,
        audience: '了解机械臂运动规划与基本调试，想实践示教与策略部署的读者',
        description: '围绕示教数据、模仿学习和后续实验，了解从数据到策略运行的流程',
      },
    ],
  },
} satisfies Record<string, LearningTrack>

export type LearningTrackId = keyof typeof learningTracks
export const learningStatusLabels = {
  ready: '可阅读',
  updating: '更新中',
  planned: '规划中',
} as const

type LearningStatus = keyof typeof learningStatusLabels

export interface LearningChapter {
  path: string
  track: LearningTrackId
  phase: string
  order: number
  status: LearningStatus
  title: string
  summary: string
  updateNote?: string
}

export function learningMeta(frontmatter: unknown) {
  return (frontmatter ?? {}) as Record<string, unknown>
}

function trackId(value: unknown): value is LearningTrackId {
  return typeof value === 'string' && Object.hasOwn(learningTracks, value)
}

function status(value: unknown): value is LearningStatus {
  return typeof value === 'string' && Object.hasOwn(learningStatusLabels, value)
}

export function learningTrack(frontmatter: unknown) {
  const { track } = learningMeta(frontmatter)
  return trackId(track) ? learningTracks[track] : undefined
}

export function learningContext(frontmatter: unknown) {
  const track = learningTrack(frontmatter)
  const { phase: id } = learningMeta(frontmatter)
  const index = track?.phases.findIndex(phase => phase.id === id) ?? -1
  if (!track || index < 0)
    return undefined

  return { track, phase: track.phases[index], nextPhase: track.phases[index + 1] }
}

export function chapterFromRoute(path: string, frontmatter: unknown): LearningChapter | undefined {
  const { contentType, track, phase, order, status: chapterStatus, title, summary, updateNote } = learningMeta(frontmatter)
  if (contentType !== 'learning-chapter' || !trackId(track) || !status(chapterStatus)
    || typeof phase !== 'string' || typeof order !== 'number' || !Number.isInteger(order)
    || order < 1 || typeof title !== 'string' || !title.trim() || typeof summary !== 'string' || !summary.trim())
    return undefined

  return {
    path: path.replace(/\/$/, ''),
    track,
    phase,
    order,
    status: chapterStatus,
    title,
    summary,
    updateNote: typeof updateNote === 'string' ? updateNote : undefined,
  }
}

export function learningChapters(routes: RouteRecordNormalized[], track: LearningTrack, phase: LearningPhase) {
  const chapters = new Map<string, LearningChapter>()
  for (const route of routes) {
    if (route.aliasOf || !route.path.startsWith(`${track.path}/`))
      continue

    const chapter = chapterFromRoute(route.path, route.meta.frontmatter)
    if (chapter?.phase === phase.id && learningTracks[chapter.track].path === track.path)
      chapters.set(chapter.path, chapter)
  }
  return [...chapters.values()].sort((a, b) => a.order - b.order)
}
