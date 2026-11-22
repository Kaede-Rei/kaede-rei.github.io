const github = 'https://github.com'
const owner = 'Kaede-Rei'
const organization = 'AgroTech-SCAU'

export const profile = {
  name: 'Kaede Rei',
  role: '机器人开发者',
  school: '华南农业大学',
  associationRole: '主要负责人之一',
  siteTitle: 'Kaede Rei の 小窝 · 机器人开发与技术笔记',
  url: 'https://kaede-rei.github.io/',
  description: 'Kaede Rei 的个人主页，收录机械臂控制、机器人嵌入式系统与系统集成相关的公开项目、技术笔记和技术积累',
  intro: '机器人开发者，关注机械臂控制、嵌入式系统与工具链',
  avatar: '/images/kaede-rei-avatar.jpg',
  shareImage: '/images/optimized/hero-1920.webp',
  githubHandle: owner,
  github: `${github}/${owner}`,
  email: 'kaerei86@gmail.com',
  bilibili: 'https://space.bilibili.com/24410561',
  rss: '/atom.xml',
  footerText: '记录代码、工具与机器人开发中的具体问题',
}

export const association = {
  name: 'AgroTech Innovation Lab',
  shortName: 'ATIL',
  organization,
  publicName: 'AgroTech 智能机械协会',
  githubOrg: `${github}/${organization}`,
  projectNavigation: `${github}/${organization}/.github/blob/main/profile/README.md`,
  path: '/agrotech',
  brand: {
    banner: '/images/brand/atil-banner.png',
    mark: '/images/brand/atil-mark.png',
  },
  shareImage: '/images/brand/atil-share.png',
}

export interface ProjectRecord {
  id: string
  title: string
  subtitle?: string
  summary: string
  url: string
  repositoryKind: 'personal' | 'organization'
  displayGroup: 'featured' | 'exploration' | 'history' | 'resource'
  stageLabel: string
  repositoryArchived: boolean
  release?: {
    tag: string
    publishedAt: string
    url: string
    distribution: 'binary-and-source' | 'source-only'
  }
  evidence: {
    checkedAt: string
    urls: string[]
    scope: string
  }
  image?: {
    src: string
    width: number
    height: number
    alt: string
    caption: string
    purpose: 'product-ui'
  }
  action?: string
  more?: { label: string; url: string }
  detail?: string
  modules?: string[]
}

const serialArm = `${profile.github}/SerialArm-Core`
const robotStudio = `${association.githubOrg}/AT-System-Integration`
const embeddedSdk = `${association.githubOrg}/Embedded-Electronic-Control-Standard`
const calibration = `${association.githubOrg}/Handeye-Calibration-App`
const dualArm = `${profile.github}/Dual-DM-Arm-LeRobot`
const atlas = `${association.githubOrg}/Competition-Robot-2026-Atlas`
const longinus = `${association.githubOrg}/Competition-Robot-2026-Longinus`
const scanner = `${association.githubOrg}/Handheld-scanner`
const mk1 = `${association.githubOrg}/Competition-Robot-2026-Mk.1`
const hephaestus = `${association.githubOrg}/Competition-Robot-2026-Hephaestus`
const profileAssets = `${profile.github}/${owner}/blob/630f9e56b64b3816a15bd2da8f38867a23b0bbbb/assets`

const checkedAt = '2026-11-22'

export const projects = {
  serialArm: {
    id: 'serialarm',
    title: 'SerialArm-Core',
    subtitle: '串联机械臂控制内核与 SerialArm Studio 工作台',
    summary: '覆盖模型与硬件配置、控制、示教和标定，提供 C++ 和 Python 接口，可选接入 ROS 2 与 MoveIt 2',
    url: serialArm,
    repositoryKind: 'personal',
    displayGroup: 'featured',
    stageLabel: '已有 Linux 发行版 · 持续开发',
    repositoryArchived: false,
    release: {
      tag: 'v0.6.2',
      publishedAt: '2026-11-08',
      url: `${serialArm}/releases/tag/v0.6.2`,
      distribution: 'binary-and-source',
    },
    evidence: {
      checkedAt,
      urls: [
        `${serialArm}/blob/fde62519882e866c5d53640b56941869fc93cf7c/README.md`,
        `${serialArm}/releases/tag/v0.6.2`,
        `${profileAssets}/serialarm-studio-dynamics.png`,
      ],
      scope: '公开文档、Linux deb / AppImage 发行与工作台截图',
    },
    image: {
      src: '/images/projects/serialarm-studio-dynamics.webp',
      width: 1440,
      height: 794,
      alt: 'SerialArm Studio 动力学配置工作台，左侧为三维机械臂模型，右侧为配置与标定面板',
      caption: 'SerialArm Studio 的动力学配置界面',
      purpose: 'product-ui',
    },
    action: '查看项目',
    more: { label: '查看发行版', url: `${serialArm}/releases` },
    detail: '内置 Damiao 后端与 DM-Arm 示例，接入其他硬件需按接口适配与验证',
  },
  robotStudio: {
    id: 'robot-studio',
    title: 'AT Robot Studio',
    subtitle: '独立 ROS 2 系统集成工作台',
    summary: '在独立的机器人工程中接入子系统、配置可复用任务，用层级状态机与行为树编排工作流，在运行台查看状态、反馈与诊断',
    url: robotStudio,
    repositoryKind: 'organization',
    displayGroup: 'featured',
    stageLabel: '已发布源码版本 · 持续开发',
    repositoryArchived: false,
    release: {
      tag: 'v0.1.0',
      publishedAt: '2026-11-10',
      url: `${robotStudio}/releases/tag/v0.1.0`,
      distribution: 'source-only',
    },
    evidence: {
      checkedAt,
      urls: [
        `${robotStudio}/blob/1ee0578bb6c3b5269861e72f852cba7edb841759/README.md`,
        `${robotStudio}/releases/tag/v0.1.0`,
        `${profileAssets}/atil-robot-studio-orchestration.png`,
      ],
      scope: 'ROS 2 工作台文档、源码发行与编排界面截图',
    },
    image: {
      src: '/images/projects/atil-robot-studio-orchestration.webp',
      width: 1200,
      height: 660,
      alt: 'AT Robot Studio 工作流编排界面，画布中展示层级状态机与状态之间的连线',
      caption: 'AT Robot Studio 的工作流编排界面',
      purpose: 'product-ui',
    },
    action: '查看工作台与源码',
    more: { label: '阅读使用指南', url: `${robotStudio}/blob/main/docs/interactive-guide.md` },
    detail: '从源码安装，机器人接口、启动配置与业务流程由外部机器人工程提供',
  },
  embeddedSdk: {
    id: 'embedded-sdk',
    title: 'Embedded Control SDK',
    subtitle: '可跨项目复用的 MCU 基础设施与设备模块',
    summary: 'SDK 提供通用通信、设备与控制模块，各项目负责业务流程、装配关系和平台配置',
    url: embeddedSdk,
    repositoryKind: 'organization',
    displayGroup: 'featured',
    stageLabel: '持续维护 · 按模块标注成熟度',
    repositoryArchived: false,
    evidence: {
      checkedAt,
      urls: [
        `${embeddedSdk}/blob/71b9fbf1bc2ec876fb899cc63cfde0c888515c96/README.md`,
        `${embeddedSdk}/blob/71b9fbf1bc2ec876fb899cc63cfde0c888515c96/docs/module-status.md`,
      ],
      scope: '公共层边界与模块成熟度说明',
    },
    action: '查看 SDK',
    more: { label: '查看模块状态', url: `${embeddedSdk}/blob/main/docs/module-status.md` },
    detail: 'Stable 对应模块文档中已确认的使用路径',
    modules: ['infra', 'domain', 'device'],
  },
  calibration: {
    id: 'handeye-calibration',
    title: 'Handeye Calibration',
    summary: '面向眼在手上场景的可视化手眼标定工作台，将相机与机器人数据接入统一流程，串联采样、诊断求解和独立验证',
    url: calibration,
    repositoryKind: 'organization',
    displayGroup: 'resource',
    stageLabel: '公开工具 · 眼在手上流程',
    repositoryArchived: false,
    evidence: {
      checkedAt,
      urls: [`${calibration}/blob/f9f61479efe4a4e0d5749bf5cccd20035dcded3b/README.md`],
      scope: '工作台与眼在手上标定流程',
    },
  },
  dualArm: {
    id: 'dual-dm-arm',
    title: 'Dual-DM-Arm-LeRobot',
    summary: '双臂遥操作、示教数据处理与模仿学习策略部署实验',
    url: `${dualArm}/tree/IL-RL`,
    repositoryKind: 'personal',
    displayGroup: 'exploration',
    stageLabel: '探索与实验',
    repositoryArchived: false,
    evidence: {
      checkedAt,
      urls: [`${dualArm}/blob/c45bc119317c5a8a72caac9863d10b916e77149d/README.md`],
      scope: 'IL-RL 分支文档中的遥操作、示教数据、模仿学习与部署流程',
    },
  },
  atlas: {
    id: 'atlas',
    title: 'Atlas',
    summary: '早期机器人系统的软件基线，相关模块与经验延续到后续工程',
    url: atlas,
    repositoryKind: 'organization',
    displayGroup: 'history',
    stageLabel: '历史软件基线 · 仓库开放',
    repositoryArchived: false,
    evidence: {
      checkedAt,
      urls: [atlas, association.projectNavigation, `${atlas}/blob/d7cb22733262ff9aa33bb591c4164092ea7e60b3/README.md`],
      scope: '组织方向导航中的历史定位与 GitHub 仓库公开状态',
    },
  },
  longinus: {
    id: 'longinus',
    title: 'Longinus',
    summary: '基于 Atlas MCU 基线演进的四舵轮遥控底盘，正在推进公共 SDK 集成与整机验证',
    url: longinus,
    repositoryKind: 'organization',
    displayGroup: 'resource',
    stageLabel: '集成与验证中',
    repositoryArchived: false,
    detail: '已推进公共 SDK 接入与驱动迁移的源码工作，编译、低速真机验收与基线冻结仍待完成',
    more: { label: '查看实施计划', url: `${longinus}/blob/main/docs/plan.md` },
    evidence: {
      checkedAt,
      urls: [
        `${longinus}/blob/464cc643f60a641f3463bb82abf74c88bc0d70f9/README.md`,
        `${longinus}/blob/464cc643f60a641f3463bb82abf74c88bc0d70f9/docs/plan.md`,
      ],
      scope: '源码进展与待完成的集成验证',
    },
  },
  scanner: {
    id: 'handheld-scanner',
    title: 'Handheld-scanner',
    summary: '面向三维采集的手持扫描原型，当前版本聚焦雷达惯导建图',
    url: scanner,
    repositoryKind: 'organization',
    displayGroup: 'exploration',
    stageLabel: '原型验证',
    repositoryArchived: false,
    evidence: {
      checkedAt,
      urls: [`${scanner}/blob/af2427b63506451430d1d66150f2079d1285a6d8/README.md`],
      scope: '更名后的仓库与雷达惯导建图原型',
    },
  },
  mk1: {
    id: 'mk1',
    title: 'Mk.1',
    summary: '比赛机器人历史工程',
    url: mk1,
    repositoryKind: 'organization',
    displayGroup: 'history',
    stageLabel: '已归档',
    repositoryArchived: true,
    evidence: { checkedAt, urls: [mk1], scope: 'GitHub 仓库归档状态' },
  },
  hephaestus: {
    id: 'hephaestus',
    title: 'Hephaestus',
    summary: '比赛机器人历史工程',
    url: hephaestus,
    repositoryKind: 'organization',
    displayGroup: 'history',
    stageLabel: '已归档',
    repositoryArchived: true,
    evidence: { checkedAt, urls: [hephaestus], scope: 'GitHub 仓库归档状态' },
  },
} satisfies Record<string, ProjectRecord>

export const featuredProjects = Object.values(projects).filter(project => project.displayGroup === 'featured')
export const historicalProjects = Object.values(projects).filter(project => project.displayGroup === 'history')
