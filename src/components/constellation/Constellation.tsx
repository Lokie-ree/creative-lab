import { motion } from 'motion/react'
import { MODULES } from '@/config/modules'
import { usePortfolio } from '@/context/PortfolioContext'
import { ModuleNode } from './ModuleNode'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

const connectorVariants = {
  hidden: { opacity: 0, scaleY: 0 },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
}

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
    <div
      className="relative flex flex-col items-center justify-center min-h-screen px-4"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%)',
      }}
    >
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
      <motion.div
        className="relative flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {MODULES
          .sort((a, b) => a.order - b.order) // Display top to bottom (lower order = top, first module at top)
          .map((module, index, sortedModules) => {
            const moduleProgress = getModuleProgress(module.id)
            const isCompleted = moduleProgress.status === 'completed'
            const isLastModule = index === sortedModules.length - 1

            return (
              <div key={module.id} className="flex flex-col items-center">
                {/* Module Node */}
                <motion.div variants={nodeVariants}>
                  <ModuleNode
                    module={module}
                    status={moduleProgress.status}
                    progress={moduleProgress.progress ?? (isCompleted ? 1 : 0)}
                    isRecommended={module.id === recommendedId}
                    onClick={() => onSelectModule(module.id)}
                  />
                </motion.div>

                {/* Connector segment (not after last module) */}
                {!isLastModule && (
                  <motion.div
                    variants={connectorVariants}
                    className={cn(
                      'w-px h-8 origin-top',
                      isCompleted
                        ? 'bg-cyan-400 animate-ring-pulse'
                        : 'bg-gray-600'
                    )}
                  />
                )}
              </div>
            )
          })}
      </motion.div>
    </div>
  )
}
