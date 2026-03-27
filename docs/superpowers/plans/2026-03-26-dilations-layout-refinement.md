# Dilations Layout Refinement Implementation Plan

## Status: Complete
Implemented 2026-03-26. PR #48.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Align the Dilations module layout and scene with the Rigid Motions reference implementation — introducing `ModuleLayout`, proper slot-based composition, `PromptReadout`, `ControlStrip`, `DilationsScene` rename, CoordinateGrid fixes, and camera center shift.

**Architecture:** `DilationsModule.tsx` is rewired to use a copy of `ModuleLayout` (identical to `rigid-motions/Layout.tsx`). `DilationsHUD` (absolute overlay) is deleted; its content distributes into a new `PromptReadout` (prompt slot), new `ControlStrip` (controls slot), and a new `dilations-copy.ts` file (copy constants). `DilationsCanvas.tsx` is renamed `DilationsScene.tsx` with CoordinateGrid geometry disposal, SpriteLabel axis labels, and camera center shifted from `(6,6)` to `(4,4)`.

**Tech Stack:** React 19, TypeScript, React Three Fiber, Three.js, Tailwind CSS 4, Vitest

---

## File Map

| File | Change |
|------|--------|
| `src/components/modules/dilations/dilations-copy.ts` | **New** — `PHASE_LABELS`, `PHASE_INTROS`, `ROUND_PROMPTS` |
| `src/components/modules/dilations/Layout.tsx` | **New** — copy of `rigid-motions/Layout.tsx` |
| `src/components/modules/dilations/components/PromptReadout.tsx` | **New** — copy of `rigid-motions/components/PromptReadout.tsx` |
| `src/components/modules/dilations/components/ControlStrip.tsx` | **New** — Phase 1 button logic |
| `src/components/modules/dilations/DilationsScene.tsx` | **New** — renamed from `DilationsCanvas.tsx` + fixes |
| `src/components/modules/dilations/DilationsCanvas.tsx` | **Deleted** (replaced by `DilationsScene.tsx`) |
| `src/components/modules/dilations/DilationsModule.tsx` | **Modified** — use `ModuleLayout`, wire all slots |
| `src/components/modules/dilations/DilationsHUD.tsx` | **Deleted** |
| `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx` | **Modified** — remove `ScaleFactorHUD` function |
| `src/components/modules/dilations/__tests__/dilations-copy.test.ts` | **New** — verify copy constant shapes |
| `src/config/modules.ts` | **Modified** — update import path from `DilationsCanvas` if referenced (check first) |

---

## Task 1: Extract copy constants to `dilations-copy.ts`

Copy constants currently live inside `DilationsHUD.tsx`. This task moves them to a dedicated file so they survive `DilationsHUD.tsx`'s deletion.

**Files:**
- Create: `src/components/modules/dilations/dilations-copy.ts`
- Create: `src/components/modules/dilations/__tests__/dilations-copy.test.ts`

- [x] **Step 1: Write the failing test**

Create `src/components/modules/dilations/__tests__/dilations-copy.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  PHASE_LABELS,
  PHASE_INTROS,
  ROUND_PROMPTS,
} from '../dilations-copy'
import type { PhaseId } from '../utils/types'

const ALL_PHASES: PhaseId[] = ['scale-factor', 'coordinate', 'similarity', 'aa-capstone']

describe('PHASE_LABELS', () => {
  it('has an entry for every PhaseId', () => {
    ALL_PHASES.forEach(p => {
      expect(PHASE_LABELS[p]).toBeDefined()
      expect(typeof PHASE_LABELS[p]).toBe('string')
    })
  })

  it('shows the phase number in the label', () => {
    expect(PHASE_LABELS['scale-factor']).toContain('1')
    expect(PHASE_LABELS['coordinate']).toContain('2')
    expect(PHASE_LABELS['similarity']).toContain('3')
    expect(PHASE_LABELS['aa-capstone']).toContain('4')
  })
})

describe('PHASE_INTROS', () => {
  it('has an entry for every PhaseId', () => {
    ALL_PHASES.forEach(p => {
      expect(Object.prototype.hasOwnProperty.call(PHASE_INTROS, p)).toBe(true)
    })
  })

  it('scale-factor intro is empty string (no entry pause on first load)', () => {
    expect(PHASE_INTROS['scale-factor']).toBe('')
  })

  it('other phases have non-empty intro copy', () => {
    expect(PHASE_INTROS['coordinate'].length).toBeGreaterThan(0)
    expect(PHASE_INTROS['similarity'].length).toBeGreaterThan(0)
    expect(PHASE_INTROS['aa-capstone'].length).toBeGreaterThan(0)
  })
})

describe('ROUND_PROMPTS', () => {
  it('has entries for all Phase 1 rounds', () => {
    const phase1Rounds = ['dilate-k2', 'dilate-k2-properties', 'dilate-k3', 'dilate-k-half', 'dilate-summary']
    phase1Rounds.forEach(r => {
      expect(ROUND_PROMPTS[r]).toBeDefined()
      expect(typeof ROUND_PROMPTS[r]).toBe('string')
    })
  })
})
```

- [x] **Step 2: Run the test to confirm it fails**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/dilations-copy.test.ts
```

Expected: FAIL — `dilations-copy` module not found.

- [x] **Step 3: Create `dilations-copy.ts`**

Copy the constants verbatim from `DilationsHUD.tsx` (lines 6–36), then delete them from `DilationsHUD.tsx`. The copy constants in `DilationsHUD.tsx` are `PHASE_LABELS`, `PHASE_INTROS`, and `ROUND_PROMPTS`.

Create `src/components/modules/dilations/dilations-copy.ts`:

> **Important:** The existing `DilationsHUD.tsx` declares `ROUND_PROMPTS` as `Record<RoundId, string>` with all 14 entries. Do NOT copy that type — use `Partial<Record<RoundId, string>>` as shown below, with only Phase 1 entries. The `??` fallback in `DilationsModule.tsx` (Task 6) depends on this being partial.

```typescript
// src/components/modules/dilations/dilations-copy.ts
import type { PhaseId, RoundId } from './utils/types'

export const PHASE_LABELS: Record<PhaseId, string> = {
  'scale-factor': 'PHASE 1 — Scale Factor',
  'coordinate':   'PHASE 2 — Coordinate Rule',
  'similarity':   'PHASE 3 — Similarity',
  'aa-capstone':  'PHASE 4 — AA Criterion',
}

// Empty string = no entry pause on first phase load
export const PHASE_INTROS: Record<PhaseId, string> = {
  'scale-factor': '',
  'coordinate':   "Now let's look at the coordinates. What happens to (x, y) when you dilate by k?",
  'similarity':   'Similar figures have the same shape but different sizes. Can a sequence of transformations connect them?',
  'aa-capstone':  "Two angles are enough to determine similarity. Let's see why.",
}

// Partial — Phase 2–4 entries added when those phases are built
export const ROUND_PROMPTS: Partial<Record<RoundId, string>> = {
  'dilate-k2':                 'Where will the image triangle appear when k = 2?',
  'dilate-k2-properties':      'What properties are preserved by dilation?',
  'dilate-k3':                 'Predict the image for k = 3.',
  'dilate-k-half':             'What happens when k is less than 1?',
  'dilate-summary':            'What have you discovered about scale factors?',
}
```

- [x] **Step 4: Run the test to confirm it passes**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/dilations-copy.test.ts
```

Expected: PASS — 5 tests passing.

- [x] **Step 5: Commit**

```bash
git add src/components/modules/dilations/dilations-copy.ts src/components/modules/dilations/__tests__/dilations-copy.test.ts
git commit -m "feat(dilations): extract copy constants to dilations-copy.ts"
```

---

## Task 2: Add `Layout.tsx`

Copy `rigid-motions/Layout.tsx` verbatim into the dilations module. No logic changes — each module owns its copy until the 3-module sequence is complete.

**Files:**
- Create: `src/components/modules/dilations/Layout.tsx`

- [x] **Step 1: Copy the file**

Copy the full contents of `src/components/modules/rigid-motions/Layout.tsx` into `src/components/modules/dilations/Layout.tsx`.

The file exports `ModuleLayout` — no path aliases or cross-module imports, so the copy works as-is.

- [x] **Step 2: Verify TypeScript accepts it**

```bash
pnpm build
```

Expected: build still passes (new file adds no new consumers yet).

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/Layout.tsx
git commit -m "feat(dilations): add Layout.tsx — copy of ModuleLayout from rigid-motions"
```

---

## Task 3: Add `PromptReadout.tsx`

Copy `rigid-motions/components/PromptReadout.tsx` verbatim into `dilations/components/`. The interface is identical — 6 props, `fadeInReadout` animation on text change. Phase 1 uses `label`, `text`, `amber` only; `notation`/`notationStyle`/`trailingText` are reserved for Phase 3.

**Files:**
- Create: `src/components/modules/dilations/components/PromptReadout.tsx`

- [x] **Step 1: Copy the file**

Copy the full contents of `src/components/modules/rigid-motions/components/PromptReadout.tsx` into `src/components/modules/dilations/components/PromptReadout.tsx`.

The only import is `fadeInReadout` from `@/lib/animation/presets` — this path alias works in both modules.

- [x] **Step 2: Verify TypeScript accepts it**

```bash
pnpm build
```

Expected: build still passes.

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/PromptReadout.tsx
git commit -m "feat(dilations): add PromptReadout — copy of rigid-motions component"
```

---

## Task 4: Add `ControlStrip.tsx`

New component. Renders a single primary button determined by `roundState` and `RoundConfig`. All buttons: 44px min touch target, `lab-silk lab-display-font`, `tracking-[0.1em]`, `duration-150` transition.

**Files:**
- Create: `src/components/modules/dilations/components/ControlStrip.tsx`

- [x] **Step 1: Create `ControlStrip.tsx`**

```typescript
// src/components/modules/dilations/components/ControlStrip.tsx
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { ROUND_CONFIGS } from '../utils/constants'

interface ControlStripProps {
  state: StageState
  dispatch: Dispatch<StageAction>
}

export function ControlStrip({ state, dispatch }: ControlStripProps) {
  const { roundState, currentRound } = state
  const config = ROUND_CONFIGS[currentRound]

  // Entry pause — student presses CONTINUE to begin the round
  if (roundState === 'entry') {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_ROUND_STATE', state: 'active' })}
        className="min-h-[44px] min-w-[44px] border border-(--lab-border) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
      >
        CONTINUE
      </button>
    )
  }

  // Prediction — ghost-drag rounds show REVEAL; sequence-builder rounds show CHECK
  if (roundState === 'prediction') {
    if (config.hasGhostDrag) {
      return (
        <button
          type="button"
          onClick={() => dispatch({ type: 'TRIGGER_REVEAL' })}
          className="min-h-[44px] min-w-[44px] border border-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-accent) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          REVEAL
        </button>
      )
    }
    if (config.hasSequenceBuilder) {
      return (
        <button
          type="button"
          onClick={() => dispatch({ type: 'CHECK_SEQUENCE' })}
          className="min-h-[44px] min-w-[44px] border border-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-accent) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          CHECK
        </button>
      )
    }
  }

  // Completion — advance to next round
  if (roundState === 'completion') {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: 'ADVANCE_ROUND' })}
        className="min-h-[44px] min-w-[44px] bg-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-bg) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
      >
        NEXT
      </button>
    )
  }

  // active / reveal — no button (dragging or animation playing)
  return null
}
```

- [x] **Step 2: Verify TypeScript accepts it**

```bash
pnpm build
```

Expected: build passes (new component, not yet consumed).

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/ControlStrip.tsx
git commit -m "feat(dilations): add ControlStrip — phase-aware button per roundState"
```

---

## Task 5: Rename `DilationsCanvas.tsx` → `DilationsScene.tsx` with fixes

Three changes in one commit: rename, CoordinateGrid geometry disposal, SpriteLabel axis labels, camera center shift from `(6,6)` to `(4,4)`.

**Files:**
- Create: `src/components/modules/dilations/DilationsScene.tsx`
- Delete: `src/components/modules/dilations/DilationsCanvas.tsx`

- [x] **Step 1: Create `DilationsScene.tsx`**

Copy `DilationsCanvas.tsx` in full, rename the component and export, then apply the three fixes below.

**Rename:** `DilationsCanvas` → `DilationsScene`, `DilationsCanvasProps` → `DilationsSceneProps`.

**Fix 1 — Camera center.** In `CameraSetup`, change the center constants:

```typescript
// Before:
const WORLD_CENTER_X = (WORLD_MIN + WORLD_MAX) / 2  // 6
const WORLD_CENTER_Y = (WORLD_MIN + WORLD_MAX) / 2  // 6

// After:
const WORLD_CENTER_X = 4
const WORLD_CENTER_Y = 4
```

**Fix 2 — CoordinateGrid geometry disposal.** Add a `useEffect` cleanup inside `CoordinateGrid`:

```typescript
function CoordinateGrid() {
  const { gridGeometry, axisGeometry } = useMemo(() => {
    // ... existing geometry creation unchanged ...
  }, [])

  // Dispose geometries on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      gridGeometry.dispose()
      axisGeometry.dispose()
    }
  }, [gridGeometry, axisGeometry])

  // ... rest of component unchanged ...
}
```

**Fix 3 — SpriteLabel axis labels.** Add labels at even integers (0, 2, 4, 6, 8, 10, 12) on both axes. Import `SpriteLabel` and add a label group below the existing grid/axis geometry. Labels sit on the axis lines slightly offset so they don't overlap tick marks.

Add this import at the top of `DilationsScene.tsx`:

```typescript
import { SpriteLabel } from './components/SpriteLabel'
```

Add this constant and component after `CoordinateGrid`:

```typescript
const AXIS_LABEL_INTEGERS = [2, 4, 6, 8, 10, 12]

function AxisLabels() {
  return (
    <>
      {/* X-axis labels — positioned below the x-axis */}
      {AXIS_LABEL_INTEGERS.map(n => (
        <SpriteLabel
          key={`x-${n}`}
          text={String(n)}
          position={{ x: n, y: -0.6 }}
          zLayer={0.05}
          color="#7a746a"
          planeWidth={0.55}
        />
      ))}
      {/* Y-axis labels — positioned left of the y-axis */}
      {AXIS_LABEL_INTEGERS.map(n => (
        <SpriteLabel
          key={`y-${n}`}
          text={String(n)}
          position={{ x: -0.6, y: n }}
          zLayer={0.05}
          color="#7a746a"
          planeWidth={0.55}
        />
      ))}
      {/* Origin */}
      <SpriteLabel
        text="0"
        position={{ x: -0.5, y: -0.5 }}
        zLayer={0.05}
        color="#7a746a"
        planeWidth={0.45}
      />
    </>
  )
}
```

In `DilationsScene`, render `<AxisLabels />` inside the Canvas after `<CoordinateGrid />`:

```tsx
export function DilationsScene({ children, coordinatesVisible: _coordinatesVisible, angleLabelsVisible: _angleLabelsVisible }: DilationsSceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <CameraSetup />
      <CoordinateGrid />
      <AxisLabels />
      {children}
    </Canvas>
  )
}
```

- [x] **Step 2: Verify TypeScript accepts it**

```bash
pnpm build
```

Expected: build **fails** with a TypeScript error about the stale `DilationsCanvas` import in `DilationsModule.tsx`. This is expected — do NOT try to fix it here. Proceed directly to Task 6 without committing. Tasks 5 and 6 are committed together in Task 6 Step 3.

- [x] **Step 3: Delete `DilationsCanvas.tsx`**

```bash
rm src/components/modules/dilations/DilationsCanvas.tsx
```

- [x] **Step 4: Start Task 6 immediately** — do not commit yet. The build is broken until Task 6 rewrites `DilationsModule.tsx`. Both tasks are committed together at Task 6 Step 3.

---

## Task 6: Rewire `DilationsModule.tsx`

Replace the raw flex layout and absolute overlays with `ModuleLayout`. This is the core wiring task. Imports `dilations-copy.ts` for prompts and labels, uses `PromptReadout`, `ControlStrip`, `DilationsScene`, and `ScaleFactorDisplay`.

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

- [x] **Step 1: Rewrite `DilationsModule.tsx`**

```typescript
// src/components/modules/dilations/DilationsModule.tsx
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { ModuleProps } from '@/config/modules'
import { useDilationsStage } from './hooks/useDilationsStage'
import { DilationsScene } from './DilationsScene'
import { ModuleLayout } from './Layout'
import { PromptReadout } from './components/PromptReadout'
import { ControlStrip } from './components/ControlStrip'
import { ScaleFactorDisplay } from './components/ScaleFactorDisplay'
import { ScaleFactorScene } from './rounds/ScaleFactorRounds'
import { PHASE_LABELS, PHASE_INTROS, ROUND_PROMPTS } from './dilations-copy'
import { ROUND_CONFIGS } from './utils/constants'

export default function DilationsModule({ onBack }: ModuleProps) {
  const { state, dispatch } = useDilationsStage()
  const { phase, currentRound, roundState } = state
  const config = ROUND_CONFIGS[currentRound]
  const [contextLost, setContextLost] = useState(false)

  const isScaleFactorPhase = phase === 'scale-factor'

  // ── Prompt label derivation ──────────────────────────────────────────────
  const promptLabel = (() => {
    if (roundState === 'entry') return PHASE_LABELS[phase]
    if (roundState === 'reveal') return 'Discovered'
    if (roundState === 'completion') return 'Complete'
    return 'Predict'
  })()

  // ── Prompt text derivation ───────────────────────────────────────────────
  const promptText = (() => {
    if (roundState === 'entry') return PHASE_INTROS[phase] || config.label
    return ROUND_PROMPTS[currentRound] ?? config.label
  })()

  // ── Amber: phase entry and first reveal ──────────────────────────────────
  const amber = roundState === 'entry' && PHASE_INTROS[phase] !== ''

  // ── Formula readout: scale factor in Phase 1 ────────────────────────────
  const formulaReadout = isScaleFactorPhase && config.scaleFactor != null
    ? <div className="px-5 py-2 md:px-4"><ScaleFactorDisplay k={config.scaleFactor} /></div>
    : null

  return (
    <ModuleLayout
      statusStrip={
        <div className="flex items-center w-full pl-2 pr-5 md:pl-4 md:pr-6">
          {/* Left: back chevron */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to module list"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-(--lab-text-muted) transition-colors duration-150 hover:text-(--lab-text) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Title (desktop only) */}
          <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
            Dilations & Similarity
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: phase label */}
          <span className="shrink-0 lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
            {PHASE_LABELS[phase]}
          </span>
        </div>
      }
      prompt={
        <PromptReadout
          label={promptLabel}
          text={promptText}
          amber={amber}
        />
      }
      formulaReadout={formulaReadout}
      visualization={
        <>
          <DilationsScene
            coordinatesVisible={state.coordinatesVisible}
            angleLabelsVisible={state.angleLabelsVisible}
            onContextLost={() => setContextLost(true)}
            onContextRestored={() => setContextLost(false)}
          >
            {isScaleFactorPhase && (
              <ScaleFactorScene
                key={currentRound}
                state={state}
                dispatch={dispatch}
              />
            )}
          </DilationsScene>

          {contextLost && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-(--lab-bg)/90 z-10">
              <span className="lab-silk lab-display-font text-(--lab-text-muted)">
                SYS:REC — Visualization paused
              </span>
              <button
                type="button"
                onClick={() => setContextLost(false)}
                className="min-h-[44px] border border-(--lab-border) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
              >
                Tap to Resume
              </button>
            </div>
          )}
        </>
      }
      controls={
        <ControlStrip state={state} dispatch={dispatch} />
      }
    />
  )
}
```

Note: `DilationsScene` now needs `onContextLost` and `onContextRestored` props to wire the WebGL recovery overlay. Add these to `DilationsSceneProps` in `DilationsScene.tsx`:

```typescript
// Add to DilationsSceneProps in DilationsScene.tsx:
onContextLost?: () => void
onContextRestored?: () => void
```

And add `ContextRecovery` inside the Canvas (copy the pattern from `RigidMotionsScene.tsx` lines 48–73 — it listens for `webglcontextlost` and `webglcontextrestored` events and calls the callbacks).

```typescript
// ContextRecovery component inside DilationsScene.tsx:
function ContextRecovery({
  onContextLost,
  onContextRestored,
}: {
  onContextLost?: () => void
  onContextRestored?: () => void
}) {
  const { gl } = useThree()
  useEffect(() => {
    const canvas = gl.domElement
    const onLost = (e: Event) => {
      ;(e as WebGLContextEvent).preventDefault()
      onContextLost?.()
    }
    const onRestored = () => {
      gl.setSize(canvas.clientWidth, canvas.clientHeight)
      onContextRestored?.()
    }
    const onOrientationChange = () => {
      requestAnimationFrame(() => {
        gl.setSize(canvas.clientWidth, canvas.clientHeight, false)
      })
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    window.addEventListener('orientationchange', onOrientationChange)
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      window.removeEventListener('orientationchange', onOrientationChange)
    }
  }, [gl, onContextLost, onContextRestored])
  return null
}
```

Pass it inside the Canvas in `DilationsScene`:

```tsx
<Canvas ...>
  <ContextRecovery onContextLost={onContextLost} onContextRestored={onContextRestored} />
  <CameraSetup />
  <CoordinateGrid />
  <AxisLabels />
  {children}
</Canvas>
```

Also add the missing import in `DilationsScene.tsx`:

```typescript
import { useThree } from '@react-three/fiber'
```

- [x] **Step 2: Verify TypeScript accepts it**

```bash
pnpm build
```

Expected: TypeScript may flag missing `onContextLost`/`onContextRestored` props on `DilationsSceneProps` if not yet added — add them now if needed. Build should pass once props are in sync.

- [x] **Step 3: Commit Tasks 5 + 6 together** (since Task 5 deleted `DilationsCanvas.tsx` which this task's import change resolves)

```bash
git add src/components/modules/dilations/DilationsScene.tsx
git add src/components/modules/dilations/DilationsModule.tsx
git rm src/components/modules/dilations/DilationsCanvas.tsx
git commit -m "feat(dilations): wire ModuleLayout — rename DilationsScene, fix CoordinateGrid, add axis labels"
```

---

## Task 7: Delete `DilationsHUD.tsx` and remove `ScaleFactorHUD` from `ScaleFactorRounds.tsx`

**Files:**
- Delete: `src/components/modules/dilations/DilationsHUD.tsx`
- Modify: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`

- [x] **Step 1: Verify `DilationsHUD.tsx` is no longer imported anywhere**

```bash
grep -r "DilationsHUD" src/
```

Expected: no results (the import was removed in Task 6). If any remain, remove them before deleting the file.

- [x] **Step 2: Delete `DilationsHUD.tsx`**

```bash
git rm src/components/modules/dilations/DilationsHUD.tsx
```

- [x] **Step 3: Remove `ScaleFactorHUD` from `ScaleFactorRounds.tsx`**

In `ScaleFactorRounds.tsx`, delete the entire `ScaleFactorHUD` block (lines 18–29 — the `// ─── ScaleFactorHUD` comment and the exported function). The `ScaleFactorDisplay` import on line 13 stays (it's still used by the `formulaReadout` slot via `DilationsModule.tsx`).

After deletion, `ScaleFactorRounds.tsx` exports only: `ScaleFactorScene`.

- [x] **Step 4: Verify `ScaleFactorHUD` is no longer imported anywhere**

```bash
grep -r "ScaleFactorHUD" src/
```

Expected: no results.

- [x] **Step 5: Full build**

```bash
pnpm build
```

Expected: PASS with zero TypeScript errors.

- [x] **Step 6: Commit**

```bash
git add src/components/modules/dilations/rounds/ScaleFactorRounds.tsx
git rm src/components/modules/dilations/DilationsHUD.tsx
git commit -m "chore(dilations): delete DilationsHUD, remove ScaleFactorHUD export"
```

---

## Task 8: Final verification

- [x] **Step 1: Run all dilations tests**

```bash
pnpm vitest run src/components/modules/dilations
```

Expected: all tests pass (existing 3 test files + new `dilations-copy.test.ts` = 4 files).

- [x] **Step 2: Full production build**

```bash
pnpm build
```

Expected: PASS — zero TypeScript errors, zero unused locals.

- [x] **Step 3: Start dev server and verify the module visually**

```bash
pnpm dev
```

Open `http://localhost:5173`, navigate to the Dilations module. Verify:
- Status strip: back chevron (left) + "Dilations & Similarity" (desktop) + phase label (right)
- Scene: coordinate grid with axis labels at 0, 2, 4, 6, 8, 10, 12; origin at (0,0) clearly visible; content centered around (4,4)
- Prompt area: shows round prompt text
- Formula strip: shows "k = 2" scale factor display for Phase 1 prediction rounds
- Controls: CONTINUE on first load (entry state) → REVEAL after dropping ghost → NEXT after reveal completes
- Portrait: controls panel below scene, capped at 60dvh
- Landscape: scene left (flex-3), controls panel right (flex-2)

- [x] **Step 4: Final commit (if any cleanup needed after visual review)**

```bash
git add -p
git commit -m "fix(dilations): layout refinement visual tweaks"
```
