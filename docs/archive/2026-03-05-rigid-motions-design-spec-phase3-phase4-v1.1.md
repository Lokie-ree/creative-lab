# Rigid Motions Module — Phase 3 & 4 Design Specification v1.2

**Date:** March 5, 2026
**Status:** v1.2 — all design decisions locked; ready for implementation planning
**Supersedes:** v1.1 (March 5, 2026)
**Standards:** 8.G.A.1, 8.G.A.2, 8.G.A.3
**Course:** Grade 8 Mathematics
**ALD Target:** Level 3 → Level 4 (Phase 3) · Level 5 capstone (Phase 4)

**Related documentation:** `docs/plans/2026-03-02-rigid-motions-design-spec-v3.1.md` · `ARCHITECTURE.md` · `philosophy.md`

**Prerequisites:** Phase 2 complete (predict-and-reveal loop for translate, reflect, rotate; guide state machine through `predict-rotate`).

---

## Design Decisions (v1.2)

Three decisions locked in this revision. These supersede the open questions in v1.1.

### Decision 1 — Constraint Elements in Phase 3

`TranslationVector` and `ReflectionAxisTicks` are **suppressed** in Phase 3 predict stages. `RotationArcs` **persists** into `predict-with-coordinates-rotate`.

**Rationale:** `TranslationVector` is a restatement of `(x+dx, y+dy)` — the formula says the same thing more precisely and the two compete for attention without reinforcing each other. `ReflectionAxisTicks` have done their job in Phase 2; in Phase 3 the student reads `(x,y)→(−x,y)` against live coordinates, a different cognitive task where the ticks add visual noise without new pedagogical contribution. `RotationArcs` are different in kind — `(x,y)→(y,−x)` does not feel like rotation the way `(x+dx,y+dy)` feels like translation, and the arc is the geometric explanation for why the coordinate swap works. A student who sees the arc sweep from A(−3,−2) to A′(−2,3) *while* reading `(−3,−2)→(−2,3)` is getting the connection between the circular path and the algebraic rule. Phase 3 is exactly when that simultaneity pays off.

**Implementation:** `showTranslationVector` and `showAxisTicks` gate only on Phase 2 state names. `showRotationArcs` extends to include `predict-with-coordinates-rotate`. Use `COORDINATE_STAGES` set from `guide-state.ts` for the guard (see Decision 2).

### Decision 2 — Phase 3 Round Selection Mechanism

**Option A** (sequencing behavior in the state hook, not domain logic in `round-generator.ts`).

`stageRoundIndex` resets to **1** when entering a Phase 3 predict state, selecting the harder round per type (`translate-n3-n4`, `reflect-x`, `rotate-90-cw`) — students have seen index 0 in Phase 2. A comment documents the intent inline.

**Implementation:** Export `COORDINATE_STAGES` as a `Set<GuideState>` and `isCoordinateStage(state: GuideState): boolean` from `guide-state.ts`. In `handleNext`, use `isCoordinateStage(next) ? 1 : 0` for the `stageRoundIndex` reset. `COORDINATE_STAGES` is the single source of truth used in at least three places: `stageRoundIndex` reset, constraint element visibility guards (Decision 1), and `FormulaReadout` visibility gate.

```typescript
// In guide-state.ts
export const COORDINATE_STAGES = new Set<GuideState>([
  'predict-with-coordinates-translate',
  'predict-with-coordinates-reflect',
  'predict-with-coordinates-rotate',
])

export function isCoordinateStage(state: GuideState): boolean {
  return COORDINATE_STAGES.has(state)
}
```

### Decision 3 — `CelebrationModal` Threading

**Option A** — extend `onComplete` with an optional `meta` parameter.

`TransformationParams[]` is used throughout instead of `SequenceStep[]`. The `SequenceStep = { type, params }` wrapper is redundant — `TransformationParams` is already a discriminated union where `type` is the discriminant. `{ type: 'reflect', axis: 'y' }` is more readable in `DiscoveryTab` render than `{ type: 'reflect', params: { type: 'reflect', axis: 'y' } }` would be.

**Precondition:** `TransformationParams` and related types (`TransformationType`, `TranslationParams`, `ReflectionParams`, `RotationParams`) must move from `rigid-motions/types.ts` to `src/lib/types/transforms.ts` **before** touching celebration components. `DiscoveryTab` and `CelebrationModal` import from the shared location; rigid-motions module files update their import paths. `GuideState`, `FeedbackState`, and `Round` stay in `rigid-motions/types.ts` — no outside consumers.

**Implementation:**

```typescript
// ModuleProps — onComplete extended
onComplete: (values: Record<string, number>, meta?: { completedSequence?: TransformationParams[] }) => void

// App.tsx — track alongside completedValues
const [completedSequence, setCompletedSequence] = useState<TransformationParams[] | null>(null)

// CelebrationModal — add prop
completedSequence?: TransformationParams[] | null

// DiscoveryTab — add props
moduleId?: string | null
completedSequence?: TransformationParams[] | null
```

---

## Phase 3: Coordinate Layer

### Purpose

Phase 3 is the **Level 3 → Level 4 boundary moment** — the earned reveal of coordinate rules. After demonstrating spatial understanding across all three transformation types, students see the formal coordinate notation for what they already know. Spatial reasoning precedes symbolic description; the formula is a label for an understood idea, not an instruction to memorize.

### New Guide States

```
... → predict-rotate → coordinate-reveal → predict-with-coordinates-translate
                                         → predict-with-coordinates-reflect
                                         → predict-with-coordinates-rotate → ...
```

Phase 3 adds four guide states to the existing sequence (`coordinate-reveal` + 3 typed predict states).

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
- Pressing CONTINUE advances to `predict-with-coordinates-translate`

**Pedagogical purpose:** Give students a moment of stillness to connect what they did spatially to what the coordinate rule says. The substituted vertices confirm the rule isn't a coincidence — it works for every point on their shape.

---

### Guide States: `predict-with-coordinates-translate`, `-reflect`, `-rotate`

The predict-and-reveal loop continues, but now with coordinate notation live throughout. Each typed state runs the harder Phase 2 round for that type (index 1 per stage — `translate-n3-n4`, `reflect-x`, `rotate-90-cw`).

**What changes from Phase 2 predict states:**

1. **Coordinate labels always visible** on the pre-image (`coordinatesActive === true`).

2. **Ghost coordinate readout** updates live as the student drags:
   - Shows current ghost vertex coordinates: A′(x, y), B′(x, y), C′(x, y)
   - Updates on every `ghostOffset` change — no debounce needed (three label positions, not expensive)
   - Rendered as `SpriteLabel` values near each ghost vertex (same offset logic as Phase 2 prime labels)
   - No formula shown yet — just raw coordinates. The student reads the numbers to validate their spatial prediction.

3. **`FormulaReadout` panel persists**, showing the rule for the current round's transformation type. It does not show the answer — it shows the rule. The student applies the rule mentally, then drags to match.

4. **Constraint elements (per Decision 1):**
   - `predict-with-coordinates-translate`: no `TranslationVector` (suppressed in Phase 3)
   - `predict-with-coordinates-reflect`: no `ReflectionAxisTicks` (suppressed in Phase 3)
   - `predict-with-coordinates-rotate`: `RotationArcs` visible (persists from Phase 2)

5. **`close` feedback enriched for translate stage:**
   - In Phase 2: "Adjust the position" (generic)
   - In Phase 3: identify *which* coordinate(s) are off and by how much, surfaced in the `FormulaReadout` panel
   - Example: "x is 2 units short · y is correct"
   - This is the only stage where `close` feedback carries coordinate-level specificity. Reflect still has no `close` state. Rotate `close` still means "right position, wrong rotation parameters."

6. **Earned reveal on first match per transformation type** — same as Phase 2. The `EARNED_REVEALS` copy for Phase 3 states refers to coordinate notation directly:
   - `predict-with-coordinates-translate`: "The rule (x, y) → (x+dx, y+dy) describes exactly the drag you performed."
   - `predict-with-coordinates-reflect` (y-axis): "Negating the x-coordinate is the algebraic description of mirroring across the y-axis."
   - `predict-with-coordinates-reflect` (x-axis): "Negating the y-coordinate is the algebraic description of mirroring across the x-axis."
   - `predict-with-coordinates-rotate` (90° CW): "The swap (x, y) → (y, −x) is what 90° clockwise rotation does to every point."

**Stage success requirement:** 1 successful CHECK per transformation type (3 rounds total). After `predict-with-coordinates-rotate` completes, the module advances to `capstone`.

---

### `FormulaReadout` Component

**Type:** DOM overlay. Not a Three.js object. Not a `SpriteLabel`.

**Rationale:** Coordinate notation is typographic content. Rendering math-quality notation inside Three.js (without `troika-three-text`, which is forbidden) would require manual kerning on `SpriteLabel` canvases. The DOM handles this for free. The `coordinatesActive` flag already provides the state gate.

**Placement:** Absolute-positioned panel above the R3F canvas, below the prompt strip, within the `InstrumentModule` layout grid. It occupies the same horizontal space as the canvas. Height is dynamic — collapses to zero when `guideState` is not `coordinate-reveal` or a Phase 3 predict state.

**Implementation:**

```tsx
// In InstrumentModule.tsx — sits between prompt and scene rows
{(guideState === 'coordinate-reveal' || isCoordinateStage(guideState)) && (
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
- In Phase 3 predict states: substitutes live ghost vertices when dragging; substitutes confirmed image vertices after match
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

**Precondition (before any celebration file changes):**
- `src/lib/types/transforms.ts` — move `TransformationType`, `TranslationParams`, `ReflectionParams`, `RotationParams`, `TransformationParams` out of `rigid-motions/types.ts` into this shared location. Update imports in the 4 rigid-motions files that consume them.

**Modified files:**

| File | Change |
|---|---|
| `src/lib/types/transforms.ts` | New file — shared `TransformationParams` union (precondition) |
| `InstrumentModule.tsx` | Mount `FormulaReadout` between prompt and scene rows using `isCoordinateStage`; add 5th grid row for FormulaReadout panel (fixed height, collapses when empty) |
| `hooks/useRigidMotionsState.ts` | Add 3 typed Phase 3 states to guide state machine; flip `coordinatesActive` on entering `coordinate-reveal`; fix `handleNext` to use `getGuideStateConfig(guideState).successesRequired` (removes hardcoded `2`); reset `stageRoundIndex` to `isCoordinateStage(next) ? 1 : 0` on stage entry |
| `guide-state.ts` | Replace `predict-with-coordinates` entry with 3 typed entries (indices 4–6, `successesRequired: 1` each); add `guideStateToStage` cases for all three; export `COORDINATE_STAGES` set and `isCoordinateStage` predicate |
| `types.ts` | Replace `'predict-with-coordinates'` with 3 typed literals in `GuideState` union; update `TransformationParams` import to `src/lib/types/transforms.ts` |
| `scene/RigidMotionsScene.tsx` | Update `showTranslationVector` / `showAxisTicks` guards to exclude Phase 3 states; extend `showRotationArcs` to include `predict-with-coordinates-rotate`; pass `coordinatesActive` and ghost vertex coordinates to relevant components |
| `scene/scene-math.ts` | Extend `computeGhostVertices` if-branches to handle Phase 3 reflect and rotate states (same behavior as their Phase 2 counterparts) |
| `rigid-motions-copy.ts` | Update `EARNED_REVEALS` keys to match new `GuideState` union (3 typed Phase 3 entries); add close-state coordinate copy for translate stage in Phase 3 |
| `controls/ControlStrip.tsx` | Update `PREDICT_STATES` to include 3 typed Phase 3 states; update `showFlip`/`showRotation` checks to use `'-reflect'`/`'-rotate'` variants |
| `rigid-motions/types.ts` | Update `TransformationParams` import to `src/lib/types/transforms.ts`; remove types that moved |

> **`InstrumentModule.tsx` grid row allocation:** The 4-row layout is currently `grid-rows-[3rem_auto_1fr_auto]`. Adding FormulaReadout requires a 5th row: `grid-rows-[3rem_auto_auto_1fr_auto]`. The FormulaReadout row is empty (zero height) in Phase 2 states and populated in Phase 3+. This avoids canvas reflow on entry.

---

### Phase 3 Test Coverage

No new pure math functions. Test additions are behavioral:

- `FormulaReadout` rendering: correct rule shown for each transformation type; vertex substitution correct for all five rounds
- `coordinatesActive` flag: `true` after `coordinate-reveal` entry, never reverts
- `close` feedback copy: correct coordinate-level message for translate stage
- `guide-state.test.ts`: update "has 6 states" → "has 8 states"; add Phase 3 transition tests; add `guideStateToStage` cases; add `isCoordinateStage` tests
- Camera Y adjustment: snapshot test at three viewport sizes (if implemented)

---

## Phase 4: Capstone

### Purpose

Phase 4 is the **Level 5 task** — the inverted interaction. The student is shown both the pre-image and an image and must identify the transformation sequence that maps one to the other. This requires reasoning backward from coordinates, not forward from a rule. It is the hardest cognitive demand in the module and the direct expression of 8.G.A.3's "describe the effect" language.

### New Guide State: `capstone`

```
... → predict-with-coordinates-rotate → capstone
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
  sequence: TransformationParams[]  // 1 or 2 steps from SequenceBuilder
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
| `capstone-3` | Computed from translate −2, +1 then rotate 90° CW: A′(−1,5) B′(0,1) C′(2,4) | Translate −2, +1, then rotate 90° CW around origin | Two-step. Rotate then translate gives a different result. Surfaces non-commutativity. |

> **All target vertices verified** by running `applySequence` against the specified solutions (March 5, 2026). Reversed sequences confirmed to produce distinct vertex sets for both capstone-2 and capstone-3.

> **Capstone-3 pedagogical note:** This round deliberately demonstrates that transformation composition is non-commutative. If a student submits "rotate then translate," `applySequence` produces a different result, gap lines appear, and the visual difference is the lesson. No explanatory text needed — the gap lines do the work.

**`capstone-utils.ts` exports:**

```typescript
const CAPSTONE_ROUNDS: CapstoneRound[]

interface CapstoneRound {
  id: string
  targetVertices: [number, number][]
  solutionSequence: TransformationParams[]  // For test validation only — not shown to student
  isTwoStep: boolean
}

function validateCapstoneSequence(
  sequence: TransformationParams[],
  targetVertices: [number, number][]
): FeedbackState  // 'match' | 'miss' — no 'close' state for capstone
```

---

### Capstone Scoring

**Method: result-only.** Compare `applySequence(PRE_IMAGE_VERTICES, studentSequence)` against `targetVertices` using the same 0.5-unit vertex threshold as Phase 2 `match`.

**Rationale:** Some capstone targets are reachable by more than one valid sequence (e.g., a composition that happens to simplify). Checking sequence parameters exactly would mark valid alternatives as wrong. Checking the result is mathematically honest and uses `applySequence` which is already tested.

**No `close` state for capstone.** The `PreviewGhost` provides continuous feedback during construction — by the time the student presses CHECK SEQUENCE, they can already see whether their ghost is near the target. A `close` state would be redundant. Binary: `match` or `miss`.

**On `miss`:** Gap lines render from each `PreviewGhost` vertex to the corresponding target vertex, using the same `GapLines` component from Phase 2. The student adjusts the builder and tries again. No attempt limit.

**On `match` (non-final capstone rounds):**
- `PreviewGhost` animates with a brief GSAP pulse (scale 1.0 → 1.05 → 1.0, 200ms)
- Earned reveal text appears in the `FormulaReadout` panel
- **NEXT** button replaces **CHECK SEQUENCE** to advance to the next capstone round

**On `match` (final capstone round — capstone-3):**
- `PreviewGhost` animates with pulse
- `CelebrationModal` fires with `moduleId="rigid-motions"` and `initialTab="discovery"`
- The modal's **Your Discovery** tab renders the rigid-motions branch (see `DiscoveryTab` below)
- The modal's **Behind This** tab uses the existing `BEHIND_THIS` export — no changes needed
- The modal's **Go Deeper** tab is module-agnostic — no changes needed

---

### `DiscoveryTab` — Rigid Motions Branch

`DiscoveryTab` currently renders sinewaves-specific content. It needs a rigid-motions branch keyed on `moduleId`.

**Updated interface:**

```tsx
interface DiscoveryTabProps {
  values: Record<string, number> | null
  skipped?: boolean
  moduleId?: string | null
  completedSequence?: TransformationParams[] | null
}
```

`TransformationParams` imported from `src/lib/types/transforms.ts`.

**Rigid-motions branch content:**

```
YOU BUILT:
[ Reflect over y-axis ] → [ Translate +2, +3 ]

Through construction, not selection.
```

- Each sequence step rendered as a labeled chip (same visual language as `SequenceBuilder`)
- If 1-step: single chip, no arrow
- If 2-step: two chips with `→` between them
- Below: a one-line summary from `CAPSTONE_COMPLETION_COPY[roundId]`
- Below that: the coordinate rule for the final transformation type, sourced from `FormulaReadout`'s existing content

**`CAPSTONE_COMPLETION_COPY` in `rigid-motions-copy.ts`:**

```typescript
export const CAPSTONE_COMPLETION_COPY: Record<string, string> = {
  'capstone-1': 'One transformation. You named it completely.',
  'capstone-2': 'Two steps composed. Order determined the outcome.',
  'capstone-3': 'Composition is non-commutative. You found the sequence that works.',
}
```

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
| `InstrumentModule.tsx` | Wire `capstone` guide state; pass capstone round and sequence state to scene and ControlStrip; call `onComplete({}, { completedSequence })` on final capstone match |
| `hooks/useRigidMotionsState.ts` | Add `capstoneRoundIndex`, `capstoneSequence: TransformationParams[]`, `showCelebration`; add `handleSequenceChange`, `handleCheckSequence`, `handleCapstoneNext` actions |
| `scene/RigidMotionsScene.tsx` | Mount `PreviewGhost` in capstone state; mount capstone target as a second ImageShape (static, no animation); gate `DragPlane` on `guideState !== 'capstone'` |
| `controls/ControlStrip.tsx` | Render `SequenceBuilder` when `guideState === 'capstone'`; suppress all Phase 2 controls |
| `rigid-motions-copy.ts` | Add `CAPSTONE_EARNED_REVEALS`, `CAPSTONE_COMPLETION_COPY` |
| `transform-math.ts` | Confirm `applySequence` handles empty sequence (returns pre-image unchanged) and 1-step sequences without branching errors |
| `config/modules.ts` (or `ModuleProps`) | Extend `onComplete` signature: `(values: Record<string, number>, meta?: { completedSequence?: TransformationParams[] }) => void` |
| `App.tsx` | Add `completedSequence` state alongside `completedValues`; set from `handleModuleComplete` meta; pass to `CelebrationModal` |
| `CelebrationModal.tsx` | Add `completedSequence?: TransformationParams[] | null` prop; thread to `DiscoveryTab` |
| `DiscoveryTab.tsx` | Add `moduleId` and `completedSequence` props; add rigid-motions branch rendering sequence chips and completion copy |

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
| `capstoneSequence` | `TransformationParams[]` | `[]` | Current SequenceBuilder state (0–2 steps) |
| `showCelebration` | boolean | false | Fires `CelebrationModal` on final capstone match |

New actions:

| Action | Description |
|---|---|
| `handleContinue` | `coordinate-reveal` → `predict-with-coordinates-translate` (distinct from `handleNext`) |
| `handleSequenceChange(steps)` | Update `capstoneSequence` |
| `handleCheckSequence` | Run `validateCapstoneSequence`; set `feedbackState` |
| `handleCapstoneNext` | Advance `capstoneRoundIndex`; reset `capstoneSequence`; reset `feedbackState` |

---

## Complete Guide State Sequence (All Phases)

```
predict-translate
  → predict-reflect
  → predict-rotate
  → coordinate-reveal                        ← Phase 3
  → predict-with-coordinates-translate       ← Phase 3
  → predict-with-coordinates-reflect         ← Phase 3
  → predict-with-coordinates-rotate          ← Phase 3
  → capstone                                 ← Phase 4
```

Updated `GUIDE_STATE_SEQUENCE` in `guide-state.ts`:

```typescript
const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',                   index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',                     index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',                      index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',                   index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates-translate',  index: 4, transformationType: 'translate', successesRequired: 1 },
  { state: 'predict-with-coordinates-reflect',    index: 5, transformationType: 'reflect',   successesRequired: 1 },
  { state: 'predict-with-coordinates-rotate',     index: 6, transformationType: 'rotate',    successesRequired: 1 },
  { state: 'capstone',                            index: 7, transformationType: 'translate', successesRequired: 3 },
]
```

> `successesRequired: 1` per Phase 3 type = 3 rounds total through the coordinate layer. `successesRequired: 3` for capstone = all three capstone rounds. `handleNext` uses `getGuideStateConfig(guideState).successesRequired` — no hardcoded values.

---

## Key Technical Constraints (Carry Forward from Phase 2)

All Phase 2 constraints apply unchanged:

- **`SpriteLabel` only** — never `<Text>` from drei
- **`WORLD_SCALE = 1`** — math coordinates = world coordinates, no conversion
- **Drag via `DragPlane`** — not R3F pointer events on shape meshes
- **GSAP for all animations** — no CSS transitions on Three.js objects
- **`useFrame` for camera sync** — not `useEffect`
- **`computeGhostVertices` composition order** — translate → centroid → flip/rotate (not relevant to capstone's `applySequence`, which is origin-based; document the distinction)
- **`ImageShape` imperative BufferGeometry** — no JSX geometry children on animated meshes

**New constraints for Phase 3/4:**
- **`DragPlane` must not mount in `capstone`** — gate on `guideState !== 'capstone'`
- **`TransformationParams` from `src/lib/types/transforms.ts`** — celebration components never import from module-internal paths
- **`COORDINATE_STAGES` is the single source of truth** — never check Phase 3 state names inline; always use `isCoordinateStage()`

---

## Open Questions

All open questions from v1.0 and v1.1 are resolved. No deferred items remain.

---

*End of specification v1.2. Supersedes v1.1 (March 5, 2026). All design decisions locked. Ready for implementation planning.*
