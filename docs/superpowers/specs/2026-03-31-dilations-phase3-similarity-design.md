# Dilations Phase 3 — Similarity Sequences

**Date:** 2026-03-31
**Status:** Approved design, pre-implementation
**Standards:** 8.G.A.4 (similar figures), bridging M1 (rigid motions) and M2 (dilations)
**Rounds:** `similarity-guided`, `similarity-rigid-dilation`, `similarity-inverse`

## Summary

Phase 3 replaces ghost-drag interaction with a SequenceBuilder panel. Students compose rigid motions (translate, reflect, rotate) with dilation to map similar figures onto each other. The earned reveal: "similar" means such a sequence exists.

Adapted from M1's capstone SequenceBuilder — refined from 2 fixed slots to a variable-length step list (capped at 3), with the Dilate step added. No drag-to-reorder; clearing and rebuilding IS the pedagogy for discovering non-commutativity.

## Task Data (confirmed)

All tasks use `CANONICAL_TRIANGLE` A(1,1) B(4,2) C(2,4) as pre-image. k=2 fixed across all Phase 3 — scale factor discovery was Phase 1.

| Task | Target | Intended Sequence | Steps |
|------|--------|-------------------|-------|
| `similarity-guided` | (4,4)(10,6)(6,10) | Translate(1,1) → Dilate(2) | 2 |
| `similarity-rigid-dilation` | (6,2)(0,4)(4,8) | Reflect(y) → Translate(4,0) → Dilate(2) | 3 |
| `similarity-inverse` | (8,6)(6,12)(2,8) | Rotate(90°CCW) → Translate(5,2) → Dilate(2) | 3 |

Validation is result-only: `composeTriangle(steps, preImage)` checked against target with `PREDICTION_TOLERANCE`. No `validSequences` array.

Already written: `src/components/modules/dilations/utils/similarityTasks.ts`

## Infrastructure Already in Place

These exist and require no changes for Phase 3:

- **Math:** `composeTriangle`, `composeTransformations`, `applyStep` — all four transform types (translate, reflect, rotate, dilate) implemented in `utils/math.ts`
- **Types:** `TransformStep`, `TransformType`, all step param types in `utils/types.ts`. Note: `SimilarityPair` type in `types.ts` is a stale placeholder — `SimilarityTask` in `similarityTasks.ts` is the actual type. Clean up `SimilarityPair` during Step 2
- **Round configs:** All three similarity rounds defined in `constants.ts` with `hasGhostDrag: false`, `hasSequenceBuilder: true`, `coordinatesVisible: true`
- **Stage machine:** `useDilationsStage` has `ADD_SEQUENCE_STEP`, `REMOVE_SEQUENCE_STEP`, `REORDER_SEQUENCE_STEP`, `CHECK_SEQUENCE`, `RESET_SEQUENCE` actions; `sequenceSteps: TransformStep[]` in state. `REORDER_SEQUENCE_STEP` exists but is unused — Phase 3 deliberately excludes drag-to-reorder
- **Scene:** `DilationsScene.tsx` with orthographic camera, coordinate grid, SpriteLabel system

## New Files

### 1. `components/SequenceBuilder.tsx` — HTML panel

Variable-length step list for composing transformation sequences.

```ts
interface SequenceBuilderProps {
  steps: TransformStep[]
  maxSteps: number                        // 3 for Phase 3
  kLocked: boolean                        // true for Phase 3; Phase 4 can unlock
  lockedK: number                         // 2 for Phase 3
  feedbackState: 'idle' | 'match' | 'miss'
  guidance?: string                       // round-specific hint text
  onAddStep: (step: TransformStep) => void
  onRemoveStep: (index: number) => void
  onCheckSequence: () => void
  onNext: () => void
  onReset: () => void
}
```

**Internal state:** Each step has a `SlotState` (type + params) managed locally. When a step's type is selected, a default `TransformStep` is emitted via `onAddStep`. Parameter changes update the step in-place (requires new action `UPDATE_SEQUENCE_STEP` — see Stage Machine Changes below).

**Step UI (per step):**
- Header: step number (1/2/3) + Clear (×) button
- Type selector: 4 buttons — T / Ref / Rot / Dil (M1 has 3)
- Type-specific controls:
  - **Translate:** StepperField for dx, dy (range [-6, 6], increment 1)
  - **Reflect:** Two buttons — Y-axis (default), X-axis
  - **Rotate:** Degree buttons 90° / 180° / 270° + Direction CW / CCW
  - **Dilate:** k display, read-only when `kLocked=true`. Shows "k = 2" with stepper visually disabled. Prop interface accepts `kLocked: boolean` so Phase 4 can unlock without rewrite.

**Footer:**
- "Add Step" button (shown when `steps.length < maxSteps` and last step has a type selected)
- "Check" button (enabled when `steps.length > 0`; swaps to "Next" on match)
- "Reset" button (clears all steps)

**Layout:** Docked below the scene on mobile, right side panel on desktop (same zone as ControlStrip). ControlStrip is hidden when SequenceBuilder is active — the builder contains its own Check/Next/Reset buttons.

### 2. `components/SequencePreview.tsx` — R3F component

Computed ghost showing the result of the current sequence applied to the pre-image.

```ts
interface SequencePreviewProps {
  steps: TransformStep[]
  preImage: Triangle
  visible: boolean          // false when steps is empty
}
```

**Rendering:** Same visual treatment as Phase 1–2 ghost — semi-transparent fill + dashed outline. Uses `composeTriangle(steps, preImage)` to compute vertices. Recomputes on every step change (no debounce — math is trivial). Hidden when `steps` is empty.

**Z-layers:** Fill at z=0.04, outline at z=0.05 (above pre-image, below labels).

### 3. `components/SimilarityDefinition.tsx` — earned reveal overlay

Appears on `similarity-inverse` completion.

```ts
interface SimilarityDefinitionProps {
  visible: boolean
}
```

**Content:** "Two figures are similar if there exists a sequence of rigid motions and a dilation that maps one onto the other."

**Styling:** Earned reveal treatment — `--lab-earned` (#f5a623) key text, `--lab-surface` background, same pattern as Phase 1–2 earned reveals.

## Modified Files

### 4. `hooks/useDilationsStage.ts` — stage machine

**New action:**
```ts
| { type: 'UPDATE_SEQUENCE_STEP'; index: number; step: TransformStep }
```

Reducer case: replaces `sequenceSteps[index]` with the updated step. Needed because SequenceBuilder updates step parameters in-place (e.g., changing dx from 1 to 2) rather than remove+re-add.

**Side effect:** If `roundState` is `prediction` (student already checked), updating a step resets `roundState` to `active`. This allows re-checking after parameter changes.

No other state shape changes. `sequenceSteps: TransformStep[]` already exists.

### 5. `DilationsModule.tsx` — orchestrator

**Changes:**
- Import `SIMILARITY_TASKS` and look up current task by `currentRound`
- When `hasSequenceBuilder` is true: render `SequenceBuilder` instead of `ControlStrip`
- Pass `sequenceSteps` from stage state to both `SequenceBuilder` and scene
- Wire `onCheckSequence`: compose sequence via `composeTriangle`, check against task target with `trianglesMatch`, dispatch result
- Wire `onNext`: dispatch `ADVANCE_ROUND`, handle `similarity-inverse` completion (show `SimilarityDefinition`)
- Track `feedbackState` locally (idle/match/miss) — reset on round advance

### 6. `DilationsScene.tsx` — scene

**Changes:**
- Accept `sequenceSteps` and `similarityTask` props
- Render `SequencePreview` when `hasSequenceBuilder` and steps non-empty
- Render target triangle (using existing `ImageTriangle` with target vertices, accent color) when in similarity rounds
- Render side-length annotations on both triangles via `SpriteLabel`
- No `AngleMarks` in Phase 3 — `angleLabelsVisible: false` in round configs. Angle marks are Phase 4 (AA discovery)

### 7. `components/ControlStrip.tsx` — conditional rendering

**Change:** When `config.hasSequenceBuilder` is true, `ControlStrip` returns `null` for the `active` state (SequenceBuilder owns all buttons). Entry and completion buttons remain unchanged — or the module can skip rendering `ControlStrip` entirely when the builder is active.

### 8. `components/PromptReadout.tsx` — round prompts

**Change:** Add prompt text for the three similarity rounds, sourced from `SimilarityTask.guidance` or from a copy deck extension.

## Validation & State Transitions

Validation lives in `DilationsModule.tsx` (same pattern as M1's inline validation):

```ts
const composed = composeTriangle(sequenceSteps, task.preImage)
const match = trianglesMatch(composed, task.target, PREDICTION_TOLERANCE)
// feedbackState = match ? 'match' : 'miss'
```

`trianglesMatch` already exists in `utils/math.ts` — checks vertex-by-vertex distance.

**Round state lifecycle for similarity rounds:**

| Event | `roundState` transition | `feedbackState` | Notes |
|-------|------------------------|-----------------|-------|
| Entry → CONTINUE | `entry` → `active` | `idle` | Builder appears |
| Student adds/edits steps | stays `active` | `idle` | Preview updates live |
| Check (miss) | stays `active` | `miss` | Student can adjust and re-check |
| Check (match) | `active` → `completion` | `match` | Check button swaps to Next |
| Next | `completion` → next round's `entry` | reset to `idle` | Steps cleared |

Key difference from ghost-drag rounds: similarity rounds skip `prediction` and `reveal` states entirely. The live preview IS the prediction; the match IS the reveal. `CHECK_SEQUENCE` reducer action is not used — validation is handled in the module orchestrator, which dispatches `COMPLETE_ROUND` on match.

**Partial sequences:** A student checking with only a Translate step (no Dilate) will simply get a miss — no special handling needed. The live preview shows the incomplete result doesn't match.

## Build Order

| Step | Files | What | Depends On |
|------|-------|------|------------|
| 1 | `similarityTasks.ts` | Task data objects | — (done) |
| 2 | `useDilationsStage.ts`, `types.ts` | Add `UPDATE_SEQUENCE_STEP` action; remove stale `SimilarityPair`/`CapstonePair` types | — |
| 3 | `SequenceBuilder.tsx` | HTML panel component | Step 2 (actions) |
| 4 | `SequencePreview.tsx` | R3F preview ghost | Step 1 (task data) |
| 5 | `DilationsScene.tsx` | Wire preview + target triangle | Steps 3, 4 |
| 6 | `DilationsModule.tsx` | Orchestrate: wire builder, validation, round flow | Steps 2–5 |
| 7 | `SimilarityDefinition.tsx` | Earned reveal overlay | Step 6 (wiring) |
| 8 | `PromptReadout.tsx` | Similarity round prompts | Step 6 |
| 9 | Polish | Feedback animations, responsive layout, screen reader announcements (via `useAccessibility`), haptic feedback | Steps 1–8 |

Steps 3 and 4 are independent and can be built in parallel.

## Design Decisions

- **No drag-to-reorder.** Clearing and rebuilding teaches non-commutativity through action, not UI convenience.
- **k locked at 2 for Phase 3.** `kLocked` prop allows Phase 4 to unlock without component changes.
- **Result-only validation.** Any sequence producing the target is accepted — no prescribed path.
- **SequenceBuilder replaces ControlStrip** during similarity rounds. The builder contains its own Check/Next/Reset.
- **No shared components with M1.** Each module owns its copies (per project feedback). Share after all 3 geometry modules complete.
- **Side-length annotations** on both triangles (absolute lengths, not ratios) to visually confirm similarity.

## Not In Scope

- Phase 4 (AA discovery, capstone) — separate spec
- Drag-to-reorder — deliberately excluded
- Variable k values — Phase 3 is k=2 only
- Step-by-step reveal animation (GSAP timeline showing each transform applied sequentially) — deferred to polish pass
