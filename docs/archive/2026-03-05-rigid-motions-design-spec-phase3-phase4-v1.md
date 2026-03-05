# Rigid Motions Module — Phase 3 & 4 Design Specification v1.0

**Date:** March 5, 2026
**Status:** First draft — approved for review
**Supersedes:** n/a (new document)
**Standards:** 8.G.A.1, 8.G.A.2, 8.G.A.3
**Course:** Grade 8 Mathematics
**ALD Target:** Level 3 → Level 4 (Phase 3) · Level 5 capstone (Phase 4)

**Related documentation:** `docs/plans/2026-03-02-rigid-motions-design-spec-v3.1.md` · `ARCHITECTURE.md` · `philosophy.md`

**Prerequisites:** Phase 2 complete (predict-and-reveal loop for translate, reflect, rotate; guide state machine through `predict-rotate`).

---

## Phase 3: Coordinate Layer

### Purpose

Phase 3 is the **Level 3 → Level 4 boundary moment** — the earned reveal of coordinate rules. After demonstrating spatial understanding across all three transformation types, students see the formal coordinate notation for what they already know. Spatial reasoning precedes symbolic description; the formula is a label for an understood idea, not an instruction to memorize.

### New Guide States

```
... → predict-rotate → coordinate-reveal → predict-with-coordinates → ...
```

Phase 3 adds two guide states to the existing sequence.

---

### Guide State: `coordinate-reveal`

A **pause state**. No ghost. No dragging. No CHECK button.

**Scene state:**
- Pre-image triangle visible (unchanged)
- Confirmed image triangle visible (the last matched image from `predict-rotate`)
- Vertex coordinate labels active on both shapes: A(−3,−2), A′, B(1,−1), B′, C(−2,1), C′
- `coordinatesActive` flag flips to `true` — this flag never reverts for the remainder of the session

**`FormulaReadout` panel appears (DOM overlay):**
- Positioned above the canvas, below the prompt strip
- Shows the coordinate rule for the transformation just completed (the final `predict-rotate` round)
- Substitutes the student's actual vertices into the rule — not abstract variables
- Example for `rotate-90-cw` with pre-image vertex A(−3, −2):

  ```
  ROTATE 90° CLOCKWISE
  (x, y) → (y, −x)
  A(−3, −2) → A′(−2, 3)  ✓
  B(1, −1)  → B′(−1, −1) ✓
  C(−2, 1)  → C′(1, 2)   ✓
  ```

- One rule is shown — the rule for the transformation type just completed. Not all three.
- Typography: `lab-data-font` for coordinates, `lab-silk lab-display-font` for labels. No glow. No animation beyond a clean fade-in (150ms, CSS opacity transition).

**ControlStrip state:**
- Single **CONTINUE** button (only control visible)
- Pressing CONTINUE advances to `predict-with-coordinates`

**Pedagogical purpose:** Give students a moment of stillness to connect what they did spatially to what the coordinate rule says. The substituted vertices confirm the rule isn't a coincidence — it works for every point on their shape.

---

### Guide State: `predict-with-coordinates`

The predict-and-reveal loop continues, but now with coordinate notation live throughout. Rounds recycle through all five Phase 2 rounds in stage order (translate rounds first, then reflect, then rotate).

**What changes from Phase 2 predict states:**

1. **Coordinate labels always visible** on the pre-image (`coordinatesActive === true`).

2. **Ghost coordinate readout** updates live as the student drags:
   - Shows current ghost vertex coordinates: A′(x, y), B′(x, y), C′(x, y)
   - Updates on every `ghostOffset` change — no debounce needed (three label positions, not expensive)
   - Rendered as `SpriteLabel` values near each ghost vertex (same offset logic as Phase 2 prime labels)
   - No formula shown yet — just raw coordinates. The student reads the numbers to validate their spatial prediction.

3. **`FormulaReadout` panel persists** from coordinate-reveal, showing the rule for the current round's transformation type. It does not show the answer — it shows the rule. The student applies the rule mentally, then drags to match.

4. **`close` feedback enriched for translate stage:**
   - In Phase 2: "Adjust the position" (generic)
   - In Phase 3: identify *which* coordinate(s) are off and by how much, surfaced in the `FormulaReadout` panel
   - Example: "x is 2 units short · y is correct"
   - This is the only stage where `close` feedback carries coordinate-level specificity. Reflect still has no `close` state. Rotate `close` still means "right position, wrong rotation parameters."

5. **Earned reveal on first match per transformation type** — same as Phase 2. The `EARNED_REVEALS` copy for `predict-with-coordinates` refers to coordinate notation directly:
   - translate: "The rule (x, y) → (x+dx, y+dy) describes exactly the drag you performed."
   - reflect/y: "Negating the x-coordinate is the algebraic description of mirroring across the y-axis."
   - reflect/x: "Negating the y-coordinate is the algebraic description of mirroring across the x-axis."
   - rotate/90cw: "The swap (x, y) → (y, −x) is what 90° clockwise rotation does to every point."

**Stage success requirement:** 2 successful CHECKs per transformation type, same as Phase 2. After completing all three transformation types in `predict-with-coordinates`, the module advances to `capstone`.

---

### `FormulaReadout` Component

**Type:** DOM overlay. Not a Three.js object. Not a `SpriteLabel`.

**Rationale:** Coordinate notation is typographic content. Rendering math-quality notation inside Three.js (without `troika-three-text`, which is forbidden) would require manual kerning on `SpriteLabel` canvases. The DOM handles this for free. The `coordinatesActive` flag already provides the state gate.

**Placement:** Absolute-positioned panel above the R3F canvas, below the prompt strip, within the `InstrumentModule` layout grid. It occupies the same horizontal space as the canvas. Height is dynamic — collapses to zero when `guideState` is not `coordinate-reveal` or `predict-with-coordinates`.

**Implementation:**

```tsx
// In InstrumentModule.tsx — sits between prompt and scene rows
{(guideState === 'coordinate-reveal' || guideState === 'predict-with-coordinates') && (
  <FormulaReadout
    round={currentRound}
    ghostVertices={ghostVertices}  // undefined in coordinate-reveal (no ghost)
    feedbackState={feedbackState}
  />
)}
```

**Content rules:**
- Always shows the coordinate rule for the current round's transformation type
- In `coordinate-reveal`: substitutes confirmed image vertices (from last predict-rotate match)
- In `predict-with-coordinates`: substitutes live ghost vertices when dragging; substitutes confirmed image vertices after match
- Never shows the answer before CHECK

**Style:** `lab-surface` background, `1px solid var(--lab-ghost)` border, `8px` padding. `lab-data-font` for all coordinate values. `lab-text-muted` for unchanged coordinates. `lab-accent` for coordinates that match the formula's expected value. `lab-danger` for coordinates that differ (only shown in `close` feedback).

---

### Camera Adjustment (Phase 3)

The architecture documents a known issue: camera positioned at `[0, 2, 10]` with no explicit `lookAt` places the viewport center at world Y=2. After Phase 2's pre-image repositioning to A(−3,−2) B(1,−1) C(−2,1), the center of activity has shifted toward Y≈−1.

**Phase 3 is the right time to fix this.** No math impact — purely cosmetic. Evaluate adjusting camera position to `[0, -1, 10]` or adding an explicit `lookAt(new THREE.Vector3(0, -1, 0))` in `CameraSetup`. Run on desktop, iPhone 12 Pro, and iPad mini viewport sizes before committing.

---

### Phase 3 File Changes

**New files:**
- `scene/FormulaReadout.tsx` — DOM overlay panel (coordinate rule + vertex substitution)

**Modified files:**

| File | Change |
|---|---|
| `InstrumentModule.tsx` | Mount `FormulaReadout` between prompt and scene rows; wire `coordinate-reveal` → CONTINUE → `predict-with-coordinates` |
| `hooks/useRigidMotionsState.ts` | Add `coordinate-reveal` and `predict-with-coordinates` to guide state machine; flip `coordinatesActive` to `true` on entering `coordinate-reveal` |
| `guide-state.ts` | Add entries for `coordinate-reveal` (successesRequired: 0) and `predict-with-coordinates` (successesRequired: 2 per type × 3 types = 6 total, or sequenced per type — see below) |
| `scene/RigidMotionsScene.tsx` | Pass `coordinatesActive` to `PreImageTriangle`; pass ghost vertex coordinates to `GhostTriangle` for live label updates |
| `scene/GhostTriangle.tsx` | Activate live coordinate `SpriteLabel` values when `coordinatesActive === true` |
| `scene/PreImageTriangle.tsx` | Activate coordinate `SpriteLabel` values when `coordinatesActive === true` |
| `rigid-motions-copy.ts` | Add `EARNED_REVEALS` for `coordinate-reveal` and `predict-with-coordinates`; add close-state coordinate copy |
| `controls/ControlStrip.tsx` | Add CONTINUE-only state for `coordinate-reveal` |

> **`predict-with-coordinates` round sequencing:** Recycles Phase 2 rounds in stage order. The guide state machine tracks a second pass through the same three stages (translate × 2, reflect × 2, rotate × 2). `stageSuccessCount` resets to 0 on each stage entry. The simplest implementation is to add `predict-with-coordinates-translate`, `predict-with-coordinates-reflect`, `predict-with-coordinates-rotate` as distinct guide states — this mirrors the Phase 2 pattern exactly and keeps the state machine table-driven.

---

### Phase 3 Test Coverage

No new pure math functions. Test additions are behavioral:

- `FormulaReadout` rendering: correct rule shown for each transformation type; vertex substitution correct for all five rounds
- `coordinatesActive` flag: `true` after `coordinate-reveal` entry, never reverts
- `close` feedback copy: correct coordinate-level message for translate stage
- Camera Y adjustment: snapshot test at three viewport sizes (if implemented)

---

## Phase 4: Capstone

### Purpose

Phase 4 is the **Level 5 task** — the inverted interaction. The student is shown both the pre-image and an image and must identify the transformation sequence that maps one to the other. This requires reasoning backward from coordinates, not forward from a rule. It is the hardest cognitive demand in the module and the direct expression of 8.G.A.3's "describe the effect" language.

### New Guide State: `capstone`

```
... → predict-with-coordinates → capstone
```

**Scene state:**
- Pre-image triangle visible (unchanged)
- Target image triangle visible in `--lab-accent` (the capstone target, not a confirmed image)
- No ghost (initially — `PreviewGhost` appears when the student begins building a sequence)
- `coordinatesActive === true` (carried from Phase 3)
- Coordinate labels on both triangles

**ControlStrip state:**
- `SequenceBuilder` replaces all other controls (FLIP, ROTATION, CHECK, RESET, SPEED all hidden)
- `SequenceBuilder` occupies the full ControlStrip width

---

### `SequenceBuilder` Component

A two-slot builder in the ControlStrip. The student constructs a transformation sequence of 1 or 2 steps.

**Slot structure (each slot):**

```
[ Type selector ] [ Parameters ] [ × Clear ]
  Translate         ↔ +3, ↑ +2
  Reflect           Y-axis / X-axis
  Rotate            90° / 180° / 270°  CW / CCW
```

- Type selector: toggle group — Translate | Reflect | Rotate (matches Phase 2 ControlStrip conventions)
- Parameters appear conditionally based on type (same controls as Phase 2: vector inputs / axis toggle / degree + direction)
- Clear button removes the slot's selection
- Slot 2 is disabled until Slot 1 has a valid selection
- A **CHECK SEQUENCE** button appears when at least Slot 1 is filled

**Interaction model:**
- The student fills Slot 1. `PreviewGhost` appears immediately, showing the result of Slot 1 alone.
- If the student fills Slot 2, `PreviewGhost` updates to show the composed result.
- The student presses **CHECK SEQUENCE**.
- Scoring runs. Feedback renders.

**Style:** Same `lab-surface` / `lab-accent` / `lab-ghost` token conventions as Phase 2 controls. No new design language introduced.

---

### `PreviewGhost` Component

A non-draggable ghost triangle driven entirely by `SequenceBuilder` state. Distinct from the Phase 2 draggable ghost.

```typescript
interface PreviewGhostProps {
  sequence: SequenceStep[]      // 1 or 2 steps from SequenceBuilder
  preImageVertices: [number, number][]
  coordinatesActive: boolean
}
```

**Rendering:**
- Computed via `applySequence(PRE_IMAGE_VERTICES, sequence)` — the same pure function used in scoring
- Styled identically to the Phase 2 ghost (dashed green outline, prime labels)
- Coordinate labels shown when `coordinatesActive === true` (always true in capstone)
- Updates on every SequenceBuilder change — no debounce (pure math, negligible cost)
- z-layer: 0.02 (same as ImageShape)

**The `PreviewGhost` is the student's primary reasoning tool.** They adjust parameters in the builder and watch the ghost move to test their hypothesis. This is the capstone analog of dragging — the interaction modality shifts from spatial (drag) to symbolic (set parameters), but the immediate visual feedback loop is preserved.

---

### `capstone-utils.ts`

Capstone round definitions and sequence validation.

**Three capstone rounds (1 warm-up + 2 two-step):**

| Round ID | Target Vertices | Solution | Notes |
|---|---|---|---|
| `capstone-1` | Same as `translate-5-3` target: A′(2,1) B′(6,2) C′(3,4) | Translate +5, +3 | Warm-up — student has seen this position. Confirms they can use the builder. |
| `capstone-2` | Computed from reflect-y then translate +2, +3: A′(5,1) B′(1,2) C′(4,4) | Reflect over y-axis, then translate +2, +3 | Two-step. Order matters — translate first gives a different result. |
| `capstone-3` | Computed from translate −2, +1 then rotate 90° CW: A′(−3,5) B′(−3,1) C′(−1,3) | Translate −2, +1, then rotate 90° CW around origin | Two-step. Rotate then translate gives a different result. Surfaces non-commutativity. |

> **Verify all target vertices against `applySequence` before implementation.** These are specified as design intent — the exact coordinates must be confirmed by running the pure math functions.

> **Capstone-3 pedagogical note:** This round deliberately demonstrates that transformation composition is non-commutative. If a student submits "rotate then translate," `applySequence` produces a different result, gap lines appear, and the visual difference is the lesson. No explanatory text needed — the gap lines do the work.

**`capstone-utils.ts` exports:**

```typescript
const CAPSTONE_ROUNDS: CapstoneRound[]

interface CapstoneRound {
  id: string
  targetVertices: [number, number][]
  solutionSequence: SequenceStep[]  // For test validation only — not shown to student
  isTwoStep: boolean
}

function validateCapstoneSequence(
  sequence: SequenceStep[],
  targetVertices: [number, number][]
): FeedbackState  // 'match' | 'miss' — no 'close' state for capstone
```

---

### Capstone Scoring

**Method: result-only (Option B).** Compare `applySequence(PRE_IMAGE_VERTICES, studentSequence)` against `targetVertices` using the same 0.5-unit vertex threshold as Phase 2 `match`.

**Rationale:** Some capstone targets are reachable by more than one valid sequence (e.g., a composition that happens to simplify). Checking sequence parameters exactly would mark valid alternatives as wrong. Checking the result is mathematically honest and uses `applySequence` which is already tested.

**No `close` state for capstone.** The `PreviewGhost` provides continuous feedback during construction — by the time the student presses CHECK SEQUENCE, they can already see whether their ghost is near the target. A `close` state would be redundant. Binary: `match` or `miss`.

**On `miss`:** Gap lines render from each `PreviewGhost` vertex to the corresponding target vertex, using the same `GapLines` component from Phase 2. The student adjusts the builder and tries again. No attempt limit.

**On `match`:**
- `PreviewGhost` animates to the target position using a brief GSAP pulse (scale 1.0 → 1.05 → 1.0, 200ms)
- Earned reveal text appears in the `FormulaReadout` panel
- **NEXT** button replaces **CHECK SEQUENCE** to advance to the next capstone round
- After all three capstone rounds: module completion state (Phase 4 does not specify what comes after — treat as TBD)

---

### Earned Reveals for Capstone

```typescript
const CAPSTONE_EARNED_REVEALS: Record<string, string> = {
  'capstone-1':
    'One transformation was enough. You described it completely with a type and a parameter.',
  'capstone-2':
    'Two transformations composed. The order mattered — try reversing them to see why.',
  'capstone-3':
    'Rotation and translation don\'t commute. The order you chose was the one that works.',
}
```

---

### SequenceStep Type

```typescript
interface SequenceStep {
  type: TransformationType
  params: TransformationParams
}
```

This extends the existing `TransformationParams` union from `types.ts`. No new type definitions required.

---

### Phase 4 File Changes

**New files:**

| File | Purpose |
|---|---|
| `scene/PreviewGhost.tsx` | Non-draggable ghost driven by SequenceBuilder state |
| `controls/SequenceBuilder.tsx` | Two-slot sequence builder UI component |
| `capstone-utils.ts` | Capstone round definitions + `validateCapstoneSequence` |

**Modified files:**

| File | Change |
|---|---|
| `InstrumentModule.tsx` | Wire `capstone` guide state; pass capstone round and sequence state to scene and ControlStrip |
| `hooks/useRigidMotionsState.ts` | Add `capstoneSequence` state (1–2 `SequenceStep[]`); add `handleSequenceChange`, `handleCheckSequence`, `handleCapstoneNext` actions |
| `scene/RigidMotionsScene.tsx` | Mount `PreviewGhost` in capstone state; mount capstone target as a second ImageShape (static, no animation) |
| `controls/ControlStrip.tsx` | Render `SequenceBuilder` when `guideState === 'capstone'`; suppress all Phase 2 controls |
| `rigid-motions-copy.ts` | Add `CAPSTONE_EARNED_REVEALS` |
| `transform-math.ts` | Confirm `applySequence` handles empty sequence (returns pre-image unchanged) and 1-step sequences without branching errors |

---

### Phase 4 Test Coverage

New test file: `__tests__/capstone-utils.test.ts`

- `validateCapstoneSequence`: match on correct solution, miss on incorrect, match on valid alternative sequence that produces same result
- `applySequence` edge cases: empty sequence, 1-step, 2-step for all three capstone rounds
- Round-3 non-commutativity: confirm that `[translate, rotate]` and `[rotate, translate]` produce distinct vertex sets

Existing tests unchanged. `applySequence` is already tested in `transform-math.test.ts` — capstone tests extend coverage with the specific capstone round inputs.

---

## State Architecture (Phase 3 + 4 Additions)

`useRigidMotionsState` additions:

| State | Type | Default | Description |
|---|---|---|---|
| `coordinatesActive` | boolean | false | Flips to `true` on `coordinate-reveal` entry; never reverts |
| `capstoneRoundIndex` | number | 0 | Cycles through `CAPSTONE_ROUNDS` |
| `capstoneSequence` | `SequenceStep[]` | `[]` | Current SequenceBuilder state (0–2 steps) |

New actions:

| Action | Description |
|---|---|
| `handleContinue` | `coordinate-reveal` → `predict-with-coordinates` |
| `handleSequenceChange(steps)` | Update `capstoneSequence` |
| `handleCheckSequence` | Run `validateCapstoneSequence`; set `feedbackState` |
| `handleCapstoneNext` | Advance `capstoneRoundIndex`; reset `capstoneSequence`; reset `feedbackState` |

---

## Complete Guide State Sequence (All Phases)

```
predict-translate
  → predict-reflect
  → predict-rotate
  → coordinate-reveal                    ← Phase 3
  → predict-with-coordinates-translate   ← Phase 3
  → predict-with-coordinates-reflect     ← Phase 3
  → predict-with-coordinates-rotate      ← Phase 3
  → capstone                             ← Phase 4
```

Updated `GUIDE_STATE_SEQUENCE` in `guide-state.ts`:

```typescript
const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',                   index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',                     index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',                      index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',                   index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates-translate',  index: 4, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-with-coordinates-reflect',    index: 5, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-with-coordinates-rotate',     index: 6, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'capstone',                            index: 7, transformationType: 'translate', successesRequired: 3 },
]
```

> This expands `predict-with-coordinates` into three typed states, mirroring the Phase 2 pattern. The `transformationType` field drives which rounds are served and which controls are shown. `successesRequired: 3` for capstone = all three capstone rounds completed.

---

## Key Technical Constraints (Carry Forward from Phase 2)

All Phase 2 constraints apply unchanged:

- **`SpriteLabel` only** — never `<Text>` from drei
- **`WORLD_SCALE = 1`** — math coordinates = world coordinates, no conversion
- **Drag via `DragPlane`** — not R3F pointer events on shape meshes (capstone has no dragging; `DragPlane` is not mounted in capstone state)
- **GSAP for all animations** — no CSS transitions on Three.js objects
- **`useFrame` for camera sync** — not `useEffect`
- **`computeGhostVertices` composition order** — translate → centroid → flip/rotate (not relevant to capstone's `applySequence`, which is origin-based; document the distinction)
- **`ImageShape` imperative BufferGeometry** — no JSX geometry children on animated meshes

**New constraint for Phase 4:** `DragPlane` must not be mounted in `capstone` guide state. The capstone scene has no draggable ghost. Verify `RigidMotionsScene.tsx` gates `DragPlane` on `guideState !== 'capstone'`.

---

## Open Questions (Deferred to Phase 3/4 Implementation)

1. **Module completion state after capstone round 3.** Phase 4 spec ends at "module complete." A final earned-reveal screen, a summary of all transformations with their coordinate rules, or simply returning to the start is TBD. Decide before Phase 4 implementation begins.

2. **`predict-with-coordinates` round count.** Currently: 2 successes per type × 3 types = 6 rounds total (recycling Phase 2 rounds). If session timing shows this is too long for a club period, reduce to 1 success per type. The guide state machine table makes this a one-line change (`successesRequired: 1`).

3. **`FormulaReadout` panel height and canvas reflow.** The panel sits between the prompt strip and the canvas in the 4-row layout grid. Its appearance should not reflow the canvas height. Recommend allocating a fixed-height row in the grid that is empty in Phase 2 states and populated in Phase 3+. Confirm the grid row allocation before implementation.

4. **Capstone target vertex verification.** Capstone-2 and Capstone-3 target vertices in this spec are design intent, not confirmed output. Run `applySequence` against the specified solutions before writing test fixtures.

---

*End of specification. This document supersedes the Phase 3/4 sections of the Phase 2 spec (v3.1) where they conflict.*