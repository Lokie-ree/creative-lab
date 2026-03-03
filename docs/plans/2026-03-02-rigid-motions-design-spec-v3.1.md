# Rigid Motions Module — Design Specification v3.1

**Date:** March 2, 2026
**Status:** Implementation-ready
**Supersedes:** v3 (March 2, 2026)
**Standards:** 8.G.A.1, 8.G.A.2, 8.G.A.3
**Course:** Grade 8 Mathematics
**ALD Target:** Level 3 entry → Level 4 primary → Level 5 capstone

**Related documentation:** [philosophy.md](../philosophy.md) · [product.md](../product.md) · [ARCHITECTURE.md](../../src/components/modules/rigid-motions/ARCHITECTURE.md)

---

## What Changed from v3

v3.1 resolves three open questions from v3 that were identified as core pedagogical friction points:

1. **Reflection ghost model clarified** — FLIP is a local transformation (around ghost centroid). `ReflectionAxisTicks` are the feedback mechanism that confirm correct equidistance from the axis. This is intentional: if FLIP performed a global reflection, the student could press it once and land on the correct answer without reasoning about position.

2. **`Close` feedback redesigned per transformation type** — Not a universal state. Behavior varies by stage (see Match Scoring section).

3. **`round-generator.ts` content is now deterministic and specified** — No random generation. Five named rounds with exact parameters, target vertices, and ghost initial positions.

Everything else — architecture, coordinate system, file structure, phase roadmap, ALD alignment, technical constraints — is unchanged from v3.

---

## What Is Already Built (Phase 1)

The following is working and committed:

```
src/components/modules/rigid-motions/
├── InstrumentModule.tsx          — Layout, state wiring (4-row grid)
├── constants.ts                  — GRID_RANGE=9, CONTENT_RANGE=6, PRE_IMAGE_VERTICES, labels
├── hooks/
│   └── useRigidMotionsState.ts   — ghostOffset state + clamped move handler
├── scene/
│   ├── RigidMotionsScene.tsx     — R3F Canvas + all Phase 1 scene components
│   ├── scene-layout.ts           — useRigidMotionsLayout (zoom from viewport)
│   ├── scene-math.ts             — ghostVertices, clampOffset, vertexLabelOffset
│   └── __tests__/
│       └── scene-math.test.ts    — Unit tests for math utilities
└── controls/
    └── ControlStrip.tsx          — CHECK button (disabled in Phase 1)
```

**Phase 1 scene components (all inside `RigidMotionsScene.tsx`):**

| Component | What it does |
|---|---|
| `ContextRecovery` | Handles `webglcontextlost` / `webglcontextrestored` |
| `CameraSetup` | Syncs orthographic zoom to viewport via `useFrame` |
| `CoordinateGrid` | Grid lines, axis lines, origin dot, `SpriteLabel` axis numbers |
| `PreImageTriangle` | Static white triangle at A(1,1), B(4,2), C(2,4) with `SpriteLabel` labels |
| `GhostTriangle` | Draggable green dashed triangle with `SpriteLabel` prime labels |
| `DragPlane` | Invisible full-screen mesh that captures pointer events |

Phase 1 is **feature-complete for the translate-only predict loop with no scoring.** The CHECK button exists but is disabled.

**Pre-image vertices and centroid:**

| Vertex | Coordinates |
|---|---|
| A | (1, 1) |
| B | (4, 2) |
| C | (2, 4) |
| Centroid | (2.33, 2.33) |

---

## Phase 2 Scope

Phase 2 wires the full predict-and-reveal loop for translations, then adds reflections and rotations. It does not add the coordinate layer (that is Phase 3).

**Guide states in Phase 2:**

```
predict-translate → predict-reflect → predict-rotate
```

**What Phase 2 adds:**

1. **Match scoring** — position + orientation check against the correct target (behavior varies by transformation type)
2. **Reveal animation** — shape animates from pre-image along the transformation path to the correct image position
3. **Feedback states** — match, close, miss with appropriate scene and copy changes
4. **Constraint elements** — `TranslationVector`, `ReflectionAxisTicks`, `RotationArcs` (mounted conditionally per guide state)
5. **Image shape** — post-reveal confirmed image rendered in `--lab-accent` at full opacity
6. **Gap lines** — on miss, dashed lines from each ghost vertex to the correct landing position
7. **ControlStrip expansion** — FLIP toggle (reflect stage), ROTATION toggle-group (rotate stage), RESET, SPEED
8. **Guide state machine** — `useGuideState` hook driving stage progression (2 successful predictions per stage)
9. **Stage unlock** — 2 total successes per stage (not consecutive) before advancing

---

## Round Definitions (`round-generator.ts`)

Rounds are deterministic. No random generation — this ensures stable tests and consistent first-session behavior.

Pre-image centroid is **(2.33, 2.33)**.  
Ghost initial offset is **[5, 0]** for all rounds, placing the ghost centroid at **(7.33, 2.33)** before the student moves it. Verify this is reachable by `clampOffset` for all target positions.

| Round | Stage | Type | Parameters | Target Vertices | Target Centroid | Notes |
|---|---|---|---|---|---|---|
| 1 | translate | Translation | +4 right, +2 up | A′(5,3) B′(8,4) C′(6,6) | (6.33, 4.33) | Ghost opens left and below target — student must move in two dimensions |
| 2 | translate | Translation | −3 left, −5 down | A′(−2,−4) B′(1,−3) C′(−1,−1) | (−0.67, −2.67) | Ghost opens far right of target — large drag across canvas. **Verify clamp** |
| 3 | reflect | Reflection | Over y-axis | A′(−1,1) B′(−4,2) C′(−2,4) | (−2.33, 2.33) | FLIP required; centroid moves to −x |
| 4 | reflect | Reflection | Over x-axis | A′(1,−1) B′(4,−2) C′(2,−4) | (2.33, −2.33) | FLIP required; centroid moves to −y |
| 5 | rotate | Rotation | 90° CW around origin | A′(1,−1) B′(2,−4) C′(4,−2) | (2.33, −2.33) | Origin-centered rotation. **Centroid matches Round 4 — orientation differs** |

> **Round 5 / Round 4 centroid collision:** Both Round 4 (reflect over x-axis) and Round 5 (rotate 90° CW) produce a target centroid of approximately (2.33, −2.33). This is not an error — the vertices are different (B′ and C′ are swapped). The scoring and gap lines will correctly differentiate them. Document this in the test file to prevent future confusion.

> **Round 2 clamp check:** The target centroid (−0.67, −2.67) is within `±CONTENT_RANGE`. Verify that `clampOffset` clamps the *centroid* position (not the raw offset) so this target is reachable.

> **Build order:** Write `transform-math.ts` unit tests using these round definitions before implementing any scoring or animation logic. The test inputs and expected outputs are fully specified above.

---

## `computeGhostVertices` Composition Order

**This is the most important implementation constraint in Phase 2.** Apply transformations in this order only:

```
1. Translate (apply baseOffset to pre-image vertices)
2. Find the translated centroid
3. Apply FLIP or ROTATION around that centroid
```

If rotation or flip is applied before translation, the centroid used for the local transform is the pre-image centroid (2.33, 2.33), not the dragged centroid. This produces a visually plausible but geometrically wrong ghost in some positions. **Add a comment in the code stating this order is load-bearing.**

```typescript
function computeGhostVertices(
  baseOffset: [number, number],
  guideState: GuideState,
  flipped: boolean,
  rotationDegrees: 90 | 180 | 270,
  rotationDirection: 'cw' | 'ccw'
): [number, number][] {
  // Step 1: translate
  const translated = ghostVertices(baseOffset)

  // Step 2: find centroid of translated position
  const centroid = centroidOf(translated)

  // Step 3: apply orientation transform around translated centroid (not origin, not pre-image centroid)
  if (guideState === 'predict-reflect' && flipped) {
    return ghostVerticesWithFlip(baseOffset, (currentRound.params as ReflectionParams).axis, true)
  }
  if (guideState === 'predict-rotate') {
    return ghostVerticesWithRotation(baseOffset, rotationDegrees, rotationDirection)
  }
  return translated
}
```

---

## Match Scoring (`match-scoring.ts`)

Scoring behavior is **not uniform across transformation types**. This was a deliberate redesign from v3.

### Translate stage

Three possible outcomes:

| Result | Condition |
|---|---|
| `match` | Every ghost vertex within 0.5 world units of its target vertex |
| `close` | Centroid within 0.5 units but at least one vertex outside threshold — student is in the right neighborhood but imprecise |
| `miss` | Centroid outside 0.5 units |

`Close` is pedagogically useful for translation: it encourages a student who is "almost there" to refine rather than give up.

### Reflect stage

Two possible outcomes — **no `close` state**:

| Result | Condition |
|---|---|
| `match` | Every ghost vertex within 0.5 units of target AND `flipped === true` |
| `miss` | Anything else, including correct centroid position with wrong orientation |

Rationale: A student who has the centroid in the right place but forgot to flip has the triangle sitting on top of the reflection axis or in the wrong half-plane. The visual is obviously wrong. Gap lines on a `miss` are more informative than a "close" label — the lines will cross the axis, making the equidistance property visible.

**Important scoring guard:** Check orientation first.

```typescript
if (stage === 'reflect' && !isFlipped) return 'miss'
```

### Rotate stage

Three possible outcomes:

| Result | Condition |
|---|---|
| `match` | Every ghost vertex within 0.5 units of target AND rotation settings match expected |
| `close` | Centroid within 0.5 units but rotation degree or direction is wrong — student found the right position but has the wrong spin |
| `miss` | Centroid outside 0.5 units |

`Close` is meaningful for rotation because position and orientation are genuinely semi-independent: a student might understand the destination but confuse 90° CW with 90° CCW. That's a different error than "wrong location entirely" and deserves distinct feedback copy.

---

## Ghost Orientation Model

### FLIP (reflect stage)

FLIP is a **local transformation applied around the ghost's current centroid**, not a global reflection over the axis.

**Why local, not global:** If FLIP performed a global reflection, pressing it once would jump the ghost to the mathematically correct position without the student needing to reason about position at all. That defeats the prediction goal. The student must first drag the ghost to the correct location, then toggle the orientation.

**How it's implemented:**

```typescript
function ghostVerticesWithFlip(
  baseOffset: [number, number],
  axis: 'x' | 'y',
  flipped: boolean
): [number, number][] {
  const verts = ghostVertices(baseOffset)  // translated vertices
  if (!flipped) return verts
  const centroid = centroidOf(verts)
  // Mirror each vertex through the centroid along the relevant axis
  return axis === 'y'
    ? verts.map(([x, y]) => [2 * centroid[0] - x, y])   // flip horizontally around centroid
    : verts.map(([x, y]) => [x, 2 * centroid[1] - y])   // flip vertically around centroid
}
```

**`ReflectionAxisTicks` as the feedback mechanism:** Since FLIP is local, the `ReflectionAxisTicks` do the pedagogical heavy lifting. They render dashed perpendicular lines from each pre-image vertex and each ghost vertex to the reflection axis. When the ghost is in the correct position AND flipped:

- Each pre-image vertex and its ghost counterpart are equidistant from the axis
- The tick lines form symmetric pairs

When the student is wrong, the ticks are visually asymmetric — this is the signal. Consider color-coding: neutral color when mismatched, green when all pairs are equidistant. This gives the student real-time visual feedback without revealing the answer.

### ROTATION (rotate stage)

Rotation is applied **around the ghost centroid** (local), not the origin (global).

**Why local:** Same reasoning as FLIP. A global rotation around the origin would instantly place the ghost at the correct position, removing the prediction task.

**The `RotationArcs` reconciliation:** This creates a deliberate tension. The ghost rotates around its own centroid, but 8.G.A.3 specifies rotation around the origin. `RotationArcs` resolves this by being **origin-fixed**:

- Arcs sweep from each pre-image vertex along a circular path centered on the origin
- Arc length matches the current `rotationDegrees` and `rotationDirection`
- The arcs only "line up" with the ghost vertices when the ghost is at the mathematically correct position

This is the module's **Level 5 moment**: a student who understands *why* the arcs only align at the correct position understands what rotation around the origin means geometrically. Do not under-implement `RotationArcs`.

```typescript
interface RotationArcsProps {
  preImageVertices: [number, number][]  // Arc centers are distances from origin
  degrees: 90 | 180 | 270
  direction: 'cw' | 'ccw'
  visible: boolean
  // Note: arcs are ALWAYS centered on the origin, not the ghost centroid
}
```

---

## R3F Scene Architecture for Phase 2

### Coordinate system

`WORLD_SCALE = 1`. All geometry is placed directly in math coordinates. No conversion.

```typescript
// A point at math coordinates (3, 4) is placed at:
<mesh position={[3, 4, 0]} />
```

### Z-layering

| z | Layer |
|---|---|
| −0.5 | `DragPlane` (invisible, behind everything) |
| 0 | Grid lines |
| 0.01 | Grid fills (origin dot, shape fills) |
| 0.02 | Shape outlines |
| 0.03 | Vertex labels (`SpriteLabel`) |
| 0.04 | Constraint elements (vector, ticks, arcs) |
| 0.05 | Gap lines (miss feedback) |

### Conditional scene mounting

```tsx
function Visualization(props: VisualizationProps) {
  const {
    guideState, feedbackState, ghostOffset, currentRound,
    flipped, rotationDegrees, rotationDirection, speedMultiplier,
    coordinatesActive, onGhostMove, onDragChange, onAnimationComplete,
  } = props

  const ghostVerts = computeGhostVertices(ghostOffset, guideState, flipped, rotationDegrees, rotationDirection)
  const preImageCentroid = centroidOf(PRE_IMAGE_VERTICES)
  const ghostCentroid = centroidOf(ghostVerts)

  const showGhost = feedbackState !== 'match'
  const showImage = feedbackState === 'match'
  const showGapLines = feedbackState === 'miss'
  const showTranslationVector = guideState === 'predict-translate'
  const showAxisTicks = guideState === 'predict-reflect'
  const showRotationArcs = guideState === 'predict-rotate'

  return (
    <>
      <ContextRecovery />
      <CameraSetup />
      <CoordinateGrid coordinatesActive={coordinatesActive} />
      <PreImageTriangle coordinatesActive={coordinatesActive} />

      {showGhost && (
        <GhostTriangle
          ghostOffset={ghostOffset}
          flipped={flipped}
          rotationDegrees={rotationDegrees}
          rotationDirection={rotationDirection}
          coordinatesActive={coordinatesActive}
        />
      )}

      {showImage && (
        <ImageShape
          vertices={currentRound.targetVertices}
          labels={GHOST_VERTEX_LABELS}
          coordinatesActive={coordinatesActive}
          animateFrom={PRE_IMAGE_VERTICES}
          speedMultiplier={speedMultiplier}
          onAnimationComplete={onAnimationComplete}
        />
      )}

      {showGapLines && (
        <GapLines
          ghostVertices={ghostVerts}
          targetVertices={currentRound.targetVertices}
        />
      )}

      {showTranslationVector && (
        <TranslationVector
          preImageCentroid={preImageCentroid}
          ghostCentroid={ghostCentroid}
          visible
        />
      )}

      {showAxisTicks && (
        <ReflectionAxisTicks
          axis={(currentRound.params as ReflectionParams).axis}
          preImageVertices={PRE_IMAGE_VERTICES}
          ghostVertices={ghostVerts}
          visible
        />
      )}

      {showRotationArcs && (
        <RotationArcs
          preImageVertices={PRE_IMAGE_VERTICES}
          degrees={rotationDegrees}
          direction={rotationDirection}
          visible
        />
      )}

      <DragPlane
        ghostOffset={ghostOffset}
        onGhostMove={onGhostMove}
        onDragChange={onDragChange}
      />
    </>
  )
}
```

---

## New Scene Components

### `TranslationVector`

Visible during `predict-translate` stage while the ghost is being dragged.

**What it renders:** A line from the pre-image centroid to the ghost centroid, with an arrowhead at the ghost end. Updates live as the ghost moves.

```typescript
interface TranslationVectorProps {
  preImageCentroid: [number, number]
  ghostCentroid: [number, number]
  visible: boolean
}
```

- Line: `BufferGeometry` with two points, `LineBasicMaterial` color `#7a746a`, `opacity={0.6}`, dashed
- Arrowhead: small triangle mesh at ghost centroid end, rotated to match vector direction
- Recomputes on every `ghostOffset` change — no `useMemo` needed (two points)
- z: 0.04

**Pedagogical purpose:** Makes the invariant visible — every point on the shape moves by the same vector.

---

### `ReflectionAxisTicks`

Visible during `predict-reflect` stage.

```typescript
interface ReflectionAxisTicksProps {
  axis: 'x' | 'y'
  preImageVertices: [number, number][]
  ghostVertices: [number, number][]
  visible: boolean
}
```

- For each vertex pair, renders a dashed perpendicular line from the vertex to the axis
- **Color state:** neutral (`#7a746a`) when pairs are not equidistant; green (`#7cc87c`) when all three pairs are equidistant within 0.1 units
- Updates live as the ghost moves
- z: 0.04

**This component is the feedback mechanism for the FLIP model.** The student knows their position and orientation are both correct when all tick pairs turn green. This is the real-time signal that replaces the `close` state for reflections.

---

### `RotationArcs`

Visible during `predict-rotate` stage.

```typescript
interface RotationArcsProps {
  preImageVertices: [number, number][]
  degrees: 90 | 180 | 270
  direction: 'cw' | 'ccw'
  visible: boolean
}
```

- One arc per pre-image vertex, all centered on the **origin (0, 0)** — not the ghost centroid
- Radius = distance from origin to each pre-image vertex
- Arc sweep = `degrees`, direction = `direction`
- Arc endpoint = the mathematically correct image vertex position
- Style: dashed, color `#7a746a`, `opacity={0.6}`
- z: 0.04

**Critical implementation note:** Arcs are origin-fixed. The student's ghost rotation is centroid-local. The arcs only align with the ghost vertices when the ghost is at the correct target position. This visual reconciliation is the Level 5 pedagogical moment — do not simplify it.

**Note on CW in world coordinates (y-up):** Clockwise means decreasing angle. The `direction === 'cw' ? -1 : 1` multiplier handles this. The Grade 8 standard uses CW as the conventional default.

---

### `ImageShape`

The confirmed image after a successful CHECK. Animates from pre-image position to target.

```typescript
interface ImageShapeProps {
  vertices: [number, number][]
  labels: string[]  // ['A′', 'B′', 'C′']
  coordinatesActive: boolean
  animateFrom: [number, number][]  // Pre-image vertices — animation start position
  speedMultiplier: 0.5 | 1 | 2
  onAnimationComplete: () => void
}
```

- Rendered in `#7cc87c` (lab-accent) at full opacity, solid outline
- Ghost remains visible during the animation (student sees their prediction vs. the reveal simultaneously)
- Arrival pulse: `ImageShape` and `PreImageTriangle` both scale to 1.05 and back (200ms) after animation completes
- After animation: `onAnimationComplete()` fires → feedback state transitions to `match`
- z: 0.02

**GSAP + R3F pattern:**

```typescript
const vertsRef = useRef<[number, number][]>([...animateFrom])

useEffect(() => {
  const tl = gsap.timeline({ onComplete: onAnimationComplete })
  tl.to({ t: 0 }, {
    t: 1,
    duration: 0.6 / speedMultiplier,
    ease: 'power2.inOut',
    onUpdate: function() {
      const interpolated = interpolateReveal(animateFrom, vertices, this.targets()[0].t, type, params)
      vertsRef.current = interpolated
      updateGeometry(interpolated)
    },
  })
}, [])
```

**Reveal interpolation by transformation type:**

- **Translation:** Linear lerp of each vertex
- **Reflection over x-axis:** y-coordinate passes through 0 at t=0.5; x is constant
- **Reflection over y-axis:** x-coordinate passes through 0 at t=0.5; y is constant
- **Rotation:** Each vertex sweeps along its circular arc around the origin (angle interpolated from startAngle to startAngle + sweep, radius is constant)

Full `interpolateReveal` implementation is in `animations.ts`.

---

### `GapLines`

Visible on `miss` feedback. Dashed lines from each ghost vertex to its correct target vertex.

```typescript
interface GapLinesProps {
  ghostVertices: [number, number][]
  targetVertices: [number, number][]
}
```

- One line segment per vertex pair, staggered fade-in (50ms between vertices)
- Style: dashed, color `#7a746a`, `opacity={0.7}`
- z: 0.05

For reflections, when the student has correct position but forgot to FLIP, the gap lines will cross the reflection axis — making the equidistance property visible without any text explanation.

---

## New Non-Scene Files for Phase 2

### `types.ts`

```typescript
type TransformationType = 'translate' | 'reflect' | 'rotate'

type GuideState =
  | 'predict-translate'
  | 'predict-reflect'
  | 'predict-rotate'
  | 'coordinate-reveal'
  | 'predict-with-coordinates'
  | 'capstone'

type FeedbackState = 'idle' | 'match' | 'close' | 'miss'

type TranslationParams = { type: 'translate'; dx: number; dy: number }
type ReflectionParams  = { type: 'reflect'; axis: 'x' | 'y' }
type RotationParams    = { type: 'rotate'; degrees: 90 | 180 | 270; direction: 'cw' | 'ccw' }
type TransformationParams = TranslationParams | ReflectionParams | RotationParams

interface Round {
  id: string
  stage: 'translate' | 'reflect' | 'rotate'
  params: TransformationParams
  targetVertices: [number, number][]
}
```

---

### `guide-state.ts`

```typescript
interface GuideStateConfig {
  state: GuideState
  index: number
  transformationType: TransformationType
  successesRequired: number
}

const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',        index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',          index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',           index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',        index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates', index: 4, transformationType: 'translate', successesRequired: 2 },
  { state: 'capstone',                 index: 5, transformationType: 'translate', successesRequired: 3 },
]
```

---

### `transform-math.ts`

Pure functions. No React. **Write unit tests for these before implementing anything else.** The round definitions above give you all inputs and expected outputs.

```typescript
function translate(v: [number, number], dx: number, dy: number): [number, number]
// (x, y) + (dx, dy) → (x+dx, y+dy)

function reflectOverX(v: [number, number]): [number, number]
// (x, y) → (x, -y)

function reflectOverY(v: [number, number]): [number, number]
// (x, y) → (-x, y)

function rotateCW90(v: [number, number]): [number, number]
// (x, y) → (y, -x)

function rotateCW180(v: [number, number]): [number, number]
// (x, y) → (-x, -y)

function rotateCW270(v: [number, number]): [number, number]
// (x, y) → (-y, x)

function applyTransform(
  vertices: [number, number][],
  params: TransformationParams
): [number, number][]

function applySequence(
  vertices: [number, number][],
  sequence: SequenceStep[]
): [number, number][]

function centroidOf(vertices: [number, number][]): [number, number]
```

All functions are pure and operate in math coordinates (y-up). World coordinates = math coordinates.

---

### `match-scoring.ts`

```typescript
function scoreGuess(
  ghostVertices: [number, number][],
  targetVertices: [number, number][],
  stage: 'translate' | 'reflect' | 'rotate',
  flipped: boolean,
  rotationDegrees: 90 | 180 | 270,
  rotationDirection: 'cw' | 'ccw',
  expectedParams: TransformationParams
): FeedbackState

// Per-stage behavior:
// translate: match (all verts ≤0.5), close (centroid ≤0.5, some verts outside), miss
// reflect:   match (all verts ≤0.5 AND flipped), miss (everything else — no close state)
//            Guard: if (stage === 'reflect' && !flipped) return 'miss'
// rotate:    match (all verts ≤0.5 AND correct rotation), close (centroid ≤0.5 wrong rotation), miss
```

---

### `round-generator.ts`

```typescript
const ROUNDS: Round[] = [
  {
    id: 'translate-4-2',
    stage: 'translate',
    params: { type: 'translate', dx: 4, dy: 2 },
    targetVertices: [[5, 3], [8, 4], [6, 6]],
  },
  {
    id: 'translate-n3-n5',
    stage: 'translate',
    params: { type: 'translate', dx: -3, dy: -5 },
    targetVertices: [[-2, -4], [1, -3], [-1, -1]],
  },
  {
    id: 'reflect-y',
    stage: 'reflect',
    params: { type: 'reflect', axis: 'y' },
    targetVertices: [[-1, 1], [-4, 2], [-2, 4]],
  },
  {
    id: 'reflect-x',
    stage: 'reflect',
    params: { type: 'reflect', axis: 'x' },
    targetVertices: [[1, -1], [4, -2], [2, -4]],
  },
  {
    id: 'rotate-90-cw',
    stage: 'rotate',
    params: { type: 'rotate', degrees: 90, direction: 'cw' },
    targetVertices: [[1, -1], [2, -4], [4, -2]],
    // Note: target centroid (2.33, -2.33) matches Round 4 (reflect-x).
    // Vertices differ — B′ and C′ are swapped. Scoring correctly differentiates them.
  },
]

function getRoundsForStage(stage: 'translate' | 'reflect' | 'rotate'): Round[]
function getRoundById(id: string): Round | undefined
```

---

### `animations.ts`

GSAP timelines for the reveal and pulse effects.

```typescript
function interpolateReveal(
  fromVerts: [number, number][],
  toVerts: [number, number][],
  t: number,  // 0 → 1, driven by GSAP
  type: TransformationType,
  params: TransformationParams
): [number, number][]
```

Interpolation by type:

- **translate:** Linear lerp of each vertex x and y
- **reflect over x:** y-coordinate passes through 0 at t=0.5; x stays constant
- **reflect over y:** x-coordinate passes through 0 at t=0.5; y stays constant
- **rotate:** Each vertex sweeps its circular arc around the origin; angle = `startAngle + totalSweep * t`, radius is constant

```typescript
case 'rotate': {
  const sign = params.direction === 'cw' ? -1 : 1
  const totalAngle = sign * (params.degrees * Math.PI / 180)
  return fromVerts.map(([x, y]) => {
    const r = Math.sqrt(x ** 2 + y ** 2)
    const startAngle = Math.atan2(y, x)
    const angle = startAngle + totalAngle * t
    return [r * Math.cos(angle), r * Math.sin(angle)]
  })
}
```

---

### `rigid-motions-copy.ts`

All user-facing strings. No inline strings in component files.

```typescript
const PROMPT_TEXT: Record<string, string> = {
  'translate-4-2':    'TRANSLATE · 4 RIGHT, 2 UP',
  'translate-n3-n5':  'TRANSLATE · 3 LEFT, 5 DOWN',
  'reflect-y':        'REFLECT · OVER Y-AXIS',
  'reflect-x':        'REFLECT · OVER X-AXIS',
  'rotate-90-cw':     'ROTATE · 90° CLOCKWISE',
}

const FEEDBACK_COPY: Record<FeedbackState, string | null> = {
  idle:  null,
  match: null,     // Visual is the feedback — no text
  close: null,     // Stage-specific: for translate, show 'Adjust the position'; for rotate, show 'Check the rotation'
  miss:  null,     // Gap lines are the feedback — no text
}

// Fired on first match per stage — the earned reveal
const EARNED_REVEALS: Record<GuideState, string> = {
  'predict-translate':
    'Every point moved the same direction and distance. The shape didn\'t change — only its position.',
  'predict-reflect':
    'Every point is the same distance from the axis as its mirror image. Distances and angles are preserved.',
  'predict-rotate':
    'Every point swept the same arc around the origin. The distance from the origin never changed.',
  'coordinate-reveal': '',
  'predict-with-coordinates': '',
  'capstone': '',
}
```

---

## ControlStrip Expansion

Context-sensitive visibility driven by `guideState` and `feedbackState`.

| Control | Visible in |
|---|---|
| **CHECK** | All predict states, `feedbackState` is `idle`, `close`, or `miss` |
| **NEXT** | All predict states, `feedbackState === 'match'` (replaces CHECK) |
| **RESET** | All predict states |
| **SPEED** | All predict states (0.5× / 1× / 2×) |
| **FLIP** | `predict-reflect`, `predict-with-coordinates` |
| **ROTATION** | `predict-rotate`, `predict-with-coordinates` (90°/180°/270° + CW/CCW) |

```
predict-translate (idle/close/miss): CHECK · RESET · SPEED
predict-translate (match):           NEXT  · RESET · SPEED
predict-reflect   (idle/miss):       FLIP  · CHECK · RESET · SPEED
predict-reflect   (match):           FLIP  · NEXT  · RESET · SPEED
predict-rotate    (idle/close/miss): ROTATION · CHECK · RESET · SPEED
predict-rotate    (match):           ROTATION · NEXT  · RESET · SPEED
coordinate-reveal:                   CONTINUE (only)
predict-with-coordinates:            FLIP + ROTATION visible
capstone:                            SEQUENCE BUILDER (replaces all)
```

---

## State Architecture

### `useRigidMotionsState` (Phase 2 expansion)

```typescript
interface RigidMotionsState {
  // Phase 1 (unchanged)
  ghostOffset: [number, number]
  handleGhostMove: (offset: [number, number]) => void

  // Phase 2
  guideState: GuideState
  feedbackState: FeedbackState
  currentRound: Round
  successCount: number
  flipped: boolean
  rotationDegrees: 90 | 180 | 270
  rotationDirection: 'cw' | 'ccw'
  speedMultiplier: 0.5 | 1 | 2
  coordinatesActive: boolean

  // Actions
  handleCheck: () => void
  handleNext: () => void
  handleReset: () => void
  handleFlip: (flipped: boolean) => void
  handleRotation: (degrees: 90 | 180 | 270, direction: 'cw' | 'ccw') => void
  handleSpeedChange: (speed: 0.5 | 1 | 2) => void
}
```

The hook owns all state. No prop drilling beyond two levels: `InstrumentModule` → `RigidMotionsScene` + `ControlStrip`.

---

## File Structure (Phase 2 additions)

```
src/components/modules/rigid-motions/
├── InstrumentModule.tsx              — (update) wire Phase 2 state + props
├── constants.ts                      — (unchanged)
├── types.ts                          — NEW
├── hooks/
│   └── useRigidMotionsState.ts       — (expand) Phase 2 state + actions
├── scene/
│   ├── RigidMotionsScene.tsx         — (expand) Phase 2 props + conditional mounting
│   ├── scene-layout.ts               — (unchanged)
│   ├── scene-math.ts                 — (expand) computeGhostVertices
│   ├── TranslationVector.tsx         — NEW
│   ├── ReflectionAxisTicks.tsx       — NEW
│   ├── RotationArcs.tsx              — NEW
│   ├── ImageShape.tsx                — NEW
│   ├── GapLines.tsx                  — NEW
│   └── __tests__/
│       ├── scene-math.test.ts        — (unchanged)
│       └── transform-math.test.ts    — NEW (write first)
├── controls/
│   └── ControlStrip.tsx              — (expand) FLIP, ROTATION, SPEED, RESET, NEXT
├── guide-state.ts                    — NEW
├── transform-math.ts                 — NEW
├── match-scoring.ts                  — NEW
├── round-generator.ts                — NEW
├── animations.ts                     — NEW
└── rigid-motions-copy.ts             — NEW
```

---

## Phase 3 Scope (Coordinate Layer)

Phase 3 adds the Level 3 → Level 4 boundary moment.

1. **Coordinate labels** on both pre-image and image vertices — hidden until coordinate reveal
2. **`coordinate-reveal` guide state** — both shapes visible, no ghost, no dragging, CONTINUE button
3. **`FormulaReadout`** — surfaces the coordinate rule for each transformation type
4. **`predict-with-coordinates` stage** — predict-and-reveal loop continues with coordinate readouts live

The `coordinatesActive: boolean` flag is already threaded through Phase 2 props. Phase 3 flips it to `true` at the coordinate reveal and it never reverts.

---

## Phase 4 Scope (Capstone)

Phase 4 adds the Level 5 task.

1. **`capstone` guide state** — both shapes visible simultaneously, no ghost
2. **`SequenceBuilder`** — two-slot step builder in ControlStrip
3. **`PreviewGhost`** — live-updating intermediate ghost as student builds the sequence
4. **`capstone-utils.ts`** — target generation for valid 1–2 step sequences

---

## Key Technical Constraints (Carry Forward)

### Never use `<Text>` from `@react-three/drei`

Creates a secondary WebGL context via `troika-three-text`. Exhausts the browser's WebGL context limit (~8 in Chromium) under React StrictMode. Use `SpriteLabel` instead.

```tsx
// ❌ Never
import { Text } from '@react-three/drei'
<Text position={[x, y, z]} fontSize={0.5}>label</Text>

// ✅ Always
<SpriteLabel text="label" position={[x, y, z]} color="#b8b0a4" planeWidth={0.6} />
```

### World coordinates = math coordinates

`WORLD_SCALE = 1`. No conversion functions. `(3, 4)` in math space → `position={[3, 4, 0]}` in Three.js.

### Drag via `DragPlane`, not R3F pointer events on shape meshes

### GSAP for all animations

No CSS transitions on Three.js objects. No `useSpring` from react-spring.

### `useFrame` for camera sync, not `useEffect`

`useEffect` on `size` causes a one-frame lag on resize.

### `computeGhostVertices` composition order is load-bearing

Translate first. Find centroid of translated position. Apply FLIP/ROTATION around that centroid. This order cannot be changed without breaking the ghost's visual behavior.