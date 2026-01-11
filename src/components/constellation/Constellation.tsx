import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { MODULES } from '@/config/modules'
import { getCourseById } from '@/config/courses'
import { usePortfolio } from '@/context/PortfolioContext'
import { ModuleNode } from './ModuleNode'
import { cn } from '@/lib/utils'

interface ConstellationProps {
  courseId: string
  onSelectModule: (moduleId: string) => void
  onBack: () => void
}

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
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
}

function getRecommendedModule(
  modules: typeof MODULES,
  getModuleProgress: (id: string) => { status: string }
): string | null {
  const sorted = [...modules].sort((a, b) => a.order - b.order)
  for (const module of sorted) {
    const progress = getModuleProgress(module.id)
    if (progress.status !== 'completed') {
      return module.id
    }
  }
  return null
}

export function Constellation({
  courseId,
  onSelectModule,
  onBack,
}: ConstellationProps) {
  const { getModuleProgress } = usePortfolio()
  const course = getCourseById(courseId)

  // Filter modules by course
  const courseModules = MODULES.filter((m) => m.courseId === courseId)
  const recommendedId = getRecommendedModule(courseModules, getModuleProgress)

  if (!course) {
    return <div className="text-white">Course not found</div>
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen px-4"
      style={{
        background:
          'radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%)',
      }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Courses</span>
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
          {course.name}
        </h1>
        <p className="text-gray-400 text-sm">Choose a module to explore</p>
      </div>

      {/* Module constellation - hybrid layout */}
      <motion.div
        className={cn(
          'relative flex items-center',
          // Mobile: vertical column
          'flex-col',
          // Desktop: horizontal row
          'md:flex-row'
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {courseModules
          .sort((a, b) => a.order - b.order)
          .map((module, index, sortedModules) => {
            const moduleProgress = getModuleProgress(module.id)
            const isCompleted = moduleProgress.status === 'completed'
            const isLastModule = index === sortedModules.length - 1

            return (
              <div
                key={module.id}
                className={cn(
                  'flex items-center',
                  // Mobile: vertical
                  'flex-col',
                  // Desktop: horizontal
                  'md:flex-row'
                )}
              >
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

                {/* Connector segment */}
                {!isLastModule && (
                  <motion.div
                    variants={connectorVariants}
                    className={cn(
                      'origin-center',
                      // Mobile: vertical connector
                      'w-px h-8',
                      // Desktop: horizontal connector
                      'md:w-8 md:h-px',
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
