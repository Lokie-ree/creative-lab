# Constellation Polish Phase 2 - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace basic module nodes with layered SVG rings showing progress through fill level.

**Architecture:** Create a dedicated `NodeRings` SVG component for the concentric circles, integrate GSAP for progress arc animation, update CSS for hover/pulse effects.

**Tech Stack:** React, SVG, GSAP, Tailwind CSS

**Design Doc:** `docs/plans/2026-01-10-constellation-polish-design.md`

---

## Task 1: Add Progress Percentage to Portfolio Types

**Files:**
- Modify: `src/types/portfolio.ts`

**Step 1: Add progress field to ModuleProgress**

Add an optional `progress` field (0-1) to track completion percentage:

```typescript
export interface ModuleProgress {
  status: ModuleStatus
  progress?: number // 0-1, percentage through module
  currentStage?: string
  currentSubStage?: string
  discoveries?: {
    amplitude?: number | null
    frequency?: number | null
  }
  completedAt?: string
}
```

**Step 2: Commit**

```bash
git add src/types/portfolio.ts
git commit -m "feat(types): add progress percentage to ModuleProgress"
```

---

## Task 2: Create NodeRings SVG Component

**Files:**
- Create: `src/components/constellation/NodeRings.tsx`

**Step 1: Create the NodeRings component**

```tsx
import { cn } from '@/lib/utils'
import type { ModuleStatus } from '@/types/portfolio'

interface NodeRingsProps {
  status: ModuleStatus
  progress: number // 0-1
  isRecommended: boolean
  className?: string
}

export function NodeRings({ status, progress, isRecommended, className }: NodeRingsProps) {
  // Calculate stroke-dasharray for progress arc
  // Circumference of middle ring (r=16): 2 * PI * 16 ≈ 100.53
  const circumference = 2 * Math.PI * 16
  const dashArray = `${progress * circumference} ${circumference}`

  const isActive = status !== 'not-started'
  const isCompleted = status === 'completed'

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('w-12 h-12', className)}
      aria-hidden="true"
    >
      {/* Outer ring - always visible */}
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        strokeWidth="2"
        className={cn(
          'transition-colors duration-150',
          isActive || isRecommended ? 'stroke-cyan-400' : 'stroke-gray-600'
        )}
      />

      {/* Middle ring - progress arc */}
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeDasharray={dashArray}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        className={cn(
          'transition-opacity duration-150',
          progress > 0 ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Inner circle - core state */}
      <circle
        cx="24"
        cy="24"
        r="8"
        strokeWidth="1.5"
        className={cn(
          'transition-all duration-150',
          isCompleted
            ? 'fill-cyan-400 stroke-cyan-400'
            : isActive
              ? 'fill-cyan-400/20 stroke-cyan-400'
              : 'fill-transparent stroke-gray-600'
        )}
      />
    </svg>
  )
}
```

**Step 2: Verify types compile**

```bash
pnpm build
```

Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/constellation/NodeRings.tsx
git commit -m "feat(constellation): add NodeRings SVG component"
```

---

## Task 3: Add Ring Pulse Animation to CSS

**Files:**
- Modify: `src/index.css`

**Step 1: Add ring-pulse keyframes**

Add after the existing `pulse-subtle` animation (around line 73):

```css
/* Ring pulse animation for recommended modules */
@keyframes ring-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.6));
  }
}

.animate-ring-pulse {
  animation: ring-pulse 2s ease-in-out infinite;
}
```

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "style: add ring-pulse animation for recommended modules"
```

---

## Task 4: Update ModuleNode to Use NodeRings

**Files:**
- Modify: `src/components/constellation/ModuleNode.tsx`

**Step 1: Replace the status indicator with NodeRings**

```tsx
import { cn } from '@/lib/utils'
import type { ModuleConfig } from '@/config/modules'
import type { ModuleStatus } from '@/types/portfolio'
import { NodeRings } from './NodeRings'

interface ModuleNodeProps {
  module: ModuleConfig
  status: ModuleStatus
  progress: number // 0-1
  isRecommended: boolean
  onClick: () => void
}

export function ModuleNode({
  module,
  status,
  progress,
  isRecommended,
  onClick,
}: ModuleNodeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-3 p-4 rounded-lg transition-all duration-150',
        'hover:scale-108 active:scale-98',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]'
      )}
    >
      {/* Layered rings */}
      <NodeRings
        status={status}
        progress={progress}
        isRecommended={isRecommended}
        className={cn(
          'transition-all duration-150',
          'group-hover:[&_circle]:stroke-[3px]',
          'group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]',
          isRecommended && status === 'not-started' && 'animate-ring-pulse'
        )}
      />

      {/* Domain label */}
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {module.domain}
      </span>

      {/* Module title */}
      <span
        className={cn(
          'text-sm font-medium transition-colors duration-150 max-w-[120px] text-center',
          status === 'completed' ? 'text-cyan-400' : 'text-white',
          'group-hover:text-cyan-300'
        )}
      >
        {module.title}
      </span>
    </button>
  )
}
```

**Step 2: Verify types compile**

```bash
pnpm build
```

Expected: Error - Constellation.tsx needs to pass `progress` prop.

**Step 3: Commit (WIP - will fix in next task)**

```bash
git add src/components/constellation/ModuleNode.tsx
git commit -m "feat(constellation): update ModuleNode to use NodeRings"
```

---

## Task 5: Update Constellation to Pass Progress

**Files:**
- Modify: `src/components/constellation/Constellation.tsx`

**Step 1: Pass progress prop to ModuleNode**

Update the map function to include progress:

```tsx
{MODULES
  .sort((a, b) => b.order - a.order)
  .map((module) => {
    const moduleProgress = getModuleProgress(module.id)
    return (
      <ModuleNode
        key={module.id}
        module={module}
        status={moduleProgress.status}
        progress={moduleProgress.progress ?? (moduleProgress.status === 'completed' ? 1 : 0)}
        isRecommended={module.id === recommendedId}
        onClick={() => onSelectModule(module.id)}
      />
    )
  })}
```

**Step 2: Verify build passes**

```bash
pnpm build
```

Expected: Success, no errors.

**Step 3: Verify visually**

```bash
pnpm dev
```

Open http://localhost:5173, click "Enter", verify:
- Nodes show three concentric rings
- Not-started nodes have gray rings
- Recommended module has pulsing glow
- Hover increases ring stroke width

**Step 4: Commit**

```bash
git add src/components/constellation/Constellation.tsx
git commit -m "feat(constellation): pass progress to ModuleNode"
```

---

## Task 6: Add GSAP Progress Arc Animation

**Files:**
- Modify: `src/components/constellation/NodeRings.tsx`

**Step 1: Add GSAP animation for progress changes**

```tsx
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import type { ModuleStatus } from '@/types/portfolio'

interface NodeRingsProps {
  status: ModuleStatus
  progress: number // 0-1
  isRecommended: boolean
  className?: string
}

export function NodeRings({ status, progress, isRecommended, className }: NodeRingsProps) {
  const progressRef = useRef<SVGCircleElement>(null)
  const circumference = 2 * Math.PI * 16

  // Animate progress arc when progress changes
  useEffect(() => {
    if (!progressRef.current) return

    gsap.to(progressRef.current, {
      strokeDasharray: `${progress * circumference} ${circumference}`,
      duration: 0.6,
      ease: 'power2.out',
    })
  }, [progress, circumference])

  const isActive = status !== 'not-started'
  const isCompleted = status === 'completed'

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('w-12 h-12', className)}
      aria-hidden="true"
    >
      {/* Outer ring - always visible */}
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        strokeWidth="2"
        className={cn(
          'transition-colors duration-150',
          isActive || isRecommended ? 'stroke-cyan-400' : 'stroke-gray-600'
        )}
      />

      {/* Middle ring - progress arc */}
      <circle
        ref={progressRef}
        cx="24"
        cy="24"
        r="16"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeDasharray={`${progress * circumference} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        className={cn(
          'transition-opacity duration-150',
          progress > 0 ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Inner circle - core state */}
      <circle
        cx="24"
        cy="24"
        r="8"
        strokeWidth="1.5"
        className={cn(
          'transition-all duration-150',
          isCompleted
            ? 'fill-cyan-400 stroke-cyan-400'
            : isActive
              ? 'fill-cyan-400/20 stroke-cyan-400'
              : 'fill-transparent stroke-gray-600'
        )}
      />
    </svg>
  )
}
```

**Step 2: Verify build**

```bash
pnpm build
```

**Step 3: Commit**

```bash
git add src/components/constellation/NodeRings.tsx
git commit -m "feat(constellation): add GSAP animation for progress arc"
```

---

## Task 7: Update Module to Track Progress

**Files:**
- Modify: `src/components/Module.tsx`

**Step 1: Add progress tracking**

Find where stages transition and update progress. The stages are:
- observe (0%)
- amplitude: explore → match → reflect (10-30%)
- frequency: explore → match → reflect (40-60%)
- challenge: diagnose → match (70-90%)
- reveal (100%)

Add a `useEffect` that updates portfolio progress when stage changes:

```tsx
// Near the top of the Module component, after existing hooks
const { updateModuleProgress } = usePortfolio()

// Add this useEffect to track progress
useEffect(() => {
  const progressMap: Record<string, number> = {
    observe: 0.05,
    amplitude: 0.25,
    frequency: 0.5,
    challenge: 0.75,
    reveal: 1,
  }

  const progress = progressMap[stage] ?? 0
  updateModuleProgress('sinusoidal-waves', {
    status: stage === 'reveal' ? 'completed' : 'in-progress',
    progress,
    currentStage: stage,
  })
}, [stage, updateModuleProgress])
```

**Step 2: Import usePortfolio**

Add to imports:
```tsx
import { usePortfolio } from '@/context/PortfolioContext'
```

**Step 3: Verify build and test**

```bash
pnpm build && pnpm dev
```

Navigate through the module, return to constellation, verify:
- Ring shows partial fill based on how far you got
- Progress persists after leaving and returning

**Step 4: Commit**

```bash
git add src/components/Module.tsx
git commit -m "feat(module): track progress percentage in portfolio state"
```

---

## Task 8: Export NodeRings from Index

**Files:**
- Modify: `src/components/constellation/index.ts` (create if doesn't exist)

**Step 1: Create or update barrel export**

```tsx
export { Constellation } from './Constellation'
export { ModuleNode } from './ModuleNode'
export { NodeRings } from './NodeRings'
export { ConnectionLines } from './ConnectionLines'
```

**Step 2: Commit**

```bash
git add src/components/constellation/index.ts
git commit -m "chore(constellation): add barrel exports"
```

---

## Task 9: Final Verification

**Step 1: Run lint**

```bash
pnpm lint
```

Fix any issues that arise.

**Step 2: Run build**

```bash
pnpm build
```

**Step 3: Visual verification checklist**

```bash
pnpm dev
```

Open http://localhost:5173 and verify:

- [ ] Not-started nodes show gray outer ring, no middle ring, empty inner circle
- [ ] Recommended module pulses with cyan glow
- [ ] Hovering scales node to 1.08x and thickens ring strokes
- [ ] Clicking a module and progressing shows partial arc fill
- [ ] Returning to constellation shows saved progress in ring
- [ ] Completed module shows all three rings in solid cyan
- [ ] Title turns cyan when completed
- [ ] Keyboard navigation shows focus ring
- [ ] No layout shift during state changes

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: address lint and visual issues"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add progress to types | `portfolio.ts` |
| 2 | Create NodeRings SVG | `NodeRings.tsx` (new) |
| 3 | Add ring-pulse CSS | `index.css` |
| 4 | Update ModuleNode | `ModuleNode.tsx` |
| 5 | Pass progress in Constellation | `Constellation.tsx` |
| 6 | Add GSAP animation | `NodeRings.tsx` |
| 7 | Track progress in Module | `Module.tsx` |
| 8 | Barrel exports | `index.ts` |
| 9 | Final verification | - |
