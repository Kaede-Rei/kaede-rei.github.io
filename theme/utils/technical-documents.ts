import type { RouteRecordNormalized } from 'vue-router'
import { learningChapters } from './learning'
import { robotArmDevelopmentReferencesPath, robotArmDevelopmentTrack } from './robot-arm-development'

export interface TechnicalDocumentEntry {
  title: string
  path: string
}

export interface TechnicalDocumentSection extends TechnicalDocumentEntry {
  id: string
  children: TechnicalDocumentEntry[]
}

export function robotArmDocumentSections(routes: RouteRecordNormalized[]): TechnicalDocumentSection[] {
  return robotArmDevelopmentTrack.phases.map((phase) => {
    const children = learningChapters(routes, robotArmDevelopmentTrack, phase)
      .map(({ title, path }) => ({ title, path }))
    if (phase.id === 'phase-4') children.push({ title: '参考资料', path: robotArmDevelopmentReferencesPath })

    return { id: phase.id, title: phase.title, path: phase.overviewLink, children }
  })
}

