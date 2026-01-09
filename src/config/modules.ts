// src/config/modules.ts

export interface ModuleConfig {
  id: string
  title: string
  domain: string
  description: string
  order: number
  component: () => Promise<{ default: React.ComponentType<ModuleProps> }>
}

export interface ModuleProps {
  onComplete: (values: { amplitude: number; frequency: number }) => void
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'sinusoidal-waves',
    title: 'Sinusoidal Waves',
    domain: 'Trigonometry',
    description: 'Where does the wave come from?',
    order: 1,
    component: () => import('@/components/Module'),
  },
  {
    id: 'vector-transformations',
    title: 'Vector Transformations',
    domain: 'Linear Algebra',
    description: 'What does a matrix do to space?',
    order: 2,
    // @ts-expect-error Module not yet implemented
    component: () => import('@/components/modules/vector-transforms/Module'),
  },
  {
    id: 'phase-portraits',
    title: 'Phase Portraits',
    domain: 'Differential Equations',
    description: 'How do systems evolve over time?',
    order: 3,
    // @ts-expect-error Module not yet implemented
    component: () => import('@/components/modules/phase-portraits/Module'),
  },
]

export function getModuleById(id: string): ModuleConfig | undefined {
  return MODULES.find(m => m.id === id)
}
