# Rigid Motions Module Architecture

## Overview

The rigid motions module teaches geometric transformations (translations, rotations, reflections) through interactive prediction. The student drags a ghost triangle to predict where a pre-image will land after a transformation, then checks their answer to see the correct image animate into place.

**Core Learning Goal**: Build intuition for rigid motions (8.G.A.1–3) by predicting and verifying triangle placements on a coordinate grid.

**ALD Target**: Level 3 entry → Level 4 primary → Level 5 capstone.

**Design spec**: `docs/plans/2026-03-02-rigid-motions-design-spec-v3.1.md`

---

## Phase Status

| Phase | Status | Scope |
|---|---|---|
| Phase 1 | Complete | Translation-only predict loop, no scoring. Draggable ghost, coordinate grid, R3F scene. |
| Phase 2 | Complete | Full predict-and-reveal loop for translate, reflect, rotate. Match scoring, reveal animation, constraint elements, guide state machine. |
| Phase 3 | Pending | Coordinate label layer (`coordinatesActive`), `FormulaReadout`, `coordinate-reveal` guide state |
| Phase 4 | Pending | Capstone: `SequenceBuilder`, `PreviewGhost`, `capstone-utils.ts` |

---

## File Structure

```
src/components/modules/rigid-motions/
├── InstrumentModule.tsx          # Entry: 4-row layout, full Phase 2 state wiring
├── constants.ts                  # Grid range, content range, triangle vertices, labels
├── types.ts                      # TransformationType, GuideState, FeedbackState, Round, params
├── transform-math.ts             # Pure math: translate, reflectOverX/Y, rotateCW90/180/270, applyTransform
├── match-scoring.ts              # scoreGuess — behavior varies by stage (translate/reflect/rotate)
├── round-generator.ts            # ROUNDS (5 deterministic rounds), getRoundsForStage, getRoundById
├── guide-state.ts                # GUIDE_STATE_SEQUENCE, nextGuideState, guideStateToStage
├── animations.ts                 # interpolateReveal — GSAP-driven t=0→1 per transformation type
├── rigid-motions-copy.ts         # All user-facing strings: PROMPT_TEXT, EARNED_REVEALS
├── hooks/
│   └── useRigidMotionsState.ts   # All state + actions: ghost, guide, feedback, controls
├── scene/
│   ├── RigidMotionsScene.tsx     # R3F Canvas shell + all 3D components
│   ├── scene-layout.ts           # useRigidMotionsLayout — camera zoom from viewport
│   ├── scene-math.ts             # ghostVertices, clampOffset, computeGhostVertices, vertexLabelOffset
│   ├── scene-primitives.tsx      # SpriteLabel, makeTriangleShape (shared across scene files)
│   ├── TranslationVector.tsx     # Dashed arrow from pre-image centroid to ghost centroid
│   ├── ReflectionAxisTicks.tsx   # Perpendicular tick lines; color = green when equidistant
│   ├── RotationArcs.tsx          # Origin-fixed arc sweeps per pre-image vertex
│   ├── ImageShape.tsx            # Confirmed image; GSAP-animated reveal, BufferGeometry refs
│   ├── GapLines.tsx              # Miss feedback: dashed lines ghost → target per vertex
│   └── __tests__/
│       ├── transform-math.test.ts   # 45 tests — all round definitions, edge cases
│       ├── match-scoring.test.ts    # 16 tests — all stages, close/miss/match boundaries
│       ├── round-generator.test.ts  # 19 tests — round contents, stage grouping
│       ├── guide-state.test.ts      # 12 tests — sequence, transitions, stage mapping
│       ├── animations.test.ts       # 11 tests — interpolateReveal at t=0, t=0.5, t=1
│       └── scene-math.test.ts       # 20 tests — clampOffset, computeGhostVertices composition
└── controls/
    └── ControlStrip.tsx          # Context-sensitive FLIP, ROTATION, SPEED, RESET, CHECK/NEXT
```

> **Orphaned file**: `scene/math.ts` exports `snapToGrid` which is no longer imported anywhere.
> It was planned for `useRigidMotionsState` but removed when the design settled on free-drag (clamped,
> not snapped). Safe to delete.

---

## Component Hierarchy

```
InstrumentModule
└── grid: [status strip | prompt | scene | control strip]
    ├── header       — module title; EscapeHatch (LAB dropdown) floats fixed top-0 left-4 h-12
    ├── div          — "Predict" label + PROMPT_TEXT[currentRound.id]
    ├── main         — RigidMotionsScene
    │   └── Canvas (R3F, orthographic)
    │       ├── ContextRecovery       — webglcontextlost / webglcontextrestored
    │       ├── CameraSetup           — orthographic zoom + frustum plane sync via useFrame
    │       ├── CoordinateGrid        — grid lines, axes, origin dot, SpriteLabel numbers
    │       ├── PreImageTriangle      — static white triangle, SpriteLabel vertex labels
    │       ├── GhostTriangle         — green dashed triangle; uses computeGhostVertices
    │       │                           (hidden when feedbackState === 'match')
    │       ├── ImageShape            — confirmed image; GSAP reveal animation
    │       │                           (shown when feedbackState === 'match')
    │       ├── GapLines              — miss feedback: dashed vertex-to-target lines
    │       │                           (shown when feedbackState === 'miss')
    │       ├── TranslationVector     — dashed arrow, pre-image → ghost centroid
    │       │                           (shown when guideState === 'predict-translate')
    │       ├── ReflectionAxisTicks   — perpendicular tick pairs, green when equidistant
    │       │                           (shown when guideState === 'predict-reflect')
    │       ├── RotationArcs          — origin-fixed arcs per pre-image vertex
    │       │                           (shown when guideState === 'predict-rotate')
    │       └── DragPlane             — invisible full-screen mesh; captures pointer events
    └── footer — ControlStrip (FLIP | ROTATION | CHECK/NEXT | RESET | SPEED)
```

---

## Round Definitions

Five deterministic rounds — no random generation.

Pre-image: **A(−3,−2) B(1,−1) C(−2,1)**, centroid (−1.33, −0.67). Ghost initial offset **[3, −3]** (ghost opens at Q4: A′(0,−5) B′(4,−4) C′(1,−2)).

| Round ID | Stage | Transform | Target Vertices | Target Centroid | Notes |
|---|---|---|---|---|---|
| `translate-5-3` | translate | +5 right, +3 up | A′(2,1) B′(6,2) C′(3,4) | (3.67, 2.33) | Ghost starts Q4; drags diagonally to Q1 |
| `translate-n3-n4` | translate | −3 left, −4 down | A′(−6,−6) B′(−2,−5) C′(−5,−3) | (−4.33, −4.67) | Ghost drags from Q4 across to Q3 |
| `reflect-y` | reflect | over y-axis | A′(3,−2) B′(−1,−1) C′(2,1) | (1.33, −0.67) | FLIP required; centroid shifts to +x |
| `reflect-x` | reflect | over x-axis | A′(−3,2) B′(1,1) C′(−2,−1) | (−1.33, 0.67) | FLIP required; centroid shifts to +y |
| `rotate-90-cw` | rotate | 90° CW around origin | A′(−2,3) B′(−1,−1) C′(1,2) | (−0.67, 1.33) | Vertices differ from `reflect-x`; scoring differentiates at vertex level |

Ghost initial offset is `[3, -3]` for all rounds.

---

## Guide State Machine

```
predict-translate → predict-reflect → predict-rotate → coordinate-reveal → predict-with-coordinates → capstone
```

- Each predict stage requires **2 successful CHECK results** before advancing.
- Successes are cumulative per stage (not consecutive).
- On each success, the round cycles to the next round in that stage's set.
- After stage completion, ghost offset, flip, and rotation all reset to defaults.

`coordinate-reveal` and later states are Phase 3+ scope. Phase 2 never reaches them.

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

### FLIP is a local transform — not a global reflection

FLIP mirrors the ghost's vertices through its **own centroid**, not over the reflection axis. This is intentional: if FLIP performed a global reflection, pressing it once would jump the ghost directly to the correct answer, eliminating the prediction task.

The student must first drag the ghost to the correct position, then toggle FLIP. `ReflectionAxisTicks` provides real-time visual feedback: the perpendicular tick lines from each pre-image/ghost vertex pair to the axis turn green when all three pairs are equidistant. This is the match signal for the reflect stage (no `close` state exists for reflect).

### ROTATION is a local transform — `RotationArcs` are origin-fixed

Ghost rotation applies around the **ghost's current centroid** (local), for the same reason as FLIP — global origin rotation would solve the task in one press.

`RotationArcs` deliberately renders arc sweeps centered on the **origin (0, 0)**. These arcs only align with the ghost's actual vertices when the ghost is in the mathematically correct position. A student who understands *why* the arcs align at one specific ghost position understands what rotation around the origin means geometrically. This is the module's **Level 5 pedagogical moment**.

### Match scoring varies by stage

Not uniform across transformation types:

| Stage | `match` | `close` | `miss` |
|---|---|---|---|
| translate | all verts ≤0.5 from target | centroid ≤0.5, some verts outside | centroid >0.5 |
| reflect | all verts ≤0.5 AND `flipped === true` | — (no close state) | anything else |
| rotate | all verts ≤0.5 AND rotation settings match | centroid ≤0.5, wrong rotation | centroid >0.5 |

Reflect has no `close` state because position-correct + orientation-wrong produces a visually obvious triangle (sitting on or in the wrong half-plane relative to the axis). Gap lines on miss are more informative than a "close" label — they cross the reflection axis, making equidistance visible.

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

Camera is positioned at `[0, 2, 10]` (no explicit lookAt — faces along −Z, viewport center at world Y=2). With the pre-image now spanning Q2/Q3 and targets ranging y ∈ [−6, 4], this Y offset is approximate; Phase 3 may benefit from recentering at Y=0 or Y=−1.

---

## State Architecture

`useRigidMotionsState` owns all state. No prop drilling beyond two levels:
`InstrumentModule → RigidMotionsScene + ControlStrip`.

| State | Type | Default | Description |
|---|---|---|---|
| `ghostOffset` | `[number, number]` | `[3, -3]` | Translation vector from pre-image to ghost |
| `guideState` | `GuideState` | `'predict-translate'` | Current stage in the learning sequence |
| `feedbackState` | `FeedbackState` | `'idle'` | `idle` / `match` / `close` / `miss` |
| `stageRoundIndex` | number | 0 | Cycles through rounds for current stage |
| `stageSuccessCount` | number | 0 | Successes accumulated in current stage |
| `flipped` | boolean | false | Ghost horizontal/vertical flip toggle |
| `rotationDegrees` | `90\|180\|270` | 90 | Selected rotation amount |
| `rotationDirection` | `'cw'\|'ccw'` | `'cw'` | Selected rotation direction |
| `speedMultiplier` | `0.5\|1\|2` | 1 | Reveal animation speed |
| `coordinatesActive` | boolean | false | Enables coordinate labels (Phase 3+) |

Actions: `handleCheck`, `handleNext`, `handleReset`, `handleFlip`, `handleRotation`, `handleSpeedChange`, `handleAnimationComplete`, `handleGhostMove`.

---

## Z-Layering

| z | Layer |
|---|---|
| −0.5 | `DragPlane` |
| 0 | Grid lines |
| 0.01 | Shape fills, origin dot |
| 0.02 | Shape outlines |
| 0.03 | `SpriteLabel` vertex labels |
| 0.04 | Constraint elements (TranslationVector, ReflectionAxisTicks, RotationArcs) |
| 0.05 | Gap lines (miss feedback) |

---

## Spec Compliance Notes

Phase 2 is fully implemented per `docs/plans/2026-03-02-rigid-motions-design-spec-v3.1.md` with one intentional simplification:

**`onAnimationComplete` is a no-op.** The spec describes `feedbackState` transitioning to `'match'` *after* the animation completes (`onAnimationComplete → setFeedbackState('match')`), which would keep the ghost visible during the animation. The implementation instead sets `feedbackState('match')` immediately on CHECK, then `ImageShape` mounts and animates. The spec's Visualization pseudocode (`showGhost = feedbackState !== 'match'`) is implemented as written — the ghost hides when ImageShape animates in. `onAnimationComplete` remains wired in case Phase 3 needs it.

**`coordinatesActive` is always `false` in Phase 2.** `PreImageTriangle`, `GhostTriangle`, and `CoordinateGrid` accept the prop and are Phase 3-ready. The `predict-with-coordinates` and `capstone` guide states are not reachable in Phase 2 (stageSuccessCount logic stops at `predict-rotate`).

**`coordinate-reveal` guard in ControlStrip.** The ControlStrip renders a "Continue" button when `guideState === 'coordinate-reveal'`, but `handleNext` in Phase 2 never sets that state. The guard is defensive and forward-compatible.

---

## Lessons Learned

1. **`Text` from drei is forbidden** — see SpriteLabel section. Verified by Playwright: `THREE.WebGLRenderer: Context Lost` on every mount. Removing `Text` eliminated the error entirely.
2. **StrictMode + WebGL**: React StrictMode's double-mount is the amplifier. Any R3F component creating a secondary WebGL context hits the browser limit in dev.
3. **`-0` in transform tests**: `Object.is(-0, 0)` is `false` in Vitest's deep equality. Pure math functions return `-0` when negating `+0`. Use `toBeCloseTo(0)` for zero-coordinate edge cases in transform tests.
4. **BufferGeometry / React reconciler conflict**: Imperative geometry updates in `useFrame` fight React's reconciler if JSX geometry children exist on the same mesh. For GSAP-animated geometry, initialize via `useRef`, attach in `useEffect`, update in `useFrame` — no JSX geometry children.
5. **`computeGhostVertices` composition order**: Rotate/flip before translate uses the pre-image centroid instead of the dragged centroid. Wrong results at most non-zero offsets. Explicitly tested and commented.
6. **Camera Y offset**: Camera at `[0, 2, 10]` faces along −Z with no lookAt, so viewport center sits at world Y=2. Originally appropriate when the pre-image occupied Q1 (y ≈ 1–4). After repositioning the pre-image to A(−3,−2) B(1,−1) C(−2,1) with targets spanning y ∈ [−6, 4], the center of activity is closer to Y≈−1. The offset is tolerable but Phase 3 should evaluate adjusting camera Y or setting an explicit lookAt.
7. **Axis label collision at ±1**: x-axis labels sit at `y = -0.7` and y-axis labels have their right edge at `x = -0.65`. Do not tighten — the ±1 zone overlaps.
