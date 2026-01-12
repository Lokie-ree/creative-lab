# Constellation Phase 4: Two-Level Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform constellation into two-level navigation with course hub leading to module constellations, optimizing desktop screen space with responsive grid/hybrid layouts.

**Architecture:** Course hub displays course nodes in a responsive grid. Clicking a course triggers zoom transition to module constellation filtered by course. Module constellation uses hybrid layout (vertical mobile, horizontal desktop). Progress arcs on courses show segmented completion.

**Tech Stack:** React 19, TypeScript, Motion (framer-motion), Tailwind CSS, React Router concepts via view state

---

## Task 1: Course Configuration

**Files:**
- Create: `src/config/courses.ts`
- Modify: `src/config/modules.ts`

**Step 1: Create course configuration file**

Create `src/config/courses.ts`:

```typescript
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
    moduleIds: ['sinusoidal', 'vector-transforms'],
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
```

**Step 2: Add courseId to modules**

Modify `src/config/modules.ts` - add `courseId` field to the Module interface and each module:

```typescript
// Add to Module interface:
courseId: string

// Update MODULES array - add courseId to each module:
// For sinusoidal module:
courseId: 'advanced-math',

// For vector-transforms module (if exists):
courseId: 'advanced-math',
```

**Step 3: Run lint to verify**

Run: `pnpm lint`
Expected: No errors

**Step 4: Commit**

```bash
git add src/config/courses.ts src/config/modules.ts
git commit -m "feat: add course configuration and link modules to courses"
```

---

## Task 2: Course Progress in Context

**Files:**
- Modify: `src/context/PortfolioContext.tsx`

**Step 1: Add course progress calculation**

Add to `PortfolioContext.tsx` - new function in the context:

```typescript
// Add to PortfolioContextType interface:
getCourseProgress: (courseId: string) => { completed: number; total: number; percentage: number }

// Add implementation in PortfolioProvider:
const getCourseProgress = useCallback((courseId: string) => {
  const course = COURSES.find((c) => c.id === courseId)
  if (!course) return { completed: 0, total: 0, percentage: 0 }

  const total = course.moduleIds.length
  const completed = course.moduleIds.filter((moduleId) => {
    const progress = getModuleProgress(moduleId)
    return progress.status === 'completed'
  }).length

  return {
    completed,
    total,
    percentage: total > 0 ? completed / total : 0,
  }
}, [getModuleProgress])

// Add to context value:
getCourseProgress,
```

**Step 2: Add COURSES import**

```typescript
import { COURSES } from '@/config/courses'
```

**Step 3: Run lint and dev server to verify**

Run: `pnpm lint && pnpm dev`
Expected: No errors, app loads

**Step 4: Commit**

```bash
git add src/context/PortfolioContext.tsx
git commit -m "feat: add course progress calculation to context"
```

---

## Task 3: Segment Arc Component

**Files:**
- Create: `src/components/constellation/SegmentArc.tsx`

**Step 1: Create segment arc component**

Create `src/components/constellation/SegmentArc.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface SegmentArcProps {
  total: number
  completed: number
  size: number
  strokeWidth?: number
  color: string
  className?: string
}

export function SegmentArc({
  total,
  completed,
  size,
  strokeWidth = 3,
  color,
  className,
}: SegmentArcProps) {
  if (total === 0) return null

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const segmentLength = circumference / total
  const gapLength = 4 // Gap between segments in pixels
  const arcLength = segmentLength - gapLength

  return (
    <svg
      width={size}
      height={size}
      className={cn('absolute inset-0', className)}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < completed
        const rotation = (index / total) * 360 - 90 // Start from top

        return (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isCompleted ? color : '#4b5563'}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            className={cn(
              'transition-all duration-300',
              isCompleted && 'drop-shadow-[0_0_6px_currentColor]'
            )}
            style={{ color: isCompleted ? color : undefined }}
          />
        )
      })}
    </svg>
  )
}
```

**Step 2: Run lint to verify**

Run: `pnpm lint`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/constellation/SegmentArc.tsx
git commit -m "feat: add SegmentArc component for course progress"
```

---

## Task 4: Course Node Component

**Files:**
- Create: `src/components/constellation/CourseNode.tsx`

**Step 1: Create course node component**

Create `src/components/constellation/CourseNode.tsx`:

```tsx
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
```

**Step 2: Run lint to verify**

Run: `pnpm lint`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/constellation/CourseNode.tsx
git commit -m "feat: add CourseNode component with segment progress"
```

---

## Task 5: Course Hub Component

**Files:**
- Create: `src/components/constellation/CourseHub.tsx`

**Step 1: Create course hub component**

Create `src/components/constellation/CourseHub.tsx`:

```tsx
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
```

**Step 2: Run lint to verify**

Run: `pnpm lint`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/constellation/CourseHub.tsx
git commit -m "feat: add CourseHub component with responsive grid"
```

---

## Task 6: Update Module Constellation for Hybrid Layout

**Files:**
- Modify: `src/components/constellation/Constellation.tsx`

**Step 1: Add courseId prop and hybrid layout**

Update `src/components/constellation/Constellation.tsx`:

```tsx
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
```

**Step 2: Run lint to verify**

Run: `pnpm lint`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/constellation/Constellation.tsx
git commit -m "feat: update Constellation with courseId filter and hybrid layout"
```

---

## Task 7: Update App.tsx View Routing

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add course hub view state**

Update `src/App.tsx` to add 'courses' view and courseId state:

```tsx
// Update View type:
type View = 'hero' | 'courses' | 'constellation' | 'module'

// Add courseId state:
const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

// Update view transitions:
// Hero "Enter" button -> 'courses'
// CourseHub onSelectCourse -> set courseId, view to 'constellation'
// Constellation onBack -> 'courses', clear courseId
// Constellation onSelectModule -> 'module'
```

**Step 2: Implement full App.tsx update**

```tsx
import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Hero } from '@/components/Hero'
import { CourseHub } from '@/components/constellation/CourseHub'
import { Constellation } from '@/components/constellation/Constellation'
import { Module } from '@/components/Module'
import { PortfolioProvider } from '@/context/PortfolioContext'

type View = 'hero' | 'courses' | 'constellation' | 'module'

function App() {
  const [view, setView] = useState<View>('hero')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  const handleEnter = useCallback(() => {
    setView('courses')
  }, [])

  const handleSelectCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId)
    setView('constellation')
  }, [])

  const handleSelectModule = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId)
    setView('module')
  }, [])

  const handleBackToCourses = useCallback(() => {
    setSelectedCourseId(null)
    setView('courses')
  }, [])

  const handleBackToConstellation = useCallback(() => {
    setSelectedModuleId(null)
    setView('constellation')
  }, [])

  const handleBackToHero = useCallback(() => {
    setView('hero')
  }, [])

  return (
    <PortfolioProvider>
      <AnimatePresence mode="wait">
        {view === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Hero onEnter={handleEnter} />
          </motion.div>
        )}

        {view === 'courses' && (
          <motion.div
            key="courses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CourseHub
              onSelectCourse={handleSelectCourse}
              onBack={handleBackToHero}
            />
          </motion.div>
        )}

        {view === 'constellation' && selectedCourseId && (
          <motion.div
            key="constellation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Constellation
              courseId={selectedCourseId}
              onSelectModule={handleSelectModule}
              onBack={handleBackToCourses}
            />
          </motion.div>
        )}

        {view === 'module' && selectedModuleId && (
          <motion.div
            key="module"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Module
              moduleId={selectedModuleId}
              onBack={handleBackToConstellation}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PortfolioProvider>
  )
}

export default App
```

**Step 3: Run dev server and test navigation**

Run: `pnpm dev`
Test: Hero → Courses → Constellation → Module → back navigation

**Step 4: Run lint to verify**

Run: `pnpm lint`
Expected: No errors

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add course hub view routing with two-level navigation"
```

---

## Task 8: Zoom Transition Animation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/constellation/CourseHub.tsx`

**Step 1: Add transition state for zoom animation**

This task adds the zoom-in/zoom-out transition between course hub and constellation. The animation:
1. Tracks which course node was clicked
2. Scales that node up while fading others
3. Transitions to constellation view

Update `src/App.tsx` - add transition state:

```tsx
// Add state for tracking transition origin
const [transitionOrigin, setTransitionOrigin] = useState<{
  x: number
  y: number
} | null>(null)

// Update handleSelectCourse to capture click position
const handleSelectCourse = useCallback((courseId: string, event?: React.MouseEvent) => {
  if (event) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setTransitionOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }
  setSelectedCourseId(courseId)
  setView('constellation')
}, [])
```

**Step 2: Update CourseHub to pass click event**

Update `CourseHub.tsx` interface and callback:

```tsx
interface CourseHubProps {
  onSelectCourse: (courseId: string, event?: React.MouseEvent) => void
  onBack: () => void
}

// In CourseNode onClick:
onClick={(e) => onSelectCourse(course.id, e)}
```

**Step 3: Update CourseNode to pass event**

Update `CourseNode.tsx`:

```tsx
interface CourseNodeProps {
  course: Course
  onClick: (event: React.MouseEvent) => void
}

// Update button onClick:
onClick={(e) => onClick(e)}
```

**Step 4: Add zoom animation variants to App.tsx**

```tsx
// Add custom transition variants for zoom effect
const zoomInVariants = {
  initial: (origin: { x: number; y: number } | null) => ({
    opacity: 0,
    scale: 0.8,
    transformOrigin: origin ? `${origin.x}px ${origin.y}px` : 'center',
  }),
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (origin: { x: number; y: number } | null) => ({
    opacity: 0,
    scale: 0.8,
    transformOrigin: origin ? `${origin.x}px ${origin.y}px` : 'center',
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
}

// Apply to constellation view:
{view === 'constellation' && selectedCourseId && (
  <motion.div
    key="constellation"
    custom={transitionOrigin}
    variants={zoomInVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <Constellation
      courseId={selectedCourseId}
      onSelectModule={handleSelectModule}
      onBack={handleBackToCourses}
    />
  </motion.div>
)}
```

**Step 5: Run dev server and test zoom transition**

Run: `pnpm dev`
Test: Click course node, verify zoom-in effect. Click back, verify zoom-out.

**Step 6: Run lint to verify**

Run: `pnpm lint`
Expected: No errors

**Step 7: Commit**

```bash
git add src/App.tsx src/components/constellation/CourseHub.tsx src/components/constellation/CourseNode.tsx
git commit -m "feat: add zoom transition between course hub and constellation"
```

---

## Task 9: Visual Polish & Testing

**Files:**
- Various touch-ups

**Step 1: Test responsive behavior**

Run: `pnpm dev`
Test at breakpoints:
- Mobile (< 640px): Single column courses, vertical modules
- Tablet (640-1024px): 2 column courses
- Desktop (> 1024px): 3-4 column courses, horizontal modules

**Step 2: Test all navigation paths**

- Hero → Courses → Advanced Math → Sinusoidal → back → back → back → Hero
- Verify zoom transitions both directions
- Verify progress displays correctly

**Step 3: Run full build**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 4: Run lint**

Run: `pnpm lint`
Expected: No errors

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete phase 4 two-level navigation with polish"
```

---

## Task 10: Update PR

**Step 1: Push changes**

```bash
git push origin feature/constellation-architecture
```

**Step 2: Update PR description**

Add Phase 4 to the PR description covering:
- Two-level navigation (Course Hub → Module Constellation)
- Course nodes with segment progress arcs
- Responsive grid layout for courses
- Hybrid layout for modules (vertical mobile, horizontal desktop)
- Zoom in/out transitions

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Course configuration + module courseId |
| 2 | Course progress in context |
| 3 | SegmentArc component |
| 4 | CourseNode component |
| 5 | CourseHub component |
| 6 | Update Constellation hybrid layout |
| 7 | Update App.tsx view routing |
| 8 | Zoom transition animation |
| 9 | Visual polish & testing |
| 10 | Update PR |
