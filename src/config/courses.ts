// src/config/courses.ts

export interface Course {
  id: string
  name: string
  icon: string
  color: string
  order: number
  moduleIds: string[]
}

export const COURSES: Course[] = [
  {
    id: 'advanced-math',
    name: 'Advanced Math',
    icon: '∞',
    color: '#22d3ee',
    order: 1,
    moduleIds: ['sinewaves', 'vector-transformations', 'phase-portraits'],
  },
  {
    id: 'cs',
    name: 'CS',
    icon: '</>',
    color: '#a855f7',
    order: 2,
    moduleIds: [],
  },
]

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id)
}
