# Dilations Phase 3 — Similarity Sequences Implementation Plan

## Status: Complete
> Implemented 2026-03-31. Merged as PR #56 (similarity sequences: 3 rounds, SequenceBuilder, SequencePreview, similarityTasks.ts).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 3 similarity rounds where students compose rigid motions + dilation via a SequenceBuilder to map similar figures.

**Architecture:** New `SimilarityRounds.tsx` renders as a child of `DilationsScene` (same pattern as `ScaleFactorRounds.tsx` and `CoordinateRounds.tsx`). A new `SequenceBuilder.tsx` HTML panel replaces `ControlStrip` during similarity rounds. Validation is result-only via existing `composeTriangle` + `trianglesMatch`.

**Tech Stack:** React 19, TypeScript, React Three Fiber, Tailwind CSS 4 with `--lab-*` tokens, Vitest

**Spec:** `docs/superpowers/specs/2026-03-31-dilations-phase3-similarity-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `utils/similarityTasks.ts` | Exists | 3 task objects with pre-computed targets |
| `utils/types.ts` | Done | Stale types removed |
| `hooks/useDilationsStage.ts` | Done | `UPDATE_SEQUENCE_STEP` added |
| `rounds/SimilarityRounds.tsx` | **Create** | R3F scene: pre-image, target, preview ghost, side-length labels |
| `components/SequenceBuilder.tsx` | **Create** | HTML panel: variable-length step list, Check/Next/Reset |
| `components/SequencePreview.tsx` | **Create** | R3F computed ghost triangle from composed sequence |
| `components/SimilarityDefinition.tsx` | **Create** | Earned reveal overlay for similarity definition |
| `dilations-copy.ts` | **Modify** | Add `ROUND_PROMPTS` + `EARNED_REVEALS` for similarity rounds |
| `DilationsModule.tsx` | **Modify** | Wire similarity phase: builder, validation, round flow |
| `__tests__/similarityTasks.test.ts` | **Create** | Validate task targets via composition math |
| `__tests__/useDilationsStage.test.ts` | **Modify** | Test `UPDATE_SEQUENCE_STEP` action |
| `__tests__/dilations-copy.test.ts` | **Modify** | Test similarity round copy completeness |

---

## Task 1: Test UPDATE_SEQUENCE_STEP Action

**Files:**
- Modify: `src/components/modules/dilations/__tests__/useDilationsStage.test.ts`
- Verify: `src/components/modules/dilations/hooks/useDilationsStage.ts`

- [ ] **Step 1: Write tests for UPDATE_SEQUENCE_STEP**

Add to the existing `sequence step manipulation` describe block:

```ts
it('UPDATE_SEQUENCE_STEP replaces step at index', () => {
  const step1: TransformStep = { type: 'translate', params: { dx: 1, dy: 1 } }
  const step2: TransformStep = { type: 'dilate', params: { k: 2 } }
  const updated: TransformStep = { type: 'translate', params: { dx: 3, dy: 0 } }

  let state = stageReducer(initialState, { type: 'ADD_SEQUENCE_STEP', step: step1 })
  state = stageReducer(state, { type: 'ADD_SEQUENCE_STEP', step: step2 })
  state = stageReducer(state, { type: 'UPDATE_SEQUENCE_STEP', index: 0, step: updated })

  expect(state.sequenceSteps).toEqual([updated, step2])
})

it('UPDATE_SEQUENCE_STEP resets prediction to active', () => {
  const step: TransformStep = { type: 'translate', params: { dx: 1, dy: 1 } }
  const updated: TransformStep = { type: 'translate', params: { dx: 2, dy: 2 } }

  let state = stageReducer(initialState, { type: 'ADD_SEQUENCE_STEP', step })
  state = stageReducer(state, { type: 'SET_ROUND_STATE', state: 'prediction' })
  state = stageReducer(state, { type: 'UPDATE_SEQUENCE_STEP', index: 0, step: updated })

  expect(state.roundState).toBe('active')
})

it('UPDATE_SEQUENCE_STEP preserves non-prediction roundState', () => {
  const step: TransformStep = { type: 'translate', params: { dx: 1, dy: 1 } }
  const updated: TransformStep = { type: 'translate', params: { dx: 2, dy: 2 } }

  let state = stageReducer(initialState, { type: 'ADD_SEQUENCE_STEP', step })
  // roundState defaults to 'entry' from initialState
  state = stageReducer(state, { type: 'UPDATE_SEQUENCE_STEP', index: 0, step: updated })

  expect(state.roundState).toBe('entry')
})
```

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/useDilationsStage.test.ts`
Expected: All pass (implementation already done in Step 2 of spec).

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/__tests__/useDilationsStage.test.ts
git commit -m "test(dilations): cover UPDATE_SEQUENCE_STEP action"
```

---

## Task 2: Test Similarity Task Targets

**Files:**
- Create: `src/components/modules/dilations/__tests__/similarityTasks.test.ts`

- [ ] **Step 1: Write tests that verify each task's target is reachable**

```ts
import { describe, it, expect } from 'vitest'
import { SIMILARITY_TASKS } from '../utils/similarityTasks'
import { composeTriangle, trianglesMatch } from '../utils/math'
import { PREDICTION_TOLERANCE } from '../utils/constants'
import type { TransformStep } from '../utils/types'

describe('similarityTasks — target reachability', () => {
  it('similarity-guided: Translate(1,1) → Dilate(2) reaches target', () => {
    const task = SIMILARITY_TASKS[0]
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 1, dy: 1 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-rigid-dilation: Reflect(y) → Translate(4,0) → Dilate(2) reaches target', () => {
    const task = SIMILARITY_TASKS[1]
    const steps: TransformStep[] = [
      { type: 'reflect', params: { axis: 'y' } },
      { type: 'translate', params: { dx: 4, dy: 0 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-inverse: Rotate(90°CCW) → Translate(5,2) → Dilate(2) reaches target', () => {
    const task = SIMILARITY_TASKS[2]
    const steps: TransformStep[] = [
      { type: 'rotate', params: { angleDeg: 90 } },
      { type: 'translate', params: { dx: 5, dy: 2 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-inverse: alternative path Dilate(2) → Rotate(90°CCW) → Translate(10,4) also reaches target', () => {
    const task = SIMILARITY_TASKS[2]
    const steps: TransformStep[] = [
      { type: 'dilate', params: { k: 2 } },
      { type: 'rotate', params: { angleDeg: 90 } },
      { type: 'translate', params: { dx: 10, dy: 4 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-guided: Translate alone (no dilate) does NOT reach target', () => {
    const task = SIMILARITY_TASKS[0]
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 3, dy: 3 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(false)
  })

  it('similarity-rigid-dilation: Translate + Dilate (no reflect) does NOT reach target', () => {
    const task = SIMILARITY_TASKS[1]
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 2, dy: 0 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(false)
  })

  it('all tasks use the canonical pre-image', () => {
    for (const task of SIMILARITY_TASKS) {
      expect(task.preImage).toEqual({ a: { x: 1, y: 1 }, b: { x: 4, y: 2 }, c: { x: 2, y: 4 } })
    }
  })

  it('all targets have integer coordinates within viewport [-2, 14]', () => {
    for (const task of SIMILARITY_TASKS) {
      for (const v of [task.target.a, task.target.b, task.target.c]) {
        expect(Number.isInteger(v.x)).toBe(true)
        expect(Number.isInteger(v.y)).toBe(true)
        expect(v.x).toBeGreaterThanOrEqual(-2)
        expect(v.x).toBeLessThanOrEqual(14)
        expect(v.y).toBeGreaterThanOrEqual(-2)
        expect(v.y).toBeLessThanOrEqual(14)
      }
    }
  })
})
```

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/similarityTasks.test.ts`
Expected: All 8 pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/__tests__/similarityTasks.test.ts
git commit -m "test(dilations): verify Phase 3 task targets are reachable"
```

---

## Task 3: Add Similarity Copy

**Files:**
- Modify: `src/components/modules/dilations/dilations-copy.ts`
- Modify: `src/components/modules/dilations/__tests__/dilations-copy.test.ts`

- [ ] **Step 1: Add test expectations for similarity round copy**

In `dilations-copy.test.ts`, find the `ROUND_PROMPTS` test and add expectations for the three similarity rounds. Find the `EARNED_REVEALS` test and add the `similarity-inverse` reveal expectation.

```ts
// In ROUND_PROMPTS test:
expect(ROUND_PROMPTS['similarity-guided']).toBeDefined()
expect(ROUND_PROMPTS['similarity-rigid-dilation']).toBeDefined()
expect(ROUND_PROMPTS['similarity-inverse']).toBeDefined()

// In EARNED_REVEALS test:
expect(EARNED_REVEALS['similarity-inverse']).toBeDefined()
expect(EARNED_REVEALS['similarity-inverse']!.text).toContain('similar')
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/dilations-copy.test.ts`
Expected: FAIL — similarity round keys not yet in copy.

- [ ] **Step 3: Add copy to dilations-copy.ts**

Add to `ROUND_PROMPTS`:

```ts
'similarity-guided':          'These look alike but aren\u2019t the same size. Try: translate, then dilate.',
'similarity-rigid-dilation':  'Translation won\u2019t work this time. What else from Module 1 can you use?',
'similarity-inverse':         'Your turn. Find the sequence.',
```

Add to `EARNED_REVEALS`:

```ts
'similarity-inverse': {
  text: 'Two figures are similar if there exists a sequence of rigid motions and a dilation that maps one onto the other.',
},
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/dilations-copy.test.ts`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/dilations/dilations-copy.ts src/components/modules/dilations/__tests__/dilations-copy.test.ts
git commit -m "feat(dilations): add Phase 3 similarity round copy"
```

---

## Task 4: SequencePreview Component (R3F)

**Files:**
- Create: `src/components/modules/dilations/components/SequencePreview.tsx`

- [ ] **Step 1: Create SequencePreview**

This is an R3F component — rendered inside the Canvas. Same visual treatment as `GhostTriangle` but driven by composed sequence output instead of drag position.

```ts
import { useMemo } from 'react'
import * as THREE from 'three'
import { composeTriangle } from '../utils/math'
import type { Triangle, TransformStep } from '../utils/types'
```

Props:
```ts
interface SequencePreviewProps {
  steps: TransformStep[]
  preImage: Triangle
  visible: boolean
}
```

Implementation:
- Compute `verts = composeTriangle(steps, preImage)` in `useMemo` keyed on `JSON.stringify(steps)`
- Build `THREE.ShapeGeometry` for fill (green, opacity 0.12)
- Build `THREE.BufferGeometry` outline from 3 vertices (lineLoop, dashed material, `dashSize: 0.3, gapSize: 0.18`)
- Dispose geometries in `useEffect` cleanup
- Z-layers: fill at 0.04, outline at 0.05
- Return `null` if `!visible`
- Color: `#7cc87c` (accent green, same as ghost triangle)

Reference: `GhostTriangle.tsx` for visual treatment, `PreviewGhost.tsx` from M1 for the composition pattern.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Pass (component is not yet wired — just needs to compile).

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/SequencePreview.tsx
git commit -m "feat(dilations): add SequencePreview R3F component"
```

---

## Task 5: SequenceBuilder Component (HTML)

**Files:**
- Create: `src/components/modules/dilations/components/SequenceBuilder.tsx`

This is the largest single component. It is HTML (React DOM), NOT R3F. Rendered outside the Canvas.

- [ ] **Step 1: Define the component interface and internal types**

```ts
import type { TransformStep, TransformType } from '../utils/types'

type SlotState = {
  type: TransformType | null
  dx: number
  dy: number
  axis: 'x' | 'y'
  angleDeg: 90 | 180 | 270
  direction: 'cw' | 'ccw'
}

const DEFAULT_SLOT: SlotState = {
  type: null, dx: 0, dy: 0, axis: 'y', angleDeg: 90, direction: 'cw',
}

interface SequenceBuilderProps {
  steps: TransformStep[]
  maxSteps: number
  kLocked: boolean
  lockedK: number
  feedbackState: 'idle' | 'match' | 'miss'
  guidance?: string
  onAddStep: (step: TransformStep) => void
  onUpdateStep: (index: number, step: TransformStep) => void
  onRemoveStep: (index: number) => void
  onCheckSequence: () => void
  onNext: () => void
  onReset: () => void
}
```

- [ ] **Step 2: Build the step editor sub-component**

Inside `SequenceBuilder.tsx`, create a `StepEditor` internal component:
- Step number header (1/2/3) + Clear (×) button
- Type selector row: 4 buttons — T / Ref / Rot / Dil
- Conditional controls based on selected type:
  - **translate:** Two stepper rows (dx, dy). Each has −/+ buttons, value display, range [-6, 6]
  - **reflect:** Two toggle buttons — Y-axis / X-axis
  - **rotate:** Three degree buttons (90°/180°/270°) + two direction buttons (CW/CCW)
  - **dilate:** "k = 2" display. When `kLocked`, stepper is visually disabled (muted text, no −/+ interaction). When unlocked, stepper with range [0.25, 4] for future Phase 4
- On type change: emit `onUpdateStep` with a new `TransformStep` using default params
- On param change: emit `onUpdateStep` with updated params

Design system:
- All buttons: `min-h-[44px] min-w-[44px]` touch targets
- Active type button: `border-(--lab-accent) text-(--lab-accent)`
- Inactive: `border-(--lab-border) text-(--lab-text-muted)`
- Stepper ±: `text-(--lab-text-muted) hover:text-(--lab-accent)`
- Values: `lab-data-font`
- Labels: `lab-silk lab-display-font`
- No border-radius on any element
- Explicit `duration-150` on interactive transitions
- Locked dilate stepper: `opacity-50 cursor-not-allowed` on ± buttons

- [ ] **Step 3: Build the main SequenceBuilder layout**

```
┌─────────────────────────────────┐
│  STEP 1                    [×]  │  ← StepEditor
│  [T] [Ref] [Rot] [Dil]         │
│  dx: [−] 0 [+]  dy: [−] 0 [+] │
├─────────────────────────────────┤
│  then                           │  ← separator (only between steps)
├─────────────────────────────────┤
│  STEP 2                    [×]  │
│  ...                            │
├─────────────────────────────────┤
│  [+ ADD STEP]                   │  ← shown when < maxSteps
├─────────────────────────────────┤
│  [RESET]        [CHECK] / [NEXT]│  ← footer
└─────────────────────────────────┘
```

- Steps: managed as `slots: SlotState[]` local state, synced to parent via callbacks
- "Add Step" adds a new `DEFAULT_SLOT` to local array and emits `onAddStep` with default translate step
- "Clear (×)" removes slot at index, emits `onRemoveStep`
- "Reset" clears all slots, emits `onReset`
- "Check" button: enabled when `steps.length > 0`, calls `onCheckSequence`
- "Next" button: replaces Check when `feedbackState === 'match'`, calls `onNext`
- Guidance text: shown above steps when provided, `lab-silk lab-display-font text-(--lab-text-muted)`
- Miss feedback: brief flash or border color change on Check (use `border-(--lab-danger)` for 1s)

Layout responsive:
- Portrait: full width below scene (same position as ControlStrip)
- Landscape: right panel (same zone as ControlStrip in Layout.tsx)

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: Pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/dilations/components/SequenceBuilder.tsx
git commit -m "feat(dilations): add SequenceBuilder HTML panel"
```

---

## Task 6: SimilarityRounds Scene Component

**Files:**
- Create: `src/components/modules/dilations/rounds/SimilarityRounds.tsx`

Same pattern as `ScaleFactorRounds.tsx` and `CoordinateRounds.tsx` — an R3F component rendered as a child of `DilationsScene`.

- [ ] **Step 1: Create SimilarityRounds**

Props (same shape as other round scenes):
```ts
interface SimilaritySceneProps {
  state: StageState
  dispatch: Dispatch<StageAction>
  task: SimilarityTask
}
```

Renders:
- `PreImageTriangle` — canonical triangle (always visible)
- `ImageTriangle` — target triangle from `task.target` (always visible, accent color)
- `SequencePreview` — composed ghost, `visible` when `state.sequenceSteps.length > 0`
- Side-length `SpriteLabel`s — absolute lengths on both triangles (3 sides each, 6 total). Compute via `sideLength` from `utils/math.ts`. Position at midpoints of each side, offset outward from centroid (same offset pattern as `RatioAnnotations`).

Does NOT render: `GhostTriangle` (no drag), `RayLines`, `RevealAnimation`, `AngleMarks`. Ghost drag is disabled — `hasGhostDrag: false`.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/rounds/SimilarityRounds.tsx
git commit -m "feat(dilations): add SimilarityRounds R3F scene"
```

---

## Task 7: Wire Phase 3 Into DilationsModule

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

This is the integration task — wiring SequenceBuilder, SimilarityRounds, validation, and round flow.

- [ ] **Step 1: Add imports and similarity phase detection**

```ts
import { SimilarityScene } from './rounds/SimilarityRounds'
import { SequenceBuilder } from './components/SequenceBuilder'
import { SIMILARITY_TASKS } from './utils/similarityTasks'
import type { SimilarityTask } from './utils/similarityTasks'
import { composeTriangle, trianglesMatch } from './utils/math'
import { PREDICTION_TOLERANCE } from './utils/constants'
```

Add phase detection alongside existing:
```ts
const isSimilarityPhase = state.phase === 'similarity'
```

Add current task lookup:
```ts
const currentTask: SimilarityTask | undefined = isSimilarityPhase
  ? SIMILARITY_TASKS.find(t => t.id === state.currentRound)
  : undefined
```

- [ ] **Step 2: Add local feedbackState for similarity rounds**

```ts
const [similarityFeedback, setSimilarityFeedback] = useState<'idle' | 'match' | 'miss'>('idle')
```

Reset on round change (add to existing round-change `useEffect`):
```ts
setSimilarityFeedback('idle')
```

- [ ] **Step 3: Wire validation handler**

```ts
const handleCheckSimilarity = useCallback(() => {
  if (!currentTask) return
  const composed = composeTriangle(state.sequenceSteps, currentTask.preImage)
  const match = trianglesMatch(composed, currentTask.target, PREDICTION_TOLERANCE)
  if (match) {
    setSimilarityFeedback('match')
    dispatch({ type: 'COMPLETE_ROUND' })
  } else {
    setSimilarityFeedback('miss')
  }
}, [currentTask, state.sequenceSteps, dispatch])
```

- [ ] **Step 4: Wire SequenceBuilder step callbacks**

```ts
const handleAddStep = useCallback((step: TransformStep) => {
  dispatch({ type: 'ADD_SEQUENCE_STEP', step })
}, [dispatch])

const handleUpdateStep = useCallback((index: number, step: TransformStep) => {
  dispatch({ type: 'UPDATE_SEQUENCE_STEP', index, step })
  setSimilarityFeedback('idle')  // reset feedback on edit
}, [dispatch])

const handleRemoveStep = useCallback((index: number) => {
  dispatch({ type: 'REMOVE_SEQUENCE_STEP', index })
  setSimilarityFeedback('idle')
}, [dispatch])

const handleResetSequence = useCallback(() => {
  dispatch({ type: 'RESET_SEQUENCE' })
  setSimilarityFeedback('idle')
}, [dispatch])
```

- [ ] **Step 5: Add SimilarityScene as DilationsScene child**

In the JSX, alongside `isScaleFactorPhase` and `isCoordinatePhase` blocks:

```tsx
{isSimilarityPhase && currentTask && (
  <SimilarityScene
    key={state.currentRound}
    state={state}
    dispatch={dispatch}
    task={currentTask}
  />
)}
```

- [ ] **Step 6: Render SequenceBuilder in controls slot**

In the Layout's `controls` prop, conditionally render:

```tsx
controls={
  isSimilarityPhase && currentTask ? (
    <SequenceBuilder
      steps={state.sequenceSteps}
      maxSteps={currentTask.maxSteps}
      kLocked={true}
      lockedK={2}
      feedbackState={similarityFeedback}
      guidance={currentTask.guidance}
      onAddStep={handleAddStep}
      onUpdateStep={handleUpdateStep}
      onRemoveStep={handleRemoveStep}
      onCheckSequence={handleCheckSimilarity}
      onNext={() => {
        handleAdvance()
        setSimilarityFeedback('idle')
      }}
      onReset={handleResetSequence}
    />
  ) : (
    <ControlStrip state={state} dispatch={dispatch} onAdvance={handleAdvance} />
  )
}
```

- [ ] **Step 7: Verify build**

Run: `pnpm build`
Expected: Pass.

- [ ] **Step 8: Manual smoke test**

Run: `pnpm dev`
Navigate through Phases 1–2 to reach Phase 3 (or temporarily set `initialState.currentRound` to `'similarity-guided'`). Verify:
- SequenceBuilder renders with guidance text
- Adding translate + dilate steps shows preview ghost in scene
- Check with correct sequence → "match" → Next button appears
- Next advances to `similarity-rigid-dilation`

- [ ] **Step 9: Commit**

```bash
git add src/components/modules/dilations/DilationsModule.tsx
git commit -m "feat(dilations): wire Phase 3 similarity into module orchestrator"
```

---

## Task 8: SimilarityDefinition Earned Reveal

**Files:**
- Create: `src/components/modules/dilations/components/SimilarityDefinition.tsx`
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

- [ ] **Step 1: Create SimilarityDefinition component**

```ts
interface SimilarityDefinitionProps {
  visible: boolean
}
```

Renders the earned reveal text from `EARNED_REVEALS['similarity-inverse']`. Uses same pattern as existing earned reveal display in `PromptReadout` — the `amber` styling with `--lab-earned` color.

This component is an overlay that appears on `similarity-inverse` completion. Positioned as a child of `ModuleLayout` (same as celebration overlays).

- Background: `bg-(--lab-surface)` with `border border-(--lab-earned)`
- Key text "similar" highlighted in `text-(--lab-earned)`
- Fade-in animation via `motion/react` `AnimatePresence`
- A "Continue" button to dismiss and advance to Phase 4

- [ ] **Step 2: Wire into DilationsModule**

Show when `currentRound === 'similarity-inverse'` and `roundState === 'completion'` and `isFirstReveal`. This follows the existing `shownReveals` pattern.

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/modules/dilations/components/SimilarityDefinition.tsx src/components/modules/dilations/DilationsModule.tsx
git commit -m "feat(dilations): add similarity definition earned reveal"
```

---

## Task 9: Polish & Accessibility

**Files:**
- Modify: `src/components/modules/dilations/components/SequenceBuilder.tsx`
- Modify: `src/components/modules/dilations/rounds/SimilarityRounds.tsx`
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

- [ ] **Step 1: Screen reader announcements**

Wire `useAccessibility` (from `@/lib/skeleton/useAccessibility`) in `DilationsModule`:
- Announce step additions: "Step N added: [type]"
- Announce step removals: "Step N removed"
- Announce check results: "Match! Sequence maps pre-image to target." / "Not a match. Try adjusting your steps."
- Announce round transitions: "Round: [label]"

- [ ] **Step 2: Miss feedback animation**

In `SequenceBuilder`, on miss: briefly flash the builder border `border-(--lab-danger)` for 1 second, then revert. Use a local state timeout (same pattern as `RatioAnnotations` delayed reveal).

- [ ] **Step 3: Responsive layout verification**

Test in dev tools:
- Portrait phone (375×667): builder below scene, steps stack vertically
- Landscape phone (667×375): builder in right panel
- Tablet portrait (768×1024): builder below, comfortable spacing
- Desktop (1440×900): builder in right panel

- [ ] **Step 4: Run full test suite + build**

Run: `pnpm vitest run && pnpm build`
Expected: All tests pass, build succeeds.

- [ ] **Step 5: Run lint**

Run: `pnpm lint`
Expected: No new errors in dilations files. Suppress any legitimate Three.js/React Compiler warnings with targeted directives (same pattern as existing suppresses).

- [ ] **Step 6: Commit**

```bash
git add -A src/components/modules/dilations/
git commit -m "fix(dilations): Phase 3 polish — a11y, miss feedback, responsive"
```

---

## Summary

| Task | What | New Files | Modified Files |
|------|------|-----------|----------------|
| 1 | Test UPDATE_SEQUENCE_STEP | — | useDilationsStage.test.ts |
| 2 | Test task targets | similarityTasks.test.ts | — |
| 3 | Similarity copy | — | dilations-copy.ts, dilations-copy.test.ts |
| 4 | SequencePreview (R3F) | SequencePreview.tsx | — |
| 5 | SequenceBuilder (HTML) | SequenceBuilder.tsx | — |
| 6 | SimilarityRounds scene | SimilarityRounds.tsx | — |
| 7 | Wire into module | — | DilationsModule.tsx |
| 8 | Similarity definition | SimilarityDefinition.tsx | DilationsModule.tsx |
| 9 | Polish & a11y | — | SequenceBuilder, SimilarityRounds, DilationsModule |

Tasks 4 and 5 are independent and can be built in parallel.
