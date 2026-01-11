import { motion } from 'motion/react'
import { COURSES } from '@/config/courses'
import { CourseNode } from './CourseNode'

interface CourseHubProps {
  onSelectCourse: (courseId: string) => void
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
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
          Randall LaPoint, Jr.
        </h1>
        <p className="text-gray-400">Interactive Learning Experiences</p>
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
            onClick={() => onSelectCourse(course.id)}
          />
        ))}
      </motion.div>
    </div>
  )
}
