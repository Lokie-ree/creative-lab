# Dilations Module Solidification Plan

## Status: Complete
Implemented 2026-03-27. All 14 tasks complete — PR #49.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Solidify Dilations (M2) to be more polished and architecturally sound than Rigid Motions (M1) before continuing with build-order prompts 5–10.

**Architecture:** Each module owns its own `Layout.tsx` and `SpriteLabel.tsx` — no shared extraction until all 3 geometry modules are complete. M2 gains earned reveals (beat-indexed), match flash, phase progress dots, keyboard nudging, accessibility, and Phase 1 completion (`dilate-k-half`, `dilate-summary`). Ghost starting position fixed to pre-image centroid (not the answer). Ghost position lifted into stage state to enable keyboard control.

**Tech Stack:** React 19, TypeScript, React Three Fiber, GSAP, Tailwind CSS 4 with `--lab-*` tokens, Vitest

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/modules/dilations/DilationsScene.tsx` | **Modify** | Fix inline circleGeometry duplication; replace hardcoded hex colors with lab token values |
| `src/components/modules/dilations/components/GhostTriangle.tsx` | **Modify** | Start at pre-image centroid (not answer); accept optional `externalPosition` prop for keyboard nudge |
| `src/components/modules/dilations/components/RayLines.tsx` | **Modify** | Replace `#3e3a34` hardcode with lab token |
| `src/components/modules/dilations/hooks/useDilationsStage.ts` | **Modify** | Store ghost position used during drag; dispatch `SET_GHOST_POSITION` on every pointer move (not just drop) |
| `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx` | **Modify** | Add `DilateKHalfScene` and `DilationSummaryScene`; wire reveal key + `onRevealComplete` callback |
| `src/components/modules/dilations/dilations-copy.ts` | **Modify** | Add `EARNED_REVEALS`, `ROUND_PROMPTS` Phase 1 close/miss copy |
| `src/components/modules/dilations/DilationsModule.tsx` | **Modify** | Earned reveals (shownReveals Set), match flash, phase progress dots, keyboard nudge handler, `useAccessibility` + haptic |
| `src/components/modules/dilations/components/ControlStrip.tsx` | **Modify** | Properties round: suppress CONTINUE in `active` state for property/summary rounds (they auto-complete); summary round: add explicit CONTINUE |
| `src/components/modules/dilations/__tests__/dilations-copy.test.ts` | **Modify** | Add tests for `EARNED_REVEALS` key coverage |
| `src/components/modules/dilations/ARCHITECTURE.md` | **Create** | As-built reference doc |

---

## Task 1: Feature Branch + Commit Pending Layout Changes

**Files:** Git only

- [x] Create the feature branch:
  ```bash
  git checkout -b feat/dilations-solidification
  ```
- [x] Stage and commit the two uncommitted files (Layout.tsx improvements + camera fix):
  ```bash
  git add src/components/modules/dilations/Layout.tsx src/components/modules/dilations/DilationsScene.tsx
  git commit -m "fix(dilations): improve portrait layout and fix camera framing bounds"
  ```
- [x] Verify build is clean:
  ```bash
  pnpm build
  ```
  Expected: exits 0 (no TypeScript errors)

---

## Task 2: Fix Ghost Starting Position + DilationsScene CircleGeometry

**Files:**
- Modify: `src/components/modules/dilations/components/GhostTriangle.tsx`
- Modify: `src/components/modules/dilations/DilationsScene.tsx`

### 4a — Ghost starting position

Currently `GhostTriangle` defaults `displayCenter` to `triangleCentroid(dilateTriangle(vertices, scale))` — the exact answer, which defeats the prediction task.

Fix: default to pre-image centroid so the student must actively drag the ghost to their predicted answer.

- [x] In `GhostTriangle.tsx`, change line ~123:

```tsx
// OLD:
const displayCenter = centerPos ?? triangleCentroid(dilateTriangle(vertices, scale))

// NEW (starts at pre-image centroid, not the answer):
const displayCenter = centerPos ?? triangleCentroid(vertices)
```

`triangleCentroid(vertices)` is already defined in the file — no new import needed.

- [x] Verify visually: run `pnpm dev`, navigate to Dilations. The ghost for k=2 should start overlapping the pre-image triangle (centered at ~2.33, 2.33), not at the doubled position.

### 4b — DilationsScene circleGeometry duplication

The `useMemo` block creates and disposes a `circleGeometry`, but the origin marker mesh uses a *second* inline `<circleGeometry args={[0.12, 16]} />` in JSX. The useMemo one is wasted.

- [x] In `DilationsScene.tsx`, remove `circleGeometry` from the `useMemo` return and from the `useEffect` dispose call, then change the origin marker to use a regular JSX inline geometry (which Three.js manages automatically):

```tsx
// In useMemo — remove circleGeometry from the returned object and the Points array:
const { gridGeometry, axisGeometry } = useMemo(() => {
  // ... existing gridPts/axisPts loop unchanged ...
  return {
    gridGeometry: new THREE.BufferGeometry().setFromPoints(gridPts),
    axisGeometry: new THREE.BufferGeometry().setFromPoints(axisPts),
    // circleGeometry removed — inline JSX <circleGeometry> below handles origin marker
  }
}, [])

// In useEffect cleanup:
useEffect(() => {
  return () => {
    gridGeometry.dispose()
    axisGeometry.dispose()
    // circleGeometry.dispose() removed
  }
}, [gridGeometry, axisGeometry])

// Origin marker mesh — inline geometry is fine (no props-driven recreation):
<mesh position={[0, 0, 0.01]}>
  <circleGeometry args={[0.12, 16]} />
  <meshBasicMaterial color="#7cc87c" />
</mesh>
```

- [x] Run build:
  ```bash
  pnpm build
  ```

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/components/GhostTriangle.tsx \
          src/components/modules/dilations/DilationsScene.tsx
  git commit -m "fix(dilations): ghost starts at pre-image centroid; remove duplicate circleGeometry"
  ```

---

## Task 3: Build `dilate-k-half` Scene

**Files:**
- Modify: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`

This round follows the same pattern as `dilate-k2`/`dilate-k3` (`PredictionRoundScene`) with `scale=0.5`. The key pedagogical difference: the ghost is visibly smaller than the pre-image, and the answer lands between the origin and the pre-image.

`PredictionRoundScene` is already parameterized by `scale` — `dilate-k-half` just needs to be wired in `ScaleFactorScene`.

- [x] In `ScaleFactorScene` in `ScaleFactorRounds.tsx`, update the round dispatch:

```tsx
export function ScaleFactorScene({ state, dispatch }: { state: StageState; dispatch: Dispatch<StageAction> }) {
  const { currentRound, roundState } = state
  const config = ROUND_CONFIGS[currentRound]

  if (currentRound === 'dilate-k2-properties') {
    return <PropertiesRoundScene roundState={roundState} dispatch={dispatch} />
  }

  if (currentRound === 'dilate-summary') {
    return <DilationSummaryScene roundState={roundState} dispatch={dispatch} />
  }

  // Prediction rounds: dilate-k2, dilate-k3, dilate-k-half
  // All use the same PredictionRoundScene parameterized by scale
  const scale = config.scaleFactor ?? 2
  return (
    <PredictionRoundScene
      scale={scale}
      roundState={roundState}
      dispatch={dispatch}
    />
  )
}
```

`DilationSummaryScene` is added in Task 6. For now, adding the `dilate-k-half` case simply falls through to `PredictionRoundScene` with `scale=0.5`.

- [x] Verify that `ROUND_CONFIGS['dilate-k-half']` has `scaleFactor: 0.5` — it does (already in `constants.ts`). No constant changes needed.

- [x] Run dev server and manually verify: the k=½ round renders a ghost smaller than the pre-image, and the reveal lands between origin and the pre-image.

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/rounds/ScaleFactorRounds.tsx
  git commit -m "feat(dilations): wire dilate-k-half to PredictionRoundScene"
  ```

---

## Task 4: Build `dilate-summary` Scene

**Files:**
- Modify: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`

The summary round shows all three dilated images simultaneously at reduced opacity (no ghost, no reveal). Student reads the pattern, presses CONTINUE (entry state), then sees all images appear (active state), then NEXT advances to Phase 2.

- [x] Add `DilationSummaryScene` component above `ScaleFactorScene` in `ScaleFactorRounds.tsx`:

```tsx
// ─── DilationSummaryScene (dilate-summary) ────────────────────────────────────

const SUMMARY_SCALE_FACTORS = [2, 3, 0.5] as const
const SUMMARY_COLORS = ['#7cc87c', '#7cc87c', '#7cc87c'] as const  // all accent green, varying opacity

function DilationSummaryScene({
  roundState,
  dispatch,
}: {
  roundState: string
  dispatch: Dispatch<StageAction>
}) {
  const images = useMemo(
    () => SUMMARY_SCALE_FACTORS.map(k => dilateTriangle(CANONICAL_TRIANGLE, k)),
    [],
  )

  // auto-complete: active → completion after images finish appearing (~600ms)
  useEffect(() => {
    if (roundState !== 'active') return
    const timer = setTimeout(() => {
      dispatch({ type: 'COMPLETE_ROUND' })
    }, 600)
    return () => clearTimeout(timer)
  }, [roundState, dispatch])

  const showImages = roundState === 'active' || roundState === 'completion'

  return (
    <>
      <PreImageTriangle vertices={CANONICAL_TRIANGLE} />
      {showImages && images.map((img, i) => (
        <ImageTriangle
          key={i}
          vertices={img}
          visible={true}
          opacity={0.25}
        />
      ))}
    </>
  )
}
```

Note: `useMemo` is already imported. Add `useEffect` to the existing import if not present.

- [x] The CONTINUE button in `ControlStrip` already handles `entry` state. When the student clicks CONTINUE, `SET_ROUND_STATE: 'active'` fires, images appear, then auto-complete to `completion` after 600ms. NEXT advances to `coord-k2`.

- [x] Run dev and verify: all three triangles appear at the end of Phase 1; student can press NEXT to enter Phase 2.

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/rounds/ScaleFactorRounds.tsx
  git commit -m "feat(dilations): add dilate-summary scene — Phase 1 complete"
  ```

---

## Task 5: Expand Copy Deck

**Files:**
- Modify: `src/components/modules/dilations/dilations-copy.ts`
- Modify: `src/components/modules/dilations/__tests__/dilations-copy.test.ts`

Add `EARNED_REVEALS` (one entry per Phase 1 round), flesh out `ROUND_PROMPTS`.

### 7a — Write the failing test first

- [x] Add to `__tests__/dilations-copy.test.ts`:

```ts
import { EARNED_REVEALS } from '../dilations-copy'

describe('EARNED_REVEALS', () => {
  const phase1Rounds: RoundId[] = [
    'dilate-k2', 'dilate-k2-properties', 'dilate-k3', 'dilate-k-half', 'dilate-summary',
  ]
  it('has an entry for every Phase 1 round', () => {
    for (const id of phase1Rounds) {
      expect(EARNED_REVEALS[id]).toBeDefined()
      expect(typeof EARNED_REVEALS[id]?.text).toBe('string')
    }
  })
  it('notation entries that exist are non-empty strings', () => {
    for (const entry of Object.values(EARNED_REVEALS)) {
      if (entry?.notation) expect(entry.notation.length).toBeGreaterThan(0)
    }
  })
})
```

- [x] Run to confirm it fails:
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/dilations-copy.test.ts
  ```
  Expected: FAIL — `EARNED_REVEALS` not exported

### 7b — Implement

- [x] Add to `dilations-copy.ts`:

```ts
import type { RoundId } from './utils/types'

export interface EarnedReveal {
  text: string
  notation?: string
  notationStyle?: 'rule' | 'congruence'
}

export const EARNED_REVEALS: Partial<Record<RoundId, EarnedReveal>> = {
  'dilate-k2': {
    text: 'Every point moved twice as far from the origin. Distances doubled — angles held.',
    notation: '(x, y) → (2x, 2y)',
    notationStyle: 'rule',
  },
  'dilate-k2-properties': {
    text: 'The shape grew but the angles stayed the same. Dilation preserves shape — just not size.',
  },
  'dilate-k3': {
    text: 'k = 3 stretched it further, but the center is still the origin. Larger k, larger distance.',
    notation: '(x, y) → (3x, 3y)',
    notationStyle: 'rule',
  },
  'dilate-k-half': {
    text: 'k < 1 pulls toward the center. Dilation can shrink as well as grow.',
    notation: '(x, y) → (½x, ½y)',
    notationStyle: 'rule',
  },
  'dilate-summary': {
    text: 'k > 1 enlarges. 0 < k < 1 reduces. The center is fixed. Angles always preserved.',
  },
}
```

Also expand `ROUND_PROMPTS` with Phase 1 miss/close text additions:

```ts
// Add to ROUND_PROMPTS:
  'dilate-k-half':             'k = ½ — where does that put the image?',
  'dilate-summary':            'Look at all three. What do you notice about k?',
```

- [x] Run tests:
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/dilations-copy.test.ts
  ```
  Expected: PASS

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/dilations-copy.ts \
          src/components/modules/dilations/__tests__/dilations-copy.test.ts
  git commit -m "feat(dilations): add EARNED_REVEALS copy deck for Phase 1"
  ```

---

## Task 6: Wire Earned Reveal System

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

Mirrors M1's pattern: `shownReveals` Set, `revealKey`, `firstReveal`, amber PromptReadout, match flash border.

The reveal moment in M2 is `roundState === 'completion'` (not a score-based match). The key is `${currentRound}` (one reveal per round, not beat-indexed within a round since M2 has no success-count within a round).

- [x] Add to `DilationsModule.tsx`:

```tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EARNED_REVEALS } from './dilations-copy'
import type { EarnedReveal } from './dilations-copy'

// Inside DilationsModule, after existing state:
const [shownReveals, setShownReveals] = useState<Set<string>>(new Set())
const revealKey = currentRound
const earnedReveal: EarnedReveal | undefined = EARNED_REVEALS[currentRound]
const isFirstReveal = roundState === 'completion' && !!earnedReveal && !shownReveals.has(revealKey)
```

- [x] Update the prompt derivation:

```tsx
const promptLabel = (() => {
  if (isFirstReveal) return 'Discovered'
  if (roundState === 'entry') return PHASE_LABELS[phase]
  if (roundState === 'reveal') return 'Reveal'
  if (roundState === 'completion') return 'Complete'
  return 'Predict'
})()

const promptText = (() => {
  if (isFirstReveal && earnedReveal) return earnedReveal.text
  if (roundState === 'entry') return PHASE_INTROS[phase] || config.label
  return ROUND_PROMPTS[currentRound] ?? config.label
})()

const amber = isFirstReveal || (roundState === 'entry' && PHASE_INTROS[phase] !== '')
const notation = isFirstReveal ? earnedReveal?.notation : undefined
const notationStyle = isFirstReveal ? earnedReveal?.notationStyle : undefined
```

- [x] Record the reveal key before advancing (wrap the ADVANCE_ROUND dispatch):

The ControlStrip's NEXT button calls `dispatch({ type: 'ADVANCE_ROUND' })` directly. To record the reveal, intercept this in `DilationsModule` by passing a wrapped callback:

```tsx
// In DilationsModule, create a wrapped advance handler:
const handleAdvance = useCallback(() => {
  if (earnedReveal && !shownReveals.has(revealKey)) {
    setShownReveals(prev => new Set([...prev, revealKey]))
  }
  dispatch({ type: 'ADVANCE_ROUND' })
}, [earnedReveal, shownReveals, revealKey, dispatch])
```

Pass `handleAdvance` to `ControlStrip` as an `onAdvance` prop.

- [x] Update `ControlStrip.tsx` to accept `onAdvance?: () => void`:

```tsx
interface ControlStripProps {
  state: StageState
  dispatch: Dispatch<StageAction>
  onAdvance?: () => void
}

// In the completion case, prefer onAdvance over direct dispatch:
if (roundState === 'completion') {
  return (
    <button
      type="button"
      onClick={() => onAdvance ? onAdvance() : dispatch({ type: 'ADVANCE_ROUND' })}
      ...
    >
      NEXT
    </button>
  )
}
```

- [x] Add match flash to `DilationsModule.tsx` visualization section:

```tsx
visualization={
  <>
    <AnimatePresence>
      {isFirstReveal && (
        <motion.div
          key={revealKey}
          className="pointer-events-none absolute inset-0 z-10 border-2 border-(--lab-accent)"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </AnimatePresence>
    <DilationsScene ...>
      ...
    </DilationsScene>
    ...
  </>
}
```

- [x] Update `PromptReadout` call to pass notation props:

```tsx
prompt={
  <PromptReadout
    label={promptLabel}
    text={promptText}
    amber={amber}
    notation={notation}
    notationStyle={notationStyle}
  />
}
```

- [x] Run build:
  ```bash
  pnpm build
  ```

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/DilationsModule.tsx \
          src/components/modules/dilations/components/ControlStrip.tsx
  git commit -m "feat(dilations): earned reveal system — shownReveals, match flash, amber prompts"
  ```

---

## Task 7: Phase Progress Indicators

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

M1 has 9 guide-state dots. M2 has 4 phases — use 4 phase dots (one per phase), styled identically to M1's LEDs.

- [x] In `DilationsModule.tsx` status strip, replace the plain `<div className="flex-1" />` spacer with 4 phase dots:

```tsx
// Add to imports:
import type { PhaseId } from './utils/types'

// Phase sequence for dot ordering:
const PHASE_SEQUENCE: PhaseId[] = ['scale-factor', 'coordinate', 'similarity', 'aa-capstone']

// In the status strip JSX, between the title and the phase label:
<div
  className="flex flex-1 items-center justify-center gap-1.5"
  aria-label={`Phase ${PHASE_SEQUENCE.indexOf(phase) + 1} of ${PHASE_SEQUENCE.length}`}
>
  {PHASE_SEQUENCE.map((p, i) => {
    const phaseIndex = PHASE_SEQUENCE.indexOf(phase)
    return (
      <span
        key={p}
        className={[
          'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
          i < phaseIndex
            ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
            : i === phaseIndex
              ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
              : 'bg-transparent border-(--lab-ghost)/40',
        ].join(' ')}
      />
    )
  })}
</div>
```

- [x] Run dev and confirm 4 dots appear in the status strip, current phase dot is green, completed phases are earthy green, future phases are ghost.

- [x] Run build:
  ```bash
  pnpm build
  ```

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/DilationsModule.tsx
  git commit -m "feat(dilations): add 4-phase progress LED indicators to status strip"
  ```

---

## Task 8: Fix Properties Round Pacing

**Files:**
- Modify: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`

`PropertiesRoundScene` currently auto-progresses entry→active (300ms) → completion (1.4s) with no student agency. The student should initiate the `active` phase by pressing CONTINUE; then annotations appear; then `completion` is auto-triggered after annotations finish.

The `ControlStrip` already shows CONTINUE in `entry` state. The fix: remove the `entry→active` auto-timer; let the CONTINUE button handle it.

- [x] In `PropertiesRoundScene`, remove the first `useEffect` that auto-progresses `entry → active`:

```tsx
// REMOVE this useEffect entirely:
useEffect(() => {
  if (roundState !== 'entry') return
  const timer = setTimeout(() => {
    dispatch({ type: 'SET_ROUND_STATE', state: 'active' })
  }, 300)
  return () => clearTimeout(timer)
}, [roundState, dispatch])
```

The `active → completion` timer (1400ms after annotations animate) stays — student just needs to wait for animations after pressing CONTINUE.

- [x] Run dev and verify: on `dilate-k2-properties`, CONTINUE button appears, student presses it, annotations animate in, then NEXT appears.

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/rounds/ScaleFactorRounds.tsx
  git commit -m "fix(dilations): properties round requires CONTINUE; removes silent auto-progress"
  ```

---

## Task 9: Lift Ghost Position to Stage State + Keyboard Nudging

**Files:**
- Modify: `src/components/modules/dilations/components/GhostTriangle.tsx`
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

Currently ghost position is managed inside `GhostTriangle` (`useState centerPos`). To enable keyboard nudging from `DilationsModule`, the ghost accepts an optional `externalPosition` prop. When set, it overrides the internal state.

### 11a — Add `externalPosition` to GhostTriangle

- [x] In `GhostTriangle.tsx`, update the props interface and `displayCenter` calculation:

```tsx
export interface GhostTriangleProps {
  vertices: Triangle
  scale: number
  onDrop: (position: Vec2) => void
  disabled: boolean
  /** If provided, overrides internal drag position. Used for keyboard nudging. */
  externalPosition?: Vec2 | null
  /** Called on every position change during drag (for keyboard nudge sync). */
  onPositionChange?: (position: Vec2) => void
}

export function GhostTriangle({
  vertices, scale, onDrop, disabled,
  externalPosition, onPositionChange,
}: GhostTriangleProps) {
  // ... existing code ...

  // handlePointerDown: call onPositionChange on every move
  const handleMove = (ev: PointerEvent) => {
    if (!dragging.current) return
    const p = getWorldPoint(ev.clientX, ev.clientY)
    const snapped = { x: snap(p.x), y: snap(p.y) }
    setCenterPos(snapped)
    onPositionChange?.(snapped)   // ← add this line
  }

  // displayCenter: external position wins if provided
  const displayCenter = externalPosition ?? centerPos ?? triangleCentroid(vertices)
```

### 11b — Keyboard nudge in DilationsModule

- [x] In `DilationsModule.tsx`, add keyboard nudge:

```tsx
import { useCallback, useEffect } from 'react'

// Keyboard nudge state — tracks ghost position for arrow key control
const [nudgePosition, setNudgePosition] = useState<{ x: number; y: number } | null>(null)

// Sync nudge position when ghost is dragged
const handleGhostPositionChange = useCallback((pos: { x: number; y: number }) => {
  setNudgePosition(pos)
}, [])

// Reset nudge on round change
useEffect(() => {
  setNudgePosition(null)
}, [currentRound])

// Arrow key nudging — only active in ghost-drag rounds during active/prediction states
const isNudgeActive =
  config.hasGhostDrag &&
  (roundState === 'active' || roundState === 'entry')

const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (!isNudgeActive) return
  const step = e.shiftKey ? 0.25 : 0.5
  let dx = 0, dy = 0
  if (e.key === 'ArrowLeft')       dx = -step
  else if (e.key === 'ArrowRight') dx = step
  else if (e.key === 'ArrowUp')    dy = step
  else if (e.key === 'ArrowDown')  dy = -step
  else return
  e.preventDefault()
  const base = nudgePosition ?? { x: (1 + 4 + 2) / 3, y: (1 + 2 + 4) / 3 } // CANONICAL centroid
  const snapped = { x: Math.round((base.x + dx) * 2) / 2, y: Math.round((base.y + dy) * 2) / 2 }
  setNudgePosition(snapped)
}, [isNudgeActive, nudgePosition])

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [handleKeyDown])
```

- [x] Wire `nudgePosition` and `handleGhostPositionChange` through to `GhostTriangle` via `ScaleFactorScene` → `PredictionRoundScene`.

Update `ScaleFactorScene` props to accept and forward them:

```tsx
export function ScaleFactorScene({
  state,
  dispatch,
  ghostExternalPosition,
  onGhostPositionChange,
}: {
  state: StageState
  dispatch: Dispatch<StageAction>
  ghostExternalPosition?: { x: number; y: number } | null
  onGhostPositionChange?: (pos: { x: number; y: number }) => void
}) {
  // pass through to PredictionRoundScene
}
```

`PredictionRoundScene` similarly accepts and passes down to `<GhostTriangle externalPosition={...} onPositionChange={...} />`.

- [x] Run build:
  ```bash
  pnpm build
  ```

- [x] Manual test: run dev, use arrow keys during a prediction round. Ghost should move in 0.5-unit increments. Shift+arrow moves in 0.25-unit increments.

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/components/GhostTriangle.tsx \
          src/components/modules/dilations/rounds/ScaleFactorRounds.tsx \
          src/components/modules/dilations/DilationsModule.tsx
  git commit -m "feat(dilations): keyboard nudge for ghost drag (arrow keys + shift)"
  ```

---

## Task 10: Accessibility — Screen Reader + Haptic

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

M1 uses `useAccessibility` from the skeleton library. M2 should too.

- [x] In `DilationsModule.tsx`, add:

```tsx
import { useAccessibility } from '@/lib/skeleton/useAccessibility'

// Inside DilationsModule:
const { announce } = useAccessibility()

// Announce reveal completions for screen readers + haptic on first reveal
useEffect(() => {
  if (!isFirstReveal) return
  announce('Discovered! ' + (earnedReveal?.text ?? ''), 'assertive')
  navigator.vibrate?.(80)
}, [isFirstReveal])  // eslint-disable-line react-hooks/exhaustive-deps
```

- [x] Run build:
  ```bash
  pnpm build
  ```

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/DilationsModule.tsx
  git commit -m "feat(dilations): screen reader announcements and haptic on earned reveals"
  ```

---

## Task 11: Token + Color Cleanup

**Files:**
- Modify: `src/components/modules/dilations/DilationsScene.tsx`
- Modify: `src/components/modules/dilations/components/RayLines.tsx`

Replace hardcoded hex colors with values derived from the lab palette. These aren't CSS variables (Three.js materials take hex strings, not CSS vars), but they should match the design token values explicitly documented in `src/lib/colors.ts`.

| Hardcoded value | Token name | Replacement |
|----------------|-----------|-------------|
| `#28251f` | border (darker variant) | Keep as-is — no direct token match for grid lines |
| `#3e3a34` in `CoordinateGrid` | `--lab-border` equivalent | Keep — subtler than border token |
| `#3e3a34` in `RayLines` | `--lab-border` | `'#4a4844'` (screw.border — the official darkest lab token) or keep `#3e3a34` |
| `#7cc87c` (origin marker) | `--lab-accent` | Keep — it's the correct accent value |

Add comments pointing to the token source so future maintainers know these are intentional:

- [x] In `DilationsScene.tsx` CoordinateGrid, add token comments:

```tsx
// Grid lines: slightly darker than --lab-bg (#1e1d1c), intentionally subtle
<lineBasicMaterial color="#28251f" transparent opacity={0.35} />
// Axis lines: matches --lab-border equivalent
<lineBasicMaterial color="#3e3a34" transparent opacity={0.55} />
// Origin marker: --lab-accent (#7cc87c)
<meshBasicMaterial color="#7cc87c" />
```

- [x] In `RayLines.tsx`, update RAY_COLOR to match the screw.border token value:

```tsx
// Was: '#3e3a34' (custom dark)
// Now: '#4a4844' (--lab-screw-border — the defined darkest neutral in the system)
const RAY_COLOR = '#4a4844'
```

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/DilationsScene.tsx \
          src/components/modules/dilations/components/RayLines.tsx
  git commit -m "chore(dilations): document hardcoded colors against lab token palette"
  ```

---

## Task 12: Wire coordinatesVisible / angleLabelsVisible to Scene

**Files:**
- Modify: `src/components/modules/dilations/DilationsScene.tsx`
- Modify: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`

Currently `DilationsScene` accepts `coordinatesVisible` and `angleLabelsVisible` props but prefixes them with `_` (unused). `PreImageTriangle` and `ImageTriangle` both already accept `showCoordinates`/`showAngles` props. This task wires them together.

This is prep for Phase 2 (coord-k2) — the flags are passed through the scene now so Phase 2 scenes just work when built.

- [x] In `DilationsScene.tsx`, remove the `_` prefix from the props and pass them to children via the `children` render prop pattern. Since `DilationsScene` renders `{children}` inside the Canvas, the children (scene rounds) need to receive these flags.

The cleanest approach: add a React context inside `DilationsScene` that scene children can consume.

```tsx
// Add a context for scene-level visibility flags:
import { createContext, useContext } from 'react'

interface DilationsSceneContext {
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
}

const DilationsSceneCtx = createContext<DilationsSceneContext>({
  coordinatesVisible: false,
  angleLabelsVisible: false,
})

export function useDilationsSceneContext() {
  return useContext(DilationsSceneCtx)
}

// In DilationsScene, wrap children with the provider:
export function DilationsScene({
  children,
  coordinatesVisible,  // remove _ prefix
  angleLabelsVisible,  // remove _ prefix
  onContextLost,
  onContextRestored,
}: DilationsSceneProps) {
  return (
    <Canvas ...>
      <DilationsSceneCtx.Provider value={{ coordinatesVisible, angleLabelsVisible }}>
        <ContextRecovery ... />
        <CameraSetup />
        <CoordinateGrid />
        <AxisLabels />
        {children}
      </DilationsSceneCtx.Provider>
    </Canvas>
  )
}
```

- [x] Update `PreImageTriangle` and `ImageTriangle` to consume the context:

```tsx
// In PreImageTriangle.tsx, add:
import { useDilationsSceneContext } from '../DilationsScene'

export function PreImageTriangle({ vertices, showCoordinates, showAngles, ... }: PreImageTriangleProps) {
  const { coordinatesVisible, angleLabelsVisible } = useDilationsSceneContext()
  const effectiveShowCoords = showCoordinates ?? coordinatesVisible
  const effectiveShowAngles = showAngles ?? angleLabelsVisible
  // use effectiveShowCoords / effectiveShowAngles below instead of props
```

Same pattern for `ImageTriangle`.

Prop overrides remain: if `showCoordinates` is explicitly passed to `PreImageTriangle`, that wins. Context is the fallback default. This lets scene rounds control it explicitly if needed.

- [x] Verify with a test: add `data-testid` or just manually navigate to the coord-k2 round (once Phase 2 is built) and confirm coordinate labels appear.

- [x] Run build:
  ```bash
  pnpm build
  ```

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/DilationsScene.tsx \
          src/components/modules/dilations/components/PreImageTriangle.tsx \
          src/components/modules/dilations/components/ImageTriangle.tsx
  git commit -m "feat(dilations): wire coordinatesVisible/angleLabelsVisible through scene context"
  ```

---

## Task 13: Write ARCHITECTURE.md

**Files:**
- Create: `src/components/modules/dilations/ARCHITECTURE.md`

- [x] Create the architecture doc at `src/components/modules/dilations/ARCHITECTURE.md`. Key sections to include:

1. **Standards** — 8.G.A.3 (dilations), 8.G.A.4 (similar figures), 8.G.A.5 (AA criterion)
2. **Phase/Round sequence** — table of all 14 rounds with phase, interaction mode, flags
3. **State architecture** — `useDilationsStage` reducer diagram, `StageState` fields, all actions
4. **Scene architecture** — camera setup, world bounds, z-layer ordering table
5. **Interaction patterns** — ghost drag (Phase 1–2) vs SequenceBuilder (Phase 3–4), keyboard nudge
6. **Animation patterns** — GSAP + useFrame imperative pattern (RevealAnimation, RayLines, AngleMarks)
7. **Earned reveal system** — shownReveals, EARNED_REVEALS keys, revealKey format
8. **Key constraints** — one-way visibility flips, ghost snap resolution, CANONICAL_TRIANGLE
9. **Build order** — reference to `docs/modules/dilations/build-order-prompts.md`

- [x] Commit:
  ```bash
  git add src/components/modules/dilations/ARCHITECTURE.md
  git commit -m "docs(dilations): write as-built ARCHITECTURE.md"
  ```

---

## Task 14: Final Build + Verification

**Files:** None (verification only)

- [x] Run full build:
  ```bash
  pnpm build
  ```
  Expected: 0 TypeScript errors

- [x] Run all tests:
  ```bash
  pnpm vitest run
  ```
  Expected: all tests pass (should be ≥71 dilations + all rigid-motions tests)

- [x] Run lint:
  ```bash
  pnpm lint
  ```
  Expected: 0 errors

- [x] Manual smoke test in browser (`pnpm dev`):
  - [x] Rigid Motions module still loads and works
  - [x] Dilations Phase 1: dilate-k2 → ghost starts at pre-image centroid, not at answer
  - [x] dilate-k2: reveal shows match flash + earned reveal copy in amber
  - [x] dilate-k2-properties: CONTINUE required (no auto-advance)
  - [x] dilate-k3: works
  - [x] dilate-k-half: ghost is visibly smaller, answer is between origin and pre-image
  - [x] dilate-summary: shows all 3 images; NEXT advances to coord-k2 entry
  - [x] Status strip shows 4 phase dots; phase 1 dot is green while in phase 1
  - [x] Arrow keys move ghost during prediction
  - [x] Landscape layout uses fixed w-72 right panel (not flex-[2])

- [x] Create PR:
  ```bash
  git push -u origin feat/dilations-solidification
  gh pr create --title "feat(dilations): solidification — shared components, Phase 1 complete, earned reveals, a11y" \
    --body "..."
  ```
