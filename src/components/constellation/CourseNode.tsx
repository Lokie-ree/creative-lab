import { motion } from 'motion/react'
import type { Course } from '@/config/courses'
import { usePortfolio } from '@/context/PortfolioContext'
import { SegmentArc } from './SegmentArc'
import { cn } from '@/lib/utils'

interface CourseNodeProps {
  course: Course
  onClick: () => void
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
      onClick={onClick}
      className="flex flex-col items-center gap-3 group"
      disabled={!hasModules}
    >
      {/* Node ring */}
      <div
        className={cn(
          'relative w-28 h-28 rounded-full flex items-center justify-center',
          'border-2 transition-all duration-300',
          hasModules
            ? 'cursor-pointer group-hover:scale-105'
            : 'cursor-not-allowed opacity-50'
        )}
        style={{
          borderColor: course.color,
          boxShadow: hasModules ? `0 0 20px ${course.color}33` : undefined,
        }}
      >
        {/* Segment arc for progress */}
        {hasModules && (
          <SegmentArc
            total={progress.total}
            completed={progress.completed}
            size={112}
            color={course.color}
          />
        )}

        {/* Icon */}
        <span
          className="text-3xl font-mono"
          style={{ color: course.color }}
        >
          {course.icon}
        </span>
      </div>

      {/* Course name */}
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
        {course.name}
      </span>

      {/* Module count */}
      {hasModules && (
        <span className="text-xs text-gray-500">
          {progress.completed}/{progress.total} modules
        </span>
      )}

      {/* Coming soon badge for empty courses */}
      {!hasModules && (
        <span className="text-xs text-gray-600 italic">Coming soon</span>
      )}
    </motion.button>
  )
}
