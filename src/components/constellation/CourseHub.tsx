import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { COURSES } from '@/config/courses'
import { CourseNode } from './CourseNode'

interface CourseHubProps {
  onSelectCourse: (courseId: string, event?: React.MouseEvent) => void
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

export function CourseHub({ onSelectCourse, onBack }: CourseHubProps) {
  return (
    <div className="flex flex-col h-dvh bg-[var(--lab-bg)]">
      {/* Header row */}
      <div className="flex items-center px-4 h-12 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 min-h-[44px] px-2 text-[var(--lab-ghost)] hover:text-[var(--lab-text)] transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="lab-silk lab-display-font">Back</span>
        </button>
      </div>

      {/* Content area — centered in remaining height */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="text-center mb-12">
          <h1 className="lab-display-font text-3xl md:text-4xl font-semibold text-(--lab-text)">
            IVLA STEM Club
          </h1>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {COURSES.sort((a, b) => a.order - b.order).map((course) => (
            <CourseNode
              key={course.id}
              course={course}
              onClick={(e) => onSelectCourse(course.id, e)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
