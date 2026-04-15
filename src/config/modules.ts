// src/config/modules.ts

import type { TransformationParams } from '@/lib/types/transforms'

export interface ModuleConfig {
  id: string
  title: string
  domain: string
  description: string
  order: number
  courseId: string
  component: () => Promise<{ default: React.ComponentType<ModuleProps> }>
  comingSoon?: boolean
}

export interface ModuleProps {
  onComplete: (values: Record<string, number>, meta?: { completedSequence?: TransformationParams[] }) => void
  isVisible?: boolean
  onBack?: () => void
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'sinewaves',
    title: 'Sinewaves',
    domain: 'Trigonometry',
    description: 'Where does the wave come from?',
    order: 1,
    courseId: 'advanced-math',
    component: () => import('@/components/modules/sinewaves/InstrumentModule'),
  },
  {
    id: 'rigid-motions',
    title: 'Rigid Motions',
    domain: 'Geometry',
    description: 'What stays the same when a shape moves?',
    order: 2,
    courseId: 'geometry',
    component: () => import('@/components/modules/rigid-motions/InstrumentModule'),
  },
  {
    id: 'dilations',
    title: 'Dilations & Similarity',
    domain: 'Geometry',
    description: 'What stays the same when a shape grows?',
    order: 3,
    courseId: 'geometry',
    component: () => import('@/components/modules/dilations/DilationsModule'),
    comingSoon: false,
  },
  {
    id: 'pythagorean-theorem',
    title: 'Pythagorean Theorem',
    domain: 'Geometry',
    description: 'Why do the squares fit together perfectly?',
    order: 4,
    courseId: 'geometry',
    component: () => import('@/components/modules/pythagorean-theorem/PythagoreanModule'),
  },
  {
    id: 'vector-transformations',
    title: 'Vector Transformations',
    domain: 'Linear Algebra',
    description: 'What does a matrix do to space?',
    order: 2,
    courseId: 'advanced-math',
    component: () => import('@/components/modules/vector-transforms/Module'),
    comingSoon: true,
  },
  {
    id: 'phase-portraits',
    title: 'Phase Portraits',
    domain: 'Differential Equations',
    description: 'How do systems evolve over time?',
    order: 3,
    courseId: 'advanced-math',
    component: () => import('@/components/modules/phase-portraits/Module'),
    comingSoon: true,
  },
]

export function getModuleById(id: string): ModuleConfig | undefined {
  return MODULES.find(m => m.id === id)
}
