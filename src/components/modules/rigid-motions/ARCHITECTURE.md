# Rigid Motions Module Architecture

## Overview

The rigid motions module teaches geometric transformations (translations, rotations, reflections) through interactive prediction and sequence construction. The student drags a ghost triangle to predict where a pre-image will land after a transformation, checks their answer to see the correct image animate into place, then reads coordinate rules that formalize what they already know spatially, and finally constructs multi-step transformation sequences in the capstone.

**Core Learning Goal**: Build intuition for rigid motions (8.G.A.1–3) by predicting and verifying triangle placements on a coordinate grid, then connecting spatial reasoning to coordinate notation.

**ALD Target**: Level 3 entry → Level 4 primary → Level 5 capstone.

**Design spec**: archived — see git history for `2026-03-05-rigid-motions-design-spec-phase3-phase4-v1.1.md`

---

## Phase Status

| Phase | Status | Scope |
|---|---|---|
| Phase 1 | Complete | Translation-only predict loop, no scoring. Draggable ghost, coordinate grid, R3F scene. |
| Phase 2 | Complete | Full predict-and-reveal loop for translate, reflect, rotate. Match scoring, reveal animation, constraint elements, guide state machine. |
| Phase 3 | Complete | Coordinate label layer (`coordinatesActive`), `FormulaReadout`, `coordinate-reveal` guide state, Phase 3 predict-with-coordinates states. |
| Phase 4 | Complete | Capstone: `SequenceBuilder`, `PreviewGhost`, `capstone-utils.ts`, `CelebrationModal` threading via `completedSequence`. |

---

## File Structure

```
src/components/modules/rigid-motions/
├── InstrumentModule.tsx          # Entry: back-chevron status strip, 5-row mobile / 2-col desktop layout, full Phase 2–4 state wiring
├── constants.ts                  # Grid range, content range, triangle vertices, labels
├── types.ts                      # GuideState, FeedbackState, Round; re-exports TransformationParams from @/lib/types/transforms
├── transform-math.ts             # Pure math: translate, reflectOverX/Y, rotateCW90/180/270, applyTransform, applySequence
├── match-scoring.ts              # scoreGuess — behavior varies by stage (translate/reflect/rotate)
├── round-generator.ts            # ROUNDS (5 deterministic rounds), getRoundsForStage, getRoundById
├── guide-state.ts                # GUIDE_STATE_SEQUENCE, nextGuideState, guideStateToStage, COORDINATE_STAGES, isCoordinateStage
├── animations.ts                 # interpolateReveal — GSAP-driven t=0→1 per transformation type
├── rigid-motions-copy.ts         # All user-facing strings: PROMPT_TEXT, EARNED_REVEALS (RevealBeat type, 12 beat-indexed entries), CAPSTONE_EARNED_REVEALS, CAPSTONE_COMPLETION_COPY, BEHIND_THIS, SYNTHESIS_REVEAL, PHASE_LABELS (2|3|4 → string), formatCoordinateRule (TransformationParams → display string)
├── capstone-utils.ts             # CAPSTONE_ROUNDS definitions + validateCapstoneSequence
├── hooks/
│   └── useRigidMotionsState.ts   # All state + actions: ghost, guide, feedback, controls, capstone sequence
├── scene/
│   ├── RigidMotionsScene.tsx     # R3F Canvas shell + all 3D components
│   ├── scene-layout.ts           # useRigidMotionsLayout — camera zoom from viewport
│   ├── scene-math.ts             # ghostVertices, clampOffset, computeGhostVertices, vertexLabelOffset
│   ├── scene-primitives.tsx      # SpriteLabel, makeTriangleShape (shared across scene files)
│   ├── FormulaReadout.tsx        # DOM overlay: coordinate rule + vertex substitution (Phase 3+)
│   ├── PreviewGhost.tsx          # Non-draggable ghost driven by SequenceBuilder state (Phase 4)
│   ├── TranslationVector.tsx     # Dashed arrow from pre-image centroid to ghost centroid
│   ├── ReflectionAxisTicks.tsx   # Perpendicular tick lines; color = green when equidistant
│   ├── RotationArcs.tsx          # Origin-fixed arc sweeps per pre-image vertex
│   ├── ImageShape.tsx            # Confirmed image; GSAP-animated reveal, BufferGeometry refs; A′B′C′ SpriteLabels appear after animation
│   ├── GapLines.tsx              # Miss feedback: dashed lines ghost → target per vertex
│   └── __tests__/
│       ├── transform-math.test.ts   # 45 tests — all round definitions, edge cases
│       ├── match-scoring.test.ts    # 16 tests — all stages, close/miss/match boundaries
│       ├── round-generator.test.ts  # 19 tests — round contents, stage grouping
│       ├── guide-state.test.ts      # guide state sequence, transitions, stage mapping, isCoordinateStage
│       ├── animations.test.ts       # 11 tests — interpolateReveal at t=0, t=0.5, t=1
│       └── scene-math.test.ts       # 20 tests — clampOffset, computeGhostVertices composition
├── components/
│   └── PromptReadout.tsx         # Prompt label + text block; accepts optional notation (lab-data-font), notationStyle ('rule'|'congruence'), trailingText
├── controls/
│   ├── ControlStrip.tsx          # Context-sensitive FLIP, ROTATION, CHECK/NEXT, RESET; CONTINUE for coordinate-reveal and synthesis-reveal; renders SequenceBuilder in capstone
│   └── SequenceBuilder.tsx       # Two-slot sequence builder UI (Phase 4)
└── __tests__/
    ├── guide-state.test.ts       # Top-level guide state tests
    └── capstone-utils.test.ts    # validateCapstoneSequence, applySequence edge cases, non-commutativity
```

> **Orphaned file**: `scene/math.ts` exports `snapToGrid` which is no longer imported anywhere.
> It was planned for `useRigidMotionsState` but removed when the design settled on free-drag (clamped,
> not snapped). Safe to delete.

**Shared type location**: `TransformationType`, `TranslationParams`, `ReflectionParams`, `RotationParams`, `TransformationParams` live in `src/lib/types/transforms.ts`. Celebration components (`CelebrationModal`, `DiscoveryTab`) import from there. `types.ts` re-exports them for module-internal convenience. `GuideState`, `FeedbackState`, and `Round` remain in `types.ts` — no outside consumers.

---

## Component Hierarchy

```
InstrumentModule
└── grid: [status strip | prompt | formula readout | scene | control strip]
    ├── header       — back chevron (ChevronLeft, all viewports) + module title (desktop-only) + LED progress dots
    ├── div          — "Predict" label + PROMPT_TEXT[currentRound.id] (mobile only; null in capstone)
    ├── div          — FormulaReadout (Phase 3+; null in Phase 2 — no placeholder div)
    ├── main         — RigidMotionsScene
    │   └── Canvas (R3F, orthographic)
    │       ├── ContextRecovery       — webglcontextlost / webglcontextrestored
    │       ├── CameraSetup           — orthographic zoom + frustum plane sync via useFrame
    │       ├── CoordinateGrid        — grid lines, axes, origin dot, SpriteLabel numbers
    │       ├── PreImageTriangle      — static white triangle, SpriteLabel vertex labels
    │       ├── GhostTriangle         — green dashed triangle; uses computeGhostVertices
    │       │                           (hidden in coordinate-reveal, capstone, and when feedbackState === 'match')
    │       ├── PreviewGhost          — non-draggable ghost driven by SequenceBuilder (capstone only)
    │       ├── ImageShape            — confirmed image; GSAP reveal animation + A′B′C′ SpriteLabels after animation
    │       │                           (shown when feedbackState === 'match')
    │       ├── GapLines              — miss feedback: dashed vertex-to-target lines
    │       │                           (shown when feedbackState === 'miss')
    │       ├── TranslationVector     — dashed arrow, pre-image → ghost centroid
    │       │                           (Phase 2 predict-translate only; suppressed in Phase 3)
    │       ├── ReflectionAxisTicks   — perpendicular tick pairs, green when equidistant
    │       │                           (Phase 2 predict-reflect only; suppressed in Phase 3)
    │       ├── RotationArcs          — origin-fixed arcs per pre-image vertex
    │       │                           (predict-rotate AND predict-with-coordinates-rotate)
    │       └── DragPlane             — invisible full-screen mesh; captures pointer events
    │                                   (gated off in capstone — PreviewGhost is non-draggable)
    └── footer — ControlStrip (mobile only; desktop uses sidebar)
                 Phase 2: FLIP | ROTATION | CHECK/NEXT | RESET
                 Phase 3: same controls (coordinate-reveal shows CONTINUE only)
                 Phase 4: SequenceBuilder replaces all other controls
```

---

## Round Definitions

Five deterministic rounds — no random generation.

Pre-image: **A(−3,−2) B(1,−1) C(−2,1)**, centroid (−1.33, −0.67). Ghost initial offset **[3, −3]** (ghost opens at Q4: A′(0,−5) B′(4,−4) C′(1,−2)).

| Round ID | Stage | Transform | Target Vertices | Target Centroid | Notes |
|---|---|---|---|---|---|
| `translate-5-3` | translate | +5 right, +3 up | A′(2,1) B′(6,2) C′(3,4) | (3.67, 2.33) | Ghost starts Q4; drags diagonally to Q1. Phase 2 index 0. |
| `translate-n3-n4` | translate | −3 left, −4 down | A′(−6,−6) B′(−2,−5) C′(−5,−3) | (−4.33, −4.67) | Ghost drags from Q4 across to Q3. Phase 3 index 1. |
| `reflect-y` | reflect | over y-axis | A′(3,−2) B′(−1,−1) C′(2,1) | (1.33, −0.67) | FLIP required; centroid shifts to +x. Phase 2 index 0. |
| `reflect-x` | reflect | over x-axis | A′(−3,2) B′(1,1) C′(−2,−1) | (−1.33, 0.67) | FLIP required; centroid shifts to +y. Phase 3 index 1. |
| `rotate-90-cw` | rotate | 90° CW around origin | A′(−2,3) B′(−1,−1) C′(1,2) | (−0.67, 1.33) | Vertices differ from `reflect-x`; scoring differentiates at vertex level. Both Phase 2 and Phase 3 (index 0 and 1 both map to this round for rotate). |

Ghost initial offset is `[3, -3]` for all rounds.

---

## Guide State Machine

```
predict-translate
  → predict-reflect
  → predict-rotate
  → coordinate-reveal                        ← Phase 3 (pause state, no ghost)
  → predict-with-coordinates-translate       ← Phase 3
  → predict-with-coordinates-reflect         ← Phase 3
  → predict-with-coordinates-rotate          ← Phase 3
  → synthesis-reveal                         ← Phase 3 (passive reveal, no ghost)
  → capstone                                 ← Phase 4
```

Full `GUIDE_STATE_SEQUENCE` from `guide-state.ts`:

```typescript
const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',                  index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',                    index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',                     index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',                  index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates-translate', index: 4, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-with-coordinates-reflect',   index: 5, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-with-coordinates-rotate',    index: 6, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'synthesis-reveal',                   index: 7, transformationType: 'translate', successesRequired: 0 },
  { state: 'capstone',                           index: 8, transformationType: 'translate', successesRequired: 3 },
]
```

- Phase 2 predict stages require **2 successful CHECK results** before advancing.
- Phase 3 predict stages require **2 successful CHECK results** each.
- `coordinate-reveal` requires 0 successes — it's a pause state, CONTINUE advances immediately.
- `synthesis-reveal` requires 0 successes — it's a passive reveal shown after all coordinate predict rounds, before capstone. CONTINUE advances immediately.
- `capstone` requires **3** — one per capstone round.
- `handleNext` reads `getGuideStateConfig(guideState).successesRequired` — no hardcoded values.

`COORDINATE_STAGES` (exported from `guide-state.ts`) is the single source of truth for Phase 3 state detection. Used in three places: `stageRoundIndex` reset, constraint element visibility guards, and `FormulaReadout` visibility gate. Always use `isCoordinateStage(state)` — never check Phase 3 state names inline.

---

## Capstone Rounds

Three capstone rounds (1 warm-up + 2 two-step). Target vertices verified by running `applySequence` against each solution.

| Round ID | Target Vertices | Solution | Notes |
|---|---|---|---|
| `capstone-1` | A′(2,1) B′(6,2) C′(3,4) | Translate +5, +3 | Warm-up — same position as `translate-5-3`. Confirms builder usage. |
| `capstone-2` | A′(5,1) B′(1,2) C′(4,4) | Reflect over y-axis, then translate +2, +3 | Two-step. Order matters. |
| `capstone-3` | A′(−1,5) B′(0,1) C′(2,4) | Translate −2, +1, then rotate 90° CW | Two-step. Reversed order produces distinct vertices — surfaces non-commutativity. |

Scoring is result-only: `applySequence(PRE_IMAGE_VERTICES, studentSequence)` vs `targetVertices` at 0.5-unit threshold. Any sequence producing the target is valid. Binary: `match` or `miss` — no `close` state.

---

## Key Technical Decisions

### `computeGhostVertices` — composition order is load-bearing

The most critical constraint in Phase 2. Apply in this order only:

```
1. Translate (apply baseOffset to pre-image vertices)
2. Find centroid of the translated position
3. Apply FLIP or ROTATION around that translated centroid
```

Applying step 3 before step 1 uses the pre-image centroid (−1.33, −0.67) instead of the dragged centroid. This produces visually plausible but geometrically wrong ghosts at many offset positions. The order is enforced in `scene-math.ts` with a comment and tested in `scene-math.test.ts`.

Note: `applySequence` in `transform-math.ts` (used for capstone scoring and `PreviewGhost`) is origin-based — it applies each transformation to the result of the previous one, with no centroid-relative step. The two composition models serve different purposes and must not be conflated.

### FLIP is a local transform — not a global reflection

FLIP mirrors the ghost's vertices through its **own centroid**, not over the reflection axis. This is intentional: if FLIP performed a global reflection, pressing it once would jump the ghost directly to the correct answer, eliminating the prediction task.

The student must first drag the ghost to the correct position, then toggle FLIP. `ReflectionAxisTicks` provides real-time visual feedback: the perpendicular tick lines from each pre-image/ghost vertex pair to the axis turn green when all three pairs are equidistant. This is the match signal for the reflect stage (no `close` state exists for reflect).

### ROTATION is a local transform — `RotationArcs` are origin-fixed

Ghost rotation applies around the **ghost's current centroid** (local), for the same reason as FLIP — global origin rotation would solve the task in one press.

`RotationArcs` deliberately renders arc sweeps centered on the **origin (0, 0)**. These arcs only align with the ghost's actual vertices when the ghost is in the mathematically correct position. A student who understands *why* the arcs align at one specific ghost position understands what rotation around the origin means geometrically. This is the module's **Level 5 pedagogical moment**.

`RotationArcs` persists into `predict-with-coordinates-rotate` (Phase 3). The arc provides the geometric explanation for why the coordinate swap `(x,y)→(y,−x)` works — seeing the arc sweep from A(−3,−2) to A′(−2,3) while reading the formula creates the connection between circular path and algebraic rule.

### Match scoring varies by stage

Not uniform across transformation types:

| Stage | `match` | `close` | `miss` |
|---|---|---|---|
| translate | all verts ≤0.5 from target | centroid ≤0.5, some verts outside | centroid >0.5 |
| reflect | all verts ≤0.5 AND `flipped === true` | — (no close state) | anything else |
| rotate | all verts ≤0.5 AND rotation settings match | centroid ≤0.5, wrong rotation | centroid >0.5 |
| capstone | `applySequence` result ≤0.5 per vertex | — (no close state) | anything else |

Reflect and capstone have no `close` state. For reflect, position-correct + orientation-wrong produces a visually obvious triangle; gap lines crossing the reflection axis are more informative. For capstone, `PreviewGhost` provides continuous feedback during construction — by CHECK time the student can already see whether their ghost is near the target.

### `FormulaReadout` — DOM overlay, not Three.js

`FormulaReadout` is a DOM overlay positioned in the layout grid (row 3), not a Three.js object or `SpriteLabel`. Coordinate notation is typographic content; rendering math-quality notation inside Three.js without `troika-three-text` (forbidden — see below) would require manual kerning on `SpriteLabel` canvases. The DOM handles this for free.

Visible when `guideState === 'coordinate-reveal' || isCoordinateStage(guideState)`. In `coordinate-reveal`: shows the rule for the last completed transformation with confirmed image vertices substituted. In Phase 3 predict states: shows the rule with live ghost vertices while dragging, confirmed vertices after match.

### `PreviewGhost` — non-draggable, sequence-driven

`PreviewGhost` is a non-draggable ghost triangle in the capstone. It is computed via `applySequence(PRE_IMAGE_VERTICES, capstoneSequence)` and updates on every `SequenceBuilder` change. `DragPlane` is gated off in `capstone` — the scene is not interactive via drag.

The `PreviewGhost` is the capstone analog of dragging: the interaction modality shifts from spatial (drag) to symbolic (set parameters), but the immediate visual feedback loop is preserved.

### `ImageShape` uses imperative BufferGeometry — not JSX geometry children

The reveal animation drives vertex positions on every GSAP tick via `vertsRef`. If geometry were set via JSX children (`<shapeGeometry args={[shape]} />`), React's reconciler would own it and conflict with imperative updates in `useFrame`. The correct pattern:

1. Create `THREE.BufferGeometry` in a `useRef` — **outside** React rendering
2. Attach to the mesh once in `useEffect`
3. Update `attr.setXYZ` + `attr.needsUpdate = true` in `useFrame`
4. Never use JSX geometry children on the same mesh

Both fill (triangle) and outline (polyline) geometries in `ImageShape` follow this pattern.

### `interpolateReveal` paths by transformation type

| Type | Interpolation |
|---|---|
| translate | Linear lerp of each vertex x and y |
| reflect/y | x passes through 0 at t=0.5; y constant |
| reflect/x | y passes through 0 at t=0.5; x constant |
| rotate | Each vertex sweeps its arc at constant radius; angle = startAngle + sweep × t |

### SpriteLabel instead of `@react-three/drei` `Text`

**Never use `<Text>` from `@react-three/drei` in this module.**

`Text` uses `troika-three-text` which creates a secondary offscreen WebGL context. React StrictMode double-mounts every component in dev. Together they exhaust the browser's WebGL context limit (~8 in Chromium), causing the main scene context to be killed on load.

`SpriteLabel` renders text to a 2D `<canvas>`, uploads it as a `THREE.CanvasTexture`, and displays it on a `PlaneGeometry` mesh. Zero extra WebGL contexts. Defined in `scene-primitives.tsx`.

### Orthographic camera zoom + frustum via `useFrame`, not `useEffect`

`useEffect` on viewport `size` causes a one-frame lag on resize — the scene briefly shows the wrong zoom before correcting. `useFrame` eliminates the lag.

`CameraSetup` updates **both** `camera.zoom` and the frustum planes (`left`, `right`, `top`, `bottom`) each frame. Zoom alone is insufficient: an orthographic camera also needs its frustum planes recomputed when the aspect ratio changes. On Android Chrome 90° rotation the aspect ratio flips instantly, and stale pixel-unit frustum planes cause content to be clipped. Both updates use a deadband to avoid unnecessary `updateProjectionMatrix` calls — `> 0.001` for zoom, `> 0.5px` for each frustum plane.

Frustum planes are kept in pixel units (`±size.width/2`, `±size.height/2`), matching R3F's default orthographic setup. Combined with `zoom = shorterSide / (GRID_RANGE × 2)`, this ensures the full ±9 grid is always visible along the shorter viewport axis, with extra space on the longer axis at any aspect ratio.

Camera is positioned at `[0, 2, 10]` (no explicit lookAt — faces along −Z, viewport center at world Y=2). With the pre-image spanning Q2/Q3 and targets ranging y ∈ [−6, 4], this Y offset is approximate. Phase 3 evaluation did not require adjustment — the layout is tolerable across tested viewport sizes.

---

## State Architecture

`useRigidMotionsState` owns all state. No prop drilling beyond two levels:
`InstrumentModule → RigidMotionsScene + ControlStrip`.

| State | Type | Default | Description |
|---|---|---|---|
| `ghostOffset` | `[number, number]` | `[3, -3]` | Translation vector from pre-image to ghost |
| `guideState` | `GuideState` | `'predict-translate'` | Current stage in the learning sequence |
| `feedbackState` | `FeedbackState` | `'idle'` | `idle` / `match` / `close` / `miss` |
| `stageRoundIndex` | number | 0 | Cycles through rounds for current stage; resets to 1 on Phase 3 entry, 0 otherwise |
| `stageSuccessCount` | number | 0 | Successes accumulated in current stage |
| `flipped` | boolean | false | Ghost horizontal/vertical flip toggle |
| `rotationDegrees` | `90\|180\|270` | 90 | Selected rotation amount |
| `rotationDirection` | `'cw'\|'ccw'` | `'cw'` | Selected rotation direction |
| `coordinatesActive` | boolean | false | Enables coordinate labels; flips to `true` on `coordinate-reveal` entry, never reverts |
| `capstoneRoundIndex` | number | 0 | Cycles through `CAPSTONE_ROUNDS` (0–2) |
| `capstoneSequence` | `TransformationParams[]` | `[]` | Current SequenceBuilder state (0–2 steps) |
| `showCelebration` | boolean | false | Fires `onComplete` → `CelebrationModal` on final capstone match |
| `shownReveals` | `Set<string>` | empty | Beat keys (`${guideState}-${stageSuccessCount}`) and capstone round IDs already revealed; distinguishes `firstMatch` (show reveal copy) from `repeatMatch` (show "Match.") |

Actions: `handleCheck`, `handleNext`, `handleReset`, `handleFlip`, `handleRotation`, `handleAnimationComplete`, `handleGhostMove`, `handleSequenceChange`, `handleCheckSequence`, `handleCapstoneNext`.

> **React batching note**: `shownReveals` is updated in `handleNext` / `handleCapstoneNext` — not in `handleCheck`. React 18 batches all `setState` calls in a single event handler into one render. If `setShownReveals` ran in `handleCheck` alongside `setFeedbackState('match')`, the component would render with both `isMatch=true` and `shownReveals.has(key)=true` simultaneously, making `firstMatch` always false. Recording in `handleNext` means the key is added after the reveal has been displayed for at least one render cycle.

---

## CelebrationModal Threading

On final capstone match, `InstrumentModule` calls:

```typescript
onComplete({}, { completedSequence: capstoneSequence })
```

`App.tsx` stores `completedSequence` alongside `completedValues` and passes it to `CelebrationModal`. `CelebrationModal` threads it to `DiscoveryTab`. `DiscoveryTab` renders the rigid-motions branch when `moduleId === 'rigid-motions'` and `completedSequence` is present — showing the student's completed sequence as labeled chips with a one-line summary from `CAPSTONE_COMPLETION_COPY`.

`TransformationParams` is imported from `src/lib/types/transforms.ts` in all celebration components — never from module-internal paths.

---

## Z-Layering

| z | Layer |
|---|---|
| −0.5 | `DragPlane` |
| 0 | Grid lines |
| 0.01 | Shape fills, origin dot |
| 0.02 | Shape outlines, `PreviewGhost` |
| 0.03 | `SpriteLabel` vertex labels |
| 0.04 | Constraint elements (TranslationVector, ReflectionAxisTicks, RotationArcs) |
| 0.05 | Gap lines (miss feedback) |

---

## Lessons Learned

1. **`Text` from drei is forbidden** — see SpriteLabel section. Verified by Playwright: `THREE.WebGLRenderer: Context Lost` on every mount. Removing `Text` eliminated the error entirely.
2. **StrictMode + WebGL**: React StrictMode's double-mount is the amplifier. Any R3F component creating a secondary WebGL context hits the browser limit in dev.
3. **`-0` in transform tests**: `Object.is(-0, 0)` is `false` in Vitest's deep equality. Pure math functions return `-0` when negating `+0`. Use `toBeCloseTo(0)` for zero-coordinate edge cases in transform tests.
4. **BufferGeometry / React reconciler conflict**: Imperative geometry updates in `useFrame` fight React's reconciler if JSX geometry children exist on the same mesh. For GSAP-animated geometry, initialize via `useRef`, attach in `useEffect`, update in `useFrame` — no JSX geometry children.
5. **`computeGhostVertices` composition order**: Rotate/flip before translate uses the pre-image centroid instead of the dragged centroid. Wrong results at most non-zero offsets. Explicitly tested and commented.
6. **Camera Y offset**: Camera at `[0, 2, 10]` faces along −Z with no lookAt, so viewport center sits at world Y=2. Originally appropriate when the pre-image occupied Q1 (y ≈ 1–4). After repositioning the pre-image to A(−3,−2) B(1,−1) C(−2,1) with targets spanning y ∈ [−6, 4], the center of activity is closer to Y≈−1. The offset is tolerable across tested viewport sizes.
7. **Axis label collision at ±1**: x-axis labels sit at `y = -0.7` and y-axis labels have their right edge at `x = -0.65`. Do not tighten — the ±1 zone overlaps.
8. **`applySequence` vs `computeGhostVertices`**: Two separate composition models. `computeGhostVertices` is centroid-relative (for draggable ghost); `applySequence` is origin-based (for capstone scoring and `PreviewGhost`). They are not interchangeable.
9. **`DragPlane` must be gated off in capstone**: If `DragPlane` mounts in capstone, pointer events on the canvas will attempt to move a ghost that doesn't exist in that state. Gate on `guideState !== 'capstone'`.
10. **React 18 automatic batching and reveal state**: `setFeedbackState` and `setShownReveals` batched in the same event handler render together. The component sees `isMatch=true` and `shownReveals.has(key)=true` at the same time, so `firstMatch` is always false and no reveal copy ever displays. Solution: record `shownReveals` in `handleNext`, not `handleCheck`. The student earns the reveal on CHECK; the key is acknowledged on NEXT (after they've seen it).
11. **New guide states must be audited against ControlStrip**: `ControlStrip` has explicit cases for each guide state category. Adding `synthesis-reveal` without updating `ControlStrip` left the user stuck on a page with no buttons. Any new state must be mapped to a button set (or CONTINUE) before shipping.
