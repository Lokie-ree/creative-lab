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
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-[var(--lab-bg)]">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-[var(--lab-ghost)] hover:text-[var(--lab-text)] transition-colors duration-150 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="lab-silk lab-display-font">Back</span>
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-light text-[var(--lab-text)] mb-2">
          Randall LaPoint, Jr.
        </h1>
      </div>

      {/* Course grid */}
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
  )
}
