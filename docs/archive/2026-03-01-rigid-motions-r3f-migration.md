# Rigid Motions R3F Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate `RigidMotionsScene.tsx` from pure SVG to React Three Fiber, achieving exact visual parity with the Phase 1 SVG version.

**Architecture:** Orthographic Canvas with world-coordinate math (WORLD_SCALE = 1). Inner `Visualization` component inside the Canvas handles all R3F primitives. Drag uses an invisible plane mesh + raycaster intersection, same snap-to-grid hook as before. Grid uses raw BufferGeometry/lineSegments (sinewaves pattern); triangle outlines use drei `<Line>` with dashed support; labels use drei `<Text>`.

**Tech Stack:** React Three Fiber (`@react-three/fiber ^9`), `@react-three/drei ^10`, `three ^0.182`, Vitest (unit tests), TypeScript.

**Reference files:**
- Design doc: `docs/plans/2026-03-01-rigid-motions-r3f-migration-design.md`
- Sinewaves scene: `src/components/modules/sinewaves/Scene.tsx`
- Sinewaves grid: `src/components/modules/sinewaves/GridLines.tsx`
- Existing scene: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`
- Constants: `src/components/modules/rigid-motions/constants.ts`
- Math utils: `src/components/modules/rigid-motions/scene/math.ts`

---

## Task 1: Update `constants.ts`

**Files:**
- Modify: `src/components/modules/rigid-motions/constants.ts`

**Step 1: Open the file and make the changes**

Comment out the three SVG-only constants and add `WORLD_SCALE`:

```ts
// src/components/modules/rigid-motions/constants.ts

/** Full grid range: canvas shows −9 to +9 on each axis */
export const GRID_RANGE = 9

// SVG-only — not used in R3F
// export const CANVAS_SIZE = 540

/** Content range: labels and shape vertices constrained to −6 to +6 */
export const CONTENT_RANGE = 6

// SVG-only — not used in R3F
// export const SCALE = CANVAS_SIZE / (GRID_RANGE * 2)

// SVG-only — not used in R3F
// export const CENTER = CANVAS_SIZE / 2

/** Math coordinates are world coordinates — no conversion needed */
export const WORLD_SCALE = 1

// ... rest of file unchanged
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: errors only in `scene/math.ts` (imports the commented-out constants) — that's fine, we fix that next.

**Step 3: Commit**

```bash
git add src/components/modules/rigid-motions/constants.ts
git commit -m "feat: add WORLD_SCALE to rigid-motions constants, comment out SVG-only constants"
```

---

## Task 2: Update `math.ts`

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/math.ts`

**Step 1: Remove the SVG-constant import and re-export**

The file currently starts with:
```ts
import { CANVAS_SIZE, GRID_RANGE, SCALE, CENTER } from '../constants'
```
And ends with:
```ts
// Re-export for convenience
export { CANVAS_SIZE, GRID_RANGE, SCALE, CENTER }
```

Remove both of those. The functions `mathToSVG`, `svgToMath`, `snapToGrid`, `clientToMath`, `toPolygonPoints`, `vertexLabelPos` all stay untouched — they are simply unused after the migration. `snapToGrid` is still called by `useRigidMotionsState`.

**Step 2: Verify TypeScript compiles clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors. (The SVG-specific functions in math.ts will have TypeScript "unused variable" warnings at most — that's acceptable. If TS errors appear on the removed exports, check that nothing else imports `CANVAS_SIZE/SCALE/CENTER` from `math.ts`.)

If `RigidMotionsScene.tsx` still imports the old SVG constants, that's expected — we replace it entirely in Task 5.

**Step 3: Commit**

```bash
git add src/components/modules/rigid-motions/scene/math.ts
git commit -m "feat: remove SVG-constant import/re-export from math.ts"
```

---

## Task 3: Write pure scene-math helpers + tests

**Files:**
- Create: `src/components/modules/rigid-motions/scene/scene-math.ts`
- Create: `src/components/modules/rigid-motions/scene/__tests__/scene-math.test.ts`

These are the renderer-agnostic math helpers that the R3F scene needs. Putting them in a separate file keeps them testable.

**Step 1: Write the failing tests first**

Create `src/components/modules/rigid-motions/scene/__tests__/scene-math.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ghostVertices, clampOffset, vertexLabelOffset } from '../scene-math'
import { PRE_IMAGE_VERTICES, CONTENT_RANGE } from '../../constants'

describe('ghostVertices', () => {
  it('offsets each vertex by the given [dx, dy]', () => {
    const result = ghostVertices([2, 3])
    // PRE_IMAGE_VERTICES: [1,1], [4,2], [2,4]
    expect(result[0]).toEqual([3, 4])
    expect(result[1]).toEqual([6, 5])
    expect(result[2]).toEqual([4, 7])
  })

  it('works with zero offset', () => {
    const result = ghostVertices([0, 0])
    expect(result).toEqual([[1, 1], [4, 2], [2, 4]])
  })

  it('works with negative offset', () => {
    const result = ghostVertices([-1, -1])
    expect(result[0]).toEqual([0, 0])
  })
})

describe('clampOffset', () => {
  // Pre-image centroid is (2.333..., 2.333...)
  // Max positive offset: CONTENT_RANGE - centroid ≈ 3.666
  // Max negative offset: -CONTENT_RANGE - centroid ≈ -8.333

  it('passes through an offset that keeps the ghost centroid in range', () => {
    const result = clampOffset([1, 1])
    expect(result).toEqual([1, 1])
  })

  it('clamps when ghost centroid would exceed +CONTENT_RANGE', () => {
    // centroid x = 2.333, offset = 4 → ghost centroid = 6.333 > 6
    // should clamp so ghost centroid = 6 → offset = 6 - 2.333 = 3.666...
    const result = clampOffset([10, 0])
    const ghostCentroidX = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / 3 + result[0]
    expect(ghostCentroidX).toBeLessThanOrEqual(CONTENT_RANGE)
  })

  it('clamps when ghost centroid would go below -CONTENT_RANGE', () => {
    const result = clampOffset([-10, 0])
    const ghostCentroidX = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / 3 + result[0]
    expect(ghostCentroidX).toBeGreaterThanOrEqual(-CONTENT_RANGE)
  })

  it('clamps both axes independently', () => {
    const result = clampOffset([100, 100])
    const cx = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / 3 + result[0]
    const cy = PRE_IMAGE_VERTICES.reduce((s, [, y]) => s + y, 0) / 3 + result[1]
    expect(cx).toBeLessThanOrEqual(CONTENT_RANGE)
    expect(cy).toBeLessThanOrEqual(CONTENT_RANGE)
  })
})

describe('vertexLabelOffset', () => {
  it('returns a point offset outward from the centroid', () => {
    const vertex: [number, number] = [4, 2]
    const centroid: [number, number] = [2, 2]
    const dist = 0.5
    const result = vertexLabelOffset(vertex, centroid, dist)
    // Direction is [1, 0], so offset should be [4 + 0.5, 2]
    expect(result[0]).toBeCloseTo(4.5)
    expect(result[1]).toBeCloseTo(2)
  })

  it('returns the vertex position when vertex equals centroid', () => {
    const vertex: [number, number] = [2, 2]
    const centroid: [number, number] = [2, 2]
    const result = vertexLabelOffset(vertex, centroid, 0.5)
    expect(result[0]).toBe(2)
    expect(result[1]).toBe(2)
  })
})
```

**Step 2: Run the tests — expect failure (module doesn't exist yet)**

```bash
npx vitest run --project unit src/components/modules/rigid-motions/scene/__tests__/scene-math.test.ts
```

Expected: FAIL — "Cannot find module '../scene-math'"

**Step 3: Implement `scene-math.ts`**

Create `src/components/modules/rigid-motions/scene/scene-math.ts`:

```ts
import { PRE_IMAGE_VERTICES, CONTENT_RANGE } from '../constants'

/** Compute ghost triangle vertices: pre-image each offset by [dx, dy] */
export function ghostVertices(offset: [number, number]): [number, number][] {
  return PRE_IMAGE_VERTICES.map(([x, y]) => [x + offset[0], y + offset[1]])
}

/** Pre-image centroid in math coordinates */
function preImageCentroid(): [number, number] {
  const cx = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / PRE_IMAGE_VERTICES.length
  const cy = PRE_IMAGE_VERTICES.reduce((s, [, y]) => s + y, 0) / PRE_IMAGE_VERTICES.length
  return [cx, cy]
}

/**
 * Clamp a raw ghost offset so the ghost centroid stays within ±CONTENT_RANGE.
 * Ghost centroid = preImageCentroid + offset.
 */
export function clampOffset(rawOffset: [number, number]): [number, number] {
  const [cx, cy] = preImageCentroid()
  const clampX = Math.min(CONTENT_RANGE - cx, Math.max(-CONTENT_RANGE - cx, rawOffset[0]))
  const clampY = Math.min(CONTENT_RANGE - cy, Math.max(-CONTENT_RANGE - cy, rawOffset[1]))
  return [clampX, clampY]
}

/**
 * Compute label position: vertex offset outward from centroid by `dist` world units.
 * Returns [x, y] in math/world coordinates.
 * Falls back to vertex position if vertex === centroid.
 */
export function vertexLabelOffset(
  vertex: [number, number],
  centroid: [number, number],
  dist = 0.5
): [number, number] {
  const dx = vertex[0] - centroid[0]
  const dy = vertex[1] - centroid[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return [vertex[0], vertex[1]]
  return [vertex[0] + (dx / len) * dist, vertex[1] + (dy / len) * dist]
}
```

**Step 4: Run the tests — expect all to pass**

```bash
npx vitest run --project unit src/components/modules/rigid-motions/scene/__tests__/scene-math.test.ts
```

Expected: all tests PASS.

**Step 5: Commit**

```bash
git add src/components/modules/rigid-motions/scene/scene-math.ts \
        src/components/modules/rigid-motions/scene/__tests__/scene-math.test.ts
git commit -m "feat: add scene-math helpers and tests for rigid-motions R3F scene"
```

---

## Task 4: Build `CoordinateGrid` component

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx` (we build this incrementally — start fresh here)

The `CoordinateGrid` is a self-contained component. Build it first, before any triangle or drag logic.

**Step 1: Replace `RigidMotionsScene.tsx` with a scaffolded R3F file**

Rewrite the file to only contain the Canvas + CoordinateGrid. Props interface stays the same as before. We'll add the rest in subsequent tasks.

```tsx
// src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
import { useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  PRE_IMAGE_VERTICES,
  VERTEX_LABELS,
  GHOST_VERTEX_LABELS,
  GRID_RANGE,
  CONTENT_RANGE,
} from '../constants'

interface RigidMotionsSceneProps {
  ghostOffset: [number, number]
  onGhostMove: (rawOffset: [number, number]) => void
}

// ─── Camera setup ────────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera, size } = useThree()
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = size.width / (GRID_RANGE * 2)
      camera.updateProjectionMatrix()
    }
  }, [camera, size.width])
  return null
}

// ─── Coordinate grid ─────────────────────────────────────────────────────────

function CoordinateGrid() {
  const { gridPoints, axisPoints } = useMemo(() => {
    const grid: THREE.Vector3[] = []
    const axes: THREE.Vector3[] = []

    for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
      const isAxis = i === 0
      const target = isAxis ? axes : grid
      // Vertical line
      target.push(new THREE.Vector3(i, -GRID_RANGE, 0))
      target.push(new THREE.Vector3(i, GRID_RANGE, 0))
      // Horizontal line
      target.push(new THREE.Vector3(-GRID_RANGE, i, 0))
      target.push(new THREE.Vector3(GRID_RANGE, i, 0))
    }

    return {
      gridPoints: new THREE.BufferGeometry().setFromPoints(grid),
      axisPoints: new THREE.BufferGeometry().setFromPoints(axes),
    }
  }, [])

  // Axis label integers: -CONTENT_RANGE to +CONTENT_RANGE, skip 0
  const labelIntegers = useMemo(() => {
    const ints: number[] = []
    for (let i = -CONTENT_RANGE; i <= CONTENT_RANGE; i++) {
      if (i !== 0) ints.push(i)
    }
    return ints
  }, [])

  return (
    <group>
      {/* Minor grid lines */}
      <lineSegments geometry={gridPoints}>
        <lineBasicMaterial color="#28251f" transparent opacity={0.2} />
      </lineSegments>

      {/* Axis lines */}
      <lineSegments geometry={axisPoints}>
        <lineBasicMaterial color="#3e3a34" transparent opacity={0.4} />
      </lineSegments>

      {/* Origin dot */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="var(--lab-text-muted)" />
      </mesh>

      {/* Axis number labels */}
      {labelIntegers.map((i) => (
        <group key={i}>
          {/* X-axis label — below axis */}
          <Text
            position={[i, -0.4, 0.01]}
            fontSize={0.5}
            color="var(--lab-text-muted)"
            font="/fonts/JetBrainsMono-Regular.woff2"
            anchorX="center"
            anchorY="top"
          >
            {String(i)}
          </Text>
          {/* Y-axis label — left of axis */}
          <Text
            position={[-0.4, i, 0.01]}
            fontSize={0.5}
            color="var(--lab-text-muted)"
            font="/fonts/JetBrainsMono-Regular.woff2"
            anchorX="right"
            anchorY="middle"
          >
            {String(i)}
          </Text>
        </group>
      ))}
    </group>
  )
}

// ─── Scene shell (placeholder triangles/drag — added in next tasks) ───────────

function Visualization({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  return (
    <>
      <CameraSetup />
      <CoordinateGrid />
      {/* Triangles + drag plane added in Tasks 5–7 */}
    </>
  )
}

export function RigidMotionsScene({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ touchAction: 'none' }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10] }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%', background: 'var(--lab-bg)' }}
      >
        <Visualization ghostOffset={ghostOffset} onGhostMove={onGhostMove} />
      </Canvas>
    </div>
  )
}
```

**Step 2: Check for the font file**

Drei's `<Text>` needs a font. Check if JetBrains Mono is available in `public/fonts/`:

```bash
ls public/fonts/
```

If the font file is missing, use the `font` prop with a fallback — drei's `<Text>` defaults to a built-in Helvetica if the font fails to load. You can also omit the `font` prop entirely for now and we'll wire it in Task 8. If the file exists, use the path shown. If not, omit the `font` prop.

**Step 3: Verify the dev server shows a grid**

```bash
npm run dev
```

Open the Rigid Motions module. You should see: grid lines (minor + axis), axis number labels, origin dot. No triangles yet — that's expected.

**Step 4: Commit**

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
git commit -m "feat: scaffold R3F canvas with CoordinateGrid for rigid-motions"
```

---

## Task 5: Build `PreImageTriangle` component

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`

**Step 1: Add a `makeTriangleShape` helper and `PreImageTriangle` component**

Add these above the `Visualization` function:

```tsx
import { Line, Text } from '@react-three/drei'
import { vertexLabelOffset } from './scene-math'

/** Build a THREE.Shape from an array of [x, y] vertices */
function makeTriangleShape(verts: readonly [number, number][]): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(verts[0][0], verts[0][1])
  for (let i = 1; i < verts.length; i++) shape.lineTo(verts[i][0], verts[i][1])
  shape.closePath()
  return shape
}

/** Math centroid of an array of [x, y] vertices */
function centroidOf(verts: readonly [number, number][]): [number, number] {
  const cx = verts.reduce((s, [x]) => s + x, 0) / verts.length
  const cy = verts.reduce((s, [, y]) => s + y, 0) / verts.length
  return [cx, cy]
}

function PreImageTriangle() {
  const verts = PRE_IMAGE_VERTICES
  const centroid = centroidOf(verts)

  // drei <Line> expects Vector3[] or [x,y,z][] — add z=0
  const linePoints = verts.map(([x, y]) => new THREE.Vector3(x, y, 0.02))

  const shape = useMemo(() => makeTriangleShape(verts), [])

  return (
    <group>
      {/* Fill */}
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="var(--lab-text)" transparent opacity={0.07} />
      </mesh>

      {/* Outline */}
      <Line
        points={linePoints}
        closed
        color="var(--lab-text)"
        lineWidth={1.5}
      />

      {/* Vertex labels */}
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <Text
            key={VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            fontSize={0.55}
            color="var(--lab-text)"
            anchorX="center"
            anchorY="middle"
          >
            {VERTEX_LABELS[idx]}
          </Text>
        )
      })}
    </group>
  )
}
```

**Step 2: Add `<PreImageTriangle />` inside `Visualization`**

```tsx
function Visualization({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  return (
    <>
      <CameraSetup />
      <CoordinateGrid />
      <PreImageTriangle />
      {/* Ghost + drag added next */}
    </>
  )
}
```

**Step 3: Verify in dev server**

The pre-image triangle (A, B, C) should appear at (1,1), (4,2), (2,4) — white stroke, very faint fill, labels offset outward.

**Step 4: Commit**

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
git commit -m "feat: add PreImageTriangle to rigid-motions R3F scene"
```

---

## Task 6: Build `GhostTriangle` component

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`

**Step 1: Add `GhostTriangle` component**

Add below `PreImageTriangle`:

```tsx
interface GhostTriangleProps {
  ghostOffset: [number, number]
}

function GhostTriangle({ ghostOffset }: GhostTriangleProps) {
  const verts = useMemo<[number, number][]>(
    () => PRE_IMAGE_VERTICES.map(([x, y]) => [x + ghostOffset[0], y + ghostOffset[1]]),
    [ghostOffset]
  )
  const centroid = centroidOf(verts)

  const linePoints = verts.map(([x, y]) => new THREE.Vector3(x, y, 0.02))

  const shape = useMemo(() => makeTriangleShape(verts), [verts])

  return (
    <group opacity={0.7}>
      {/* Fill */}
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="var(--lab-accent)" transparent opacity={0.12} />
      </mesh>

      {/* Dashed outline */}
      <Line
        points={linePoints}
        closed
        color="var(--lab-accent)"
        lineWidth={1.5}
        dashed
        dashSize={0.3}
        gapSize={0.18}
      />

      {/* Vertex labels */}
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <Text
            key={GHOST_VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            fontSize={0.55}
            color="var(--lab-accent)"
            anchorX="center"
            anchorY="middle"
          >
            {GHOST_VERTEX_LABELS[idx]}
          </Text>
        )
      })}
    </group>
  )
}
```

**Step 2: Add `<GhostTriangle />` to `Visualization`**

```tsx
function Visualization({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  return (
    <>
      <CameraSetup />
      <CoordinateGrid />
      <PreImageTriangle />
      <GhostTriangle ghostOffset={ghostOffset} />
      {/* Drag plane added next */}
    </>
  )
}
```

**Step 3: Verify in dev server**

Ghost triangle should appear at the initial offset (5, 0) — green dashed stroke, faint fill, prime labels A′, B′, C′. It should not be draggable yet.

**Step 4: Commit**

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
git commit -m "feat: add GhostTriangle to rigid-motions R3F scene"
```

---

## Task 7: Add drag plane + wire up interaction

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`

**Step 1: Add drag state refs and `DragPlane` component**

Add imports at the top of the file:
```tsx
import { useRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
```

Add the `DragPlane` component and wire into `Visualization`:

```tsx
interface DragPlaneProps {
  ghostOffset: [number, number]
  onGhostMove: (rawOffset: [number, number]) => void
  onDragChange: (dragging: boolean) => void
}

function DragPlane({ ghostOffset, onGhostMove, onDragChange }: DragPlaneProps) {
  const dragging = useRef(false)
  const dragStartWorld = useRef<[number, number]>([0, 0])
  const offsetAtDragStart = useRef<[number, number]>([0, 0])

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    dragging.current = true
    dragStartWorld.current = [e.point.x, e.point.y]
    offsetAtDragStart.current = ghostOffset
    onDragChange(true)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return
    const dx = e.point.x - dragStartWorld.current[0]
    const dy = e.point.y - dragStartWorld.current[1]
    const rawOffset: [number, number] = [
      offsetAtDragStart.current[0] + dx,
      offsetAtDragStart.current[1] + dy,
    ]
    onGhostMove(clampOffset(rawOffset))
  }

  const handlePointerUp = () => {
    dragging.current = false
    onDragChange(false)
  }

  return (
    <mesh
      position={[0, 0, -0.5]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <planeGeometry args={[GRID_RANGE * 2, GRID_RANGE * 2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
```

Import `clampOffset` at the top:
```tsx
import { ghostVertices, clampOffset, vertexLabelOffset } from './scene-math'
```

**Step 2: Wire drag state into `Visualization` and pass cursor to outer wrapper**

```tsx
function Visualization({ ghostOffset, onGhostMove, onDragChange }: RigidMotionsSceneProps & { onDragChange: (d: boolean) => void }) {
  return (
    <>
      <CameraSetup />
      <CoordinateGrid />
      <PreImageTriangle />
      <GhostTriangle ghostOffset={ghostOffset} />
      <DragPlane ghostOffset={ghostOffset} onGhostMove={onGhostMove} onDragChange={onDragChange} />
    </>
  )
}

export function RigidMotionsScene({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10] }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%', background: 'var(--lab-bg)' }}
      >
        <Visualization
          ghostOffset={ghostOffset}
          onGhostMove={onGhostMove}
          onDragChange={setIsDragging}
        />
      </Canvas>
    </div>
  )
}
```

**Step 3: Verify drag works**

In dev server:
- Ghost triangle should drag smoothly
- Should snap to integer grid on release
- Centroid should not leave the ±6 grid range
- Cursor should switch to `grabbing` while dragging

**Step 4: Commit**

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
git commit -m "feat: add drag plane to rigid-motions R3F scene"
```

---

## Task 8: Final polish + verification

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx` (font, color token resolution)

**Step 1: Resolve CSS variable colors**

Three.js materials don't resolve CSS variables (`var(--lab-text)`) directly. Replace them with the actual hex values from `src/lib/colors.ts`. Check what's in that file:

```bash
cat src/lib/colors.ts
```

Look for `text`, `accent`, `background.primary` etc. Then replace the CSS var strings in the scene file with the actual hex values. Example:
- `color="var(--lab-text)"` → `color="#b8b0a4"` (or whatever the token value is)
- `color="var(--lab-accent)"` → `color="#7cc87c"`
- `color="var(--lab-text-muted)"` → `color="#7a746a"`
- `style={{ background: 'var(--lab-bg)' }}` → this one on the Canvas style CAN stay as CSS var (it's an HTML style, not a Three material)

**Step 2: Handle font path for `<Text>`**

Run:
```bash
ls public/fonts/ 2>/dev/null || echo "no fonts folder"
```

- If JetBrains Mono woff2 exists: add `font="/fonts/JetBrainsMono-Regular.woff2"` to every `<Text>` component.
- If no fonts folder: remove all `font` props — drei will use its default font. Labels will render in a different typeface but the visual output will be close enough for parity.

**Step 3: Run all unit tests**

```bash
npx vitest run --project unit
```

Expected: all tests pass.

**Step 4: Full visual smoke test in browser**

```bash
npm run dev
```

Verify all definition-of-done criteria:
- [ ] Grid lines render: minor (low opacity) and axis (higher opacity)
- [ ] Axis number labels from -6 to +6 (skip 0) on both axes
- [ ] Origin dot visible
- [ ] Pre-image triangle at A(1,1), B(4,2), C(2,4) — white stroke, faint fill, labels outside
- [ ] Ghost triangle starts at offset (5,0) — green dashed, labels A′, B′, C′
- [ ] Ghost drags smoothly and snaps on release
- [ ] Ghost centroid cannot leave the ±6 range
- [ ] No SVG elements in the DOM (inspect → no `<svg>` under the rigid-motions module)
- [ ] No console errors

**Step 5: TypeScript final check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 6: Final commit**

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
git commit -m "feat: complete rigid-motions SVG→R3F migration, feature parity with Phase 1"
```

---

## Quick Reference: Test command

```bash
npx vitest run --project unit
```

## Quick Reference: Dev server

```bash
npm run dev
# Navigate to Rigid Motions module
```
