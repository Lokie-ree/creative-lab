# Constellation Architecture - Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the core architecture for the constellation hub navigation system.

**Architecture:** Three-view routing (hero → constellation → module) with state persistence via local storage and a module registry pattern for scalability.

**Tech Stack:** React 19, TypeScript, React Router concepts (in-app routing), Local Storage API, GSAP for transitions

---

## Task 1: Create Module Registry

**Files:**
- Create: `src/config/modules.ts`

**Step 1: Create the modules config file**

```typescript
// src/config/modules.ts

export interface ModuleConfig {
  id: string
  title: string
  domain: string
  description: string
  order: number
  component: () => Promise<{ default: React.ComponentType<ModuleProps> }>
}

export interface ModuleProps {
  onComplete: (values: { amplitude: number; frequency: number }) => void
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'sinusoidal-waves',
    title: 'Sinusoidal Waves',
    domain: 'Trigonometry',
    description: 'Where does the wave come from?',
    order: 1,
    component: () => import('@/components/Module'),
  },
  {
    id: 'vector-transformations',
    title: 'Vector Transformations',
    domain: 'Linear Algebra',
    description: 'What does a matrix do to space?',
    order: 2,
    component: () => import('@/components/modules/vector-transforms/Module'),
  },
  {
    id: 'phase-portraits',
    title: 'Phase Portraits',
    domain: 'Differential Equations',
    description: 'How do systems evolve over time?',
    order: 3,
    component: () => import('@/components/modules/phase-portraits/Module'),
  },
]

export function getModuleById(id: string): ModuleConfig | undefined {
  return MODULES.find(m => m.id === id)
}
```

**Step 2: Verify the file compiles**

Run: `pnpm build`
Expected: Build succeeds (no type errors)

**Step 3: Commit**

```bash
git add src/config/modules.ts
git commit -m "feat: add module registry config"
```

---

## Task 2: Create Portfolio State Types and Hook

**Files:**
- Create: `src/hooks/usePortfolioState.ts`
- Create: `src/types/portfolio.ts`

**Step 1: Create portfolio types**

```typescript
// src/types/portfolio.ts

export type ModuleStatus = 'not-started' | 'in-progress' | 'completed'

export interface ModuleProgress {
  status: ModuleStatus
  currentStage?: string
  currentSubStage?: string
  discoveries?: {
    amplitude?: number | null
    frequency?: number | null
  }
  completedAt?: string
}

export interface PortfolioState {
  modules: Record<string, ModuleProgress>
  lastActiveModule?: string
}

export const INITIAL_PORTFOLIO_STATE: PortfolioState = {
  modules: {},
}
```

**Step 2: Create the usePortfolioState hook**

```typescript
// src/hooks/usePortfolioState.ts

import { useState, useEffect, useCallback } from 'react'
import type { PortfolioState, ModuleProgress, ModuleStatus } from '@/types/portfolio'
import { INITIAL_PORTFOLIO_STATE } from '@/types/portfolio'

const STORAGE_KEY = 'portfolio-state'

function loadState(): PortfolioState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load portfolio state:', e)
  }
  return INITIAL_PORTFOLIO_STATE
}

function saveState(state: PortfolioState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save portfolio state:', e)
  }
}

export function usePortfolioState() {
  const [state, setState] = useState<PortfolioState>(loadState)

  // Persist to localStorage when state changes
  useEffect(() => {
    saveState(state)
  }, [state])

  const getModuleProgress = useCallback((moduleId: string): ModuleProgress => {
    return state.modules[moduleId] || { status: 'not-started' }
  }, [state.modules])

  const updateModuleProgress = useCallback((
    moduleId: string,
    progress: Partial<ModuleProgress>
  ) => {
    setState(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleId]: {
          ...prev.modules[moduleId],
          ...progress,
        },
      },
      lastActiveModule: moduleId,
    }))
  }, [])

  const setModuleStatus = useCallback((moduleId: string, status: ModuleStatus) => {
    updateModuleProgress(moduleId, {
      status,
      ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
    })
  }, [updateModuleProgress])

  const clearProgress = useCallback(() => {
    setState(INITIAL_PORTFOLIO_STATE)
  }, [])

  return {
    state,
    getModuleProgress,
    updateModuleProgress,
    setModuleStatus,
    clearProgress,
  }
}
```

**Step 3: Verify types compile**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/types/portfolio.ts src/hooks/usePortfolioState.ts
git commit -m "feat: add portfolio state management with localStorage persistence"
```

---

## Task 3: Create Portfolio Context

**Files:**
- Create: `src/context/PortfolioContext.tsx`

**Step 1: Create context provider**

```typescript
// src/context/PortfolioContext.tsx

import { createContext, useContext, type ReactNode } from 'react'
import { usePortfolioState } from '@/hooks/usePortfolioState'

type PortfolioContextValue = ReturnType<typeof usePortfolioState>

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const portfolioState = usePortfolioState()

  return (
    <PortfolioContext.Provider value={portfolioState}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio(): PortfolioContextValue {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
```

**Step 2: Verify compiles**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/context/PortfolioContext.tsx
git commit -m "feat: add PortfolioContext for global state access"
```

---

## Task 4: Create Constellation Component Structure

**Files:**
- Create: `src/components/constellation/index.ts`
- Create: `src/components/constellation/Constellation.tsx`
- Create: `src/components/constellation/ModuleNode.tsx`
- Create: `src/components/constellation/ConnectionLines.tsx`

**Step 1: Create barrel export**

```typescript
// src/components/constellation/index.ts

export { Constellation } from './Constellation'
export { ModuleNode } from './ModuleNode'
export { ConnectionLines } from './ConnectionLines'
```

**Step 2: Create ModuleNode component**

```typescript
// src/components/constellation/ModuleNode.tsx

import { cn } from '@/lib/utils'
import type { ModuleConfig } from '@/config/modules'
import type { ModuleStatus } from '@/types/portfolio'

interface ModuleNodeProps {
  module: ModuleConfig
  status: ModuleStatus
  isRecommended: boolean
  onClick: () => void
}

export function ModuleNode({ module, status, isRecommended, onClick }: ModuleNodeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2 p-4 rounded-lg transition-all',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
        isRecommended && 'animate-pulse-subtle'
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 transition-colors',
          status === 'completed' && 'bg-cyan-400 border-cyan-400',
          status === 'in-progress' && 'border-amber-400 bg-amber-400/30',
          status === 'not-started' && 'border-gray-500 bg-transparent',
          isRecommended && status === 'not-started' && 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
        )}
      />

      {/* Domain label */}
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {module.domain}
      </span>

      {/* Module title */}
      <span className={cn(
        'text-sm font-medium transition-colors',
        status === 'completed' ? 'text-cyan-400' : 'text-white',
        'group-hover:text-cyan-300'
      )}>
        {module.title}
      </span>
    </button>
  )
}
```

**Step 3: Create ConnectionLines component**

```typescript
// src/components/constellation/ConnectionLines.tsx

interface ConnectionLinesProps {
  nodeCount: number
}

export function ConnectionLines({ nodeCount }: ConnectionLinesProps) {
  if (nodeCount < 2) return null

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      {/* Vertical connecting lines between nodes */}
      <line
        x1="50%"
        y1="25%"
        x2="50%"
        y2="75%"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    </svg>
  )
}
```

**Step 4: Create Constellation component**

```typescript
// src/components/constellation/Constellation.tsx

import { MODULES } from '@/config/modules'
import { usePortfolio } from '@/context/PortfolioContext'
import { ModuleNode } from './ModuleNode'
import { ConnectionLines } from './ConnectionLines'

interface ConstellationProps {
  onSelectModule: (moduleId: string) => void
}

function getRecommendedModule(
  modules: typeof MODULES,
  getProgress: (id: string) => { status: string }
): string | null {
  const sorted = [...modules].sort((a, b) => a.order - b.order)

  // Prioritize in-progress
  for (const m of sorted) {
    if (getProgress(m.id).status === 'in-progress') return m.id
  }

  // Next incomplete
  for (const m of sorted) {
    if (getProgress(m.id).status !== 'completed') return m.id
  }

  return null
}

export function Constellation({ onSelectModule }: ConstellationProps) {
  const { getModuleProgress } = usePortfolio()
  const recommendedId = getRecommendedModule(MODULES, getModuleProgress)

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-light text-white mb-2">
          Interactive Math Experiences
        </h1>
        <p className="text-gray-400 text-sm">
          Choose a module to explore
        </p>
      </div>

      {/* Constellation */}
      <div className="relative flex flex-col items-center gap-8">
        <ConnectionLines nodeCount={MODULES.length} />

        {MODULES
          .sort((a, b) => b.order - a.order) // Display top to bottom (higher order = top)
          .map((module) => {
            const progress = getModuleProgress(module.id)
            return (
              <ModuleNode
                key={module.id}
                module={module}
                status={progress.status}
                isRecommended={module.id === recommendedId}
                onClick={() => onSelectModule(module.id)}
              />
            )
          })}
      </div>
    </div>
  )
}
```

**Step 5: Verify compiles**

Run: `pnpm build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/constellation/
git commit -m "feat: add Constellation hub components"
```

---

## Task 5: Update App.tsx for Three-View Routing

**Files:**
- Modify: `src/App.tsx`

**Step 1: Read current App.tsx**

Understand current structure before modifying.

**Step 2: Update App.tsx with three-view routing**

Update to include:
- `view` state: 'hero' | 'constellation' | 'module'
- `activeModuleId` state for tracking selected module
- Wrap with PortfolioProvider
- Add Constellation view between Hero and Module
- Update Hero CTA to go to constellation
- Add transitions between views

**Step 3: Verify app runs**

Run: `pnpm dev`
Expected: App loads, can navigate hero → constellation → module

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: implement three-view routing with constellation hub"
```

---

## Task 6: Add Navigation Header

**Files:**
- Create: `src/components/layout/Navigation.tsx`
- Modify: `src/components/layout/index.ts`

**Step 1: Create Navigation component**

```typescript
// src/components/layout/Navigation.tsx

import { cn } from '@/lib/utils'

interface NavigationProps {
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

export function Navigation({ showBackButton, onBack, className }: NavigationProps) {
  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 p-4',
      'bg-gradient-to-b from-black/50 to-transparent',
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {showBackButton && onBack ? (
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to modules</span>
          </button>
        ) : (
          <div /> // Spacer
        )}

        {/* Logo/name - links to hero */}
        <span className="text-gray-500 text-sm font-light tracking-wider">
          CREATIVE LAB
        </span>
      </div>
    </nav>
  )
}
```

**Step 2: Update barrel export**

```typescript
// src/components/layout/index.ts

export { EscapeHatch } from './EscapeHatch'
export { Navigation } from './Navigation'
```

**Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Navigation header component"
```

---

## Task 7: Wire Up Complete Flow

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/celebration/CelebrationModal.tsx`

**Step 1: Update CelebrationModal with new actions**

Add "Next Module" button that navigates to constellation.

**Step 2: Update App.tsx to pass navigation callbacks**

Wire up:
- Hero → Constellation transition
- Constellation → Module transition
- Module completion → back to Constellation
- Navigation back button

**Step 3: Test complete flow**

Run: `pnpm dev`
Test: Hero → Explore → Select module → Complete → Back to constellation

**Step 4: Commit**

```bash
git add src/App.tsx src/components/celebration/CelebrationModal.tsx
git commit -m "feat: wire up complete navigation flow"
```

---

## Task 8: Add Pulse Animation for Recommended Module

**Files:**
- Modify: `src/index.css`

**Step 1: Add subtle pulse animation**

```css
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
```

**Step 2: Verify animation works**

Run: `pnpm dev`
Expected: Recommended module node has subtle pulse

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add subtle pulse animation for recommended module"
```

---

## Task 9: Final Verification and Cleanup

**Step 1: Run full lint check**

Run: `pnpm lint`
Expected: No errors

**Step 2: Run full build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Manual testing checklist**

- [ ] Hero loads correctly
- [ ] "Explore" navigates to constellation
- [ ] Constellation shows all 3 modules
- [ ] First module (Trig) has recommended glow
- [ ] Clicking module opens it
- [ ] Completing module shows celebration
- [ ] "Next Module" returns to constellation
- [ ] Module marked as complete in constellation
- [ ] Progress persists after page refresh
- [ ] "Back to modules" from module works

**Step 4: Squash and final commit**

If all tests pass, create final commit summarizing Phase 1.

---

## Summary

This plan covers Phase 1: Core Architecture with 9 tasks:

1. Module Registry
2. Portfolio State Hook
3. Portfolio Context
4. Constellation Components
5. Three-View Routing
6. Navigation Header
7. Complete Flow Wiring
8. Pulse Animation
9. Final Verification

Each task is self-contained and can be committed independently. The implementation builds incrementally - each task depends on previous tasks being complete.
