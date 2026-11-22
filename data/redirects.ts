import { robotArmDevelopmentPath } from '../theme/utils/robot-arm-development'

const oldArmPath = '/learning-path/arm-motion-control'

const armRedirects = [
  { from: ['', '/index'], to: '' },
  { from: ['/phase-1', '/phase-1/index', '/phase-1/1-4'], to: '/phase-1' },
  { from: ['/phase-1/1-1'], to: '/phase-2/2-4' },
  { from: ['/phase-1/1-2'], to: '/phase-2/2-5' },
  { from: ['/phase-1/1-3', '/phase-2/2-1'], to: '/phase-2/2-1' },
  { from: ['/phase-2', '/phase-2/index', '/phase-2/2-2', '/phase-3', '/phase-3/index'], to: '/phase-2' },
  { from: ['/phase-2/2-3'], to: '/phase-1/1-3' },
  { from: ['/phase-2/2-4', '/phase-2/2-5', '/phase-2/2-6', '/phase-2/2-12'], to: '/phase-2/2-10' },
  { from: ['/phase-2/2-7'], to: '/phase-3/3-3' },
  { from: ['/phase-2/2-8', '/phase-2/2-9', '/phase-2/2-11'], to: '/phase-2/2-11' },
  { from: ['/phase-2/2-10'], to: '/phase-2/2-2' },
  { from: ['/phase-2/2-13', '/phase-3/3-3'], to: '/phase-2/2-15' },
  { from: ['/phase-3/3-1'], to: '/phase-2/2-13' },
  { from: ['/phase-3/3-2'], to: '/phase-4/4-3' },
]

export const legacyArmRedirects = armRedirects.map(({ from, to }) => ({
  from: from.map(suffix => oldArmPath + suffix),
  to: robotArmDevelopmentPath + to,
}))
