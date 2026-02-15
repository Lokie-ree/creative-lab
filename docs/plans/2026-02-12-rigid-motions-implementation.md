# Rigid Motions — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Rigid Motions geometry module — a "Predict & Reveal" instrument where students drag ghost shapes to predicted positions, then watch transformation animations confirm or correct their prediction.

**Architecture:** Flat file structure (no barrel exports) under `src/components/modules/rigid-motions/`. R3F canvas for visualization, shadcn toggle-group/toggle for discrete controls. Six guide states. GSAP for reveal animations. All Eurorack design tokens from `src/index.css`.

**Tech Stack:** React 19, React Three Fiber, GSAP, Tailwind CSS 4, shadcn/ui (toggle, toggle-group, button), Vitest

**Design doc:** `docs/plans/2026-02-12-rigid-motions-design.md`

**Reference patterns:** `src/components/modules/sinewaves/` (guide-state.ts, Layout.tsx, sinewaves-constants.ts, Scene.tsx)

---

## Task 1: Install shadcn Components + Register Course & Module

**Files:**
- Modify: `src/config/courses.ts`
- Modify: `src/config/modules.ts`
- Create: `src/components/modules/rigid-motions/InstrumentModule.tsx` (placeholder)
- Install: `@shadcn/toggle`, `@shadcn/toggle-group`

**Step 1: Install shadcn toggle and toggle-group**

```bash
pnpm dlx shadcn@latest add toggle toggle-group
```

Verify files created at `src/components/ui/toggle.tsx` and `src/components/ui/toggle-group.tsx`.

**Step 2: Add Geometry course to `src/config/courses.ts`**

Add after the existing `advanced-math` course:

```ts
{
  id: 'geometry',
  name: 'Geometry',
  icon: '△',
  color: '#7cc87c',
  order: 2,
  moduleIds: ['rigid-motions'],
},
```

Update the `advanced-math` entry: remove `'vector-transformations'` and `'phase-portraits'` from `moduleIds` if desired, or leave as-is.

**Step 3: Create placeholder InstrumentModule**

Create `src/components/modules/rigid-motions/InstrumentModule.tsx`:

```tsx
interface ModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  isVisible?: boolean
  onBack?: () => void
}

export default function InstrumentModule({ isVisible: _isVisible }: ModuleProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--lab-bg) text-(--lab-text)">
      <p className="lab-silk lab-display-font">RIGID MOTIONS — COMING SOON</p>
    </div>
  )
}
```

**Step 4: Register module in `src/config/modules.ts`**

Add entry (insert before or after vector-transformations):

```ts
{
  id: 'rigid-motions',
  title: 'Rigid Motions',
  domain: 'Geometry',
  description: 'What stays the same when a shape moves?',
  order: 2,
  courseId: 'geometry',
  component: () => import('@/components/modules/rigid-motions/InstrumentModule'),
},
```

**Step 5: Verify build + dev server**

```bash
pnpm build
pnpm dev
```

Navigate to the app, confirm the Geometry course appears in CourseHub and clicking Rigid Motions loads the placeholder.

**Step 6: Commit**

```bash
git add src/components/ui/toggle.tsx src/components/ui/toggle-group.tsx \
  src/config/courses.ts src/config/modules.ts \
  src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat(rigid-motions): scaffold module, add Geometry course, install shadcn toggles"
```

---

## Task 2: Types + Transform Math (TDD)

**Files:**
- Create: `src/components/modules/rigid-motions/types.ts`
- Create: `src/components/modules/rigid-motions/transform-math.ts`
- Create: `src/components/modules/rigid-motions/__tests__/transform-math.test.ts`

**Step 1: Create `types.ts`**

```ts
/** A 2D point on the coordinate grid */
export interface Point2D {
  x: number
  y: number
}

/** A shape defined by labeled vertices */
export interface Shape {
  id: string
  name: string
  vertices: Point2D[]
  labels: string[] // Same length as vertices: ['A', 'B', 'C', ...]
}

/** Transformation types */
export type TransformationType = 'translation' | 'reflection' | 'rotation'

/** A transformation to apply */
export type Transformation =
  | { type: 'translation'; dx: number; dy: number }
  | { type: 'reflection'; axis: 'x' | 'y' | Line }
  | { type: 'rotation'; center: Point2D; degrees: number }

/** A line defined by two points (for arbitrary reflection axes) */
export interface Line {
  p1: Point2D
  p2: Point2D
}

/** Guide states for the module */
export type GuideState =
  | 'watch'
  | 'predict-translate'
  | 'predict-reflect'
  | 'predict-rotate'
  | 'challenge'
  | 'free'

/** Rotation presets available in the toggle-group */
export const ROTATION_PRESETS = [0, 90, 180, 270] as const
export type RotationPreset = (typeof ROTATION_PRESETS)[number]

/** The student's prediction */
export interface Prediction {
  position: Point2D   // Where the centroid is placed
  rotation: RotationPreset
  flipped: boolean
}

/** Result of checking a prediction against the correct answer */
export interface MatchResult {
  positionScore: number   // 0-1, 1 = exact
  orientationScore: number // 0-1, 1 = exact
  overall: number          // 0-1 combined score
  isMatch: boolean
  isClose: boolean
  feedback: string
}

/** Challenge target for challenge mode */
export interface ChallengeTarget {
  transformation: Transformation
  composedWith?: Transformation  // For composed sequences
  description: string            // Plain-language description
}
```

**Step 2: Write failing tests for transform math**

Create `src/components/modules/rigid-motions/__tests__/transform-math.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  translatePoints,
  reflectPointsOverAxis,
  rotatePoints,
  applyTransformation,
  getCentroid,
} from '../transform-math'
import type { Point2D, Transformation } from '../types'

describe('getCentroid', () => {
  it('returns center of a triangle', () => {
    const points: Point2D[] = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 3 }]
    const c = getCentroid(points)
    expect(c.x).toBeCloseTo(1)
    expect(c.y).toBeCloseTo(1)
  })
})

describe('translatePoints', () => {
  it('translates all points by dx, dy', () => {
    const points: Point2D[] = [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    const result = translatePoints(points, 2, -1)
    expect(result).toEqual([{ x: 3, y: 1 }, { x: 5, y: 3 }])
  })
})

describe('reflectPointsOverAxis', () => {
  it('reflects over x-axis', () => {
    const points: Point2D[] = [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    const result = reflectPointsOverAxis(points, 'x')
    expect(result).toEqual([{ x: 1, y: -2 }, { x: 3, y: -4 }])
  })

  it('reflects over y-axis', () => {
    const points: Point2D[] = [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    const result = reflectPointsOverAxis(points, 'y')
    expect(result).toEqual([{ x: -1, y: 2 }, { x: -3, y: 4 }])
  })
})

describe('rotatePoints', () => {
  it('rotates 90° clockwise about origin', () => {
    const points: Point2D[] = [{ x: 1, y: 0 }]
    const result = rotatePoints(points, { x: 0, y: 0 }, -90)
    expect(result[0].x).toBeCloseTo(0)
    expect(result[0].y).toBeCloseTo(-1)
  })

  it('rotates 180° about origin', () => {
    const points: Point2D[] = [{ x: 1, y: 2 }]
    const result = rotatePoints(points, { x: 0, y: 0 }, 180)
    expect(result[0].x).toBeCloseTo(-1)
    expect(result[0].y).toBeCloseTo(-2)
  })

  it('rotates about a non-origin point', () => {
    const points: Point2D[] = [{ x: 2, y: 0 }]
    const result = rotatePoints(points, { x: 1, y: 0 }, 90)
    expect(result[0].x).toBeCloseTo(1)
    expect(result[0].y).toBeCloseTo(1)
  })
})

describe('applyTransformation', () => {
  it('applies translation', () => {
    const points: Point2D[] = [{ x: 0, y: 0 }]
    const t: Transformation = { type: 'translation', dx: 3, dy: 2 }
    const result = applyTransformation(points, t)
    expect(result).toEqual([{ x: 3, y: 2 }])
  })

  it('applies reflection over y-axis', () => {
    const points: Point2D[] = [{ x: 2, y: 1 }]
    const t: Transformation = { type: 'reflection', axis: 'y' }
    const result = applyTransformation(points, t)
    expect(result).toEqual([{ x: -2, y: 1 }])
  })

  it('applies rotation', () => {
    const points: Point2D[] = [{ x: 1, y: 0 }]
    const t: Transformation = { type: 'rotation', center: { x: 0, y: 0 }, degrees: 90 }
    const result = applyTransformation(points, t)
    expect(result[0].x).toBeCloseTo(0)
    expect(result[0].y).toBeCloseTo(1)
  })
})
```

**Step 3: Run tests — verify they fail**

```bash
pnpm vitest run --project unit src/components/modules/rigid-motions/__tests__/transform-math.test.ts
```

Expected: FAIL — module `../transform-math` not found.

**Step 4: Implement `transform-math.ts`**

Create `src/components/modules/rigid-motions/transform-math.ts`:

```ts
import type { Point2D, Transformation } from './types'

/** Compute centroid (average) of a set of points */
export function getCentroid(points: Point2D[]): Point2D {
  const n = points.length
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  )
  return { x: sum.x / n, y: sum.y / n }
}

/** Translate all points by (dx, dy) */
export function translatePoints(points: Point2D[], dx: number, dy: number): Point2D[] {
  return points.map(p => ({ x: p.x + dx, y: p.y + dy }))
}

/** Reflect all points over x-axis or y-axis */
export function reflectPointsOverAxis(points: Point2D[], axis: 'x' | 'y'): Point2D[] {
  return points.map(p =>
    axis === 'x' ? { x: p.x, y: -p.y } : { x: -p.x, y: p.y }
  )
}

/** Rotate all points about a center by given degrees (counterclockwise positive) */
export function rotatePoints(points: Point2D[], center: Point2D, degrees: number): Point2D[] {
  const rad = (degrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  return points.map(p => {
    const dx = p.x - center.x
    const dy = p.y - center.y
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    }
  })
}

/** Apply a Transformation to a set of points */
export function applyTransformation(points: Point2D[], t: Transformation): Point2D[] {
  switch (t.type) {
    case 'translation':
      return translatePoints(points, t.dx, t.dy)
    case 'reflection':
      if (t.axis === 'x' || t.axis === 'y') {
        return reflectPointsOverAxis(points, t.axis)
      }
      // Arbitrary line reflection — implement when needed
      return points
    case 'rotation':
      return rotatePoints(points, t.center, t.degrees)
  }
}
```

**Step 5: Run tests — verify they pass**

```bash
pnpm vitest run --project unit src/components/modules/rigid-motions/__tests__/transform-math.test.ts
```

Expected: All PASS.

**Step 6: Commit**

```bash
git add src/components/modules/rigid-motions/types.ts \
  src/components/modules/rigid-motions/transform-math.ts \
  src/components/modules/rigid-motions/__tests__/transform-math.test.ts
git commit -m "feat(rigid-motions): types and transform math with tests"
```

---

## Task 3: Shape Library + Match Scoring (TDD)

**Files:**
- Create: `src/components/modules/rigid-motions/shape-library.ts`
- Create: `src/components/modules/rigid-motions/match-scoring.ts`
- Create: `src/components/modules/rigid-motions/__tests__/match-scoring.test.ts`

**Step 1: Create `shape-library.ts`**

All shapes are asymmetric so orientation is always visible. Vertices are in grid-unit coordinates centered near origin.

```ts
import type { Shape } from './types'

/** L-shape: asymmetric, clear orientation. 6 vertices. */
export const L_SHAPE: Shape = {
  id: 'l-shape',
  name: 'L',
  vertices: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 0, y: 3 },
  ],
  labels: ['A', 'B', 'C', 'D', 'E', 'F'],
}

/** Arrow: unmistakable orientation. 7 vertices. */
export const ARROW_SHAPE: Shape = {
  id: 'arrow',
  name: 'Arrow',
  vertices: [
    { x: 0, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 0 },
    { x: 3, y: 1.5 },
    { x: 2, y: 3 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
  ],
  labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
}

/** T-shape: challenge mode. 8 vertices. */
export const T_SHAPE: Shape = {
  id: 't-shape',
  name: 'T',
  vertices: [
    { x: 0, y: 2 },
    { x: 3, y: 2 },
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 2, y: 5 },
    { x: 1, y: 5 },
    { x: 1, y: 3 },
    { x: 0, y: 3 },
  ],
  labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
}

/** Z-shape: challenge mode. 8 vertices. */
export const Z_SHAPE: Shape = {
  id: 'z-shape',
  name: 'Z',
  vertices: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 1, y: 3 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
  ],
  labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
}

/** Shapes available per guide state */
export const GUIDED_SHAPES = [L_SHAPE, ARROW_SHAPE] as const
export const CHALLENGE_SHAPES = [L_SHAPE, ARROW_SHAPE, T_SHAPE, Z_SHAPE] as const

/** Get a random shape for the given context */
export function getRandomShape(pool: readonly Shape[]): Shape {
  return pool[Math.floor(Math.random() * pool.length)]
}
```

**Step 2: Write failing tests for match scoring**

Create `src/components/modules/rigid-motions/__tests__/match-scoring.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeMatchResult } from '../match-scoring'
import type { Point2D } from '../types'

describe('computeMatchResult', () => {
  const correctVertices: Point2D[] = [
    { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  ]

  it('returns perfect match when prediction is exact', () => {
    const predicted = [...correctVertices]
    const result = computeMatchResult(predicted, correctVertices)
    expect(result.isMatch).toBe(true)
    expect(result.overall).toBeCloseTo(1)
  })

  it('returns close when prediction is slightly off', () => {
    const predicted = correctVertices.map(p => ({ x: p.x + 0.3, y: p.y + 0.3 }))
    const result = computeMatchResult(predicted, correctVertices)
    expect(result.isMatch).toBe(false)
    expect(result.isClose).toBe(true)
  })

  it('returns miss when prediction is far off', () => {
    const predicted = correctVertices.map(p => ({ x: p.x + 5, y: p.y + 5 }))
    const result = computeMatchResult(predicted, correctVertices)
    expect(result.isMatch).toBe(false)
    expect(result.isClose).toBe(false)
  })
})
```

**Step 3: Run tests — verify they fail**

```bash
pnpm vitest run --project unit src/components/modules/rigid-motions/__tests__/match-scoring.test.ts
```

**Step 4: Implement `match-scoring.ts`**

```ts
import type { Point2D, MatchResult } from './types'
import { getCentroid } from './transform-math'

/** Distance between two points */
function distance(a: Point2D, b: Point2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/** Average distance between corresponding vertex pairs */
function averageVertexDistance(predicted: Point2D[], correct: Point2D[]): number {
  const n = Math.min(predicted.length, correct.length)
  let total = 0
  for (let i = 0; i < n; i++) {
    total += distance(predicted[i], correct[i])
  }
  return total / n
}

/** Max grid distance for normalization (based on a ±6 grid) */
const MAX_GRID_DISTANCE = 12

/** Thresholds */
const MATCH_THRESHOLD = 0.85
const CLOSE_THRESHOLD = 0.6

/**
 * Compare predicted vertices to correct vertices.
 * Returns a MatchResult with scores and feedback.
 */
export function computeMatchResult(
  predicted: Point2D[],
  correct: Point2D[]
): MatchResult {
  const centroidDist = distance(getCentroid(predicted), getCentroid(correct))
  const avgVertexDist = averageVertexDistance(predicted, correct)

  // Position score: how close the centroid is (0-1, 1 = exact)
  const positionScore = Math.max(0, 1 - centroidDist / MAX_GRID_DISTANCE)

  // Orientation score: how close individual vertices are (0-1, 1 = exact)
  const orientationScore = Math.max(0, 1 - avgVertexDist / MAX_GRID_DISTANCE)

  // Combined: weight orientation more heavily (position can be close but flipped wrong)
  const overall = positionScore * 0.4 + orientationScore * 0.6

  const isMatch = overall >= MATCH_THRESHOLD
  const isClose = !isMatch && overall >= CLOSE_THRESHOLD

  let feedback = ''
  if (isMatch) {
    feedback = 'Nailed it!'
  } else if (positionScore > 0.85 && orientationScore < 0.7) {
    feedback = 'Almost — check the orientation.'
  } else if (orientationScore > 0.85 && positionScore < 0.7) {
    feedback = 'Orientation is right — adjust the position.'
  } else if (isClose) {
    feedback = 'Getting closer. Check both position and orientation.'
  } else {
    feedback = 'Not quite. Think about where each point maps to.'
  }

  return { positionScore, orientationScore, overall, isMatch, isClose, feedback }
}
```

**Step 5: Run tests — verify they pass**

```bash
pnpm vitest run --project unit src/components/modules/rigid-motions/__tests__/match-scoring.test.ts
```

**Step 6: Commit**

```bash
git add src/components/modules/rigid-motions/shape-library.ts \
  src/components/modules/rigid-motions/match-scoring.ts \
  src/components/modules/rigid-motions/__tests__/match-scoring.test.ts
git commit -m "feat(rigid-motions): shape library and match scoring with tests"
```

---

## Task 4: Guide State Machine + Constants + Copy

**Files:**
- Create: `src/components/modules/rigid-motions/guide-state.ts`
- Create: `src/components/modules/rigid-motions/rigid-motions-constants.ts`
- Create: `src/components/modules/rigid-motions/rigid-motions-copy.ts`

**Step 1: Create `guide-state.ts`**

Model after `src/components/modules/sinewaves/guide-state.ts`. Six states instead of five.

```ts
import type { GuideState } from './types'

export const GUIDE_STATE_TO_INDEX: Record<GuideState, number> = {
  'watch': 0,
  'predict-translate': 1,
  'predict-reflect': 2,
  'predict-rotate': 3,
  'challenge': 4,
  'free': 5,
}

export const INDEX_TO_GUIDE_STATE: GuideState[] = [
  'watch',
  'predict-translate',
  'predict-reflect',
  'predict-rotate',
  'challenge',
  'free',
]

export const TOTAL_GUIDE_STATES = 6

export interface GuideStateConfig {
  prompt: string
  description: string
  showRotation: boolean    // Show rotation toggle-group
  showFlip: boolean        // Show flip toggle
  showCheck: boolean       // Show CHECK button
  showGhost: boolean       // Show draggable ghost shape
  showTransformAxis: boolean // Show axis line or rotation center
}

export function getGuideStateConfig(state: GuideState): GuideStateConfig {
  switch (state) {
    case 'watch':
      return {
        prompt: 'OBSERVE',
        description: 'Watch how each transformation moves the shape.',
        showRotation: false,
        showFlip: false,
        showCheck: false,
        showGhost: false,
        showTransformAxis: true,
      }
    case 'predict-translate':
      return {
        prompt: 'PREDICT · TRANSLATION',
        description: 'Drag your prediction into position.',
        showRotation: false,
        showFlip: false,
        showCheck: true,
        showGhost: true,
        showTransformAxis: false,
      }
    case 'predict-reflect':
      return {
        prompt: 'PREDICT · REFLECTION',
        description: 'Flip if needed, then drag into position.',
        showRotation: false,
        showFlip: true,
        showCheck: true,
        showGhost: true,
        showTransformAxis: true,
      }
    case 'predict-rotate':
      return {
        prompt: 'PREDICT · ROTATION',
        description: 'Set the angle, then drag into position.',
        showRotation: true,
        showFlip: false,
        showCheck: true,
        showGhost: true,
        showTransformAxis: true,
      }
    case 'challenge':
      return {
        prompt: 'CHALLENGE',
        description: 'Predict the composed transformation.',
        showRotation: true,
        showFlip: true,
        showCheck: true,
        showGhost: true,
        showTransformAxis: true,
      }
    case 'free':
      return {
        prompt: 'FREE EXPLORE',
        description: 'Apply any transformation. Discover what stays the same.',
        showRotation: true,
        showFlip: true,
        showCheck: false,
        showGhost: false,
        showTransformAxis: true,
      }
  }
}

/** Speed options for reveal animation */
export const SPEED_OPTIONS = [0.5, 1, 2] as const
export type SpeedMultiplier = (typeof SPEED_OPTIONS)[number]

export function cycleSpeed(current: SpeedMultiplier): SpeedMultiplier {
  const index = SPEED_OPTIONS.indexOf(current)
  return SPEED_OPTIONS[(index + 1) % SPEED_OPTIONS.length]
}
```

**Step 2: Create `rigid-motions-constants.ts`**

```ts
/** Successful predictions needed per stage before advancing */
export const PREDICTIONS_TO_ADVANCE = 2

/** Match scoring thresholds */
export const MATCH_THRESHOLDS = {
  match: 0.85,
  close: 0.6,
} as const

/** Grid configuration */
export const GRID_CONFIG = {
  range: 6,          // -6 to 6 on both axes
  majorSpacing: 1,   // Major grid line every 1 unit
  minorSpacing: 0.5, // Minor grid line every 0.5 units
} as const

/** Proximity feedback thresholds (normalized 0-1) */
export const PROXIMITY_THRESHOLDS = {
  medium: 0.4,
  close: 0.7,
} as const
```

**Step 3: Create `rigid-motions-copy.ts`**

Use the `educational-copywriter` skill for polished copy later. Placeholder copy for now:

```ts
import type { GuideState } from './types'

/** Earned insight text revealed after mastering each stage */
export const EARNED_INSIGHTS: Partial<Record<GuideState, string>> = {
  'predict-translate': 'Every point moves the same distance in the same direction. Distances are preserved.',
  'predict-reflect': 'Each point is the same distance from the line of reflection. Orientation reverses.',
  'predict-rotate': 'Every point stays the same distance from the center. The angle of rotation is constant.',
  'challenge': 'Two figures are congruent if one can be mapped onto the other by a sequence of rigid motions.',
}

/** Match feedback messages */
export const MATCH_MESSAGES = {
  nailed: 'Nailed it!',
  closeOrientation: 'Almost — check the orientation.',
  closePosition: 'Right orientation — adjust the position.',
  close: 'Getting closer. Check both position and orientation.',
  miss: 'Not quite. Think about where each point maps to.',
} as const

/** Nudge messages when student is stuck */
export const NUDGES: Partial<Record<GuideState, string>> = {
  'predict-translate': 'Count the grid squares. Every point moves the same amount.',
  'predict-reflect': 'The reflection line acts like a mirror. Each point is equidistant.',
  'predict-rotate': 'Trace an arc from each point around the center. How far does it swing?',
}
```

**Step 4: Verify types compile**

```bash
pnpm tsc -b --noEmit
```

**Step 5: Commit**

```bash
git add src/components/modules/rigid-motions/guide-state.ts \
  src/components/modules/rigid-motions/rigid-motions-constants.ts \
  src/components/modules/rigid-motions/rigid-motions-copy.ts
git commit -m "feat(rigid-motions): guide state machine, constants, and copy"
```

---

## Task 5: Challenge Utils + Proximity Hook

**Files:**
- Create: `src/components/modules/rigid-motions/challenge-utils.ts`
- Create: `src/components/modules/rigid-motions/use-proximity.ts`

**Step 1: Create `challenge-utils.ts`**

Generates random transformation targets for challenge mode.

```ts
import type { ChallengeTarget, Transformation, Point2D } from './types'
import { GRID_CONFIG } from './rigid-motions-constants'

const { range } = GRID_CONFIG

/** Random int in [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Pick random element from array */
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Generate a single random transformation */
function randomTransformation(): Transformation {
  const type = pick(['translation', 'reflection', 'rotation'] as const)

  switch (type) {
    case 'translation':
      return {
        type: 'translation',
        dx: randInt(-range + 2, range - 2),
        dy: randInt(-range + 2, range - 2),
      }
    case 'reflection':
      return { type: 'reflection', axis: pick(['x', 'y'] as const) }
    case 'rotation': {
      const degrees = pick([90, 180, 270] as const)
      return { type: 'rotation', center: { x: 0, y: 0 }, degrees }
    }
  }
}

/** Describe a transformation in plain language */
function describeTransformation(t: Transformation): string {
  switch (t.type) {
    case 'translation': {
      const parts: string[] = []
      if (t.dx !== 0) parts.push(`${Math.abs(t.dx)} ${t.dx > 0 ? 'right' : 'left'}`)
      if (t.dy !== 0) parts.push(`${Math.abs(t.dy)} ${t.dy > 0 ? 'up' : 'down'}`)
      return `Translate ${parts.join(', ')}`
    }
    case 'reflection':
      return `Reflect over the ${t.axis === 'x' ? 'x' : 'y'}-axis`
    case 'rotation':
      return `Rotate ${Math.abs(t.degrees)}° ${t.degrees > 0 ? 'counterclockwise' : 'clockwise'} about the origin`
  }
}

/** Generate a challenge target (single or composed transformation) */
export function generateChallengeTarget(composed: boolean = false): ChallengeTarget {
  const t1 = randomTransformation()

  if (!composed) {
    return { transformation: t1, description: describeTransformation(t1) }
  }

  const t2 = randomTransformation()
  return {
    transformation: t1,
    composedWith: t2,
    description: `${describeTransformation(t1)}, then ${describeTransformation(t2).toLowerCase()}`,
  }
}
```

**Step 2: Create `use-proximity.ts`**

```ts
import { useMemo } from 'react'
import type { Point2D } from './types'
import { getCentroid } from './transform-math'
import { PROXIMITY_THRESHOLDS } from './rigid-motions-constants'

interface ProximityResult {
  score: number  // 0-1
  label: string  // Feedback text
}

/**
 * Compute proximity between ghost shape position and correct position.
 * Used for real-time "getting closer" feedback as the student drags.
 */
export function useProximity(
  ghostVertices: Point2D[] | null,
  correctVertices: Point2D[] | null
): ProximityResult {
  return useMemo(() => {
    if (!ghostVertices || !correctVertices) {
      return { score: 0, label: '' }
    }

    const ghostCentroid = getCentroid(ghostVertices)
    const correctCentroid = getCentroid(correctVertices)

    const dist = Math.sqrt(
      (ghostCentroid.x - correctCentroid.x) ** 2 +
      (ghostCentroid.y - correctCentroid.y) ** 2
    )

    // Normalize: 0 at max distance (12), 1 at exact match
    const score = Math.max(0, 1 - dist / 12)

    let label = ''
    if (score >= PROXIMITY_THRESHOLDS.close) {
      label = 'Almost there...'
    } else if (score >= PROXIMITY_THRESHOLDS.medium) {
      label = 'Getting closer...'
    }

    return { score, label }
  }, [ghostVertices, correctVertices])
}
```

**Step 3: Verify types compile**

```bash
pnpm tsc -b --noEmit
```

**Step 4: Commit**

```bash
git add src/components/modules/rigid-motions/challenge-utils.ts \
  src/components/modules/rigid-motions/use-proximity.ts
git commit -m "feat(rigid-motions): challenge generation and proximity hook"
```

---

## Task 6: Scene Infrastructure — Grid, Shape, Axis

**Files:**
- Create: `src/components/modules/rigid-motions/scene-layout.ts`
- Create: `src/components/modules/rigid-motions/GridLines.tsx`
- Create: `src/components/modules/rigid-motions/Shape.tsx`
- Create: `src/components/modules/rigid-motions/TransformationAxis.tsx`

These are R3F components. Test by visual inspection in dev server.

**Step 1: Create `scene-layout.ts`**

Reference `src/components/modules/sinewaves/scene-layout.ts` for the viewport-proportional pattern.

```ts
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'

export interface SceneLayout {
  gridScale: number     // Scale factor: grid units → world units
  isPortrait: boolean
  isMobile: boolean
}

/**
 * Compute viewport-aware layout for the rigid motions scene.
 * Maps a ±6 grid onto the available canvas area.
 */
export function useSceneLayout(): SceneLayout {
  const { viewport } = useThree()

  return useMemo(() => {
    const isPortrait = viewport.height > viewport.width
    const isMobile = viewport.width < 6

    // Scale so the grid fits within the viewport with padding
    const padding = 0.9 // 10% padding on each side
    const gridRange = 12 // -6 to 6
    const gridScale = Math.min(
      (viewport.width * padding) / gridRange,
      (viewport.height * padding) / gridRange,
    )

    return { gridScale, isPortrait, isMobile }
  }, [viewport])
}
```

**Step 2: Create `GridLines.tsx`**

Reference `src/components/modules/sinewaves/GridLines.tsx` for the THREE.LineSegments pattern.

Renders a coordinate grid from -6 to 6 with major/minor lines, axis labels, and origin marker. Use `--lab-ghost` for minor lines, `--lab-border` for major, `--lab-text` for axes.

Implementation: Use `@react-three/drei` `Line` component or raw THREE.LineSegments. Draw horizontal and vertical lines. Axis lines (x=0, y=0) slightly brighter. Vertex count labels at integer positions along axes.

*Full implementation left to the developer — follow the GridLines.tsx pattern from sinewaves, adapted for a 2D coordinate grid with labeled axes.*

**Step 3: Create `Shape.tsx`**

R3F component that renders a polygon as a filled shape with outlined edges and labeled vertices.

Props:
- `vertices: Point2D[]`
- `labels: string[]`
- `color: string` (hex)
- `opacity?: number`
- `showLabels?: boolean`
- `scale: number` (from `useSceneLayout().gridScale`)

Implementation: Use `THREE.Shape` + `ShapeGeometry` for fill, `Line` from drei for edges, `Text` from drei for vertex labels. Keep it flat on the z=0 plane.

**Step 4: Create `TransformationAxis.tsx`**

Renders the axis of transformation (reflection line or rotation center point).

Props:
- `type: 'x-axis' | 'y-axis' | 'rotation-center'`
- `center?: Point2D` (for rotation)
- `scale: number`
- `visible: boolean`

Implementation: Dashed line for reflection axis (using drei `Line` with `dashed` prop). Small dot/crosshair for rotation center.

**Step 5: Verify dev server renders**

Create a temporary test by updating the placeholder `InstrumentModule.tsx` to render a basic R3F Canvas with GridLines and a sample Shape. Verify in browser.

```bash
pnpm dev
```

**Step 6: Commit**

```bash
git add src/components/modules/rigid-motions/scene-layout.ts \
  src/components/modules/rigid-motions/GridLines.tsx \
  src/components/modules/rigid-motions/Shape.tsx \
  src/components/modules/rigid-motions/TransformationAxis.tsx
git commit -m "feat(rigid-motions): scene infrastructure — grid, shape, axis components"
```

---

## Task 7: GhostShape + Scene Canvas

**Files:**
- Create: `src/components/modules/rigid-motions/GhostShape.tsx`
- Create: `src/components/modules/rigid-motions/Scene.tsx`

**Step 1: Create `GhostShape.tsx`**

The core interaction component — a draggable, translucent copy of the source shape.

Props:
- `shape: Shape`
- `rotation: RotationPreset`
- `flipped: boolean`
- `scale: number`
- `onPositionChange: (position: Point2D) => void`
- `visible: boolean`

Key behavior:
- Uses drei `useDrag` or raw pointer events for drag interaction
- Snaps position to grid intersections (round x and y to nearest integer)
- Applies rotation and flip transforms visually
- Renders with `--lab-accent` color at 50% opacity, dashed outline
- Emits position changes on drag end (snapped)

Implementation notes:
- Use a `group` with `onPointerDown`, `onPointerMove`, `onPointerUp` for drag
- Track drag state in ref (not state — avoid re-renders during drag)
- On pointer up, snap to grid and call `onPositionChange`
- Apply rotation via `group.rotation.z` and flip via `group.scale.x = -1`

**Step 2: Create `Scene.tsx`**

R3F Canvas wrapper. Reference `src/components/modules/sinewaves/Scene.tsx`.

Props:
- `sourceShape: Shape`
- `ghostPosition: Point2D | null`
- `ghostRotation: RotationPreset`
- `ghostFlipped: boolean`
- `correctVertices: Point2D[] | null` (shown after CHECK)
- `showGhost: boolean`
- `showAxis: boolean`
- `axisType: 'x-axis' | 'y-axis' | 'rotation-center'`
- `rotationCenter?: Point2D`
- `revealAnimating: boolean`
- `onGhostPositionChange: (pos: Point2D) => void`
- `isVisible: boolean`

Renders:
- `<Canvas>` with OrthographicCamera (flat 2D view)
- `<GridLines />`
- `<Shape />` for the source shape
- `<GhostShape />` (when `showGhost`)
- `<TransformationAxis />` (when `showAxis`)
- `<Shape />` for the revealed correct position (after CHECK, animated)

**Step 3: Verify in dev server**

Update placeholder `InstrumentModule.tsx` to render Scene with a source shape and draggable ghost. Confirm:
- Grid renders
- Source shape visible
- Ghost shape draggable
- Snaps to grid

```bash
pnpm dev
```

**Step 4: Commit**

```bash
git add src/components/modules/rigid-motions/GhostShape.tsx \
  src/components/modules/rigid-motions/Scene.tsx
git commit -m "feat(rigid-motions): draggable ghost shape and scene canvas"
```

---

## Task 8: StatusStrip + PromptReadout + FormulaReadout

**Files:**
- Create: `src/components/modules/rigid-motions/StatusStrip.tsx`
- Create: `src/components/modules/rigid-motions/PromptReadout.tsx`
- Create: `src/components/modules/rigid-motions/FormulaReadout.tsx`

Model these directly after the sinewaves equivalents:
- `src/components/modules/sinewaves/components/StatusStrip.tsx`
- `src/components/modules/sinewaves/components/PromptReadout.tsx`
- `src/components/modules/sinewaves/components/FormulaReadout.tsx`

**Step 1: Create `StatusStrip.tsx`**

Same API as sinewaves but with 6 dots (one per guide state) and title "RIGID MOTIONS".

Props:
- `currentState: GuideState`
- `onBack?: () => void`

Uses: `GUIDE_STATE_TO_INDEX`, `TOTAL_GUIDE_STATES` from `./guide-state`.

**Step 2: Create `PromptReadout.tsx`**

Displays transformation prompt + description.

Props:
- `prompt: string`
- `description?: string`
- `visible?: boolean`

Uses `fadeInReadout` animation from `@/lib/animation/presets`.

**Step 3: Create `FormulaReadout.tsx`**

Displays earned insights (the "formula" equivalent for geometry).

Props:
- `insight: string | null`
- `visible?: boolean`

Shows earned insight text when the student completes a stage. Uses `lab-data-font` for the insight text.

**Step 4: Verify types compile**

```bash
pnpm tsc -b --noEmit
```

**Step 5: Commit**

```bash
git add src/components/modules/rigid-motions/StatusStrip.tsx \
  src/components/modules/rigid-motions/PromptReadout.tsx \
  src/components/modules/rigid-motions/FormulaReadout.tsx
git commit -m "feat(rigid-motions): status strip, prompt readout, formula readout"
```

---

## Task 9: ControlStrip + InstrumentControls (shadcn)

**Files:**
- Create: `src/components/modules/rigid-motions/ControlStrip.tsx`
- Create: `src/components/modules/rigid-motions/InstrumentControls.tsx`

**Step 1: Create `InstrumentControls.tsx`**

The CHECK, RESET, and Speed controls.

```tsx
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { SpeedMultiplier } from './guide-state'

interface InstrumentControlsProps {
  onCheck: () => void
  onReset: () => void
  speed: SpeedMultiplier
  onSpeedChange: (speed: SpeedMultiplier) => void
  showCheck: boolean
  checkDisabled?: boolean
}

export function InstrumentControls({
  onCheck,
  onReset,
  speed,
  onSpeedChange,
  showCheck,
  checkDisabled,
}: InstrumentControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {showCheck && (
        <Button
          onClick={onCheck}
          disabled={checkDisabled}
          variant="outline"
          className="lab-silk lab-display-font border-(--lab-accent) text-(--lab-accent) duration-150 hover:bg-(--lab-accent)/10"
        >
          CHECK
        </Button>
      )}

      <Button
        onClick={onReset}
        variant="outline"
        className="lab-silk lab-display-font border-(--lab-danger) text-(--lab-danger) duration-150 hover:bg-(--lab-danger)/10"
      >
        RESET
      </Button>

      <ToggleGroup
        type="single"
        value={String(speed)}
        onValueChange={(v) => v && onSpeedChange(Number(v) as SpeedMultiplier)}
        className="gap-0"
      >
        {[0.5, 1, 2].map((s) => (
          <ToggleGroupItem
            key={s}
            value={String(s)}
            className="lab-silk lab-data-font h-8 px-2 text-[9px] data-[state=on]:bg-(--lab-accent)/15 data-[state=on]:text-(--lab-accent)"
          >
            {s}x
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
```

**Step 2: Create `ControlStrip.tsx`**

Orchestrates the rotation toggle-group, flip toggle, and instrument controls.

```tsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Toggle } from '@/components/ui/toggle'
import { InstrumentControls } from './InstrumentControls'
import type { RotationPreset } from './types'
import type { SpeedMultiplier } from './guide-state'

interface ControlStripProps {
  // Rotation
  rotation: RotationPreset
  onRotationChange: (r: RotationPreset) => void
  showRotation: boolean
  // Flip
  flipped: boolean
  onFlipChange: (f: boolean) => void
  showFlip: boolean
  // Actions
  onCheck: () => void
  onReset: () => void
  showCheck: boolean
  checkDisabled?: boolean
  // Speed
  speed: SpeedMultiplier
  onSpeedChange: (s: SpeedMultiplier) => void
  // Feedback
  proximityLabel?: string
  matchFeedback?: string
}

export function ControlStrip({
  rotation, onRotationChange, showRotation,
  flipped, onFlipChange, showFlip,
  onCheck, onReset, showCheck, checkDisabled,
  speed, onSpeedChange,
  proximityLabel, matchFeedback,
}: ControlStripProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Rotation toggle-group */}
        {showRotation && (
          <div className="flex flex-col items-center gap-1">
            <span className="lab-silk lab-display-font text-(--lab-ghost)">ROTATION</span>
            <ToggleGroup
              type="single"
              value={String(rotation)}
              onValueChange={(v) => v && onRotationChange(Number(v) as RotationPreset)}
              className="gap-0"
            >
              {[0, 90, 180, 270].map((deg) => (
                <ToggleGroupItem
                  key={deg}
                  value={String(deg)}
                  className="lab-silk lab-data-font h-8 px-2.5 text-[9px] data-[state=on]:bg-(--lab-accent)/15 data-[state=on]:text-(--lab-accent)"
                >
                  {deg}°
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Flip toggle */}
        {showFlip && (
          <div className="flex flex-col items-center gap-1">
            <span className="lab-silk lab-display-font text-(--lab-ghost)">FLIP</span>
            <Toggle
              pressed={flipped}
              onPressedChange={onFlipChange}
              className="lab-silk lab-display-font h-8 px-3 text-[9px] data-[state=on]:bg-(--lab-accent)/15 data-[state=on]:text-(--lab-accent)"
            >
              MIRROR
            </Toggle>
          </div>
        )}

        {/* Instrument controls (CHECK, RESET, SPEED) */}
        <InstrumentControls
          onCheck={onCheck}
          onReset={onReset}
          speed={speed}
          onSpeedChange={onSpeedChange}
          showCheck={showCheck}
          checkDisabled={checkDisabled}
        />
      </div>

      {/* Feedback row */}
      {(proximityLabel || matchFeedback) && (
        <div className="text-center">
          <p className="lab-silk lab-display-font text-(--lab-accent)" aria-live="polite">
            {matchFeedback || proximityLabel}
          </p>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Verify types compile + dev server**

```bash
pnpm tsc -b --noEmit
pnpm dev
```

**Step 4: Commit**

```bash
git add src/components/modules/rigid-motions/ControlStrip.tsx \
  src/components/modules/rigid-motions/InstrumentControls.tsx
git commit -m "feat(rigid-motions): control strip with shadcn toggle-group and toggle"
```

---

## Task 10: Animations — Reveal + Celebration

**Files:**
- Create: `src/components/modules/rigid-motions/animations.ts`

**Step 1: Create `animations.ts`**

Reference `src/components/modules/sinewaves/animations.ts` for the GSAP timeline pattern. Use tokens from `src/lib/animation/tokens.ts`.

Key sequences:
1. **revealTransformation** — Animates the source shape along its transformation path to the correct position. ~600ms.
2. **matchCelebration** — Pulse on match success. Scale 1 → 1.05 → 1, green glow.
3. **stageTransition** — Fade out current prompt/controls, fade in new ones.
4. **watchDemo** — Auto-plays a transformation for the watch stage.

```ts
import gsap from 'gsap'
import { duration, easing } from '@/lib/animation/tokens'

/**
 * Animate the reveal of a transformation.
 * Called after CHECK — the correct shape slides/flips/rotates into position.
 */
export function revealTransformation(
  element: HTMLElement | null,
  speedMultiplier: number = 1,
  onComplete?: () => void
): gsap.core.Timeline | null {
  if (!element) return null

  const tl = gsap.timeline({ onComplete })

  tl.fromTo(element,
    { opacity: 0, scale: 0.9 },
    {
      opacity: 1,
      scale: 1,
      duration: (duration.slow / 1000) / speedMultiplier,
      ease: easing.out,
    }
  )

  return tl
}

/**
 * Celebration pulse on successful match.
 */
export function matchCelebration(
  element: HTMLElement | null,
  onComplete?: () => void
): gsap.core.Timeline | null {
  if (!element) return null

  const tl = gsap.timeline({ onComplete })

  tl.to(element, {
    scale: 1.05,
    duration: duration.feedback / 1000,
    ease: easing.out,
  })
  tl.to(element, {
    scale: 1,
    duration: duration.feedback / 1000,
    ease: easing.inOut,
  })

  return tl
}

/**
 * Stage transition: fade out old content, fade in new.
 */
export function stageTransition(
  exitElements: (HTMLElement | null)[],
  enterElements: (HTMLElement | null)[],
  onComplete?: () => void
): gsap.core.Timeline | null {
  const tl = gsap.timeline({ onComplete })

  const exits = exitElements.filter(Boolean) as HTMLElement[]
  const enters = enterElements.filter(Boolean) as HTMLElement[]

  if (exits.length > 0) {
    tl.to(exits, {
      opacity: 0,
      y: -8,
      duration: duration.fast / 1000,
      ease: easing.in,
      stagger: 0.05,
    })
  }

  if (enters.length > 0) {
    tl.fromTo(enters,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: duration.normal / 1000,
        ease: easing.out,
        stagger: 0.05,
      },
      exits.length > 0 ? '-=0.1' : 0,
    )
  }

  return tl
}
```

**Step 2: Verify types compile**

```bash
pnpm tsc -b --noEmit
```

**Step 3: Commit**

```bash
git add src/components/modules/rigid-motions/animations.ts
git commit -m "feat(rigid-motions): GSAP reveal and celebration animations"
```

---

## Task 11: InstrumentModule — Orchestration

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx` (replace placeholder)

**Step 1: Implement InstrumentModule**

This is the main orchestration component. Reference `src/components/modules/sinewaves/InstrumentModule.tsx` for the pattern.

Key state:
- `guideState: GuideState` — current stage
- `ghostPosition: Point2D | null` — where the student placed the ghost
- `rotation: RotationPreset` — current rotation toggle value
- `flipped: boolean` — current flip toggle value
- `speed: SpeedMultiplier` — animation speed
- `successCount: number` — successful predictions in current stage
- `currentTransformation: Transformation | null` — the active transformation to predict
- `currentShape: Shape` — the active shape
- `matchFeedback: string | null` — feedback after CHECK
- `earnedInsight: string | null` — insight revealed after stage completion
- `showReveal: boolean` — whether the correct position is showing
- `booted: boolean` — for boot animation

Key logic:
- On stage entry: generate transformation for current stage type, pick shape
- On CHECK: compute correct vertices via `applyTransformation`, compute ghost vertices from prediction, run `computeMatchResult`
- On match: increment successCount, play celebration, if `successCount >= PREDICTIONS_TO_ADVANCE`, show earned insight + advance stage
- On stage advance: reset prediction state, generate new transformation
- Always interactive: ghost draggable in all states, guide just points attention

**Step 2: Verify dev server**

```bash
pnpm dev
```

Navigate through all guide states. Verify:
- Watch stage shows demos
- Predict stages show ghost, controls respond
- CHECK triggers reveal animation
- Match advances stage after threshold
- Challenge shows composed transformations
- Free mode has all controls

**Step 3: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat(rigid-motions): instrument module orchestration"
```

---

## Task 12: Layout + Integration + Final Verification

**Files:**
- Create: `src/components/modules/rigid-motions/Layout.tsx`
- Possibly modify: `src/App.tsx` (if EscapeHatch needs rigid-motions handling)

**Step 1: Create `Layout.tsx`**

Copy the pattern from `src/components/modules/sinewaves/Layout.tsx` exactly. Same `InstrumentLayout` component with slots for statusStrip, promptReadout, formulaReadout, visualization, controlStrip. Same panel screws, scored dividers, responsive grid.

**Step 2: Wire Layout into InstrumentModule**

Update InstrumentModule to use `<InstrumentLayout>` and pass each component as a slot prop.

**Step 3: Handle EscapeHatch in App.tsx**

Check `src/App.tsx` — sinewaves hides the global EscapeHatch because it has its own StatusStrip with ESC. Rigid motions needs the same treatment. Add `'rigid-motions'` to the condition.

**Step 4: Full build verification**

```bash
pnpm build
pnpm dev
```

Verify:
- No TypeScript errors
- No build warnings
- Module loads from CourseHub → Constellation → Rigid Motions
- All 6 guide states work
- Controls appear/disappear per state
- Drag, rotate, flip, CHECK, RESET all functional
- Reveal animation plays
- Match celebration fires
- Earned insights display
- ESC returns to constellation
- Mobile responsive

**Step 5: Commit**

```bash
git add src/components/modules/rigid-motions/Layout.tsx \
  src/components/modules/rigid-motions/InstrumentModule.tsx \
  src/App.tsx
git commit -m "feat(rigid-motions): layout, app integration, and final wiring"
```

---

## Summary

| Task | What | Files | Test |
|------|------|-------|------|
| 1 | Scaffold + shadcn | 5 files | Build + dev |
| 2 | Types + transform math | 3 files | Vitest (TDD) |
| 3 | Shapes + match scoring | 3 files | Vitest (TDD) |
| 4 | Guide state + constants + copy | 3 files | Type check |
| 5 | Challenge utils + proximity | 2 files | Type check |
| 6 | Grid, Shape, Axis | 4 files | Dev server |
| 7 | GhostShape + Scene | 2 files | Dev server |
| 8 | StatusStrip, Prompt, Formula | 3 files | Type check |
| 9 | ControlStrip + InstrumentControls | 2 files | Dev server |
| 10 | Animations | 1 file | Type check |
| 11 | InstrumentModule | 1 file | Dev server |
| 12 | Layout + integration | 2-3 files | Full build + manual |

**Total:** ~24 new files, 2-3 modified files, ~12 commits.
