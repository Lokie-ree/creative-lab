# Rigid Motions Module — Design Specification v3

**Date:** March 2, 2026
**Status:** Draft — Phase 2+ implementation-ready
**Supersedes:** `2026-02-19-rigid-motions-design-spec.md` (v2, SVG-based)
**Standards:** 8.G.A.1, 8.G.A.2, 8.G.A.3
**Course:** Grade 8 Mathematics
**ALD Target:** Level 3 entry → Level 4 primary → Level 5 capstone

**Related documentation:** [philosophy.md](../philosophy.md) · [product.md](../product.md) · [ARCHITECTURE.md](../../src/components/modules/rigid-motions/ARCHITECTURE.md) · [mockups/RigidMotions.jsx](../../mockups/RigidMotions.jsx)

---

## What Changed from v2

v2 was written before the R3F implementation existed. It described the coordinate system in SVG terms (`mathToSVG`, `svgToMath`, `canvasSize / 18` scale factor) and included SVG-specific implementation notes that no longer apply.

v3 is grounded in the actual implementation:

- **Coordinate system is world coordinates.** `WORLD_SCALE = 1`. Math coordinates are world coordinates. No conversion functions needed. A point at `(3, 4)` in math space is at `(3, 4, 0)` in Three.js world space.
- **`SpriteLabel` replaces `<Text>` from drei.** `@react-three/drei`'s `Text` uses `troika-three-text`, which creates a secondary WebGL context. In React StrictMode, this exhausts the browser's WebGL context limit (~8 in Chromium) and kills the main scene context. `SpriteLabel` renders text to a 2D canvas and uploads it as a `CanvasTexture` on a `PlaneGeometry` mesh. Zero extra WebGL contexts. **Never use `<Text>` from drei in this module.**
- **Drag is handled by `DragPlane`.** An invisible `PlaneGeometry` mesh at z=−0.5 captures pointer events. Window-level `pointermove`/`pointerup` listeners handle out-of-bounds dragging. The ghost offset is clamped in `clampOffset` so the ghost centroid stays within `±CONTENT_RANGE`.
- **Camera zoom via `useFrame`.** `CameraSetup` reads `useRigidMotionsLayout().zoom` each frame and applies it to the orthographic camera with a deadband to avoid unnecessary matrix updates.

Everything else — pedagogy, ALD alignment, stage flow, interaction model, earned reveals, capstone design, vocabulary arc — is unchanged from v2. Those decisions were correct and are not revisited here.

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

---

## Phase 2 Scope

Phase 2 wires the full predict-and-reveal loop for translations, then adds reflections and rotations. It does not add the coordinate layer (that is Phase 3).

**Guide states in Phase 2:**

```
predict-translate → predict-reflect → predict-rotate
```

**What Phase 2 adds:**

1. **Match scoring** — position + orientation check against the correct target
2. **Reveal animation** — shape animates from pre-image along the transformation path to the correct image position
3. **Feedback states** — match, close, miss with appropriate scene and copy changes
4. **Constraint elements** — `TranslationVector`, `ReflectionAxisTicks`, `RotationArcs` (mounted conditionally per guide state)
5. **Image shape** — post-reveal confirmed image rendered in `--lab-accent` at full opacity
6. **Gap lines** — on miss, dashed lines from each ghost vertex to the correct landing position
7. **ControlStrip expansion** — FLIP toggle (reflect stage), ROTATION toggle-group (rotate stage), RESET, SPEED
8. **Guide state machine** — `useGuideState` hook driving stage progression (2 successful predictions per stage)
9. **Stage unlock** — 2 total successes per stage (not consecutive) before advancing

---

## R3F Scene Architecture for Phase 2

### Coordinate system

`WORLD_SCALE = 1`. All geometry is placed directly in math coordinates. No conversion.

```typescript
// A point at math coordinates (3, 4) is placed at:
<mesh position={[3, 4, 0]} />

// The grid renders from -GRID_RANGE to +GRID_RANGE on both axes
// Content is constrained to ±CONTENT_RANGE (±6)
// Camera zoom = shorterSide / (GRID_RANGE * 2) keeps the full ±9 grid visible
```

### Z-layering

All scene elements use z-offset to control draw order:

| z | Layer |
|---|---|
| −0.5 | `DragPlane` (invisible, behind everything) |
| 0 | Grid lines |
| 0.01 | Grid fills (origin dot, shape fills) |
| 0.02 | Shape outlines |
| 0.03 | Vertex labels (`SpriteLabel`) |
| 0.04 | Constraint elements (vector, ticks, arcs) |
| 0.05 | Gap lines (miss feedback) |

### New scene components for Phase 2

Each component lives in its own file under `scene/`. They are mounted conditionally inside `Visualization` based on `guideState` and `feedbackState`.

---

## New Scene Components

### `TranslationVector`

Visible during `predict-translate` stage while the ghost is being dragged.

**What it renders:** A line from the pre-image centroid to the ghost centroid, with an arrowhead at the ghost end. Updates live as the ghost moves.

**R3F implementation:**

```typescript
interface TranslationVectorProps {
  preImageCentroid: [number, number]
  ghostCentroid: [number, number]
  visible: boolean
}
```

- Line: `BufferGeometry` with two points (pre-image centroid → ghost centroid), `lineBasicMaterial` color `#7a746a`, `opacity={0.6}`, dashed
- Arrowhead: small `<mesh>` cone or triangle at the ghost centroid end, rotated to match the vector direction
- Recomputes geometry on every `ghostOffset` change — no `useMemo` needed since it's two points
- z: 0.04

**Pedagogical purpose:** Makes the displacement constraint visible. Every point on the shape moves by the same vector. The arrow externalizes that invariant.

---

### `ReflectionAxisTicks`

Visible during `predict-reflect` stage.

**What it renders:** For each vertex pair (pre-image vertex + corresponding ghost vertex), two perpendicular tick marks from each vertex to the reflection axis. If the ghost is correctly placed, the tick pairs are equal length. If not, they are visibly unequal — the student can see the error without being told.

**R3F implementation:**

```typescript
interface ReflectionAxisTicksProps {
  axis: 'x' | 'y'
  preImageVertices: [number, number][]
  ghostVertices: [number, number][]
  visible: boolean
}
```

- For each vertex, compute the foot of the perpendicular from the vertex to the axis:
  - x-axis reflection: foot = `(vertex.x, 0)`
  - y-axis reflection: foot = `(0, vertex.y)`
- Render two `lineSegments` per vertex: pre-image vertex → foot, ghost vertex → foot
- Style: `lineBasicMaterial` color `#7a746a`, `opacity={0.5}`, dashed
- z: 0.04

**Pedagogical purpose:** Makes the equidistance property visible. The axis is the perpendicular bisector of each vertex-to-image segment.

---

### `RotationArcs`

Visible during `predict-rotate` stage.

**What it renders:** For each pre-image vertex, a partial circle arc sweeping from the vertex's current position through the correct angular distance around the origin. All arcs share the same center (origin). Each arc's radius equals the distance from the origin to that vertex.

**R3F implementation:**

```typescript
interface RotationArcsProps {
  preImageVertices: [number, number][]
  degrees: 90 | 180 | 270
  direction: 'cw' | 'ccw'
  visible: boolean
}
```

Arc computation (32 points per arc, same as mockup):

```typescript
function computeArc(
  vertex: [number, number],
  degrees: number,
  direction: 'cw' | 'ccw',
  numPoints = 32
): [number, number][] {
  const r = Math.sqrt(vertex[0] ** 2 + vertex[1] ** 2)
  const startAngle = Math.atan2(vertex[1], vertex[0])
  const sweep = (direction === 'cw' ? -1 : 1) * (degrees * Math.PI / 180)
  return Array.from({ length: numPoints + 1 }, (_, i) => {
    const angle = startAngle + (i / numPoints) * sweep
    return [r * Math.cos(angle), r * Math.sin(angle)]
  })
}
```

- Render each arc as a `BufferGeometry` line strip (not `lineLoop` — arcs are open)
- Style: `lineBasicMaterial` color `#7a746a`, `opacity={0.6}`
- z: 0.04

**Pedagogical purpose:** Makes the constant-radius property impossible to miss. Every vertex sweeps the same arc length. This is the digital equivalent of the pencil-pinned-to-the-origin exercise.

**Note on CW in world coordinates:** In Three.js (y-up), clockwise rotation means decreasing angle (subtracting from `startAngle`). The `direction === 'cw' ? -1 : 1` multiplier handles this. The Grade 8 standard uses CW as the conventional default.

---

### `ImageShape`

The confirmed image after a successful CHECK. Replaces the ghost after the reveal animation completes.

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
- Reveal animation: GSAP timeline animates vertices from `animateFrom` to `vertices`
  - Translation: linear interpolation
  - Reflection: vertices arc perpendicular to the axis (not straight-line lerp)
  - Rotation: vertices sweep along circular arcs around the origin
- Arrival pulse: both `ImageShape` and `PreImageTriangle` scale to 1.05 and back (200ms)
- After animation: `onAnimationComplete()` fires, feedback state transitions to `match`
- z: 0.02 (same layer as other outlines)

**GSAP + R3F pattern:**

```typescript
// Animate a mutable ref array of vertices, update BufferGeometry each frame
const vertsRef = useRef<[number, number][]>(animateFrom)

useEffect(() => {
  const tl = gsap.timeline({ onComplete: onAnimationComplete })
  tl.to(vertsRef.current, {
    duration: 0.6 / speedMultiplier,
    ease: 'power2.inOut',
    onUpdate: () => {
      // Recompute geometry from vertsRef.current
      updateGeometry(vertsRef.current)
    },
    // For translation: lerp each vertex directly
    // For rotation: compute angle interpolation per vertex
    // For reflection: compute perpendicular arc per vertex
  })
}, [])
```

The specific interpolation logic for each transformation type is in `animations.ts`.

---

### `GapLines`

Visible on miss feedback. Dashed lines from each ghost vertex to its correct landing position.

```typescript
interface GapLinesProps {
  ghostVertices: [number, number][]
  targetVertices: [number, number][]
}
```

- One `lineSegments` per vertex pair, staggered fade-in (50ms per vertex)
- Style: dashed, color `#7a746a`, `opacity={0.7}`
- z: 0.05

---

## New Non-Scene Files for Phase 2

### `guide-state.ts`

```typescript
type GuideState =
  | 'predict-translate'
  | 'predict-reflect'
  | 'predict-rotate'
  | 'coordinate-reveal'
  | 'predict-with-coordinates'
  | 'capstone'

type FeedbackState = 'idle' | 'match' | 'close' | 'miss'

interface GuideStateConfig {
  state: GuideState
  index: number
  transformationType: TransformationType
  successesRequired: number
}

const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',  index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',    index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',     index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',  index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates', index: 4, transformationType: 'translate', successesRequired: 2 },
  { state: 'capstone',           index: 5, transformationType: 'translate', successesRequired: 3 },
]
```

### `transform-math.ts`

Pure functions. No React. Fully testable.

```typescript
// Apply a transformation to an array of vertices
function applyTransform(
  vertices: [number, number][],
  params: TransformationParams
): [number, number][]

// Apply a sequence of transformations (capstone)
function applySequence(
  vertices: [number, number][],
  sequence: SequenceStep[]
): [number, number][]

// Individual transforms
function translate(v: [number, number], dx: number, dy: number): [number, number]
function reflectOverX(v: [number, number]): [number, number]  // (x, y) → (x, -y)
function reflectOverY(v: [number, number]): [number, number]  // (x, y) → (-x, y)
function rotateCW90(v: [number, number]): [number, number]    // (x, y) → (y, -x)
function rotateCW180(v: [number, number]): [number, number]   // (x, y) → (-x, -y)
function rotateCW270(v: [number, number]): [number, number]   // (x, y) → (-y, x)
```

All functions are pure and operate in math coordinates (y-up). No coordinate conversion needed — world coordinates are math coordinates.

### `match-scoring.ts`

```typescript
type MatchResult =
  | { type: 'match' }
  | { type: 'close'; hint: 'Check the orientation' | 'Check the position' }
  | { type: 'miss'; distance: number }

function checkMatch(
  ghostVertices: [number, number][],
  targetVertices: [number, number][]
): MatchResult
```

Thresholds (unchanged from v2):
- Position: centroid distance ≤ 0.3 world units
- Orientation: longest-edge angle difference ≤ 5°

### `round-generator.ts`

Generates the target for each predict round. Each round specifies:

```typescript
interface Round {
  transformationType: TransformationType
  params: TransformationParams
  targetVertices: [number, number][]
  promptText: string  // e.g. "TRANSLATE · 4 RIGHT, 2 UP"
}
```

Rounds are generated from a fixed sequence per stage (not random) to ensure the first few rounds are pedagogically ordered: easy → harder. Randomization can be introduced in later rounds within a stage.

**Translate rounds (ordered):**
1. 4 right, 2 up — clean positive translation, lands in Q1
2. 3 left, 1 up — introduces negative dx
3. 2 right, 4 down — introduces negative dy
4. 5 left, 3 down — both negative

**Reflect rounds:**
1. Reflect over y-axis — lands in Q2, orientation reverses left-right
2. Reflect over x-axis — lands in Q4, orientation reverses up-down

**Rotate rounds:**
1. 90° CW — lands in Q4
2. 180° — lands in Q3
3. 270° CW — lands in Q2

### `animations.ts`

GSAP animation sequences. All durations are divided by `speedMultiplier`.

```typescript
// Reveal animation: pre-image animates to image position
function playRevealAnimation(
  fromVertices: [number, number][],
  toVertices: [number, number][],
  transformationType: TransformationType,
  params: TransformationParams,
  speedMultiplier: 0.5 | 1 | 2,
  onUpdate: (verts: [number, number][]) => void,
  onComplete: () => void
): gsap.core.Timeline

// Arrival pulse: scale mesh up and back
function playArrivalPulse(
  meshRef: React.RefObject<THREE.Mesh>,
  speedMultiplier: 0.5 | 1 | 2
): gsap.core.Timeline

// Gap line staggered fade-in
function playGapLines(
  lineRefs: React.RefObject<THREE.LineSegments>[],
  speedMultiplier: 0.5 | 1 | 2
): gsap.core.Timeline
```

**Reveal interpolation by transformation type:**

- **Translation:** Linear vertex interpolation. Each vertex moves in a straight line from pre-image to image position.
- **Reflection over x-axis:** Each vertex arcs perpendicular to the x-axis. Interpolate y-coordinate through 0 (the axis), x-coordinate stays constant.
- **Reflection over y-axis:** Same, but x-coordinate passes through 0.
- **Rotation:** Each vertex sweeps along its circular arc around the origin. Interpolate the angle from `startAngle` to `startAngle + sweep`. Radius is constant.

```typescript
function interpolateReveal(
  fromVerts: [number, number][],
  toVerts: [number, number][],
  t: number,  // 0 → 1
  type: TransformationType,
  params: TransformationParams
): [number, number][] {
  switch (type) {
    case 'translate':
      return fromVerts.map(([x, y], i) => [
        x + (toVerts[i][0] - x) * t,
        y + (toVerts[i][1] - y) * t,
      ])
    case 'reflect':
      return fromVerts.map(([x, y], i) => {
        if (params.axis === 'x') {
          // Arc through y=0: y goes from fromY → 0 → toY
          const midY = 0
          const yInterp = t < 0.5
            ? y + (midY - y) * (t * 2)
            : midY + (toVerts[i][1] - midY) * ((t - 0.5) * 2)
          return [x, yInterp]
        } else {
          const midX = 0
          const xInterp = t < 0.5
            ? x + (midX - x) * (t * 2)
            : midX + (toVerts[i][0] - midX) * ((t - 0.5) * 2)
          return [xInterp, y]
        }
      })
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
  }
}
```

### `rigid-motions-copy.ts`

All user-facing strings. No strings in component files.

```typescript
// Prompt text per round
const PROMPT_TEXT: Record<string, string> = {
  'translate-4-2': 'TRANSLATE · 4 RIGHT, 2 UP',
  'translate-n3-1': 'TRANSLATE · 3 LEFT, 1 UP',
  // ...
  'reflect-y': 'REFLECT · OVER Y-AXIS',
  'reflect-x': 'REFLECT · OVER X-AXIS',
  'rotate-90-cw': 'ROTATE · 90° CLOCKWISE',
  'rotate-180-cw': 'ROTATE · 180°',
  'rotate-270-cw': 'ROTATE · 270° CLOCKWISE',
}

// Feedback copy
const FEEDBACK: Record<FeedbackState, string | null> = {
  idle: null,
  match: null,  // No text — the visual is the feedback
  close: 'Check the orientation',  // or 'Check the position'
  miss: null,   // Gap lines are the feedback
}

// Earned reveals (fired on first match per stage)
const EARNED_REVEALS: Record<GuideState, string> = {
  'predict-translate': 'Every point moved the same direction and distance. The shape didn\'t change — only its position.',
  'predict-reflect': 'Every point is the same distance from the axis as its image. Distances and angles are preserved — but left and right swap.',
  'predict-rotate': 'Every point swept the same arc around the origin. Distances and angles are preserved — orientation is preserved too.',
  // ...
}
```

---

## ControlStrip Expansion

The `ControlStrip` grows with each stage. Context-sensitive visibility is driven by `guideState` and `feedbackState`.

### Phase 2 controls

| Control | Component | Visible in |
|---|---|---|
| **CHECK** | `button` | All predict states, `feedbackState === 'idle'` or `'close'` or `'miss'` |
| **NEXT** | `button` (replaces CHECK) | All predict states, `feedbackState === 'match'` |
| **RESET** | `button` | All predict states |
| **SPEED** | `toggle-group` (0.5× / 1× / 2×) | All predict states |
| **FLIP** | `toggle` | `predict-reflect`, `predict-with-coordinates` |
| **ROTATION** | `toggle-group` (90° / 180° / 270°) + CW/CCW | `predict-rotate`, `predict-with-coordinates` |

### Visibility rules per state

```
predict-translate (idle/close/miss): CHECK, RESET, SPEED
predict-translate (match):           NEXT, RESET, SPEED
predict-reflect   (idle/close/miss): FLIP, CHECK, RESET, SPEED
predict-reflect   (match):           FLIP, NEXT, RESET, SPEED
predict-rotate    (idle/close/miss): ROTATION, CHECK, RESET, SPEED
predict-rotate    (match):           ROTATION, NEXT, RESET, SPEED
coordinate-reveal:                   CONTINUE (no other controls)
predict-with-coordinates:            FLIP + ROTATION both visible
capstone:                            SEQUENCE BUILDER replaces all
```

### FLIP behavior

FLIP is a toggle that mirrors the ghost shape. It applies a reflection transformation to the ghost vertices on top of the current drag offset.

```typescript
// Ghost vertices with flip applied
function ghostVerticesWithFlip(
  baseOffset: [number, number],
  axis: 'x' | 'y',
  flipped: boolean
): [number, number][] {
  const verts = ghostVertices(baseOffset)
  if (!flipped) return verts
  return axis === 'y'
    ? verts.map(([x, y]) => [-x, y])   // Reflect over y-axis
    : verts.map(([x, y]) => [x, -y])   // Reflect over x-axis
}
```

### ROTATION behavior

ROTATION applies a rotation to the ghost vertices on top of the current drag offset. The rotation is always around the ghost centroid (not the origin) — the student drags to position, then rotates in place.

```typescript
function ghostVerticesWithRotation(
  baseOffset: [number, number],
  degrees: 90 | 180 | 270,
  direction: 'cw' | 'ccw'
): [number, number][] {
  const verts = ghostVertices(baseOffset)
  const centroid = centroidOf(verts)
  const sign = direction === 'cw' ? -1 : 1
  const angle = sign * (degrees * Math.PI / 180)
  return verts.map(([x, y]) => {
    const dx = x - centroid[0]
    const dy = y - centroid[1]
    return [
      centroid[0] + dx * Math.cos(angle) - dy * Math.sin(angle),
      centroid[1] + dx * Math.sin(angle) + dy * Math.cos(angle),
    ]
  })
}
```

---

## State Architecture

### `useRigidMotionsState` (expanded for Phase 2)

```typescript
interface RigidMotionsState {
  // Existing (Phase 1)
  ghostOffset: [number, number]
  handleGhostMove: (offset: [number, number]) => void

  // New (Phase 2)
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

The hook owns all state. `InstrumentModule` passes it down as props. No prop drilling beyond two levels — `InstrumentModule` → `RigidMotionsScene` + `ControlStrip`.

---

## `RigidMotionsScene` Props (Phase 2)

```typescript
interface RigidMotionsSceneProps {
  // Phase 1 (unchanged)
  ghostOffset: [number, number]
  onGhostMove: (offset: [number, number]) => void

  // Phase 2 additions
  guideState: GuideState
  feedbackState: FeedbackState
  currentRound: Round
  flipped: boolean
  rotationDegrees: 90 | 180 | 270
  rotationDirection: 'cw' | 'ccw'
  speedMultiplier: 0.5 | 1 | 2
  coordinatesActive: boolean
  onAnimationComplete: () => void
}
```

The `Visualization` inner component receives all props and mounts/unmounts scene components based on `guideState` and `feedbackState`.

---

## Conditional Scene Mounting

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

  const showGhost = feedbackState !== 'match' || guideState !== 'capstone'
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

## File Structure (Phase 2 additions)

```
src/components/modules/rigid-motions/
├── InstrumentModule.tsx              — (update) wire Phase 2 state + props
├── constants.ts                      — (unchanged)
├── types.ts                          — NEW: TransformationType, Shape, GuideState, etc.
├── hooks/
│   └── useRigidMotionsState.ts       — (expand) add Phase 2 state + actions
├── scene/
│   ├── RigidMotionsScene.tsx         — (expand) add Phase 2 props + conditional mounting
│   ├── scene-layout.ts               — (unchanged)
│   ├── scene-math.ts                 — (expand) add computeGhostVertices
│   ├── TranslationVector.tsx         — NEW
│   ├── ReflectionAxisTicks.tsx       — NEW
│   ├── RotationArcs.tsx              — NEW
│   ├── ImageShape.tsx                — NEW
│   ├── GapLines.tsx                  — NEW
│   └── __tests__/
│       ├── scene-math.test.ts        — (unchanged)
│       └── transform-math.test.ts    — NEW
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

Phase 3 adds the coordinate layer — the Level 3 → Level 4 boundary moment.

**What Phase 3 adds:**

1. **Coordinate labels** on both pre-image and image vertices — initially hidden, activated at the coordinate reveal
2. **`coordinate-reveal` guide state** — discrete state with its own scene render: both pre-image and image visible, no ghost, no dragging, CONTINUE button
3. **`FormulaReadout`** — surfaces the coordinate rule for each transformation type
4. **`predict-with-coordinates` stage** — predict-and-reveal loop continues with coordinate readouts live on both shapes; composed sequences introduced

The `coordinatesActive: boolean` flag is already threaded through the Phase 2 props interface. Phase 3 flips it to `true` at the coordinate reveal and it never reverts.

---

## Phase 4 Scope (Capstone)

Phase 4 adds the Level 5 capstone task.

**What Phase 4 adds:**

1. **`capstone` guide state** — both pre-image and image shown simultaneously, no ghost, no dragging
2. **`SequenceBuilder`** — two-slot step builder in the ControlStrip
3. **`PreviewGhost`** — live-updating intermediate position ghost as the student builds the sequence
4. **`capstone-utils.ts`** — target generation for valid 1-2 step sequences

The capstone design is fully specified in v2 and is not changed here.

---

## Key Technical Constraints (Carry Forward)

These are non-negotiable decisions from the Phase 1 implementation. Do not revisit them.

### Never use `<Text>` from `@react-three/drei`

`Text` uses `troika-three-text`, which creates a secondary WebGL context. In React StrictMode, this exhausts the browser's WebGL context limit (~8 in Chromium). Use `SpriteLabel` instead.

```tsx
// ❌ Never
import { Text } from '@react-three/drei'
<Text position={[x, y, z]} fontSize={0.5}>label</Text>

// ✅ Always
<SpriteLabel text="label" position={[x, y, z]} color="#b8b0a4" planeWidth={0.6} />
```

### World coordinates = math coordinates

`WORLD_SCALE = 1`. No conversion functions. A point at `(3, 4)` in math space is placed at `position={[3, 4, 0]}` in Three.js.

### Drag via `DragPlane`, not R3F pointer events on shape meshes

The invisible `DragPlane` at z=−0.5 captures all pointer events. Window-level listeners handle out-of-bounds dragging. Do not add `onPointerDown` to triangle meshes.

### GSAP for all animations

All reveal animations, pulses, and staggered effects use GSAP. No CSS transitions on Three.js objects. No `useSpring` from react-spring.

### `useFrame` for camera sync, not `useEffect`

`CameraSetup` uses `useFrame` with a deadband check to sync camera zoom. `useEffect` on `size` causes a one-frame lag on resize.

---

## Open Questions for Phase 2

**Ghost orientation vs. position independence.** The current ghost is a pure translation of the pre-image. For the reflect and rotate stages, the ghost needs to support orientation changes (FLIP, ROTATION) on top of the drag offset. The `computeGhostVertices` function in `scene-math.ts` should handle this composition. The question is whether FLIP and ROTATION are applied relative to the ghost centroid (current position) or the origin. Decision: **apply relative to ghost centroid** — the student drags to position, then adjusts orientation in place. This matches the physical intuition of picking up a shape and rotating it.

**Snap-to-grid for oriented ghost.** The current `snapToGrid` snaps the offset to 0.5-unit increments. For the reflect stage, the ghost position after FLIP may not align to the grid. Decision: snap the drag offset before applying FLIP/ROTATION, so the underlying position always snaps but the orientation transform is applied on top without snapping.

**Reveal animation start position.** The `ImageShape` animates from `PRE_IMAGE_VERTICES` (the pre-image position) to `targetVertices` (the correct image position). The ghost remains visible during the animation, showing the student's prediction alongside the correct reveal. The ghost does not animate — it stays where the student placed it.

**`prefers-reduced-motion`.** All GSAP timelines should check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip to the end state if true. Add this check at the top of each animation function in `animations.ts`.
