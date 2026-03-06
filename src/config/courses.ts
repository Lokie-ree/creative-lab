// src/config/courses.ts

export interface Course {
  id: string
  name: string
  icon: string
  order: number
  moduleIds: string[]
}

export const COURSES: Course[] = [
  {
    id: 'advanced-math',
    name: 'Advanced Math',
    icon: '∞',
    order: 1,
    moduleIds: ['sinewaves', 'vector-transformations', 'phase-portraits'],
  },
  {
    id: 'geometry',
    name: 'Geometry',
    icon: '△',
    order: 2,
    moduleIds: ['rigid-motions'],
  },
  {
    id: 'cs',
    name: 'CS',
    icon: '</>',
    order: 3,
    moduleIds: [],
  },
]

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id)
}
