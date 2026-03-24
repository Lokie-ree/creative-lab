# Dilations Module — Prompt 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the math utilities, type definitions, and constants that every subsequent Dilations prompt depends on. Also extend the shared transform types with `DilationParams` for the 3-module geometry arc.

**Architecture:** Pure TypeScript — no React, no side effects. Extend `src/lib/types/transforms.ts` with `DilationParams`, then create module-local types, math functions, and constants in `src/components/modules/dilations/utils/`. All functions are deterministic. All coordinates assume origin at (0,0), positive x right, positive y up.

**Tech Stack:** TypeScript, Vitest (jsdom environment, `src/**/__tests__/**/*.test.ts` pattern)

**Spec:** `docs/modules/dilations/build-order-prompts.md` — Prompt 1 section

**Reference implementation:** `src/components/modules/rigid-motions/` — follow the same file layout patterns (types in module `types.ts`, math in `transform-math.ts`, constants in `constants.ts`, tests in `__tests__/`)

---

### Task 1: Extend Shared Transform Types with DilationParams

**Files:**
- Modify: `src/lib/types/transforms.ts`
- Modify: `src/components/modules/rigid-motions/transform-math.ts` (add default case to prevent build break)
- Test: `src/components/modules/rigid-motions/scene/__tests__/transform-math.test.ts` (verify no breakage)

- [ ] **Step 1: Add DilationParams to shared types**

In `src/lib/types/transforms.ts`, add `'dilate'` to `TransformationType`, add `DilationParams`, and extend `TransformationParams` union:

```typescript
export type TransformationType = 'translate' | 'reflect' | 'rotate' | 'dilate'

export type TranslationParams = { type: 'translate'; dx: number; dy: number }
export type ReflectionParams  = { type: 'reflect'; axis: 'x' | 'y' }
export type RotationParams    = { type: 'rotate'; degrees: 90 | 180 | 270; direction: 'cw' | 'ccw' }
export type DilationParams    = { type: 'dilate'; k: number }
export type TransformationParams = TranslationParams | ReflectionParams | RotationParams | DilationParams
```

- [ ] **Step 2: Add default case to M1's applyTransform**

`strict: true` enables `noImplicitReturns`. M1's `applyTransform` switch in `src/components/modules/rigid-motions/transform-math.ts` has no default case — adding `'dilate'` to the union makes the switch non-exhaustive and will fail `tsc -b` with "Not all code paths return a value."

Add a default case after the `'rotate'` case (line 88 of transform-math.ts):

```typescript
    // Exhaustive guard — rigid-motions only handles translate/reflect/rotate.
    // Dilations and future transform types are handled by their own modules.
    default: {
      const _exhaustive: never = params
      throw new Error(`Unsupported transform type in rigid-motions: ${(_exhaustive as TransformationParams).type}`)
    }
```

This is a proper exhaustive check — if a future type is added to the union but not handled here, TypeScript catches it at compile time.

- [ ] **Step 3: Run existing M1 transform-math tests to verify no breakage**

Run: `pnpm vitest run src/components/modules/rigid-motions/scene/__tests__/transform-math.test.ts`
Expected: All existing tests PASS. M1 never creates a `DilationParams`, so the default case is unreachable in practice.

- [ ] **Step 4: Run full build to verify no type errors**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types/transforms.ts src/components/modules/rigid-motions/transform-math.ts
git commit -m "feat(types): add DilationParams to shared transform types

Extends TransformationType and TransformationParams unions with 'dilate'
for the 3-module geometry arc (rigid-motions → dilations → pythagorean).
Adds exhaustive default case to M1's applyTransform to satisfy strict mode.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create Dilations Module Type Definitions

**Files:**
- Create: `src/components/modules/dilations/utils/types.ts`

- [ ] **Step 1: Create the dilations directory structure**

Run: `mkdir -p src/components/modules/dilations/utils`

- [ ] **Step 2: Write type definitions**

Create `src/components/modules/dilations/utils/types.ts`:

```typescript
// src/components/modules/dilations/utils/types.ts
//
// Type definitions for the Dilations module.
// Re-exports shared transform types; defines module-specific types.

export type {
  TransformationType,
  TranslationParams,
  ReflectionParams,
  RotationParams,
  DilationParams,
  TransformationParams,
} from '@/lib/types/transforms'

export type Vec2 = { x: number; y: number }

export type Triangle = { a: Vec2; b: Vec2; c: Vec2 }

export type ScaleFactor = 2 | 3 | 0.5 | 0.333

export type RoundId =
  | 'dilate-k2' | 'dilate-k2-properties' | 'dilate-k3'
  | 'dilate-k-half' | 'dilate-summary'
  | 'coord-k2' | 'coord-k-half' | 'coord-k-third'
  | 'similarity-guided' | 'similarity-rigid-dilation' | 'similarity-inverse'
  | 'aa-discover' | 'aa-confirm' | 'capstone-final'

export type PhaseId = 'scale-factor' | 'coordinate' | 'similarity' | 'aa-capstone'

export type RoundState = 'entry' | 'active' | 'prediction' | 'reveal' | 'completion'

export type RoundConfig = {
  id: RoundId
  phase: PhaseId
  label: string
  scaleFactor?: ScaleFactor
  hasGhostDrag: boolean
  hasSequenceBuilder: boolean
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
}

export type TransformType = 'translate' | 'reflect' | 'rotate' | 'dilate'

export type TranslateStepParams = { dx: number; dy: number }
export type ReflectStepParams = { axis: 'x' | 'y' }
export type RotateStepParams = { angleDeg: number }
export type DilateStepParams = { k: number }

export type TransformStep = {
  type: TransformType
  params: TranslateStepParams | ReflectStepParams | RotateStepParams | DilateStepParams
}

export type SimilarityPair = {
  preImage: Triangle
  target: Triangle
  isSimilar: boolean
  validSequences?: TransformStep[][]
}

export type CapstonePair = SimilarityPair & {
  angleLabels: { a: number; b: number; c: number }[]
}
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm build`
Expected: PASS (types-only file, no runtime code).

- [ ] **Step 4: Commit**

```bash
git add src/components/modules/dilations/utils/types.ts
git commit -m "feat(dilations): add module type definitions

Defines Vec2, Triangle, RoundId, PhaseId, RoundConfig, TransformStep,
SimilarityPair, CapstonePair. Re-exports shared transform types.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Create Constants and Round Configs

**Files:**
- Create: `src/components/modules/dilations/utils/constants.ts`

- [ ] **Step 1: Write constants file**

Create `src/components/modules/dilations/utils/constants.ts`:

```typescript
// src/components/modules/dilations/utils/constants.ts

import type { Triangle, ScaleFactor, RoundId, RoundConfig } from './types'

/** Same scalene triangle as M1: A(1,1) B(4,2) C(2,4) */
export const CANONICAL_TRIANGLE: Triangle = {
  a: { x: 1, y: 1 },
  b: { x: 4, y: 2 },
  c: { x: 2, y: 4 },
}

export const SCALE_FACTORS: readonly ScaleFactor[] = [2, 3, 0.5, 0.333]

/** Grid units — how close ghost centroid must be to target centroid */
export const PREDICTION_TOLERANCE = 0.75

export const ROUND_SEQUENCE: readonly RoundId[] = [
  'dilate-k2', 'dilate-k2-properties', 'dilate-k3',
  'dilate-k-half', 'dilate-summary',
  'coord-k2', 'coord-k-half', 'coord-k-third',
  'similarity-guided', 'similarity-rigid-dilation', 'similarity-inverse',
  'aa-discover', 'aa-confirm', 'capstone-final',
]

export const ROUND_CONFIGS: Record<RoundId, RoundConfig> = {
  'dilate-k2':             { id: 'dilate-k2',             phase: 'scale-factor', label: 'k = 2 — Enlargement',         scaleFactor: 2,     hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-k2-properties':  { id: 'dilate-k2-properties',  phase: 'scale-factor', label: 'k = 2 — Properties',          scaleFactor: 2,     hasGhostDrag: false, hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-k3':             { id: 'dilate-k3',             phase: 'scale-factor', label: 'k = 3 — Confirm',             scaleFactor: 3,     hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-k-half':         { id: 'dilate-k-half',         phase: 'scale-factor', label: 'k = ½ — Reduction',           scaleFactor: 0.5,   hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-summary':        { id: 'dilate-summary',        phase: 'scale-factor', label: 'Scale Factor Summary',                            hasGhostDrag: false, hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'coord-k2':              { id: 'coord-k2',              phase: 'coordinate',   label: 'k = 2 with Coordinates',      scaleFactor: 2,     hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: false },
  'coord-k-half':          { id: 'coord-k-half',          phase: 'coordinate',   label: 'k = ½ with Coordinates',      scaleFactor: 0.5,   hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: false },
  'coord-k-third':         { id: 'coord-k-third',         phase: 'coordinate',   label: 'k = ⅓ — Generalize',         scaleFactor: 0.333, hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: false },
  'similarity-guided':     { id: 'similarity-guided',     phase: 'similarity',   label: 'Guided Similarity',                               hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: false },
  'similarity-rigid-dilation': { id: 'similarity-rigid-dilation', phase: 'similarity', label: 'Rigid + Dilation',                          hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: false },
  'similarity-inverse':    { id: 'similarity-inverse',    phase: 'similarity',   label: 'Inverse Similarity',                              hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: false },
  'aa-discover':           { id: 'aa-discover',           phase: 'aa-capstone',  label: 'AA Discovery',                                    hasGhostDrag: false, hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: true  },
  'aa-confirm':            { id: 'aa-confirm',            phase: 'aa-capstone',  label: 'AA Confirmation',                                 hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: true  },
  'capstone-final':        { id: 'capstone-final',        phase: 'aa-capstone',  label: 'Capstone Challenge',                              hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: true  },
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/utils/constants.ts
git commit -m "feat(dilations): add constants and round configs

Defines CANONICAL_TRIANGLE, SCALE_FACTORS, PREDICTION_TOLERANCE,
ROUND_SEQUENCE (14 rounds), and ROUND_CONFIGS with phase/visibility flags.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Create Math Utilities — Core Dilation Functions

**Files:**
- Create: `src/components/modules/dilations/utils/math.ts`
- Create: `src/components/modules/dilations/__tests__/math.test.ts`

- [ ] **Step 1: Write failing tests for core dilation functions**

Create `src/components/modules/dilations/__tests__/math.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  dilatePoint,
  dilateTriangle,
  sideLength,
  triangleSideLengths,
  sideRatio,
} from '../utils/math'
import type { Vec2, Triangle } from '../utils/types'
import { CANONICAL_TRIANGLE } from '../utils/constants'

const A: Vec2 = { x: 1, y: 1 }
const B: Vec2 = { x: 4, y: 2 }
const C: Vec2 = { x: 2, y: 4 }

describe('dilatePoint', () => {
  it('scales a point by k=2 from origin', () => {
    expect(dilatePoint(A, 2)).toEqual({ x: 2, y: 2 })
  })

  it('scales a point by k=3 from origin', () => {
    expect(dilatePoint(B, 3)).toEqual({ x: 12, y: 6 })
  })

  it('scales a point by k=0.5 from origin', () => {
    expect(dilatePoint(C, 0.5)).toEqual({ x: 1, y: 2 })
  })

  it('handles the origin (fixed point)', () => {
    expect(dilatePoint({ x: 0, y: 0 }, 5)).toEqual({ x: 0, y: 0 })
  })
})

describe('dilateTriangle', () => {
  it('dilates canonical triangle by k=2', () => {
    const result = dilateTriangle(CANONICAL_TRIANGLE, 2)
    expect(result.a).toEqual({ x: 2, y: 2 })
    expect(result.b).toEqual({ x: 8, y: 4 })
    expect(result.c).toEqual({ x: 4, y: 8 })
  })

  it('dilates canonical triangle by k=0.5', () => {
    const result = dilateTriangle(CANONICAL_TRIANGLE, 0.5)
    expect(result.a).toEqual({ x: 0.5, y: 0.5 })
    expect(result.b).toEqual({ x: 2, y: 1 })
    expect(result.c).toEqual({ x: 1, y: 2 })
  })
})

describe('sideLength', () => {
  it('computes distance between A(1,1) and B(4,2)', () => {
    expect(sideLength(A, B)).toBeCloseTo(Math.sqrt(10))
  })

  it('computes distance between same point', () => {
    expect(sideLength(A, A)).toBe(0)
  })
})

describe('triangleSideLengths', () => {
  it('returns [AB, BC, CA] for canonical triangle', () => {
    const [ab, bc, ca] = triangleSideLengths(CANONICAL_TRIANGLE)
    expect(ab).toBeCloseTo(Math.sqrt(10))  // A(1,1)→B(4,2)
    expect(bc).toBeCloseTo(Math.sqrt(8))   // B(4,2)→C(2,4)
    expect(ca).toBeCloseTo(Math.sqrt(10))  // C(2,4)→A(1,1)
  })
})

describe('sideRatio', () => {
  it('returns 2 for doubled side', () => {
    expect(sideRatio(3, 6)).toBe(2)
  })

  it('returns 0.5 for halved side', () => {
    expect(sideRatio(4, 2)).toBe(0.5)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts`
Expected: FAIL — module `../utils/math` does not exist.

- [ ] **Step 3: Implement core dilation functions**

Create `src/components/modules/dilations/utils/math.ts`:

```typescript
// src/components/modules/dilations/utils/math.ts
//
// Pure math functions for the Dilations module.
// No React, no side effects. All coordinates: origin at (0,0), +x right, +y up.

import type { Vec2, Triangle } from './types'

/** Origin-centered dilation: (x, y) → (kx, ky) */
export function dilatePoint(p: Vec2, k: number): Vec2 {
  return { x: p.x * k, y: p.y * k }
}

/** Apply origin-centered dilation to all 3 vertices */
export function dilateTriangle(t: Triangle, k: number): Triangle {
  return {
    a: dilatePoint(t.a, k),
    b: dilatePoint(t.b, k),
    c: dilatePoint(t.c, k),
  }
}

/** Euclidean distance between two points */
export function sideLength(a: Vec2, b: Vec2): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** Side lengths [AB, BC, CA] */
export function triangleSideLengths(t: Triangle): [number, number, number] {
  return [
    sideLength(t.a, t.b),
    sideLength(t.b, t.c),
    sideLength(t.c, t.a),
  ]
}

/** image / pre-image ratio */
export function sideRatio(pre: number, image: number): number {
  return image / pre
}

// ---------------------------------------------------------------------------
// Standalone transformation primitives (Vec2 interface)
// Used by composePoint internally; exported for direct use in later prompts.
// ---------------------------------------------------------------------------

/** (x, y) → (x + dx, y + dy) */
export function translatePoint(p: Vec2, dx: number, dy: number): Vec2 {
  return { x: p.x + dx, y: p.y + dy }
}

/** Reflect over x-axis: (x, y) → (x, -y). Reflect over y-axis: (x, y) → (-x, y). */
export function reflectPoint(p: Vec2, axis: 'x' | 'y'): Vec2 {
  return axis === 'x' ? { x: p.x, y: -p.y } : { x: -p.x, y: p.y }
}

/** Rotate around origin by angleDeg degrees (counter-clockwise positive) */
export function rotatePoint(p: Vec2, angleDeg: number): Vec2 {
  const rad = angleDeg * (Math.PI / 180)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    x: Math.round((p.x * cos - p.y * sin) * 1e10) / 1e10,
    y: Math.round((p.x * sin + p.y * cos) * 1e10) / 1e10,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts`
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/dilations/utils/math.ts src/components/modules/dilations/__tests__/math.test.ts
git commit -m "feat(dilations): add core dilation math utilities

dilatePoint, dilateTriangle, sideLength, triangleSideLengths, sideRatio.
All pure functions, origin-centered, deterministic.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Add Angle and Matching Functions

**Files:**
- Modify: `src/components/modules/dilations/utils/math.ts`
- Modify: `src/components/modules/dilations/__tests__/math.test.ts`

- [ ] **Step 1: Write failing tests for angle and matching functions**

Append to `src/components/modules/dilations/__tests__/math.test.ts`:

```typescript
import {
  // ... existing imports ...
  angleDeg,
  triangleAngles,
  pointsMatch,
  trianglesMatch,
} from '../utils/math'

describe('angleDeg', () => {
  it('computes 90° for a right angle', () => {
    const vertex: Vec2 = { x: 0, y: 0 }
    const a: Vec2 = { x: 1, y: 0 }
    const b: Vec2 = { x: 0, y: 1 }
    expect(angleDeg(a, vertex, b)).toBe(90)
  })

  it('computes 180° for a straight line', () => {
    const vertex: Vec2 = { x: 0, y: 0 }
    const a: Vec2 = { x: 1, y: 0 }
    const b: Vec2 = { x: -1, y: 0 }
    expect(angleDeg(a, vertex, b)).toBe(180)
  })

  it('computes 60° for equilateral triangle vertex', () => {
    const vertex: Vec2 = { x: 0, y: 0 }
    const a: Vec2 = { x: 1, y: 0 }
    const b: Vec2 = { x: 0.5, y: Math.sqrt(3) / 2 }
    expect(angleDeg(a, vertex, b)).toBe(60)
  })
})

describe('triangleAngles', () => {
  it('angles sum to 180 for canonical triangle', () => {
    const [a, b, c] = triangleAngles(CANONICAL_TRIANGLE)
    expect(a + b + c).toBeCloseTo(180)
  })

  it('angles are preserved under dilation', () => {
    const dilated = dilateTriangle(CANONICAL_TRIANGLE, 3)
    const [a1, b1, c1] = triangleAngles(CANONICAL_TRIANGLE)
    const [a2, b2, c2] = triangleAngles(dilated)
    expect(a2).toBe(a1)
    expect(b2).toBe(b1)
    expect(c2).toBe(c1)
  })
})

describe('pointsMatch', () => {
  it('returns true for exact match', () => {
    expect(pointsMatch({ x: 1, y: 2 }, { x: 1, y: 2 }, 0.5)).toBe(true)
  })

  it('returns true within tolerance', () => {
    expect(pointsMatch({ x: 1, y: 2 }, { x: 1.3, y: 2.3 }, 0.75)).toBe(true)
  })

  it('returns false beyond tolerance', () => {
    expect(pointsMatch({ x: 1, y: 2 }, { x: 3, y: 4 }, 0.75)).toBe(false)
  })
})

describe('trianglesMatch', () => {
  it('returns true for identical triangles', () => {
    expect(trianglesMatch(CANONICAL_TRIANGLE, CANONICAL_TRIANGLE, 0.1)).toBe(true)
  })

  it('returns false when one vertex is off', () => {
    const shifted: Triangle = { ...CANONICAL_TRIANGLE, a: { x: 5, y: 5 } }
    expect(trianglesMatch(CANONICAL_TRIANGLE, shifted, 0.5)).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts`
Expected: FAIL — `angleDeg`, `triangleAngles`, `pointsMatch`, `trianglesMatch` not found.

- [ ] **Step 3: Implement angle and matching functions**

Append to `src/components/modules/dilations/utils/math.ts`:

```typescript
/** Angle at vertex in degrees, given points a-vertex-b. Rounded to nearest integer. */
export function angleDeg(a: Vec2, vertex: Vec2, b: Vec2): number {
  const v1x = a.x - vertex.x
  const v1y = a.y - vertex.y
  const v2x = b.x - vertex.x
  const v2y = b.y - vertex.y
  const dot = v1x * v2x + v1y * v2y
  const cross = v1x * v2y - v1y * v2x
  const rad = Math.atan2(Math.abs(cross), dot)
  return Math.round(rad * (180 / Math.PI))
}

/** Angles at vertices A, B, C in degrees */
export function triangleAngles(t: Triangle): [number, number, number] {
  return [
    angleDeg(t.b, t.a, t.c),
    angleDeg(t.a, t.b, t.c),
    angleDeg(t.a, t.c, t.b),
  ]
}

/** True if two points are within tolerance (Euclidean distance) */
export function pointsMatch(a: Vec2, b: Vec2, tolerance: number): boolean {
  return sideLength(a, b) <= tolerance
}

/** True if all 3 vertex pairs match within tolerance */
export function trianglesMatch(a: Triangle, b: Triangle, tolerance: number): boolean {
  return (
    pointsMatch(a.a, b.a, tolerance) &&
    pointsMatch(a.b, b.b, tolerance) &&
    pointsMatch(a.c, b.c, tolerance)
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts`
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/dilations/utils/math.ts src/components/modules/dilations/__tests__/math.test.ts
git commit -m "feat(dilations): add angle computation and matching functions

angleDeg (atan2-based, rounded), triangleAngles, pointsMatch,
trianglesMatch. Verified angle preservation under dilation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Add Composition Functions

**Files:**
- Modify: `src/components/modules/dilations/utils/math.ts`
- Modify: `src/components/modules/dilations/__tests__/math.test.ts`

- [ ] **Step 1: Write failing tests for composition functions**

Append to `src/components/modules/dilations/__tests__/math.test.ts`:

```typescript
import {
  // ... existing imports ...
  translatePoint,
  reflectPoint,
  rotatePoint,
  composeTransformations,
  composeTriangle,
} from '../utils/math'
import type { TransformStep } from '../utils/types'

describe('translatePoint', () => {
  it('translates a point by (dx, dy)', () => {
    expect(translatePoint({ x: 1, y: 2 }, 3, -1)).toEqual({ x: 4, y: 1 })
  })
})

describe('reflectPoint', () => {
  it('reflects over x-axis', () => {
    expect(reflectPoint({ x: 2, y: 3 }, 'x')).toEqual({ x: 2, y: -3 })
  })

  it('reflects over y-axis', () => {
    expect(reflectPoint({ x: 2, y: 3 }, 'y')).toEqual({ x: -2, y: 3 })
  })
})

describe('rotatePoint', () => {
  it('rotates 90° CCW', () => {
    const result = rotatePoint({ x: 1, y: 0 }, 90)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(1)
  })

  it('rotates 180°', () => {
    const result = rotatePoint({ x: 3, y: 4 }, 180)
    expect(result.x).toBeCloseTo(-3)
    expect(result.y).toBeCloseTo(-4)
  })
})

describe('composeTransformations', () => {
  it('applies translate then dilate', () => {
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 1, dy: 1 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    // (1,1) → translate(1,1) → (2,2) → dilate(2) → (4,4)
    const result = composeTransformations(steps, { x: 1, y: 1 })
    expect(result).toEqual({ x: 4, y: 4 })
  })

  it('applies dilate then translate', () => {
    const steps: TransformStep[] = [
      { type: 'dilate', params: { k: 2 } },
      { type: 'translate', params: { dx: 1, dy: 1 } },
    ]
    // (1,1) → dilate(2) → (2,2) → translate(1,1) → (3,3)
    const result = composeTransformations(steps, { x: 1, y: 1 })
    expect(result).toEqual({ x: 3, y: 3 })
  })

  it('applies reflect-y then dilate', () => {
    const steps: TransformStep[] = [
      { type: 'reflect', params: { axis: 'y' } },
      { type: 'dilate', params: { k: 3 } },
    ]
    // (2,4) → reflect-y → (-2,4) → dilate(3) → (-6,12)
    const result = composeTransformations(steps, { x: 2, y: 4 })
    expect(result).toEqual({ x: -6, y: 12 })
  })

  it('applies rotate 90° then dilate', () => {
    const steps: TransformStep[] = [
      { type: 'rotate', params: { angleDeg: 90 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    // (1,0) → rotate 90° CCW → (0,1) → dilate(2) → (0,2)
    const result = composeTransformations(steps, { x: 1, y: 0 })
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(2)
  })

  it('handles empty sequence (identity)', () => {
    const result = composeTransformations([], { x: 3, y: 5 })
    expect(result).toEqual({ x: 3, y: 5 })
  })
})

describe('composeTriangle', () => {
  it('applies a sequence to all three vertices', () => {
    const steps: TransformStep[] = [
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, CANONICAL_TRIANGLE)
    expect(result.a).toEqual({ x: 2, y: 2 })
    expect(result.b).toEqual({ x: 8, y: 4 })
    expect(result.c).toEqual({ x: 4, y: 8 })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts`
Expected: FAIL — `composeTransformations`, `composeTriangle` not found.

- [ ] **Step 3: Implement composition functions**

Append to `src/components/modules/dilations/utils/math.ts`:

```typescript
import type { TransformStep } from './types'

/** Apply a single TransformStep to a point, delegating to standalone primitives */
function applyStep(step: TransformStep, p: Vec2): Vec2 {
  switch (step.type) {
    case 'translate': {
      const params = step.params as { dx: number; dy: number }
      return translatePoint(p, params.dx, params.dy)
    }
    case 'reflect': {
      const params = step.params as { axis: 'x' | 'y' }
      return reflectPoint(p, params.axis)
    }
    case 'rotate': {
      const params = step.params as { angleDeg: number }
      return rotatePoint(p, params.angleDeg)
    }
    case 'dilate': {
      const params = step.params as { k: number }
      return dilatePoint(p, params.k)
    }
  }
}

/** Apply an ordered sequence of TransformSteps to a point */
export function composeTransformations(steps: TransformStep[], p: Vec2): Vec2 {
  return steps.reduce((point, step) => applyStep(step, point), p)
}

/** Apply an ordered sequence of TransformSteps to all vertices of a triangle */
export function composeTriangle(steps: TransformStep[], t: Triangle): Triangle {
  return {
    a: composeTransformations(steps, t.a),
    b: composeTransformations(steps, t.b),
    c: composeTransformations(steps, t.c),
  }
}
```

Note: Move the `import type { TransformStep }` to the top of the file alongside the existing `Vec2, Triangle` import.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/modules/dilations/__tests__/math.test.ts`
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/dilations/utils/math.ts src/components/modules/dilations/__tests__/math.test.ts
git commit -m "feat(dilations): add transformation composition functions

translatePoint, reflectPoint, rotatePoint standalone primitives.
composeTransformations and composeTriangle apply ordered TransformStep sequences.
Supports translate, reflect, rotate (arbitrary angle), and dilate.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Register Module in Config

**Files:**
- Modify: `src/config/modules.ts`

- [ ] **Step 1: Add dilations module config**

Add to `MODULES` array in `src/config/modules.ts`, after the `rigid-motions` entry:

```typescript
{
  id: 'dilations',
  title: 'Dilations & Similarity',
  domain: 'Geometry',
  description: 'What stays the same when a shape grows?',
  order: 3,
  courseId: 'geometry',
  component: () => import('@/components/modules/dilations/DilationsModule'),
  comingSoon: true,
},
```

Note: `comingSoon: true` — the component doesn't exist yet. This registers the module so it appears in the course hub. The lazy import will only resolve when a student clicks into it (which they can't with `comingSoon`).

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: PASS. `comingSoon` modules are never loaded — the dynamic import path is not resolved at build time.

- [ ] **Step 3: Commit**

```bash
git add src/config/modules.ts
git commit -m "feat(dilations): register module in config (comingSoon)

Adds dilations entry to MODULES array with courseId 'geometry',
order 3. comingSoon: true until UI is built.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run all dilations tests**

Run: `pnpm vitest run src/components/modules/dilations`
Expected: All tests PASS.

- [ ] **Step 2: Run full M1 test suite to confirm no regression**

Run: `pnpm vitest run src/components/modules/rigid-motions`
Expected: All tests PASS.

- [ ] **Step 3: Run full build**

Run: `pnpm build`
Expected: PASS with no type errors.

---

## File Summary

```
Modified:
  src/lib/types/transforms.ts                            — Added DilationParams, extended unions
  src/components/modules/rigid-motions/transform-math.ts — Added exhaustive default case in applyTransform
  src/config/modules.ts                                  — Registered dilations module (comingSoon)

Created:
  src/components/modules/dilations/
  ├── utils/
  │   ├── types.ts                     — Vec2, Triangle, RoundId, RoundConfig, TransformStep, etc.
  │   ├── constants.ts                 — CANONICAL_TRIANGLE, SCALE_FACTORS, ROUND_CONFIGS
  │   └── math.ts                      — dilatePoint/Triangle, sideLength, angleDeg, translatePoint, reflectPoint, rotatePoint, composeTransformations, composeTriangle
  └── __tests__/
      └── math.test.ts                 — 15+ test cases covering all math functions
```
