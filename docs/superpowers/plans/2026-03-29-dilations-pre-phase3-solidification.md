## Status: Complete

> Implemented via PRs #53 (7 solidification items) and #54 (3 drag quality fixes). Merged 2026-03-29/30.

# Dilations Pre-Phase 3 Solidification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Fix four bugs and three UX gaps in Dilations Phases 1 & 2 to reach a polished baseline before building Phase 3.

**Architecture:** Seven targeted changes across `App.tsx`, `dilations-copy.ts`, `DilationsModule.tsx`, `GhostTriangle.tsx`, `usePredictReveal.ts`, `math.ts`, `CoordinateReadout.tsx`, and both round-scene files. No new components. No new routes. Changes are surgical — each item touches its own narrow slice of the module.

**Tech Stack:** React 19, TypeScript (strict), React Three Fiber, Vitest, Tailwind CSS 4, pnpm

**Spec:** `docs/superpowers/specs/2026-03-29-dilations-pre-phase3-solidification-design.md`

---

## File Map

| File | What changes |
|------|--------------|
| `src/App.tsx` | Retry logic on module chunk load failure |
| `src/components/modules/dilations/dilations-copy.ts` | Remove Phase 1 notation; add `PHASE_NAMES` map |
| `src/components/modules/dilations/DilationsModule.tsx` | Status strip label; entry prompt label; accuracy state; nudge fallback default; Phase 2 predicted vertices |
| `src/components/modules/dilations/components/GhostTriangle.tsx` | Delta-based drag; initial position |
| `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx` | Hide ghost during entry; accuracy callback |
| `src/components/modules/dilations/rounds/CoordinateRounds.tsx` | Hide ghost during entry; accuracy callback |
| `src/components/modules/dilations/hooks/usePredictReveal.ts` | Export `computeAccuracy` helper |
| `src/components/modules/dilations/utils/math.ts` | Add `translateTriangle`, `triangleCentroid`, `ghostVerticesToWorld` |
| `src/components/modules/dilations/components/CoordinateReadout.tsx` | Predicted vertices display mode |
| `src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx` | Add prediction-state test |

---

## Task 1: Create feature branch

- [x] **Create and switch to feature branch**
  ```bash
  git checkout -b feat/dilations-pre-phase3-solidification
  ```

---

## Task 2: Copy-only changes (Items 2 & 3a — `dilations-copy.ts`)

**Files:**
- Modify: `src/components/modules/dilations/dilations-copy.ts`

These are pure data changes — no logic, no tests needed.

- [x] **Remove `notation` and `notationStyle` from Phase 1 earned reveals**

  In `EARNED_REVEALS`, update the three Phase 1 entries to remove `notation` and `notationStyle`. The `text` field is unchanged. Final state for each:

  ```ts
  'dilate-k2': {
    text: 'Every point moved twice as far from the origin. Distances doubled — angles held.',
  },
  'dilate-k3': {
    text: 'k = 3 stretched it further, but the center is still the origin. Larger k, larger distance.',
  },
  'dilate-k-half': {
    text: 'k < 1 pulls toward the center. Dilation can shrink as well as grow.',
  },
  ```

  `dilate-k2-properties` and `dilate-summary` have no `notation` already — leave them alone. Phase 2 entries (`coord-k2`, `coord-k-half`, `coord-k-third`) keep their notation — leave those alone too.

- [x] **Add `PHASE_NAMES` export after `PHASE_LABELS`**

  ```ts
  export const PHASE_NAMES: Record<PhaseId, string> = {
    'scale-factor': 'Scale Factor',
    'coordinate':   'Coordinate Rule',
    'similarity':   'Similarity',
    'aa-capstone':  'AA Criterion',
  }
  ```

  `PhaseId` is already imported from `./utils/types` at line 6 — no new import needed.

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```
  Expected: no TypeScript errors. The `notation` and `notationStyle` fields are optional (`?:`) in `EarnedReveal`, so removing them is safe.

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/dilations-copy.ts
  git commit -m "feat(dilations): remove Phase 1 coordinate notation; add PHASE_NAMES map"
  ```

---

## Task 3: Status strip + prompt label (Item 3b — `DilationsModule.tsx`)

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

- [x] **Add `PHASE_NAMES` to the import line**

  Line 15 currently imports `PHASE_LABELS`, `PHASE_INTROS`, `ROUND_PROMPTS`, `EARNED_REVEALS`. Add `PHASE_NAMES`:

  ```ts
  import { PHASE_LABELS, PHASE_NAMES, PHASE_INTROS, ROUND_PROMPTS, EARNED_REVEALS } from './dilations-copy'
  ```

- [x] **Update prompt label for `entry` state**

  In the `promptLabel` IIFE (around line 97–103), change:
  ```ts
  if (roundState === 'entry') return PHASE_LABELS[phase]
  ```
  to:
  ```ts
  if (roundState === 'entry') return 'Dilations'
  ```

- [x] **Update status strip right-edge label**

  In the JSX (around line 173–175), change:
  ```tsx
  <span className="shrink-0 lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
    {PHASE_LABELS[phase]}
  </span>
  ```
  to:
  ```tsx
  <span className="shrink-0 lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
    {PHASE_NAMES[phase]}
  </span>
  ```

  `PHASE_LABELS` is now unused — it was only referenced in the two places just replaced. **Remove it from the import line.** TypeScript `noUnusedLocals` will fail the build if it remains.

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/DilationsModule.tsx
  git commit -m "feat(dilations): clean up status strip phase label and entry prompt label"
  ```

---

## Task 4: Silent retry on module load (Item 1 — `App.tsx`)

**Files:**
- Modify: `src/App.tsx`

- [x] **Replace the load call in `DynamicModule`**

  Find the `useEffect` in `DynamicModule` (lines ~32–52). The current pattern:
  ```ts
  moduleConfig.component()
    .then(module => {
      startTransition(() => {
        setLoadedModule(() => module.default)
        setError(null)
      })
    })
    .catch(err => {
      console.error(`Failed to load module "${moduleId}":`, err)
      setError(`Failed to load module "${moduleId}"`)
    })
  ```

  Replace with one silent retry before surfacing the error:
  ```ts
  moduleConfig.component()
    .catch(() => moduleConfig.component())  // retry once on transient failure
    .then(module => {
      startTransition(() => {
        setLoadedModule(() => module.default)
        setError(null)
      })
    })
    .catch(err => {
      console.error(`Failed to load module "${moduleId}":`, err)
      setError(`Failed to load module "${moduleId}"`)
    })
  ```

  The `startTransition` wrapper on the success path is intentional — keep it exactly as shown.

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/App.tsx
  git commit -m "fix(app): silent retry on module chunk load failure"
  ```

---

## Task 5: Math utilities (Items 4, 6, 7 prep — `math.ts`)

**Files:**
- Modify: `src/components/modules/dilations/utils/math.ts`
- Test: `src/components/modules/dilations/__tests__/math.test.ts` (create)

These utilities are used by later tasks. Write and test them first.

- [x] **Write failing tests for the three new functions**

  Create `src/components/modules/dilations/__tests__/math.test.ts`:

  ```ts
  import { describe, it, expect } from 'vitest'
  import { translateTriangle, triangleCentroid, ghostVerticesToWorld } from '../utils/math'
  import { CANONICAL_TRIANGLE } from '../utils/constants'

  describe('translateTriangle', () => {
    it('shifts all vertices by dx, dy', () => {
      const t = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 1, y: 2 } }
      const result = translateTriangle(t, 3, -1)
      expect(result).toEqual({
        a: { x: 3, y: -1 },
        b: { x: 5, y: -1 },
        c: { x: 4, y: 1 },
      })
    })
  })

  describe('triangleCentroid', () => {
    it('returns the centroid of CANONICAL_TRIANGLE', () => {
      // A(1,1) B(4,2) C(2,4) → centroid (7/3, 7/3)
      const c = triangleCentroid(CANONICAL_TRIANGLE)
      expect(c.x).toBeCloseTo(7 / 3, 5)
      expect(c.y).toBeCloseTo(7 / 3, 5)
    })
  })

  describe('ghostVerticesToWorld', () => {
    it('places ghost centroid at the given world position', () => {
      const center = { x: 2, y: 3 }
      const result = ghostVerticesToWorld(CANONICAL_TRIANGLE, 2, center)
      const cx = (result.a.x + result.b.x + result.c.x) / 3
      const cy = (result.a.y + result.b.y + result.c.y) / 3
      expect(cx).toBeCloseTo(2, 5)
      expect(cy).toBeCloseTo(3, 5)
    })

    it('scales vertices by k relative to the image centroid', () => {
      // For k=1 (identity), ghost centroid at (1,1): vertices should be canonical triangle
      // shifted so centroid is at (1,1)
      const center = { x: 7 / 3, y: 7 / 3 }  // canonical centroid
      const result = ghostVerticesToWorld(CANONICAL_TRIANGLE, 1, center)
      expect(result.a.x).toBeCloseTo(1, 5)
      expect(result.a.y).toBeCloseTo(1, 5)
    })
  })
  ```

- [x] **Run tests to verify they fail**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts
  ```
  Expected: 4 failures (functions not yet exported)

- [x] **Add `translateTriangle`, `triangleCentroid`, and `ghostVerticesToWorld` to `math.ts`**

  Add after the existing `translatePoint` function (around line 102):

  ```ts
  /** Translate all 3 vertices of a triangle by (dx, dy) */
  export function translateTriangle(t: Triangle, dx: number, dy: number): Triangle {
    return {
      a: translatePoint(t.a, dx, dy),
      b: translatePoint(t.b, dx, dy),
      c: translatePoint(t.c, dx, dy),
    }
  }

  /** Centroid of a triangle */
  export function triangleCentroid(t: Triangle): Vec2 {
    return {
      x: (t.a.x + t.b.x + t.c.x) / 3,
      y: (t.a.y + t.b.y + t.c.y) / 3,
    }
  }

  /**
   * Compute the world-space vertices of the ghost triangle.
   * Mirrors GhostTriangle's internal scaledShape + group position logic:
   * dilate CANONICAL_TRIANGLE by k → center at origin → translate to centroid position.
   */
  export function ghostVerticesToWorld(vertices: Triangle, k: number, centroid: Vec2): Triangle {
    const dilated = dilateTriangle(vertices, k)
    const c = triangleCentroid(dilated)
    const originCentered = translateTriangle(dilated, -c.x, -c.y)
    return translateTriangle(originCentered, centroid.x, centroid.y)
  }
  ```

- [x] **Run tests to verify they pass**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts
  ```
  Expected: 4 passing

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/utils/math.ts src/components/modules/dilations/__tests__/math.test.ts
  git commit -m "feat(dilations): add translateTriangle, triangleCentroid, ghostVerticesToWorld to math.ts"
  ```

---

## Task 6: Delta-based drag + initial position (Items 4 & 6 — `GhostTriangle.tsx`)

**Files:**
- Modify: `src/components/modules/dilations/components/GhostTriangle.tsx`

- [x] **Add `dragStartWorld` and `centerAtDragStart` refs**

  After the existing `dragging` ref (around line 69), add:
  ```ts
  const dragStartWorld = useRef<Vec2>({ x: 0, y: 0 })
  const centerAtDragStart = useRef<Vec2>({ x: 0, y: 0 })
  ```

- [x] **Change the initial value of `centerPosRef`**

  Line 95 currently:
  ```ts
  const centerPosRef = useRef<Vec2>(triangleCentroid(vertices))
  ```
  Change to:
  ```ts
  const centerPosRef = useRef<Vec2>({ x: 0, y: -0.5 })
  ```

  The local `triangleCentroid` function at the top of the file can be removed if it's no longer used anywhere in the file. Check before deleting.

- [x] **Update `handlePointerDown` to record delta baseline**

  In `handlePointerDown`, after `dragging.current = true`, record the drag baseline. The baseline for `centerAtDragStart` must use `externalPosition ?? centerPosRef.current` (not just `centerPosRef.current`) — this matters when the user keyboard-nudged the ghost before dragging:

  ```ts
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled) return
    e.stopPropagation()
    dragging.current = true

    const startWorld = getWorldPoint(e.nativeEvent.clientX, e.nativeEvent.clientY)
    dragStartWorld.current = startWorld
    centerAtDragStart.current = externalPosition ?? centerPosRef.current

    const handleMove = (ev: PointerEvent) => {
      if (!dragging.current) return
      const p = getWorldPoint(ev.clientX, ev.clientY)
      const newCenter = {
        x: centerAtDragStart.current.x + (p.x - dragStartWorld.current.x),
        y: centerAtDragStart.current.y + (p.y - dragStartWorld.current.y),
      }
      const snapped = { x: snap(newCenter.x), y: snap(newCenter.y) }
      centerPosRef.current = snapped
    }

    const handleUp = (ev: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      const p = getWorldPoint(ev.clientX, ev.clientY)
      const newCenter = {
        x: centerAtDragStart.current.x + (p.x - dragStartWorld.current.x),
        y: centerAtDragStart.current.y + (p.y - dragStartWorld.current.y),
      }
      const snapped = { x: snap(newCenter.x), y: snap(newCenter.y) }
      centerPosRef.current = snapped
      onDrop(snapped)
      onPositionChange?.(snapped)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      cleanupDragRef.current = null
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    cleanupDragRef.current = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [disabled, getWorldPoint, onDrop, onPositionChange, externalPosition])
  ```

  Note: `externalPosition` is now in the dependency array.

- [x] **Remove the local `translateTriangle` function** if it exists in this file (it should now come from `math.ts`). Check whether `GhostTriangle.tsx` uses `translateTriangle` — it does, in the `scaledShape` computation. Update the import to pull from `../utils/math`:
  ```ts
  import { dilateTriangle, translateTriangle, triangleCentroid } from '../utils/math'
  ```
  Remove the local definitions of `translateTriangle` and `triangleCentroid` from the top of the file.

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/components/GhostTriangle.tsx
  git commit -m "fix(dilations): delta-based drag in GhostTriangle; neutral initial position"
  ```

---

## Task 7: Hide ghost during entry (Item 6 — round scenes)

**Files:**
- Modify: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`
- Modify: `src/components/modules/dilations/rounds/CoordinateRounds.tsx`

- [x] **Update `showGhost` condition in `PredictionRoundScene`** (`ScaleFactorRounds.tsx` line ~52)

  Change:
  ```ts
  const showGhost = roundState !== 'completion'
  ```
  to:
  ```ts
  const showGhost = roundState !== 'completion' && roundState !== 'entry'
  ```

- [x] **Update `showGhost` condition in `CoordinatePredictionScene`** (`CoordinateRounds.tsx` line ~53)

  Same change:
  ```ts
  const showGhost = roundState !== 'completion' && roundState !== 'entry'
  ```

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/rounds/ScaleFactorRounds.tsx src/components/modules/dilations/rounds/CoordinateRounds.tsx
  git commit -m "fix(dilations): hide ghost during entry state to prevent pre-image overlap"
  ```

---

## Task 8: `computeAccuracy` export (Item 5 — `usePredictReveal.ts`)

**Files:**
- Modify: `src/components/modules/dilations/hooks/usePredictReveal.ts`
- Test: `src/components/modules/dilations/__tests__/usePredictReveal.test.ts` (create)

- [x] **Write failing tests for `computeAccuracy`**

  Create `src/components/modules/dilations/__tests__/usePredictReveal.test.ts`:

  ```ts
  import { describe, it, expect } from 'vitest'
  import { computeAccuracy } from '../hooks/usePredictReveal'

  const target = { x: 4, y: 4 }
  const tolerance = 0.75  // PREDICTION_TOLERANCE from constants

  describe('computeAccuracy', () => {
    it('returns exact when distance <= tolerance * 0.5', () => {
      expect(computeAccuracy({ x: 4.3, y: 4 }, target, tolerance)).toBe('exact')
    })

    it('returns close when distance > tolerance * 0.5 and <= tolerance', () => {
      expect(computeAccuracy({ x: 4.6, y: 4 }, target, tolerance)).toBe('close')
    })

    it('returns miss when distance > tolerance', () => {
      expect(computeAccuracy({ x: 6, y: 4 }, target, tolerance)).toBe('miss')
    })

    it('returns exact at distance 0', () => {
      expect(computeAccuracy(target, target, tolerance)).toBe('exact')
    })
  })
  ```

- [x] **Run tests to verify they fail**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/usePredictReveal.test.ts
  ```
  Expected: 4 failures

- [x] **Export `computeAccuracy` from `usePredictReveal.ts`**

  Add before the `predictRevealReducer` function:

  ```ts
  export function computeAccuracy(ghostPos: Vec2, targetCentroid: Vec2, tolerance: number): Accuracy {
    const d = Math.sqrt((ghostPos.x - targetCentroid.x) ** 2 + (ghostPos.y - targetCentroid.y) ** 2)
    return d <= tolerance * 0.5 ? 'exact' : d <= tolerance ? 'close' : 'miss'
  }
  ```

  The existing private `dist` function in the file can be simplified to call `computeAccuracy`, or kept as-is. Either way, no breaking change.

- [x] **Run tests to verify they pass**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/usePredictReveal.test.ts
  ```
  Expected: 4 passing

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/hooks/usePredictReveal.ts src/components/modules/dilations/__tests__/usePredictReveal.test.ts
  git commit -m "feat(dilations): export computeAccuracy helper from usePredictReveal"
  ```

---

## Task 9: Accuracy feedback (Item 5 — round scenes + `DilationsModule.tsx`)

**Files:**
- Modify: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`
- Modify: `src/components/modules/dilations/rounds/CoordinateRounds.tsx`
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

### Round scenes

- [x] **Add `onAccuracy` to `PredictionRoundScene` props and call site** (`ScaleFactorRounds.tsx`)

  Add to the props interface:
  ```ts
  onAccuracy?: (a: Accuracy) => void
  ```

  Import `Accuracy` and `computeAccuracy`:
  ```ts
  import { usePredictReveal, computeAccuracy, type Accuracy } from '../hooks/usePredictReveal'
  ```

  In `handleGhostDrop`, compute accuracy synchronously from the dropped position before it's discarded:
  ```ts
  const handleGhostDrop = useCallback((pos: Vec2) => {
    placeGhost(pos)
    commitPrediction()
    dispatch({ type: 'COMMIT_PREDICTION' })
    const targetCentroid = { x: (targetTriangle.a.x + targetTriangle.b.x + targetTriangle.c.x) / 3,
                             y: (targetTriangle.a.y + targetTriangle.b.y + targetTriangle.c.y) / 3 }
    onAccuracy?.(computeAccuracy(pos, targetCentroid, PREDICTION_TOLERANCE))
  }, [placeGhost, commitPrediction, dispatch, onAccuracy, targetTriangle])
  ```

  Use `triangleCentroid` from `math.ts` instead of inlining if already imported: `import { triangleCentroid } from '../utils/math'`.

  Propagate `onAccuracy` through `ScaleFactorScene` → `PredictionRoundScene`:
  - Add `onAccuracy?: (a: Accuracy) => void` to `ScaleFactorScene` props
  - Pass it down to `PredictionRoundScene` (the non-properties, non-summary rounds)

- [x] **Same change in `CoordinatePredictionScene` / `CoordinateScene`** (`CoordinateRounds.tsx`)

  Identical pattern — add `onAccuracy` prop, import `computeAccuracy` and `Accuracy`, call in `handleGhostDrop`, propagate through `CoordinateScene`.

### DilationsModule

- [x] **Add `predictionAccuracy` state and reset effect**

  After the `nudgePosition` state:
  ```ts
  const [predictionAccuracy, setPredictionAccuracy] = useState<Accuracy | null>(null)
  ```

  Import `Accuracy` from `usePredictReveal`:
  ```ts
  import type { Accuracy } from './hooks/usePredictReveal'
  ```

  Add a reset effect below the existing nudge reset effect. Follow the same pattern (same eslint suppression):
  ```ts
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPredictionAccuracy(null)
  }, [currentRound])
  /* eslint-enable react-hooks/set-state-in-effect */
  ```

- [x] **Wire `onAccuracy` into both scene components**

  ```ts
  const handleAccuracy = useCallback((a: Accuracy) => {
    setPredictionAccuracy(a)
  }, [])
  ```

  Pass to `ScaleFactorScene` and `CoordinateScene`:
  ```tsx
  <ScaleFactorScene
    ...
    onAccuracy={handleAccuracy}
  />
  <CoordinateScene
    ...
    onAccuracy={handleAccuracy}
  />
  ```

- [x] **Update `promptLabel` for prediction state**

  In the `promptLabel` IIFE, add a case before the fallback `return 'Predict'`:
  ```ts
  if (roundState === 'prediction') {
    if (predictionAccuracy === 'exact') return 'Exact!'
    if (predictionAccuracy === 'close') return 'Close!'
    return 'Good try'
  }
  ```

- [x] **Update `amber` flag to include accurate predictions**

  Current:
  ```ts
  const amber = isFirstReveal || (roundState === 'entry' && PHASE_INTROS[phase] !== '')
  ```
  Change to:
  ```ts
  const amber = isFirstReveal
    || (roundState === 'entry' && PHASE_INTROS[phase] !== '')
    || (roundState === 'prediction' && (predictionAccuracy === 'exact' || predictionAccuracy === 'close'))
  ```

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/rounds/ScaleFactorRounds.tsx \
          src/components/modules/dilations/rounds/CoordinateRounds.tsx \
          src/components/modules/dilations/DilationsModule.tsx
  git commit -m "feat(dilations): accuracy feedback on prediction commit (Exact/Close/Good try)"
  ```

---

## Task 10: Phase 2 predicted coordinates (Item 7 — `CoordinateReadout.tsx` + `DilationsModule.tsx`)

**Files:**
- Modify: `src/components/modules/dilations/components/CoordinateReadout.tsx`
- Modify: `src/components/modules/dilations/DilationsModule.tsx`
- Test: `src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx` (modify)

### CoordinateReadout

- [x] **Add `predictedVertices` prop and prediction display mode**

  Current props interface:
  ```ts
  export interface CoordinateReadoutProps {
    scaleFactor: number
    roundState: RoundState
    isGeneralized: boolean
  }
  ```

  Add:
  ```ts
  export interface CoordinateReadoutProps {
    scaleFactor: number
    roundState: RoundState
    isGeneralized: boolean
    predictedVertices?: Triangle
  }
  ```

  Import `Triangle` from types:
  ```ts
  import type { RoundState, Triangle } from '../utils/types'
  ```

  The component currently has two display states (before/after reveal). Restructure to three:

  ```tsx
  export function CoordinateReadout({
    scaleFactor,
    roundState,
    isGeneralized,
    predictedVertices,
  }: CoordinateReadoutProps) {
    const isAfterReveal = roundState === 'reveal' || roundState === 'completion'
    const isPrediction = roundState === 'prediction' && predictedVertices != null

    // Before prediction committed: just show k = N
    if (!isAfterReveal && !isPrediction) {
      return (
        <div className="px-5 py-2 md:px-4">
          <ScaleFactorDisplay k={scaleFactor} />
        </div>
      )
    }

    // Prediction state: show ghost vertices in lab-ghost color
    if (!isAfterReveal && isPrediction) {
      const verts = [predictedVertices.a, predictedVertices.b, predictedVertices.c] as const
      return (
        <div className="px-5 py-2 md:px-4 flex flex-col gap-1.5">
          <div className="lab-silk lab-display-font text-[8px] tracking-[0.2em] text-(--lab-text-muted)">
            PREDICTED
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 lab-data-font text-xs text-(--lab-ghost)">
            {VERTEX_NAMES.map((name, i) => (
              <span key={name}>
                {name}&prime;({verts[i].x.toFixed(2).replace(/\.?0+$/, '')},{' '}
                {verts[i].y.toFixed(2).replace(/\.?0+$/, '')})
              </span>
            ))}
          </div>
        </div>
      )
    }

    // After reveal: full coordinate table + rule (existing behavior)
    const pre = CANONICAL_TRIANGLE
    const actualVerts = [pre.a, pre.b, pre.c] as const
    return (
      <div className="px-5 py-2 md:px-4 flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 lab-data-font text-xs">
          {actualVerts.map((v, i) => (
            <span key={VERTEX_NAMES[i]}>
              <span className="text-(--lab-text-muted)">
                {VERTEX_NAMES[i]}({v.x}, {v.y})
              </span>
              <span className="text-(--lab-text-muted) mx-0.5">→</span>
              <span className="text-(--lab-accent)">
                {VERTEX_NAMES[i]}&prime;({formatCoord(scaleFactor, v.x)}, {formatCoord(scaleFactor, v.y)})
              </span>
            </span>
          ))}
        </div>
        <div
          className={[
            'lab-data-font text-sm font-semibold border-t border-(--lab-border) pt-1.5',
            isGeneralized ? 'text-(--lab-earned)' : 'text-(--lab-accent)',
          ].join(' ')}
        >
          {coordinateRule(scaleFactor, isGeneralized)}
        </div>
      </div>
    )
  }
  ```

- [x] **Add prediction-state test to `CoordinateReadout.test.tsx`**

  Open `src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx` and add:

  ```tsx
  import { render, screen } from '@testing-library/react'
  import { CoordinateReadout } from '../components/CoordinateReadout'

  describe('CoordinateReadout — prediction state', () => {
    it('shows PREDICTED label and ghost vertices when predictedVertices provided in prediction state', () => {
      const predicted = {
        a: { x: 2, y: 2 },
        b: { x: 8, y: 4 },
        c: { x: 4, y: 8 },
      }
      render(
        <CoordinateReadout
          scaleFactor={2}
          roundState="prediction"
          isGeneralized={false}
          predictedVertices={predicted}
        />
      )
      expect(screen.getByText('PREDICTED')).toBeInTheDocument()
      expect(screen.getByText(/A′\(2, 2\)/)).toBeInTheDocument()
    })

    it('shows k = N when in prediction state but no predictedVertices', () => {
      render(
        <CoordinateReadout
          scaleFactor={2}
          roundState="prediction"
          isGeneralized={false}
        />
      )
      expect(screen.queryByText('PREDICTED')).not.toBeInTheDocument()
    })
  })
  ```

  Check existing imports in the test file — add whatever is missing (e.g. `render`, `screen` from `@testing-library/react`).

- [x] **Run tests**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx
  ```
  Expected: all passing (including new tests)

### DilationsModule

- [x] **Import `ghostVerticesToWorld` and compute predicted vertices**

  Add to imports:
  ```ts
  import { ghostVerticesToWorld } from './utils/math'
  import { CANONICAL_TRIANGLE, ROUND_CONFIGS } from './utils/constants'
  ```
  (`ROUND_CONFIGS` is already imported; `CANONICAL_TRIANGLE` may not be — check.)

  In the `formulaReadout` IIFE, update the `isCoordinatePhase` branch:

  ```ts
  if (isCoordinatePhase && config.scaleFactor != null) {
    const predictedVertices =
      roundState === 'prediction' && nudgePosition != null
        ? ghostVerticesToWorld(CANONICAL_TRIANGLE, config.scaleFactor, nudgePosition)
        : undefined

    return (
      <CoordinateReadout
        scaleFactor={config.scaleFactor}
        roundState={roundState}
        isGeneralized={currentRound === 'coord-k-third'}
        predictedVertices={predictedVertices}
      />
    )
  }
  ```

- [x] **Update keyboard nudge fallback default**

  Line ~65 in `DilationsModule.tsx`:
  ```ts
  const base = nudgePosition ?? { x: 7 / 3, y: 7 / 3 }
  ```
  Change to:
  ```ts
  const base = nudgePosition ?? { x: 0, y: -0.5 }
  ```

  This keeps the keyboard nudge base consistent with the ghost's new initial render position.

- [x] **Verify build passes**
  ```bash
  pnpm build
  ```

- [x] **Commit**
  ```bash
  git add src/components/modules/dilations/components/CoordinateReadout.tsx \
          src/components/modules/dilations/DilationsModule.tsx \
          src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx
  git commit -m "feat(dilations): show predicted coordinates in Phase 2 formula strip after ghost drop"
  ```

---

## Task 11: Final verification

- [x] **Run all dilations tests**
  ```bash
  pnpm vitest run src/components/modules/dilations
  ```
  Expected: all passing

- [x] **Run full build**
  ```bash
  pnpm build
  ```
  Expected: no TypeScript errors, no lint errors

- [x] **Manual smoke test in dev server**
  ```bash
  pnpm dev
  ```
  Check each item:
  - [x] Phase 1 earned reveals: no `(x,y) →` notation
  - [x] Status strip: shows "Scale Factor" (not "PHASE 1 — Scale Factor")
  - [x] Entry state prompt label: shows "Dilations" (not "PHASE 1 — Scale Factor")
  - [x] Ghost hidden during entry, appears after CONTINUE
  - [x] Ghost appears at bottom-left of scene (near origin), not on pre-image
  - [x] Dragging feels smooth — shape stays under finger from wherever grabbed
  - [x] After dropping ghost: prompt shows "Exact!" / "Close!" / "Good try" with appropriate amber
  - [x] Phase 2, after dropping ghost: formula strip shows "PREDICTED" row with ghost coordinates
  - [x] Phase 2, after REVEAL: formula strip shows actual coordinates in green + rule as before

- [x] **Create PR**
  ```bash
  gh pr create --title "feat(dilations): pre-Phase 3 solidification (7 items)" \
    --body "Closes 7 polish items before Phase 3 build. See spec: docs/superpowers/specs/2026-03-29-dilations-pre-phase3-solidification-design.md"
  ```
