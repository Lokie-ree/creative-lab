import { MODULES } from '@/config/modules'
import { usePortfolio } from '@/context/PortfolioContext'
import { ModuleNode } from './ModuleNode'
import { ConnectionLines } from './ConnectionLines'

interface ConstellationProps {
  onSelectModule: (moduleId: string) => void
  onBack?: () => void
}

function getRecommendedModule(
  modules: typeof MODULES,
  getProgress: (id: string) => { status: string }
): string | null {
  const sorted = [...modules].sort((a, b) => a.order - b.order)

  // Prioritize in-progress
  for (const m of sorted) {
    if (getProgress(m.id).status === 'in-progress') return m.id
  }

  // Next incomplete
  for (const m of sorted) {
    if (getProgress(m.id).status !== 'completed') return m.id
  }

  return null
}

export function Constellation({ onSelectModule, onBack }: ConstellationProps) {
  const { getModuleProgress } = usePortfolio()
  const recommendedId = getRecommendedModule(MODULES, getModuleProgress)

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] px-4">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          <span>&#8592;</span>
          <span>Back</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-light text-white mb-2">
          Interactive Math Experiences
        </h1>
        <p className="text-gray-400 text-sm">
          Choose a module to explore
        </p>
      </div>

      {/* Constellation */}
      <div className="relative flex flex-col items-center gap-8">
        <ConnectionLines nodeCount={MODULES.length} />

        {MODULES
          .sort((a, b) => b.order - a.order) // Display top to bottom (higher order = top)
          .map((module) => {
            const moduleProgress = getModuleProgress(module.id)
            return (
              <ModuleNode
                key={module.id}
                module={module}
                status={moduleProgress.status}
                progress={moduleProgress.progress ?? (moduleProgress.status === 'completed' ? 1 : 0)}
                isRecommended={module.id === recommendedId}
                onClick={() => onSelectModule(module.id)}
              />
            )
          })}
      </div>
    </div>
  )
}
