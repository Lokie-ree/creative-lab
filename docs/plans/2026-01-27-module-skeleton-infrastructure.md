# Module Skeleton Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create reusable skeleton infrastructure (hooks, types, utilities) that modules can adopt incrementally, implementing the patterns defined in `docs/plans/2026-01-22-module-skeleton.md`.

**Architecture:** Extract the common flow logic (Idle → Explore → Challenge → Success → Reveal) into composable hooks. Modules provide configuration; skeleton handles orchestration. Existing modules (sinewaves, vector-transforms) remain functional and can migrate incrementally.

**Tech Stack:** React hooks, TypeScript, GSAP for animations, React Three Fiber context for WebGL recovery

---

## Phase 1: Core Types and Interfaces

### Task 1: Create skeleton types

**Files:**
- Create: `src/lib/skeleton/types.ts`

**Step 1: Create the types file with core interfaces**

```typescript
/**
 * Module Skeleton Types
 *
 * Defines the shared interfaces for module configuration and state management.
 * See docs/plans/2026-01-22-module-skeleton.md for full specification.
 */

// =============================================================================
// INTERACTION MODES
// =============================================================================

export type InteractionMode =
  | 'slider'           // Parameter controls (sinewaves amplitude/frequency)
  | 'direct-manipulate' // Drag elements in scene (points on a line)
  | 'discrete-select'   // Click/tap choices
  | 'hybrid'           // Combination

// =============================================================================
// FLOW PHASES
// =============================================================================

export type FlowPhase =
  | 'idle'
  | 'explore'
  | 'challenge'
  | 'success'
  | 'reveal'

export type ExploreSubPhase = 'active' | 'unlocking'
export type ChallengeSubPhase = 'targeting' | 'matching' | 'hint' | 'assist'
export type SuccessSubPhase = 'hold' | 'pulse' | 'comprehension'

// =============================================================================
// STAGE CONFIGURATION
// =============================================================================

export interface SliderConfig {
  min: number
  max: number
  step: number
  defaultValue: number
}

export interface DragConfig {
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  snapToGrid?: number
  constraintFn?: (point: { x: number; y: number }) => { x: number; y: number }
}

export interface SelectConfig {
  options: Array<{ label: string; value: string | number }>
}

export interface StageUnlockConfig {
  minimumEngagementSeconds: number  // Default: 5
  intensityThreshold: number        // Default: 0.7
  rangeExplorationThreshold: number // Default: 0.6
  timeFallbackSeconds: number       // Default: 45
}

export interface ExploreStage {
  id: string
  parameter: string
  interactionMode: InteractionMode
  controlConfig: SliderConfig | DragConfig | SelectConfig
  unlockConditions?: Partial<StageUnlockConfig>
}

// =============================================================================
// CHALLENGE CONFIGURATION
// =============================================================================

export interface TargetConstraints {
  minimumDistance: number           // Default: 0.3
  maximumDistance: number           // Default: 0.95
  difficultyProgression: 'fixed' | 'increasing' | 'adaptive'
}

export interface ChallengeConfig<TParams, TTarget> {
  generateTarget: () => TTarget
  matchThreshold: number
  proximityFn: (current: TParams, target: TTarget) => number
  parameterProximity?: (current: TParams, target: TTarget) => Record<string, number>
  targetConstraints: TargetConstraints
  fallbackTarget?: TTarget
}

// =============================================================================
// FEEDBACK CONFIGURATION
// =============================================================================

export interface NotationConfig {
  maxWidth: 'auto' | number
  overflow: 'truncate' | 'wrap' | 'scale'
  minFontSize: number
  precision: number
  format: 'decimal' | 'fraction' | 'mixed'
}

export interface FeedbackConfig<TParams> {
  intensityFn: (params: TParams, mode: 'explore' | 'challenge', target?: unknown) => number
  notation: (params: TParams) => string
  notationConfig?: NotationConfig
}

// =============================================================================
// IDLE/HINT CONFIGURATION
// =============================================================================

export interface IdleConfig {
  hintDelay: number
  hintType: 'pulse' | 'nudge'
}

// =============================================================================
// MODULE CONFIGURATION
// =============================================================================

export interface ModuleConfig<TParams, TTarget> {
  id: string
  stages: ExploreStage[]
  challenge: ChallengeConfig<TParams, TTarget>
  feedback: FeedbackConfig<TParams>
  idle: IdleConfig
  stageUnlock: StageUnlockConfig
}

// =============================================================================
// MODULE STATE
// =============================================================================

export interface ModuleState<TParams> {
  phase: FlowPhase
  currentStageIndex: number
  params: TParams
  discoveries: Partial<TParams>

  // Timing
  phaseStartTime: number
  lastInteractionTime: number
  engagementTime: number

  // Challenge state
  currentTarget: unknown | null
  challengeAttempts: number
  hintsShown: number

  // Success state
  matchAccuracy: number
  challengeStreak: number
}

// =============================================================================
// ANALYTICS EVENTS
// =============================================================================

export interface SessionStartEvent {
  moduleId: string
  timestamp: number
}

export interface SessionEndEvent {
  moduleId: string
  duration: number
  completedChallenges: number
  exitReason: 'completed' | 'abandoned' | 'timeout'
}

export interface StageUnlockEvent {
  stage: string
  unlockTrigger: 'intensity' | 'range' | 'time'
  engagementTime: number
}

export interface ChallengeEndEvent {
  success: boolean
  duration: number
  hintCount: number
  exitType: 'match' | 'skip' | 'assist' | 'newChallenge'
  finalProximity: number
}

export interface ModuleAnalytics {
  sessionStart: SessionStartEvent
  sessionEnd: SessionEndEvent
  stageUnlock: StageUnlockEvent
  challengeEnd: ChallengeEndEvent
}

// =============================================================================
// ERROR RECOVERY
// =============================================================================

export interface ErrorRecoveryConfig {
  onContextLost: 'pause' | 'reload'
  contextLostMessage: string
}

export interface PerformanceConfig {
  targetFPS: number
  degradationThreshold: number
  degradationStrategy: 'reduceDetail' | 'reduceAnimations' | 'both'
}
```

**Step 2: Create barrel export**

```typescript
// src/lib/skeleton/index.ts
export * from './types'
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm build`
Expected: Build succeeds with no type errors

**Step 4: Commit**

```bash
git add src/lib/skeleton/types.ts src/lib/skeleton/index.ts
git commit -m "feat(skeleton): add core types and interfaces

Define TypeScript interfaces for module configuration, flow phases,
stage unlock conditions, challenge settings, and analytics events.

Implements types from docs/plans/2026-01-22-module-skeleton.md"
```

---

## Phase 2: Core Flow Hook

### Task 2: Create useModuleFlow hook

**Files:**
- Create: `src/lib/skeleton/useModuleFlow.ts`
- Modify: `src/lib/skeleton/index.ts`

**Step 1: Write test for phase transitions**

```typescript
// src/lib/skeleton/__tests__/useModuleFlow.test.ts
import { renderHook, act } from '@testing-library/react'
import { useModuleFlow } from '../useModuleFlow'
import type { ModuleConfig } from '../types'

const mockConfig: ModuleConfig<{ amplitude: number }, { a: number }> = {
  id: 'test-module',
  stages: [
    {
      id: 'amplitude',
      parameter: 'amplitude',
      interactionMode: 'slider',
      controlConfig: { min: 0, max: 2, step: 0.1, defaultValue: 1 },
    },
  ],
  challenge: {
    generateTarget: () => ({ a: 1.5 }),
    matchThreshold: 0.95,
    proximityFn: (current, target) => 1 - Math.abs(current.amplitude - target.a),
    targetConstraints: { minimumDistance: 0.3, maximumDistance: 0.95, difficultyProgression: 'fixed' },
  },
  feedback: {
    intensityFn: () => 0.5,
    notation: (params) => `A = ${params.amplitude}`,
  },
  idle: { hintDelay: 15, hintType: 'pulse' },
  stageUnlock: {
    minimumEngagementSeconds: 5,
    intensityThreshold: 0.7,
    rangeExplorationThreshold: 0.6,
    timeFallbackSeconds: 45,
  },
}

describe('useModuleFlow', () => {
  it('starts in idle phase', () => {
    const { result } = renderHook(() => useModuleFlow(mockConfig, { amplitude: 1 }))
    expect(result.current.state.phase).toBe('idle')
  })

  it('transitions from idle to explore on first interaction', () => {
    const { result } = renderHook(() => useModuleFlow(mockConfig, { amplitude: 1 }))

    act(() => {
      result.current.recordInteraction()
    })

    expect(result.current.state.phase).toBe('explore')
  })

  it('tracks engagement time during explore', async () => {
    const { result } = renderHook(() => useModuleFlow(mockConfig, { amplitude: 1 }))

    act(() => {
      result.current.recordInteraction()
    })

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100))

    act(() => {
      result.current.recordInteraction()
    })

    expect(result.current.state.engagementTime).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/skeleton/__tests__/useModuleFlow.test.ts`
Expected: FAIL with "Cannot find module '../useModuleFlow'"

**Step 3: Write minimal implementation**

```typescript
// src/lib/skeleton/useModuleFlow.ts
import { useState, useCallback, useRef, useEffect } from 'react'
import type { ModuleConfig, ModuleState, FlowPhase } from './types'

interface UseModuleFlowReturn<TParams> {
  state: ModuleState<TParams>

  // Actions
  recordInteraction: () => void
  advanceStage: () => void
  enterChallenge: () => void
  recordMatch: (accuracy: number) => void
  exitToReveal: () => void
  reset: () => void

  // Computed
  currentStage: ModuleConfig<TParams, unknown>['stages'][number] | null
  isLastExploreStage: boolean
  canUnlockStage: boolean
}

function createInitialState<TParams>(params: TParams): ModuleState<TParams> {
  return {
    phase: 'idle',
    currentStageIndex: 0,
    params,
    discoveries: {},
    phaseStartTime: Date.now(),
    lastInteractionTime: 0,
    engagementTime: 0,
    currentTarget: null,
    challengeAttempts: 0,
    hintsShown: 0,
    matchAccuracy: 0,
    challengeStreak: 0,
  }
}

export function useModuleFlow<TParams, TTarget>(
  config: ModuleConfig<TParams, TTarget>,
  initialParams: TParams
): UseModuleFlowReturn<TParams> {
  const [state, setState] = useState<ModuleState<TParams>>(() =>
    createInitialState(initialParams)
  )

  const engagementStartRef = useRef<number | null>(null)

  // Track engagement time while in explore phase
  useEffect(() => {
    if (state.phase === 'explore' && engagementStartRef.current === null) {
      engagementStartRef.current = Date.now()
    }
    if (state.phase !== 'explore') {
      engagementStartRef.current = null
    }
  }, [state.phase])

  const recordInteraction = useCallback(() => {
    const now = Date.now()

    setState(prev => {
      // Transition from idle to explore on first interaction
      if (prev.phase === 'idle') {
        return {
          ...prev,
          phase: 'explore' as FlowPhase,
          phaseStartTime: now,
          lastInteractionTime: now,
        }
      }

      // Update engagement time during explore
      const engagementTime = engagementStartRef.current
        ? now - engagementStartRef.current
        : prev.engagementTime

      return {
        ...prev,
        lastInteractionTime: now,
        engagementTime,
      }
    })
  }, [])

  const advanceStage = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentStageIndex + 1
      const isLastStage = nextIndex >= config.stages.length

      if (isLastStage) {
        // Move to challenge
        return {
          ...prev,
          phase: 'challenge' as FlowPhase,
          currentTarget: config.challenge.generateTarget(),
          phaseStartTime: Date.now(),
          engagementTime: 0,
        }
      }

      return {
        ...prev,
        currentStageIndex: nextIndex,
        phaseStartTime: Date.now(),
        engagementTime: 0,
      }
    })
  }, [config])

  const enterChallenge = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'challenge' as FlowPhase,
      currentTarget: config.challenge.generateTarget(),
      phaseStartTime: Date.now(),
      challengeAttempts: prev.challengeAttempts + 1,
    }))
  }, [config])

  const recordMatch = useCallback((accuracy: number) => {
    setState(prev => ({
      ...prev,
      phase: 'success' as FlowPhase,
      matchAccuracy: accuracy,
      challengeStreak: prev.challengeStreak + 1,
      phaseStartTime: Date.now(),
    }))
  }, [])

  const exitToReveal = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'reveal' as FlowPhase,
      phaseStartTime: Date.now(),
    }))
  }, [])

  const reset = useCallback(() => {
    setState(createInitialState(initialParams))
  }, [initialParams])

  // Computed values
  const currentStage = config.stages[state.currentStageIndex] ?? null
  const isLastExploreStage = state.currentStageIndex >= config.stages.length - 1

  const canUnlockStage = state.engagementTime / 1000 >= config.stageUnlock.minimumEngagementSeconds

  return {
    state,
    recordInteraction,
    advanceStage,
    enterChallenge,
    recordMatch,
    exitToReveal,
    reset,
    currentStage,
    isLastExploreStage,
    canUnlockStage,
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/skeleton/__tests__/useModuleFlow.test.ts`
Expected: All 3 tests PASS

**Step 5: Update barrel export**

```typescript
// src/lib/skeleton/index.ts
export * from './types'
export * from './useModuleFlow'
```

**Step 6: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/lib/skeleton/useModuleFlow.ts src/lib/skeleton/__tests__/useModuleFlow.test.ts src/lib/skeleton/index.ts
git commit -m "feat(skeleton): add useModuleFlow hook

Core flow orchestration hook that manages:
- Phase transitions (idle → explore → challenge → success → reveal)
- Engagement time tracking
- Stage progression
- Challenge attempts and streak tracking"
```

---

## Phase 3: Stage Unlock Logic

### Task 3: Create useStageUnlock hook

**Files:**
- Create: `src/lib/skeleton/useStageUnlock.ts`
- Create: `src/lib/skeleton/__tests__/useStageUnlock.test.ts`
- Modify: `src/lib/skeleton/index.ts`

**Step 1: Write test for unlock conditions**

```typescript
// src/lib/skeleton/__tests__/useStageUnlock.test.ts
import { renderHook, act } from '@testing-library/react'
import { useStageUnlock } from '../useStageUnlock'
import type { StageUnlockConfig } from '../types'

const defaultConfig: StageUnlockConfig = {
  minimumEngagementSeconds: 1, // Short for testing
  intensityThreshold: 0.7,
  rangeExplorationThreshold: 0.6,
  timeFallbackSeconds: 10,
}

describe('useStageUnlock', () => {
  it('does not unlock before minimum engagement', () => {
    const { result } = renderHook(() => useStageUnlock(defaultConfig))

    act(() => {
      result.current.recordValue(0.5, 0.8) // High intensity but no engagement
    })

    expect(result.current.shouldUnlock).toBe(false)
  })

  it('unlocks when intensity threshold held for 1 second', async () => {
    const { result } = renderHook(() => useStageUnlock(defaultConfig))

    // Simulate engagement
    act(() => {
      result.current.startEngagement()
    })

    // Wait for minimum engagement
    await new Promise(resolve => setTimeout(resolve, 1100))

    // Record high intensity for 1+ second
    act(() => {
      result.current.recordValue(0.5, 0.8) // intensity above 0.7
    })

    await new Promise(resolve => setTimeout(resolve, 1100))

    act(() => {
      result.current.recordValue(0.5, 0.8)
    })

    expect(result.current.shouldUnlock).toBe(true)
    expect(result.current.unlockTrigger).toBe('intensity')
  })

  it('unlocks when range exploration threshold met', async () => {
    const { result } = renderHook(() => useStageUnlock({
      ...defaultConfig,
      rangeExplorationThreshold: 0.5, // 50% of range
    }))

    act(() => {
      result.current.startEngagement()
    })

    await new Promise(resolve => setTimeout(resolve, 1100))

    // Explore values across range (0 to 1, so visit 0.1, 0.3, 0.5, 0.7, 0.9)
    act(() => {
      result.current.recordValue(0.1, 0.3)
      result.current.recordValue(0.3, 0.3)
      result.current.recordValue(0.5, 0.3)
      result.current.recordValue(0.7, 0.3)
      result.current.recordValue(0.9, 0.3)
    })

    expect(result.current.shouldUnlock).toBe(true)
    expect(result.current.unlockTrigger).toBe('range')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/skeleton/__tests__/useStageUnlock.test.ts`
Expected: FAIL with "Cannot find module '../useStageUnlock'"

**Step 3: Write implementation**

```typescript
// src/lib/skeleton/useStageUnlock.ts
import { useState, useCallback, useRef, useEffect } from 'react'
import type { StageUnlockConfig } from './types'

export type UnlockTrigger = 'intensity' | 'range' | 'time' | null

interface UseStageUnlockReturn {
  shouldUnlock: boolean
  unlockTrigger: UnlockTrigger

  // Actions
  startEngagement: () => void
  recordValue: (normalizedValue: number, intensity: number) => void
  reset: () => void

  // Debug info
  engagementSeconds: number
  exploredRangePercent: number
  intensityHoldSeconds: number
}

export function useStageUnlock(config: StageUnlockConfig): UseStageUnlockReturn {
  const [shouldUnlock, setShouldUnlock] = useState(false)
  const [unlockTrigger, setUnlockTrigger] = useState<UnlockTrigger>(null)

  // Tracking refs (to avoid re-renders on every value)
  const engagementStartRef = useRef<number | null>(null)
  const intensityStartRef = useRef<number | null>(null)
  const visitedBucketsRef = useRef<Set<number>>(new Set())
  const lastIntensityRef = useRef<number>(0)

  // State for computed values (for debugging/UI)
  const [engagementSeconds, setEngagementSeconds] = useState(0)
  const [exploredRangePercent, setExploredRangePercent] = useState(0)
  const [intensityHoldSeconds, setIntensityHoldSeconds] = useState(0)

  const startEngagement = useCallback(() => {
    engagementStartRef.current = Date.now()
  }, [])

  const recordValue = useCallback((normalizedValue: number, intensity: number) => {
    const now = Date.now()

    // Check minimum engagement
    const engagementMs = engagementStartRef.current
      ? now - engagementStartRef.current
      : 0
    const engagementSec = engagementMs / 1000
    setEngagementSeconds(engagementSec)

    if (engagementSec < config.minimumEngagementSeconds) {
      return // Too early to unlock
    }

    // Track intensity hold time
    if (intensity >= config.intensityThreshold) {
      if (intensityStartRef.current === null) {
        intensityStartRef.current = now
      }
      const holdMs = now - intensityStartRef.current
      const holdSec = holdMs / 1000
      setIntensityHoldSeconds(holdSec)

      if (holdSec >= 1) {
        setShouldUnlock(true)
        setUnlockTrigger('intensity')
        return
      }
    } else {
      intensityStartRef.current = null
      setIntensityHoldSeconds(0)
    }
    lastIntensityRef.current = intensity

    // Track range exploration (bucket values into 10 buckets)
    const bucket = Math.floor(normalizedValue * 10)
    visitedBucketsRef.current.add(Math.min(bucket, 9))
    const rangePercent = visitedBucketsRef.current.size / 10
    setExploredRangePercent(rangePercent)

    if (rangePercent >= config.rangeExplorationThreshold) {
      setShouldUnlock(true)
      setUnlockTrigger('range')
      return
    }

    // Time-based fallback
    if (engagementSec >= config.timeFallbackSeconds) {
      setShouldUnlock(true)
      setUnlockTrigger('time')
    }
  }, [config])

  const reset = useCallback(() => {
    setShouldUnlock(false)
    setUnlockTrigger(null)
    engagementStartRef.current = null
    intensityStartRef.current = null
    visitedBucketsRef.current.clear()
    setEngagementSeconds(0)
    setExploredRangePercent(0)
    setIntensityHoldSeconds(0)
  }, [])

  return {
    shouldUnlock,
    unlockTrigger,
    startEngagement,
    recordValue,
    reset,
    engagementSeconds,
    exploredRangePercent,
    intensityHoldSeconds,
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/skeleton/__tests__/useStageUnlock.test.ts`
Expected: All tests PASS

**Step 5: Update barrel export**

```typescript
// src/lib/skeleton/index.ts
export * from './types'
export * from './useModuleFlow'
export * from './useStageUnlock'
```

**Step 6: Commit**

```bash
git add src/lib/skeleton/useStageUnlock.ts src/lib/skeleton/__tests__/useStageUnlock.test.ts src/lib/skeleton/index.ts
git commit -m "feat(skeleton): add useStageUnlock hook

Implements stage unlock logic with three triggers:
- Intensity threshold held for 1 second
- Range exploration (percentage of value buckets visited)
- Time-based fallback

All require minimum engagement time before any unlock can trigger."
```

---

## Phase 4: Challenge Failure Path

### Task 4: Create useChallengeAssist hook

**Files:**
- Create: `src/lib/skeleton/useChallengeAssist.ts`
- Create: `src/lib/skeleton/__tests__/useChallengeAssist.test.ts`

**Step 1: Write test for progressive hints**

```typescript
// src/lib/skeleton/__tests__/useChallengeAssist.test.ts
import { renderHook, act } from '@testing-library/react'
import { useChallengeAssist } from '../useChallengeAssist'

describe('useChallengeAssist', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows directional nudge after 60 seconds', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    expect(result.current.showDirectionalNudge).toBe(false)

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.showDirectionalNudge).toBe(true)
  })

  it('shows "try another" option after 90 seconds', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    act(() => {
      vi.advanceTimersByTime(90000)
    })

    expect(result.current.showTryAnother).toBe(true)
  })

  it('shows "show me" option after 120 seconds', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    act(() => {
      vi.advanceTimersByTime(120000)
    })

    expect(result.current.showAssist).toBe(true)
  })

  it('extends timers when user interacts', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    // After 50 seconds, interact
    act(() => {
      vi.advanceTimersByTime(50000)
      result.current.recordInteraction()
    })

    // Nudge should still be hidden (timer reset)
    expect(result.current.showDirectionalNudge).toBe(false)

    // Need another 60 seconds from last interaction
    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.showDirectionalNudge).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/skeleton/__tests__/useChallengeAssist.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/lib/skeleton/useChallengeAssist.ts
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseChallengeAssistReturn {
  // Visibility flags
  showDirectionalNudge: boolean  // ~60s
  showTryAnother: boolean        // ~90s
  showAssist: boolean            // ~120s

  // Actions
  startChallenge: () => void
  recordInteraction: () => void
  onTryAnother: () => void
  onAssist: () => void
  reset: () => void

  // For analytics
  elapsedSeconds: number
  interactionCount: number
}

const NUDGE_DELAY = 60000      // 60 seconds
const TRY_ANOTHER_DELAY = 90000 // 90 seconds
const ASSIST_DELAY = 120000    // 120 seconds

export function useChallengeAssist(): UseChallengeAssistReturn {
  const [showDirectionalNudge, setShowDirectionalNudge] = useState(false)
  const [showTryAnother, setShowTryAnother] = useState(false)
  const [showAssist, setShowAssist] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [interactionCount, setInteractionCount] = useState(0)

  const challengeStartRef = useRef<number | null>(null)
  const lastInteractionRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkTimers = useCallback(() => {
    if (!lastInteractionRef.current) return

    const timeSinceInteraction = Date.now() - lastInteractionRef.current
    const totalTime = challengeStartRef.current
      ? Date.now() - challengeStartRef.current
      : 0

    setElapsedSeconds(Math.floor(totalTime / 1000))

    // Progressive reveals based on time since last interaction
    if (timeSinceInteraction >= NUDGE_DELAY) {
      setShowDirectionalNudge(true)
    }
    if (timeSinceInteraction >= TRY_ANOTHER_DELAY) {
      setShowTryAnother(true)
    }
    if (timeSinceInteraction >= ASSIST_DELAY) {
      setShowAssist(true)
    }
  }, [])

  const startChallenge = useCallback(() => {
    const now = Date.now()
    challengeStartRef.current = now
    lastInteractionRef.current = now
    setShowDirectionalNudge(false)
    setShowTryAnother(false)
    setShowAssist(false)
    setElapsedSeconds(0)
    setInteractionCount(0)

    // Start interval to check timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(checkTimers, 1000)
  }, [checkTimers])

  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now()
    setInteractionCount(c => c + 1)

    // Reset visibility on interaction (user is actively trying)
    setShowDirectionalNudge(false)
    setShowTryAnother(false)
    setShowAssist(false)
  }, [])

  const onTryAnother = useCallback(() => {
    // Called when user chooses to try a different challenge
    // Parent should generate new target and call startChallenge
  }, [])

  const onAssist = useCallback(() => {
    // Called when user chooses "show me"
    // Parent should animate to solution
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    challengeStartRef.current = null
    lastInteractionRef.current = null
    setShowDirectionalNudge(false)
    setShowTryAnother(false)
    setShowAssist(false)
    setElapsedSeconds(0)
    setInteractionCount(0)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    showDirectionalNudge,
    showTryAnother,
    showAssist,
    startChallenge,
    recordInteraction,
    onTryAnother,
    onAssist,
    reset,
    elapsedSeconds,
    interactionCount,
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/skeleton/__tests__/useChallengeAssist.test.ts`
Expected: All tests PASS

**Step 5: Update barrel export and commit**

```bash
git add src/lib/skeleton/useChallengeAssist.ts src/lib/skeleton/__tests__/useChallengeAssist.test.ts src/lib/skeleton/index.ts
git commit -m "feat(skeleton): add useChallengeAssist hook

Implements challenge failure path with progressive assistance:
- Directional nudge at ~60s of no progress
- 'Try another' option at ~90s
- 'Show me' assisted solve at ~120s

Timers reset when user interacts, preventing interruption during
active exploration."
```

---

## Phase 5: Accessibility Infrastructure

### Task 5: Create useAccessibility hook

**Files:**
- Create: `src/lib/skeleton/useAccessibility.ts`

**Step 1: Write the accessibility hook**

```typescript
// src/lib/skeleton/useAccessibility.ts
import { useCallback, useEffect, useRef } from 'react'

interface UseAccessibilityReturn {
  // Announcements
  announce: (message: string, priority?: 'polite' | 'assertive') => void

  // Focus management
  focusElement: (selector: string) => void
  trapFocus: (containerRef: React.RefObject<HTMLElement>) => () => void

  // Preferences
  prefersReducedMotion: boolean
  prefersHighContrast: boolean

  // Keyboard helpers
  handleArrowKeys: (
    onLeft: () => void,
    onRight: () => void,
    onUp?: () => void,
    onDown?: () => void
  ) => (e: KeyboardEvent) => void
}

export function useAccessibility(): UseAccessibilityReturn {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  // Create or get announcer element
  useEffect(() => {
    let announcer = document.getElementById('skeleton-announcer') as HTMLDivElement
    if (!announcer) {
      announcer = document.createElement('div')
      announcer.id = 'skeleton-announcer'
      announcer.setAttribute('role', 'status')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `
      document.body.appendChild(announcer)
    }
    announcerRef.current = announcer

    return () => {
      // Don't remove - might be used by other modules
    }
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return

    announcerRef.current.setAttribute('aria-live', priority)
    // Clear and set to trigger announcement
    announcerRef.current.textContent = ''
    requestAnimationFrame(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message
      }
    })
  }, [])

  const focusElement = useCallback((selector: string) => {
    // Delay to allow React to render
    requestAnimationFrame(() => {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        element.focus()
      }
    })
  }, [])

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current
    if (!container) return () => {}

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Media query preferences
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  const prefersHighContrast = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-contrast: more)').matches
    : false

  const handleArrowKeys = useCallback((
    onLeft: () => void,
    onRight: () => void,
    onUp?: () => void,
    onDown?: () => void
  ) => {
    return (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          onLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          onRight()
          break
        case 'ArrowUp':
          if (onUp) {
            e.preventDefault()
            onUp()
          }
          break
        case 'ArrowDown':
          if (onDown) {
            e.preventDefault()
            onDown()
          }
          break
      }
    }
  }, [])

  return {
    announce,
    focusElement,
    trapFocus,
    prefersReducedMotion,
    prefersHighContrast,
    handleArrowKeys,
  }
}
```

**Step 2: Update barrel export**

**Step 3: Commit**

```bash
git add src/lib/skeleton/useAccessibility.ts src/lib/skeleton/index.ts
git commit -m "feat(skeleton): add useAccessibility hook

Provides accessibility infrastructure:
- ARIA live region announcements
- Focus management and focus trapping
- Media query preferences (reduced motion, high contrast)
- Arrow key handler factory for keyboard navigation"
```

---

## Phase 6: Error Recovery

### Task 6: Create useErrorRecovery hook

**Files:**
- Create: `src/lib/skeleton/useErrorRecovery.ts`

**Step 1: Write the error recovery hook**

```typescript
// src/lib/skeleton/useErrorRecovery.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import type { ErrorRecoveryConfig, PerformanceConfig } from './types'

interface UseErrorRecoveryReturn {
  // WebGL context state
  isContextLost: boolean
  contextLostMessage: string
  attemptRestore: () => void

  // Performance state
  isPerformanceDegraded: boolean
  currentFPS: number
  degradationLevel: 'none' | 'partial' | 'full'

  // Tab visibility
  isTabVisible: boolean
  tabHiddenDuration: number  // milliseconds

  // Actions
  startMonitoring: () => void
  stopMonitoring: () => void
}

const DEFAULT_ERROR_CONFIG: ErrorRecoveryConfig = {
  onContextLost: 'pause',
  contextLostMessage: 'Visualization paused. Tap to resume.',
}

const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  targetFPS: 60,
  degradationThreshold: 30,
  degradationStrategy: 'both',
}

export function useErrorRecovery(
  errorConfig: Partial<ErrorRecoveryConfig> = {},
  performanceConfig: Partial<PerformanceConfig> = {}
): UseErrorRecoveryReturn {
  const config = { ...DEFAULT_ERROR_CONFIG, ...errorConfig }
  const perfConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...performanceConfig }

  // WebGL context state
  const [isContextLost, setIsContextLost] = useState(false)

  // Performance state
  const [isPerformanceDegraded, setIsPerformanceDegraded] = useState(false)
  const [currentFPS, setCurrentFPS] = useState(60)
  const [degradationLevel, setDegradationLevel] = useState<'none' | 'partial' | 'full'>('none')

  // Tab visibility
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [tabHiddenDuration, setTabHiddenDuration] = useState(0)

  // Refs for tracking
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(0)
  const tabHiddenStartRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isMonitoringRef = useRef(false)

  // FPS monitoring
  const measureFPS = useCallback(() => {
    const now = performance.now()

    if (lastFrameTimeRef.current > 0) {
      const delta = now - lastFrameTimeRef.current
      const fps = 1000 / delta

      frameTimesRef.current.push(fps)
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift()
      }

      // Calculate average FPS
      const avgFPS = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
      setCurrentFPS(Math.round(avgFPS))

      // Check degradation
      if (avgFPS < perfConfig.degradationThreshold) {
        setIsPerformanceDegraded(true)
        setDegradationLevel(avgFPS < 15 ? 'full' : 'partial')
      } else if (avgFPS > perfConfig.degradationThreshold + 10) {
        // Hysteresis: need to be 10 FPS above threshold to recover
        setIsPerformanceDegraded(false)
        setDegradationLevel('none')
      }
    }

    lastFrameTimeRef.current = now

    if (isMonitoringRef.current) {
      animationFrameRef.current = requestAnimationFrame(measureFPS)
    }
  }, [perfConfig.degradationThreshold])

  const attemptRestore = useCallback(() => {
    // In R3F, context restore is usually automatic
    // This is a manual trigger for cases where we need to reload
    if (config.onContextLost === 'reload') {
      window.location.reload()
    } else {
      // Try to restore - the actual restore happens in the Canvas component
      setIsContextLost(false)
    }
  }, [config.onContextLost])

  const startMonitoring = useCallback(() => {
    isMonitoringRef.current = true
    animationFrameRef.current = requestAnimationFrame(measureFPS)
  }, [measureFPS])

  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  // Tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false)
        tabHiddenStartRef.current = Date.now()
      } else {
        setIsTabVisible(true)
        if (tabHiddenStartRef.current) {
          const duration = Date.now() - tabHiddenStartRef.current
          setTabHiddenDuration(duration)
          tabHiddenStartRef.current = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    isContextLost,
    contextLostMessage: config.contextLostMessage,
    attemptRestore,
    isPerformanceDegraded,
    currentFPS,
    degradationLevel,
    isTabVisible,
    tabHiddenDuration,
    startMonitoring,
    stopMonitoring,
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/skeleton/useErrorRecovery.ts src/lib/skeleton/index.ts
git commit -m "feat(skeleton): add useErrorRecovery hook

Handles error conditions gracefully:
- WebGL context loss detection and restore attempt
- FPS monitoring with degradation detection
- Tab visibility tracking with hidden duration
- Configurable degradation strategies"
```

---

## Phase 7: Analytics Hook

### Task 7: Create useModuleAnalytics hook

**Files:**
- Create: `src/lib/skeleton/useModuleAnalytics.ts`

**Step 1: Write the analytics hook**

```typescript
// src/lib/skeleton/useModuleAnalytics.ts
import { useCallback, useRef, useEffect } from 'react'
import type {
  SessionStartEvent,
  SessionEndEvent,
  StageUnlockEvent,
  ChallengeEndEvent
} from './types'

type AnalyticsEvent =
  | { type: 'sessionStart'; data: SessionStartEvent }
  | { type: 'sessionEnd'; data: SessionEndEvent }
  | { type: 'stageUnlock'; data: StageUnlockEvent }
  | { type: 'challengeEnd'; data: ChallengeEndEvent }

interface UseModuleAnalyticsReturn {
  // Event recording
  trackSessionStart: (moduleId: string) => void
  trackSessionEnd: (data: Omit<SessionEndEvent, 'moduleId'>) => void
  trackStageUnlock: (data: StageUnlockEvent) => void
  trackChallengeEnd: (data: ChallengeEndEvent) => void

  // For testing/debugging
  getEvents: () => AnalyticsEvent[]
  clearEvents: () => void
}

// In production, replace with actual analytics service
const sendToAnalytics = (event: AnalyticsEvent) => {
  // Queue for batch sending
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.type, event.data)
  }

  // TODO: Integrate with actual analytics service
  // - Segment
  // - PostHog
  // - Custom backend
}

export function useModuleAnalytics(): UseModuleAnalyticsReturn {
  const eventsRef = useRef<AnalyticsEvent[]>([])
  const moduleIdRef = useRef<string | null>(null)
  const sessionStartRef = useRef<number | null>(null)

  const trackSessionStart = useCallback((moduleId: string) => {
    moduleIdRef.current = moduleId
    sessionStartRef.current = Date.now()

    const event: AnalyticsEvent = {
      type: 'sessionStart',
      data: { moduleId, timestamp: Date.now() },
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const trackSessionEnd = useCallback((data: Omit<SessionEndEvent, 'moduleId'>) => {
    if (!moduleIdRef.current) return

    const event: AnalyticsEvent = {
      type: 'sessionEnd',
      data: { ...data, moduleId: moduleIdRef.current },
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const trackStageUnlock = useCallback((data: StageUnlockEvent) => {
    const event: AnalyticsEvent = {
      type: 'stageUnlock',
      data,
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const trackChallengeEnd = useCallback((data: ChallengeEndEvent) => {
    const event: AnalyticsEvent = {
      type: 'challengeEnd',
      data,
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const getEvents = useCallback(() => eventsRef.current, [])

  const clearEvents = useCallback(() => {
    eventsRef.current = []
  }, [])

  // Track session end on unmount
  useEffect(() => {
    return () => {
      if (sessionStartRef.current && moduleIdRef.current) {
        const duration = Date.now() - sessionStartRef.current
        trackSessionEnd({
          duration,
          completedChallenges: 0, // Would need to track this
          exitReason: 'abandoned',
        })
      }
    }
  }, [trackSessionEnd])

  return {
    trackSessionStart,
    trackSessionEnd,
    trackStageUnlock,
    trackChallengeEnd,
    getEvents,
    clearEvents,
  }
}
```

**Step 2: Update final barrel export**

```typescript
// src/lib/skeleton/index.ts
export * from './types'
export * from './useModuleFlow'
export * from './useStageUnlock'
export * from './useChallengeAssist'
export * from './useAccessibility'
export * from './useErrorRecovery'
export * from './useModuleAnalytics'
```

**Step 3: Commit**

```bash
git add src/lib/skeleton/useModuleAnalytics.ts src/lib/skeleton/index.ts
git commit -m "feat(skeleton): add useModuleAnalytics hook

Event tracking for module usage:
- Session start/end with duration
- Stage unlock with trigger type
- Challenge completion with exit type and accuracy
- Development logging, ready for production integration"
```

---

## Phase 8: Integration Example

### Task 8: Create example usage documentation

**Files:**
- Create: `src/lib/skeleton/README.md`

**Step 1: Write documentation**

```markdown
# Module Skeleton

Reusable infrastructure for learning modules. Provides the common flow pattern
(Idle → Explore → Challenge → Success → Reveal) while allowing modules to define
their own content and interactions.

## Quick Start

```tsx
import {
  useModuleFlow,
  useStageUnlock,
  useChallengeAssist,
  useAccessibility,
  type ModuleConfig,
} from '@/lib/skeleton'

// Define your module configuration
const config: ModuleConfig<MyParams, MyTarget> = {
  id: 'my-module',
  stages: [
    {
      id: 'param1',
      parameter: 'param1',
      interactionMode: 'slider',
      controlConfig: { min: 0, max: 2, step: 0.1, defaultValue: 1 },
    },
  ],
  challenge: {
    generateTarget: () => ({ value: Math.random() * 2 }),
    matchThreshold: 0.95,
    proximityFn: (current, target) => 1 - Math.abs(current.param1 - target.value),
    targetConstraints: {
      minimumDistance: 0.3,
      maximumDistance: 0.95,
      difficultyProgression: 'fixed',
    },
  },
  feedback: {
    intensityFn: (params) => params.param1 / 2,
    notation: (params) => `Value = ${params.param1.toFixed(2)}`,
  },
  idle: { hintDelay: 15, hintType: 'pulse' },
  stageUnlock: {
    minimumEngagementSeconds: 5,
    intensityThreshold: 0.7,
    rangeExplorationThreshold: 0.6,
    timeFallbackSeconds: 45,
  },
}

// Use in your component
function MyModule() {
  const [params, setParams] = useState({ param1: 1 })

  const flow = useModuleFlow(config, params)
  const unlock = useStageUnlock(config.stageUnlock)
  const assist = useChallengeAssist()
  const a11y = useAccessibility()

  // Handle parameter changes
  const handleChange = (value: number) => {
    setParams({ param1: value })
    flow.recordInteraction()

    if (flow.state.phase === 'explore') {
      const intensity = config.feedback.intensityFn(params, 'explore')
      unlock.recordValue(value / 2, intensity) // normalized value

      if (unlock.shouldUnlock) {
        a11y.announce('Stage complete!')
        flow.advanceStage()
        unlock.reset()
      }
    }
  }

  // Render based on phase
  return (
    <div>
      {flow.state.phase === 'idle' && <IdleView />}
      {flow.state.phase === 'explore' && <ExploreView />}
      {flow.state.phase === 'challenge' && <ChallengeView assist={assist} />}
      {flow.state.phase === 'success' && <SuccessView />}
      {flow.state.phase === 'reveal' && <RevealView />}
    </div>
  )
}
```

## Hooks

### useModuleFlow
Core flow orchestration. Manages phase transitions and state.

### useStageUnlock
Stage unlock logic with three triggers: intensity, range exploration, time fallback.

### useChallengeAssist
Challenge failure path. Progressive hints, "try another", assisted solve.

### useAccessibility
A11y infrastructure. Announcements, focus management, keyboard helpers.

### useErrorRecovery
Error handling. WebGL context loss, FPS monitoring, tab visibility.

### useModuleAnalytics
Event tracking for usage analytics.

## Migration Guide

Existing modules can adopt skeleton hooks incrementally:

1. Add types to existing config
2. Replace custom phase logic with `useModuleFlow`
3. Replace unlock logic with `useStageUnlock`
4. Add `useChallengeAssist` for failure path
5. Add `useAccessibility` for a11y
6. Add `useModuleAnalytics` for tracking

No big-bang rewrite required.
```

**Step 2: Commit**

```bash
git add src/lib/skeleton/README.md
git commit -m "docs(skeleton): add README with usage examples

Documents all skeleton hooks with quick start example and
migration guide for existing modules."
```

---

## Final Verification

### Task 9: Verify full build and tests

**Step 1: Run all tests**

Run: `pnpm vitest run`
Expected: All tests pass

**Step 2: Run full build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Run lint**

Run: `pnpm lint`
Expected: No errors

**Step 4: Final commit with all changes**

```bash
git add -A
git status
# Verify only skeleton files are staged
git commit -m "feat(skeleton): complete module skeleton infrastructure

Phase 1 complete. Adds reusable hooks for:
- Flow orchestration (useModuleFlow)
- Stage unlock logic (useStageUnlock)
- Challenge assistance (useChallengeAssist)
- Accessibility (useAccessibility)
- Error recovery (useErrorRecovery)
- Analytics (useModuleAnalytics)

Ready for module migration in Phase 2."
```

---

## Next Steps (Separate Plan)

After this infrastructure is in place, create a follow-up plan for:

1. **Phase 2: Migrate Sinewaves Module** - Refactor `src/components/modules/sinewaves/ObservatoryModule.tsx` (or new module shell) to use skeleton hooks
2. **Phase 3: Add UI Components** - FormulaReveal, DirectionalNudge, AssistOverlay
3. **Phase 4: Migrate Vector Transforms** - Refactor to use skeleton hooks
4. **Phase 5: Add Missing Features** - Per-parameter feedback, notation edge cases
