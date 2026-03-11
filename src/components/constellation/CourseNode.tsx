import { motion } from 'motion/react'
import type { Course } from '@/config/courses'
import { usePortfolio } from '@/context/PortfolioContext'
import { SegmentArc } from './SegmentArc'
import { cn } from '@/lib/utils'

interface CourseNodeProps {
  course: Course
  onClick: (event: React.MouseEvent) => void
}

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

export function CourseNode({ course, onClick }: CourseNodeProps) {
  const { getCourseProgress } = usePortfolio()
  const progress = getCourseProgress(course.id)
  const hasModules = course.moduleIds.length > 0

  return (
    <motion.button
      variants={nodeVariants}
      onClick={(e) => onClick(e)}
      className="flex flex-col items-center gap-3 group"
      disabled={!hasModules}
    >
      {/* Node panel */}
      <div
        className={cn(
          'relative w-24 h-24 rounded flex items-center justify-center',
          'border transition-all duration-150',
          hasModules
            ? 'cursor-pointer border-[var(--lab-border)] group-hover:border-[var(--lab-accent)]'
            : 'cursor-not-allowed opacity-40 border-[var(--lab-border)]'
        )}
      >
        {/* Segment arc for progress */}
        <SegmentArc
          total={progress.total}
          completed={progress.completed}
          size={96}
        />

        {/* Icon */}
        <span className="text-2xl font-mono text-[var(--lab-accent)]">
          {course.icon}
        </span>
      </div>

      {/* Course name */}
      <span className="lab-display-font text-sm text-(--lab-text-muted) group-hover:text-(--lab-text) transition-colors duration-150">
        {course.name}
      </span>

      {/* Module count */}
      {hasModules && (
        <span className="text-xs text-[var(--lab-ghost)] lab-silk lab-display-font">
          {progress.completed}/{progress.total} modules
        </span>
      )}

      {/* Coming soon */}
      {!hasModules && (
        <span className="text-xs text-[var(--lab-ghost)] lab-silk lab-display-font">
          Coming soon
        </span>
      )}
    </motion.button>
  )
}
