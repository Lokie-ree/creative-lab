# Dilations — Phase 3 Polish & Phase 1/2 Fixes

**Date:** 2026-04-04  
**Status:** Approved  
**Scope:** SequenceBuilder redesign, Phase 3 scene fixes, Phase 1/2 bug fixes and UX polish

---

## Background

Testing of the Phase 3 similarity rounds (PRs #55–#56) surfaced a set of issues across all three phases. This spec covers the full set of agreed fixes.

---

## Phase 3 — SequenceBuilder Redesign

### Problem

The current `SequenceBuilder` is a vertical stacked form. Each `StepEditor` (type picker + param row) is ~130px tall. With 2–3 steps, the builder overflows every viewport. In portrait, the scene takes `aspect-square w-full` leaving ~50–80px below the formula strip — the builder is unusable.

### Solution: Chip Rail

Replace the vertical form with a compact chip rail + inline editor pattern.

#### Structure (top to bottom in the controls slot)

1. **Chip rail row** — horizontal sequence of step chips + `+` add button
2. **Inline editor** — appears below the rail when a chip is tapped; hidden otherwise
3. **Footer row** — RESET (left) + CHECK or NEXT (right)

#### Draft slots vs committed steps

The chip rail maintains a local `SlotState[]` (same pattern as the current `SequenceBuilder`). A `SlotState` has `type: TransformType | null`. When `type` is `null`, the chip is a **draft** — it exists locally in the UI but has not yet been committed to the parent's `sequenceSteps: TransformStep[]`. Only when a type is first selected does `onAddStep` fire, promoting the slot to a committed `TransformStep`.

`SequencePreview` receives only the committed `TransformStep[]` from stage state. It never sees draft null-type slots. The per-step preview ghost therefore reflects only fully-specified steps.

#### Initial and reset state

On mount and after RESET, the chip rail initializes with **one empty draft chip** (no type selected). This matches the current `SequenceBuilder` behavior (`[{ ...DEFAULT_SLOT }]`). The rail never reaches zero chips — RESET always returns to one draft chip, not an empty rail.

#### Chip rail

- Each committed chip shows a `STEP N` micro-label (7px, 0.2em tracking) and a compact value line (`T +1,+1`, `Dil ×2`, `Rot 90°↺`, `Ref Y`) in `lab-data-font`
- A draft chip (no type yet) shows `STEP N` label + `—` placeholder value in `lab-ghost` color
- Active chip (being edited): accent border + `rgba(124,200,124,0.06)` background tint
- `→` separator (text, `lab-text-muted`) between chips
- `+` add button (dashed border, 32×32) appears when `slots.length < maxSteps` and the last chip is committed (has a type)
- No `+` button when at `maxSteps`; no `+` button when the last slot is still a draft

#### Inline editor

Opens below the chip rail when a chip is tapped. Closed via a `DONE` button (top-right of editor). Changes apply to sequence state immediately; the live SequencePreview ghost in the scene updates on every param change.

**Opening the editor auto-selects** the tapped chip (sets it as active). Tapping a different chip while the editor is open switches the editor to that chip without closing.

**Type change resets params to defaults.** When a student changes the type of an existing step in the inline editor (e.g. Translate → Rotate), all params reset to their defaults for the new type (`dx:0, dy:0` for Translate; `angleDeg:90, direction:'ccw'` for Rotate; etc.). Stale params from the previous type are discarded.

**Editor header:** `EDITING STEP N` label (9px, accent) + `DONE` button

**Type row:** 4 buttons — `T` / `Ref` / `Rot` / `Dil` — full width, min-height 28px

**Param section per type:**

| Type | Controls |
|------|----------|
| Translate | DX stepper (−/value/+) + DY stepper. Stepper buttons 26×26px. Range −6 to +6. |
| Reflect | Y-axis / X-axis toggle row — 2 buttons full width, min-height 28px |
| Rotate | 3×2 combined grid — `90°↺` / `180°` / `270°↺` / `90°↻` / `(grayed)` / `270°↻`. One tap = fully specified rotation. 180° CW and CCW are identical so the second 180° cell is grayed with `opacity: 0.3`, a `(same)` label at 7px, and `pointer-events: none` — it is not tappable. |
| Dilate | Fixed k display: `k = 2 · fixed for this task`. No inputs. |

**Total controls height:**
- Chip rail: ~44px
- Inline editor (when open): ~90–100px across all types
- Footer: ~44px
- **Total when editing: ~188px**
- **Total when closed: ~88px**

#### Content changes

- Remove `guidance` field from `SimilarityTask` type (`utils/types.ts`) and all task definitions (`similarityTasks.ts`)
- Remove the guidance header section from `SequenceBuilder`; inline editor header shows only `EDITING STEP N`
- Remove `guidance` prop from the `SequenceBuilder` call site in `DilationsModule.tsx`
- `ROUND_PROMPTS` is the sole location for per-round copy

### Feedback States

#### Idle (building)

- No feedback copy, neutral border throughout
- SequencePreview ghost updates in scene as steps are built

#### Miss (CHECK pressed, sequence does not match)

- Prompt strip turns amber: label `Not quite`, text `Not there yet — try adjusting your steps.`
- Amber hint strip appears between chip rail and footer: amber dot + `Tap any step to adjust its parameters.`
  - This strip is intentionally **mechanical** — it reminds students how to use the UI, not what to try. It is not a hint toward the correct answer. The correct-answer hint lives in `ROUND_PROMPTS` (above the scene) for guided rounds.
  - Because RESET always leaves one draft chip, this copy is always accurate — there is always at least one chip to tap.
- No border change on the builder or any chip
- CHECK remains available; student can iterate without ceremony

#### Match (CHECK pressed, sequence matches within tolerance)

- Prompt strip turns amber: label `Discovered`, text from `EARNED_REVEALS[currentRound]` if defined, otherwise default match copy
- Brief flash border on scene (same `AnimatePresence` pattern as Phase 1/2 earned reveals)
- All chips turn accent-border + accent tint (match state)
- RESET disappears; NEXT replaces CHECK
- `similarity-inverse` earned reveal fires the `SimilarityDefinition` overlay as before

**Default match copy for rounds without an `EARNED_REVEALS` entry** (similarity-guided, similarity-rigid-dilation):  
`"A sequence of rigid motions and a dilation maps the pre-image onto the target."`

---

## Phase 3 — Scene Fixes

### Angle Marks Instead of Side Lengths

`SimilarityRounds.tsx` currently renders `SideLengthLabels` on both triangles. Phase 3 teaches angle preservation (the setup for AA in Phase 4) — side lengths tell students what's different, angle marks show what's preserved.

**Change:** Replace `SideLengthLabels` with `AngleMarks` on both triangles:
- Pre-image: `color="#b8b0a4"` (text color)
- Target: `color="#7cc87c"` (accent)
- Remove `SideLengthLabels` and its helpers (`midpoint`, `offsetFromCentroid`, `formatLength`) from `SimilarityRounds.tsx`

### SequencePreview Shows Per-Step Intermediate State

`SequencePreview` applies the **full prefix** of committed steps and renders the resulting triangle as a dashed ghost. This scaffolds understanding — students see what Translate does to the pre-image, then what Dilate does on top of that result, building sequence intuition step by step.

**Behavior:** after each step is added or modified, the ghost updates to show the triangle after applying all currently committed steps in order. Only committed `TransformStep[]` (never draft null-type slots) are passed to `SequencePreview`.

### Camera Expansion for Phase 3

Phase 3 intermediate states can reach x as low as −4 (e.g. after Reflect(y-axis): B′(−4, 2)). The current camera range x,y ∈ [−2, 14] clips these.

**Fix:** `CameraSetup` accepts a `worldSize` prop (default `16`). When `worldSize = 20`, center shifts to (5, 5), giving x,y ∈ [−5, 15].

- `DilationsScene.tsx` receives the active phase and passes `worldSize={isSimilarityPhase ? 20 : 16}` to `CameraSetup`
- Phases 1 and 2 are unaffected
- Triangles appear ~20% smaller in Phase 3 — acceptable; content is less dense

All Phase 3 intermediate and final states fit within the expanded range:
- Task 1: max coords (10, 10) ✓
- Task 2: min x = −4, max coords (6, 8) ✓
- Task 3: min x = −4, max coords (8, 12) ✓

**Axis labels:** The existing `AXIS_LABEL_INTEGERS` (`[2, 4, 6, 8, 10, 12]`) has no coverage for negative x/y or values above 12. With `coordinatesVisible = true` in all similarity rounds and intermediate states reaching x = −4, students will be working in an unlabeled region. `DilationsScene.tsx` derives the label set from `worldSize` — when `worldSize === 20`, use `[-4, -2, 0, 2, 4, 6, 8, 10, 12, 14]`; when `worldSize === 16` (default), keep `[2, 4, 6, 8, 10, 12]`. No additional prop needed.

---

## Phase 1/2 Fixes

### Live Coordinate Update on Drag

**File:** `DilationsModule.tsx:189`  
**Bug:** `predictedVertices` is only computed when `roundState === 'prediction'`, so the formula strip doesn't update while the student is actively dragging.  
**Fix:**
```ts
(roundState === 'active' || roundState === 'prediction') && nudgePosition != null
```
Coordinates now update live on every drag move, matching M1's behavior.

### Coordinate Rule Duplication

During `isFirstReveal`, both `PromptReadout` (notation field) and `CoordinateReadout` (rule line) display `(x, y) → (2x, 2y)` simultaneously.

**Fix:** Pass `isFirstReveal` as a prop to `CoordinateReadout`. When `true`, suppress the rule line — the prompt owns the notation during the reveal moment. The formula strip continues showing k and the coordinate table.

### Snap Precision

**Files:** `GhostTriangle.tsx` — `handleUp`; `DilationsModule.tsx` — keyboard nudge (line ~124)

Reduce drag commit snap from 0.5 to 0.25 world units, and update the coarse keyboard nudge to match:

| Location | Before | After |
|----------|--------|-------|
| `GhostTriangle.tsx` `handleUp` | `snap(0.5)` | `snap(0.25)` |
| `DilationsModule.tsx` nudge snap | `Math.round((base.x + dx) * 2) / 2` | `Math.round((base.x + dx) * 4) / 4` |

Both changes are applied together so drag-commit and keyboard-nudge share a 0.25-unit grid. The Shift+Arrow fine nudge (0.25) already aligns. Target centroids for k=1/3 (e.g. 7/3 ≈ 2.33) now snap to 2.25 — 0.08 units off vs 0.17 units off with the old grid.

The architecture doc note ("Arrow: 0.5-unit increments; Shift+Arrow: 0.25-unit increments") becomes: Arrow: 0.25-unit increments; Shift+Arrow: 0.25-unit increments (fine nudge effectively unchanged, coarse nudge tightened).

### Accuracy Re-engagement Nudge

**File:** `DilationsModule.tsx` — `promptText` derivation  
When `predictionAccuracy === 'miss'` and `roundState === 'prediction'`, the prompt currently shows "Good try" with no further guidance.

**Change:** Add a secondary hint line for this state only:
```
"Pretty far off — try repositioning before revealing."
```
The student can still press REVEAL immediately; this is an invitation, not a gate.

---

## Files Affected

| File | Change |
|------|--------|
| `components/SequenceBuilder.tsx` | Full rewrite — chip rail + inline editor |
| `rounds/SimilarityRounds.tsx` | `SideLengthLabels` → `AngleMarks`; remove unused helpers |
| `components/SequencePreview.tsx` | Per-step intermediate rendering |
| `DilationsScene.tsx` | Pass `worldSize` to `CameraSetup` based on phase; derive axis label set from `worldSize` (`CameraSetup` is defined inside this file) |
| `utils/similarityTasks.ts` | Remove `guidance` field from task definitions |
| `utils/types.ts` | Remove `guidance` from `SimilarityTask` type |
| `dilations-copy.ts` | Add default match copy for Phase 3 rounds without earned reveals |
| `DilationsModule.tsx` | Live coord fix; `isFirstReveal` prop to `CoordinateReadout`; miss nudge copy; remove `guidance` prop from `SequenceBuilder` call site; coarse nudge snap 0.5→0.25 |
| `components/CoordinateReadout.tsx` | Suppress rule during `isFirstReveal` |
| `components/GhostTriangle.tsx` | `snap(0.5)` → `snap(0.25)` |
