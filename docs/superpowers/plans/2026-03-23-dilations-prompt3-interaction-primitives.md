## Status: Complete
> Implemented 2026-03-23. Merged as part of PR #47 (dilations prompts 1–4).

# Dilations Prompt 3: Shared Interaction Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the six shared primitives (SpriteLabel, GhostTriangle, usePredictReveal, RevealAnimation, PreImageTriangle, ImageTriangle) that all round-specific components in Prompts 4–8 will compose together.

**Architecture:** Each primitive is independently authored and parameterized. `usePredictReveal` manages the predict→reveal local state machine without coupling to the stage machine (callers compose with `dispatch`). R3F components use `THREE.BufferGeometry` imperatively like M1 — no drei `<Text>` or `<Html>` (WebGL context limit). `SpriteLabel` copies M1's CanvasTexture approach and adapts to `Vec2` position. `GhostTriangle` uses the same drag-plane pointer-event pattern as M1's `DragPlane`.

**Tech Stack:** React 19, TypeScript strict, React Three Fiber, Three.js, GSAP, Vitest (jsdom for hook tests only)

---

## Key Architectural Decisions

**SpriteLabel — copy M1, don't import across modules.**
M1's `SpriteLabel` in `scene-primitives.tsx` uses `[number, number, number]` for position; M2's spec uses `Vec2 = {x, y}`. Rather than cross-module import with an adapter, copy the CanvasTexture implementation into a new M2 `SpriteLabel` and update the interface. This keeps modules independent and avoids a brittle cross-dependency. M1's critical note: do NOT use drei `<Text>` (troika creates its own offscreen WebGL context — exhausts Chromium's ~8 context limit with multiple instances).

**GhostTriangle — center follows pointer, not offset-from-pre-image.**
M1's ghost tracks an *offset from the pre-image centroid*. M2's ghost tracks the *absolute centroid position* — the student places the predicted image by dragging its center. The ghost shape is `dilateTriangle(vertices, scale)` (correct size), translated so its centroid lands on the pointer. `onDrop(position: Vec2)` fires with the centroid on pointer-up.

**usePredictReveal — no dispatch dependency.**
The hook manages local state (`ghostPosition`, `isPredicted`, `isRevealed`, `accuracy`). It does NOT call `dispatch` internally. The caller (round component) is responsible for composing the hook actions with stage machine dispatches. This keeps the hook testable with Vitest without mocking the stage machine.

**usePredictReveal accuracy — intentional deviation from spec.**
The spec says "Accuracy check: compares ghost-placed triangle to target triangle using `trianglesMatch`." This plan intentionally uses centroid-distance instead (exact ≤ tolerance×0.5, close ≤ tolerance, miss otherwise). Rationale: the student places the *center* of the ghost, not each vertex — centroid-distance is a better signal for this UX. Do not "fix" this back to `trianglesMatch`.

**PreImageTriangle vs DilationsCanvas baseline.**
`DilationsCanvas` currently renders a minimal inline pre-image triangle (added in Prompt 2). The Prompt 3 `PreImageTriangle` component is the richer version with vertex labels, coordinate labels, and angle labels. Prompt 4+ round components will render `PreImageTriangle` (the rich one) as a child of `DilationsCanvas`. The inline baseline in `DilationsCanvas` will remain for now — Prompt 4 will remove it when the full round orchestration is in place.

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/components/modules/dilations/components/SpriteLabel.tsx` | **Create** | CanvasTexture text label — Vec2 position, in-R3F-scene |
| `src/components/modules/dilations/hooks/usePredictReveal.ts` | **Create** | Predict→reveal local state machine, accuracy check |
| `src/components/modules/dilations/components/GhostTriangle.tsx` | **Create** | Draggable semi-transparent triangle, pointer-driven, snap to 0.5 |
| `src/components/modules/dilations/components/PreImageTriangle.tsx` | **Create** | Static pre-image with vertex/coord/angle labels |
| `src/components/modules/dilations/components/ImageTriangle.tsx` | **Create** | Revealed image triangle (static, visibility-gated) |
| `src/components/modules/dilations/components/RevealAnimation.tsx` | **Create** | GSAP: image fade-in + optional origin rays |
| `src/components/modules/dilations/__tests__/usePredictReveal.test.ts` | **Create** | Hook unit tests |

**Existing files consumed (read-only unless noted):**
- `src/components/modules/dilations/utils/types.ts` — `Vec2`, `Triangle`
- `src/components/modules/dilations/utils/math.ts` — `dilateTriangle`, `trianglesMatch`, `centroidOf`... wait — `centroidOf` is in M1. For M2, compute centroid inline: `{ x: (a.x+b.x+c.x)/3, y: (a.y+b.y+c.y)/3 }`.
- `src/components/modules/dilations/utils/constants.ts` — `CANONICAL_TRIANGLE`
- `src/components/modules/rigid-motions/scene/scene-primitives.tsx` — reference for SpriteLabel CanvasTexture implementation (read, do not import from)
- `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx` — reference for DragPlane pattern (lines 252–315, read, do not import from)

---

## Task 1: SpriteLabel

**Files:**
- Create: `src/components/modules/dilations/components/SpriteLabel.tsx`

No unit tests (requires WebGL). Verify TypeScript only.

`SpriteLabel` renders text as a CanvasTexture on a PlaneGeometry mesh inside the R3F scene. This is the same approach as M1's SpriteLabel — see `src/components/modules/rigid-motions/scene/scene-primitives.tsx` for the exact implementation to copy and adapt.

**Changes from M1's SpriteLabel:**
- `position: Vec2` instead of `[number, number, number]` — add a `zLayer?: number` prop (default `0.1`)
- Remove `anchorX`/`anchorY` options for simplicity (always center/middle) — these can be re-added later if needed
- Keep `planeWidth` prop (default `1.0`, slightly smaller than M1's 1.5 since dilation grid has more space)

```typescript
// src/components/modules/dilations/components/SpriteLabel.tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vec2 } from '../utils/types'

export interface SpriteLabelProps {
  text: string
  position: Vec2
  zLayer?: number
  color?: string
  visible?: boolean
  planeWidth?: number
}

export function SpriteLabel({
  text,
  position,
  zLayer = 0.1,
  color = '#b8b0a4',
  visible = true,
  planeWidth = 1.0,
}: SpriteLabelProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const scale = 4
    const pxFontSize = 32 * scale
    const font = `${pxFontSize}px ui-monospace, "Cascadia Code", "Fira Mono", monospace`
    const ctx = canvas.getContext('2d')!
    ctx.font = font
    const textWidth = ctx.measureText(text).width
    canvas.width = textWidth + 16 * scale
    canvas.height = pxFontSize + 12 * scale
    ctx.font = font
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [text, color])

  const aspect = texture.image
    ? (texture.image as HTMLCanvasElement).width / (texture.image as HTMLCanvasElement).height
    : 1
  const planeHeight = planeWidth / aspect

  if (!visible) return null

  return (
    <mesh position={[position.x, position.y, zLayer]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.01} depthWrite={false} />
    </mesh>
  )
}
```

- [x] **Step 1: Create `SpriteLabel.tsx`** (code above)

- [x] **Step 2: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -20
```

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/SpriteLabel.tsx
git commit -m "feat(dilations): add SpriteLabel — CanvasTexture text label for R3F scene"
```

**Label collision constraint (deferred).** The spec notes "SpriteLabel must handle overlapping positions gracefully." Label collision detection is not implemented in Prompt 3 — labels use fixed offsets from vertices (the `labelOffset` push). Visual QA is required on rounds with small image triangles (especially k=0.5 and k=⅓), where pre-image and image vertex labels can overlap. If labels collide during QA, increase the `distance` parameter passed to `labelOffset` for image labels. Full collision avoidance is deferred to a later prompt.

---

## Task 2: usePredictReveal Hook (TDD)

**Files:**
- Create: `src/components/modules/dilations/hooks/usePredictReveal.ts`
- Test: `src/components/modules/dilations/__tests__/usePredictReveal.test.ts`

This hook owns the local predict→reveal state. It does NOT dispatch to the stage machine — the caller composes that.

### Hook interface

```typescript
export type Accuracy = 'exact' | 'close' | 'miss'

export interface PredictRevealState {
  ghostPosition: Vec2 | null
  isPredicted: boolean
  isRevealed: boolean
  accuracy: Accuracy | null  // null until prediction committed
}

export interface PredictRevealActions {
  placeGhost: (pos: Vec2) => void
  commitPrediction: () => void
  triggerReveal: () => void
  reset: () => void
}

export function usePredictReveal(
  targetTriangle: Triangle,
  tolerance: number,
): PredictRevealState & PredictRevealActions
```

### Accuracy thresholds

When `commitPrediction` is called, compare the ghost-placed triangle (centroid = `ghostPosition`, shape = `dilateTriangle` from the target's scale factor) against `targetTriangle` using `trianglesMatch`:

- `'exact'`: ghost centroid within `tolerance * 0.5` of target centroid
- `'close'`: ghost centroid within `tolerance` of target centroid
- `'miss'`: beyond tolerance

**Implementation note:** The hook only has `targetTriangle` and `tolerance` — it doesn't know the scale factor. The `ghostPosition` is the placed centroid. To check accuracy, compare centroid distance:
- Compute target centroid: `{ x: (a.x+b.x+c.x)/3, y: (a.y+b.y+c.y)/3 }`
- Compute distance from `ghostPosition` to target centroid
- Exact: `dist <= tolerance * 0.5`, Close: `dist <= tolerance`, Miss: otherwise

This is simpler than full triangle matching and more appropriate for the predict UX (student places the center, not each vertex).

### Reducer for testability

Export `predictRevealReducer` (like `stageReducer`) so tests can call it directly.

```typescript
type PRState = PredictRevealState
type PRAction =
  | { type: 'PLACE_GHOST'; pos: Vec2 }
  | { type: 'COMMIT'; targetCentroid: Vec2; tolerance: number }
  | { type: 'REVEAL' }
  | { type: 'RESET' }

const initialPRState: PRState = {
  ghostPosition: null,
  isPredicted: false,
  isRevealed: false,
  accuracy: null,
}

export function predictRevealReducer(state: PRState, action: PRAction): PRState { ... }
```

The hook uses `useReducer` with `predictRevealReducer` internally, computing `targetCentroid` from `targetTriangle` in `commitPrediction`.

- [x] **Step 1: Write failing tests**

```typescript
// src/components/modules/dilations/__tests__/usePredictReveal.test.ts
import { describe, it, expect } from 'vitest'
import { predictRevealReducer } from '../hooks/usePredictReveal'
import type { PRState, PRAction } from '../hooks/usePredictReveal'

const INITIAL: PRState = {
  ghostPosition: null,
  isPredicted: false,
  isRevealed: false,
  accuracy: null,
}

function dispatch(state: PRState, action: PRAction): PRState {
  return predictRevealReducer(state, action)
}

// Target centroid at (2, 2) — for test triangles
const TARGET_CENTROID = { x: 2, y: 2 }
const TOLERANCE = 1.0

describe('predictRevealReducer', () => {
  describe('PLACE_GHOST', () => {
    it('sets ghostPosition', () => {
      const s = dispatch(INITIAL, { type: 'PLACE_GHOST', pos: { x: 3, y: 4 } })
      expect(s.ghostPosition).toEqual({ x: 3, y: 4 })
    })

    it('does not change isPredicted or accuracy', () => {
      const s = dispatch(INITIAL, { type: 'PLACE_GHOST', pos: { x: 3, y: 4 } })
      expect(s.isPredicted).toBe(false)
      expect(s.accuracy).toBeNull()
    })
  })

  describe('COMMIT', () => {
    it('sets isPredicted to true', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 2, y: 2 } }
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.isPredicted).toBe(true)
    })

    it('accuracy is exact when ghost centroid is within tolerance*0.5', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 2.3, y: 2.0 } }  // dist ≈ 0.3 < 0.5
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('exact')
    })

    it('accuracy is close when ghost centroid is within tolerance but not tolerance*0.5', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 2.7, y: 2.0 } }  // dist ≈ 0.7, in (0.5, 1.0]
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('close')
    })

    it('accuracy is miss when ghost centroid is beyond tolerance', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 5, y: 2 } }  // dist = 3 > 1.0
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('miss')
    })

    it('accuracy is miss when ghostPosition is null', () => {
      const s = dispatch(INITIAL, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('miss')
      expect(s.isPredicted).toBe(true)
    })
  })

  describe('REVEAL', () => {
    it('sets isRevealed to true', () => {
      const predicted = { ...INITIAL, isPredicted: true }
      const s = dispatch(predicted, { type: 'REVEAL' })
      expect(s.isRevealed).toBe(true)
    })

    it('is a no-op when not yet predicted', () => {
      const s = dispatch(INITIAL, { type: 'REVEAL' })
      expect(s.isRevealed).toBe(false)
    })
  })

  describe('RESET', () => {
    it('clears all state back to initial', () => {
      const full: PRState = {
        ghostPosition: { x: 3, y: 4 },
        isPredicted: true,
        isRevealed: true,
        accuracy: 'close',
      }
      const s = dispatch(full, { type: 'RESET' })
      expect(s).toEqual(INITIAL)
    })
  })
})
```

- [x] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/usePredictReveal.test.ts
```

Expected: FAIL — `predictRevealReducer` not found.

- [x] **Step 3: Implement `usePredictReveal.ts`**

```typescript
// src/components/modules/dilations/hooks/usePredictReveal.ts
import { useReducer, useCallback, useMemo } from 'react'
import type { Vec2, Triangle } from '../utils/types'

export type Accuracy = 'exact' | 'close' | 'miss'

export interface PRState {
  ghostPosition: Vec2 | null
  isPredicted: boolean
  isRevealed: boolean
  accuracy: Accuracy | null
}

export type PRAction =
  | { type: 'PLACE_GHOST'; pos: Vec2 }
  | { type: 'COMMIT'; targetCentroid: Vec2; tolerance: number }
  | { type: 'REVEAL' }
  | { type: 'RESET' }

const INITIAL_PR_STATE: PRState = {
  ghostPosition: null,
  isPredicted: false,
  isRevealed: false,
  accuracy: null,
}

function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function predictRevealReducer(state: PRState, action: PRAction): PRState {
  switch (action.type) {
    case 'PLACE_GHOST':
      return { ...state, ghostPosition: action.pos }

    case 'COMMIT': {
      const d = state.ghostPosition ? dist(state.ghostPosition, action.targetCentroid) : Infinity
      const accuracy: Accuracy =
        d <= action.tolerance * 0.5 ? 'exact' :
        d <= action.tolerance       ? 'close' :
                                      'miss'
      return { ...state, isPredicted: true, accuracy }
    }

    case 'REVEAL':
      if (!state.isPredicted) return state
      return { ...state, isRevealed: true }

    case 'RESET':
      return { ...INITIAL_PR_STATE }

    default: {
      const _exhaustive: never = action
      return state
      // eslint-disable-next-line no-unreachable
      void _exhaustive
    }
  }
}

function triangleCentroid(t: Triangle): Vec2 {
  return {
    x: (t.a.x + t.b.x + t.c.x) / 3,
    y: (t.a.y + t.b.y + t.c.y) / 3,
  }
}

export function usePredictReveal(targetTriangle: Triangle, tolerance: number) {
  const [state, dispatch] = useReducer(predictRevealReducer, INITIAL_PR_STATE)
  const targetCentroid = useMemo(() => triangleCentroid(targetTriangle), [targetTriangle])

  const placeGhost = useCallback((pos: Vec2) => {
    dispatch({ type: 'PLACE_GHOST', pos })
  }, [])

  const commitPrediction = useCallback(() => {
    dispatch({ type: 'COMMIT', targetCentroid, tolerance })
  }, [targetCentroid, tolerance])

  const triggerReveal = useCallback(() => {
    dispatch({ type: 'REVEAL' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return { ...state, placeGhost, commitPrediction, triggerReveal, reset }
}
```

**Note on exhaustive switch:** The `default` branch uses `const _exhaustive: never = action` to assert exhaustiveness. The `void _exhaustive` line is unreachable but needed to avoid `noUnusedLocals` warning on `_exhaustive`. If TypeScript complains, use `return state` as the only line in `default` (the never-assignment will still catch new action types at compile time if added without a case).

Actually, simplify: use just `default: return state` since all PR action types are covered. The `never` trick for exhaustiveness is only needed when the return type might widen. Since all cases have explicit returns and `default: return state` is unreachable, this is fine.

- [x] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/usePredictReveal.test.ts
```

Expected: All tests pass.

- [x] **Step 5: Commit**

```bash
git add src/components/modules/dilations/hooks/usePredictReveal.ts \
        src/components/modules/dilations/__tests__/usePredictReveal.test.ts
git commit -m "feat(dilations): add usePredictReveal — predict→reveal local state with accuracy check"
```

---

## Task 3: GhostTriangle

**Files:**
- Create: `src/components/modules/dilations/components/GhostTriangle.tsx`

No unit tests (R3F/WebGL). TypeScript check only.

### Drag approach (adapted from M1's DragPlane — read lines 252–315 of RigidMotionsScene.tsx)

Uses an invisible full-viewport plane mesh that captures pointer events. On pointer down, starts tracking; on pointer move, converts client coords to world coords via raycasting and updates ghost center; on pointer up, snaps to 0.5 grid and fires `onDrop`.

**Snap:** `Math.round(value * 2) / 2` for 0.5-unit increments.

**Ghost shape:** `dilateTriangle(vertices, scale)` gives the correctly-sized shape. Translate it so its centroid = current pointer world position.

### Props

```typescript
export interface GhostTriangleProps {
  vertices: Triangle          // pre-image vertices (CANONICAL_TRIANGLE)
  scale: number               // dilation scale factor k
  onDrop: (position: Vec2) => void
  disabled: boolean
}
```

### Visual

- Fill: `#7a746a` (lab ghost color) transparent opacity 0.25
- Outline: `lineDashedMaterial` color `#7a746a`, `dashSize: 0.25, gapSize: 0.15`
- Uses `useFrame` to call `computeLineDistances()` on the lineLoop ref each frame (required for dashed lines to work in Three.js — same pattern as M1's PreviewGhost)

### Implementation

```typescript
// src/components/modules/dilations/components/GhostTriangle.tsx
import { useRef, useState, useMemo, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Triangle, Vec2 } from '../utils/types'
import { dilateTriangle } from '../utils/math'

const GHOST_COLOR = '#7a746a'

function snap(v: number): number {
  return Math.round(v * 2) / 2
}

function triangleCentroid(t: Triangle): Vec2 {
  return {
    x: (t.a.x + t.b.x + t.c.x) / 3,
    y: (t.a.y + t.b.y + t.c.y) / 3,
  }
}

function translateTriangle(t: Triangle, dx: number, dy: number): Triangle {
  return {
    a: { x: t.a.x + dx, y: t.a.y + dy },
    b: { x: t.b.x + dx, y: t.b.y + dy },
    c: { x: t.c.x + dx, y: t.c.y + dy },
  }
}

function buildTriangleGeometries(t: Triangle) {
  const { a, b, c } = t
  const shape = new THREE.Shape()
  shape.moveTo(a.x, a.y)
  shape.lineTo(b.x, b.y)
  shape.lineTo(c.x, c.y)
  shape.closePath()

  const outlinePts = [
    new THREE.Vector3(a.x, a.y, 0),
    new THREE.Vector3(b.x, b.y, 0),
    new THREE.Vector3(c.x, c.y, 0),
    new THREE.Vector3(a.x, a.y, 0),
  ]

  return {
    fillGeo: new THREE.ShapeGeometry(shape),
    outlineGeo: new THREE.BufferGeometry().setFromPoints(outlinePts),
  }
}

export interface GhostTriangleProps {
  vertices: Triangle
  scale: number
  onDrop: (position: Vec2) => void
  disabled: boolean
}

export function GhostTriangle({ vertices, scale, onDrop, disabled }: GhostTriangleProps) {
  const { camera, gl } = useThree()
  const lineLoopRef = useRef<THREE.LineLoop>(null)
  const dragging = useRef(false)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])

  // scaledShape is the dilated triangle centered at origin
  const scaledShape = useMemo(() => {
    const dilated = dilateTriangle(vertices, scale)
    const c = triangleCentroid(dilated)
    return translateTriangle(dilated, -c.x, -c.y)
  }, [vertices, scale])

  const [centerPos, setCenterPos] = useState<Vec2 | null>(null)

  const getWorldPoint = useCallback((clientX: number, clientY: number): Vec2 => {
    const rect = gl.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, target)
    return { x: target.x, y: target.y }
  }, [camera, gl, raycaster, plane])

  const handlePointerDown = useCallback((e: THREE.Event & { nativeEvent: PointerEvent }) => {
    if (disabled) return
    e.stopPropagation?.()
    dragging.current = true

    const handleMove = (ev: PointerEvent) => {
      if (!dragging.current) return
      const p = getWorldPoint(ev.clientX, ev.clientY)
      setCenterPos({ x: snap(p.x), y: snap(p.y) })
    }

    const handleUp = (ev: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      const p = getWorldPoint(ev.clientX, ev.clientY)
      const snapped = { x: snap(p.x), y: snap(p.y) }
      setCenterPos(snapped)
      onDrop(snapped)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [disabled, getWorldPoint, onDrop])

  useFrame(() => {
    lineLoopRef.current?.computeLineDistances()
  })

  // If no position yet, render at centroid of dilated shape (pre-placed guide)
  const displayCenter = centerPos ?? triangleCentroid(dilateTriangle(vertices, scale))

  const positioned = useMemo(() =>
    translateTriangle(scaledShape, displayCenter.x, displayCenter.y),
    [scaledShape, displayCenter]
  )

  const { fillGeo, outlineGeo } = useMemo(
    () => buildTriangleGeometries(positioned),
    [positioned]
  )

  return (
    <group>
      {/* Invisible drag capture plane — only rendered when NOT disabled.
          IMPORTANT: omit entirely when disabled so it doesn't block pointer events
          from sibling R3F components (e.g., during reveal/completion states). */}
      {!disabled && (
        <mesh
          position={[0, 0, -0.1]}
          onPointerDown={handlePointerDown as unknown as (e: THREE.Event) => void}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Ghost fill */}
      <mesh geometry={fillGeo} position={[0, 0, 0.05]}>
        <meshBasicMaterial color={GHOST_COLOR} transparent opacity={disabled ? 0.1 : 0.25} />
      </mesh>

      {/* Ghost outline */}
      <lineLoop ref={lineLoopRef} geometry={outlineGeo} position={[0, 0, 0.06]}>
        <lineDashedMaterial
          color={GHOST_COLOR}
          dashSize={0.25}
          gapSize={0.15}
          transparent
          opacity={disabled ? 0.3 : 0.8}
        />
      </lineLoop>
    </group>
  )
}
```

**Implementer note:** The `onPointerDown` type cast is needed because R3F pointer events use `ThreeEvent<PointerEvent>` which differs from the Three.js `THREE.Event` type. Import `type ThreeEvent` from `@react-three/fiber` and use it instead for cleaner typing.

- [x] **Step 1: Implement `GhostTriangle.tsx`** (code above, clean up types as needed)

- [x] **Step 2: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

Expected: no errors. If there are ThreeEvent type issues, import `type ThreeEvent` from `@react-three/fiber` and use `(e: ThreeEvent<PointerEvent>) => void` for `onPointerDown`.

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/GhostTriangle.tsx
git commit -m "feat(dilations): add GhostTriangle — draggable R3F triangle with 0.5-unit snap and onDrop"
```

---

## Task 4: PreImageTriangle + ImageTriangle

**Files:**
- Create: `src/components/modules/dilations/components/PreImageTriangle.tsx`
- Create: `src/components/modules/dilations/components/ImageTriangle.tsx`

No unit tests (R3F). TypeScript check only.

### PreImageTriangle

Static rendering of the canonical triangle with vertex labels, optional coordinate labels, and optional angle labels (all via `SpriteLabel`).

**Vertex label offset:** Offset label away from centroid. Simple formula: `label = vertex + normalize(vertex - centroid) * 0.5`.

```typescript
// src/components/modules/dilations/components/PreImageTriangle.tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import type { Triangle, Vec2 } from '../utils/types'
import { SpriteLabel } from './SpriteLabel'

const PRE_COLOR = '#b8b0a4'
const VERTEX_LABELS = ['A', 'B', 'C'] as const

function centroid(t: Triangle): Vec2 {
  return { x: (t.a.x + t.b.x + t.c.x) / 3, y: (t.a.y + t.b.y + t.c.y) / 3 }
}

function labelOffset(vertex: Vec2, c: Vec2, distance = 0.5): Vec2 {
  const dx = vertex.x - c.x
  const dy = vertex.y - c.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { x: vertex.x + (dx / len) * distance, y: vertex.y + (dy / len) * distance }
}

export interface PreImageTriangleProps {
  vertices: Triangle
  showCoordinates?: boolean
  showAngles?: boolean
  coordinateLabels?: [string, string, string]  // override auto "(x, y)" format
  angleLabels?: [number, number, number]       // degrees at A, B, C
}

export function PreImageTriangle({
  vertices,
  showCoordinates = false,
  showAngles = false,
  coordinateLabels,
  angleLabels,
}: PreImageTriangleProps) {
  const { a, b, c } = vertices
  const verts = [a, b, c] as const

  const { fillGeo, outlineGeo } = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(a.x, a.y)
    shape.lineTo(b.x, b.y)
    shape.lineTo(c.x, c.y)
    shape.closePath()
    // 3 points only — <lineLoop> closes back to first point automatically
    const outlinePts = [
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(c.x, c.y, 0),
    ]
    return {
      fillGeo: new THREE.ShapeGeometry(shape),
      outlineGeo: new THREE.BufferGeometry().setFromPoints(outlinePts),
    }
  }, [a, b, c])

  const c2 = useMemo(() => centroid(vertices), [vertices])

  return (
    <group>
      <mesh geometry={fillGeo} position={[0, 0, 0.02]}>
        <meshBasicMaterial color={PRE_COLOR} transparent opacity={0.2} />
      </mesh>
      {/* Use lineLoop (not <primitive object={new THREE.Line()}>) to avoid creating a new GPU object on every render */}
      <lineLoop geometry={outlineGeo} position={[0, 0, 0.03]}>
        <lineBasicMaterial color={PRE_COLOR} transparent opacity={0.7} />
      </lineLoop>
      {verts.map((v, i) => {
        const off = labelOffset(v, c2)
        return (
          <SpriteLabel
            key={VERTEX_LABELS[i]}
            text={VERTEX_LABELS[i]}
            position={off}
            zLayer={0.08}
            color={PRE_COLOR}
          />
        )
      })}
      {showCoordinates && verts.map((v, i) => {
        const label = coordinateLabels?.[i] ?? `(${v.x}, ${v.y})`
        const off = labelOffset(v, c2, 1.1)
        return (
          <SpriteLabel
            key={`coord-${i}`}
            text={label}
            position={off}
            zLayer={0.08}
            color={PRE_COLOR}
            planeWidth={1.5}
          />
        )
      })}
      {showAngles && angleLabels && verts.map((v, i) => {
        const off = labelOffset(v, c2, 0.85)
        return (
          <SpriteLabel
            key={`angle-${i}`}
            text={`${angleLabels[i]}°`}
            position={off}
            zLayer={0.08}
            color="#f5a623"
          />
        )
      })}
    </group>
  )
}
```

### ImageTriangle

Revealed image triangle. Same structure as PreImageTriangle but with image-specific colors. Uses `visible` prop to gate rendering (returns `null` when `visible` is false).

Image color: `#7cc87c` (lab accent / phosphor green) — matches M1's image color.

```typescript
// src/components/modules/dilations/components/ImageTriangle.tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import type { Triangle, Vec2 } from '../utils/types'
import { SpriteLabel } from './SpriteLabel'

const IMAGE_COLOR = '#7cc87c'
const PRIME_LABELS = ["A'", "B'", "C'"] as const

function centroid(t: Triangle): Vec2 {
  return { x: (t.a.x + t.b.x + t.c.x) / 3, y: (t.a.y + t.b.y + t.c.y) / 3 }
}

function labelOffset(vertex: Vec2, c: Vec2, distance = 0.5): Vec2 {
  const dx = vertex.x - c.x
  const dy = vertex.y - c.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { x: vertex.x + (dx / len) * distance, y: vertex.y + (dy / len) * distance }
}

export interface ImageTriangleProps {
  vertices: Triangle
  visible: boolean
  opacity?: number
  showCoordinates?: boolean
  showAngles?: boolean
  coordinateLabels?: [string, string, string]
  angleLabels?: [number, number, number]
}

export function ImageTriangle({
  vertices,
  visible,
  opacity = 0.18,
  showCoordinates = false,
  showAngles = false,
  coordinateLabels,
  angleLabels,
}: ImageTriangleProps) {
  // HOOKS FIRST — all useMemo calls must appear before any early return (Rules of Hooks)
  const { a, b, c } = vertices
  const verts = [a, b, c] as const

  const { fillGeo, outlineGeo } = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(a.x, a.y)
    shape.lineTo(b.x, b.y)
    shape.lineTo(c.x, c.y)
    shape.closePath()
    // 3 points — <lineLoop> closes back to first automatically
    const outlinePts = [
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(c.x, c.y, 0),
    ]
    return {
      fillGeo: new THREE.ShapeGeometry(shape),
      outlineGeo: new THREE.BufferGeometry().setFromPoints(outlinePts),
    }
  }, [a, b, c])

  const c2 = useMemo(() => centroid(vertices), [vertices])

  // Early return AFTER all hooks
  if (!visible) return null

  return (
    <group>
      <mesh geometry={fillGeo} position={[0, 0, 0.04]}>
        <meshBasicMaterial color={IMAGE_COLOR} transparent opacity={opacity} />
      </mesh>
      {/* Use lineLoop (not <primitive object={new THREE.Line()}>) to avoid creating a new GPU object on every render */}
      <lineLoop geometry={outlineGeo} position={[0, 0, 0.05]}>
        <lineBasicMaterial color={IMAGE_COLOR} transparent opacity={0.7} />
      </lineLoop>
      {verts.map((v, i) => {
        const off = labelOffset(v, c2)
        return (
          <SpriteLabel
            key={PRIME_LABELS[i]}
            text={PRIME_LABELS[i]}
            position={off}
            zLayer={0.09}
            color={IMAGE_COLOR}
          />
        )
      })}
      {showCoordinates && verts.map((v, i) => {
        const label = coordinateLabels?.[i] ?? `(${v.x}, ${v.y})`
        const off = labelOffset(v, c2, 1.1)
        return (
          <SpriteLabel
            key={`img-coord-${i}`}
            text={label}
            position={off}
            zLayer={0.09}
            color={IMAGE_COLOR}
            planeWidth={1.5}
          />
        )
      })}
      {showAngles && angleLabels && verts.map((v, i) => {
        const off = labelOffset(v, c2, 0.85)
        return (
          <SpriteLabel
            key={`img-angle-${i}`}
            text={`${angleLabels[i]}°`}
            position={off}
            zLayer={0.09}
            color="#f5a623"
          />
        )
      })}
    </group>
  )
}
```

**Implementer note — hooks order:** The code above already has the correct structure: all `useMemo` calls run unconditionally, `if (!visible) return null` comes after. Do not move the early return before any hook calls — that violates React's Rules of Hooks and will crash at runtime.

- [x] **Step 1: Implement `PreImageTriangle.tsx`**

- [x] **Step 2: Implement `ImageTriangle.tsx`** (hooks are already in the correct order above; do not add an early return before them)

- [x] **Step 3: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

Expected: no errors. Watch for:
- `coordinateLabels` as tuple `[string, string, string]` must be exactly 3 — check array access patterns
- `<lineLoop>` and `<lineBasicMaterial>` are intrinsic R3F elements — no import needed, they map to Three.js `LineLoop` / `LineBasicMaterial`

- [x] **Step 4: Commit**

```bash
git add src/components/modules/dilations/components/PreImageTriangle.tsx \
        src/components/modules/dilations/components/ImageTriangle.tsx
git commit -m "feat(dilations): add PreImageTriangle and ImageTriangle — R3F triangle renders with label support"
```

---

## Task 5: RevealAnimation

**Files:**
- Create: `src/components/modules/dilations/components/RevealAnimation.tsx`

No unit tests (GSAP + R3F). TypeScript check only.

### What it does

GSAP-powered animation that runs once on mount (same as M1's `ImageShape`). See `src/components/modules/rigid-motions/scene/ImageShape.tsx` for the exact GSAP+useEffect+useFrame pattern to follow.

**Animation sequence (~1.5s total):**
1. Image triangle fades in (opacity 0 → 0.18, 0.3s, power2.out)
2. If `showRays`: three dashed lines grow from `rayOrigin` outward through each image vertex (0→full length, 0.5s, power2.out) — start after step 1 completes
3. `onComplete()` fires when all animations finish

**No "ghost fades out"** — the ghost is managed by `GhostTriangle` (parent hides it by setting `disabled`/opacity).

### Props

```typescript
export interface RevealAnimationProps {
  targetTriangle: Triangle
  onComplete: () => void
  showRays?: boolean
  rayOrigin?: Vec2  // defaults to { x: 0, y: 0 }
}
```

### Ray lines

Three `THREE.Line` objects (one per vertex), each growing from `rayOrigin` to the respective image vertex. Animate by scaling the geometry: use a `tRef` (0→1) and update buffer attributes in `useFrame` (same pattern as M1's `ImageShape.updateTriGeo`).

For each ray `i`, the line goes from `rayOrigin` to `targetTriangle[vertex_i]`. Buffer attribute has 2 points: `[rayOrigin, lerp(rayOrigin, targetVertex, t)]`.

### Implementation — follow M1's `ImageShape.tsx` pattern exactly

**CRITICAL:** Do NOT use `<primitive object={new THREE.X(...)}>` anywhere in this component. It creates a new GPU object on every render. Use M1's proven imperative geometry pattern instead:

1. Create Three.js objects in `useRef` (no JSX)
2. Attach them to the scene in `useEffect` via `scene.add` or by assigning to `mesh.geometry`
3. JSX renders bare `<mesh ref={meshRef}>` / `<lineLoop ref={outlineRef}>` with material as JSX children
4. `useFrame` reads refs and updates buffer attributes imperatively

Read `src/components/modules/rigid-motions/scene/ImageShape.tsx` carefully. Match its structure for:
- `meshRef` / `outlineRef` / `rayLineRefs` typed as `useRef<THREE.Mesh | null>(null)` etc.
- Geometries created with `useRef<THREE.BufferGeometry>(new THREE.BufferGeometry())`
- `useEffect` attaches geometry: `meshRef.current.geometry = fillGeo.current`
- `useFrame` mutates opacity via `(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacityRef.current.v`
- GSAP timeline with `{ onComplete }`, `tl.kill()` in cleanup

```typescript
// src/components/modules/dilations/components/RevealAnimation.tsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import type { Triangle, Vec2 } from '../utils/types'

const RAY_COLOR = '#8a847a'  // lab text-muted
const IMAGE_COLOR = '#7cc87c'

export interface RevealAnimationProps {
  targetTriangle: Triangle
  onComplete: () => void
  showRays?: boolean
  rayOrigin?: Vec2
}

export function RevealAnimation({
  targetTriangle,
  onComplete,
  showRays = false,
  rayOrigin = { x: 0, y: 0 },
}: RevealAnimationProps) {
  const { a, b, c } = targetTriangle
  const vertices = [a, b, c] as const

  // Imperative refs — geometry lives here, not in JSX (M1 ImageShape pattern)
  const meshRef = useRef<THREE.Mesh>(null)
  const outlineRef = useRef<THREE.LineLoop>(null)
  const rayRefs = useRef<(THREE.Line | null)[]>([null, null, null])
  const outlineGeo = useRef(new THREE.BufferGeometry())
  const rayGeos = useRef([
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
  ])
  const opacityRef = useRef({ v: 0 })
  const rayT = useRef({ t: 0 })

  // Build geometries and attach to scene objects on mount
  useEffect(() => {
    // Triangle fill — create ShapeGeometry inline (no ref needed; assigned once and done)
    const shape = new THREE.Shape()
    shape.moveTo(a.x, a.y)
    shape.lineTo(b.x, b.y)
    shape.lineTo(c.x, c.y)
    shape.closePath()
    if (meshRef.current) meshRef.current.geometry = new THREE.ShapeGeometry(shape)

    // Outline (3 pts — lineLoop closes automatically; ref needed for useFrame opacity mutation)
    const outlinePts = [
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(c.x, c.y, 0),
    ]
    outlineGeo.current.setFromPoints(outlinePts)
    if (outlineRef.current) outlineRef.current.geometry = outlineGeo.current

    // Ray geometries — 2 pts each (origin → endpoint, endpoint starts at origin)
    vertices.forEach((v, i) => {
      const pts = [
        new THREE.Vector3(rayOrigin.x, rayOrigin.y, 0),
        new THREE.Vector3(rayOrigin.x, rayOrigin.y, 0),
      ]
      rayGeos.current[i].setFromPoints(pts)
      if (rayRefs.current[i]) rayRefs.current[i]!.geometry = rayGeos.current[i]
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useFrame: write opacity + ray endpoints to GPU each frame
  useFrame(() => {
    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacityRef.current.v
    }
    if (outlineRef.current) {
      ;(outlineRef.current.material as THREE.LineBasicMaterial).opacity = opacityRef.current.v
    }
    if (showRays) {
      const t = rayT.current.t
      vertices.forEach((v, i) => {
        const geo = rayGeos.current[i]
        const attr = geo.attributes.position as THREE.BufferAttribute
        if (!attr) return
        attr.setXYZ(1,
          rayOrigin.x + (v.x - rayOrigin.x) * t,
          rayOrigin.y + (v.y - rayOrigin.y) * t,
          0,
        )
        attr.needsUpdate = true
      })
    }
  })

  // GSAP — runs once on mount
  useEffect(() => {
    opacityRef.current.v = 0
    rayT.current.t = 0

    const tl = gsap.timeline({ onComplete })
    tl.to(opacityRef.current, { v: 0.18, duration: 0.3, ease: 'power2.out' })
    if (showRays) {
      tl.to(rayT.current, { t: 1, duration: 0.5, ease: 'power2.out' })
    }

    return () => { tl.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group>
      {/* Bare refs — geometry/material mutated imperatively by useFrame (M1 ImageShape pattern) */}
      <mesh ref={meshRef} position={[0, 0, 0.04]}>
        <meshBasicMaterial color={IMAGE_COLOR} transparent opacity={0} />
      </mesh>
      <lineLoop ref={outlineRef} position={[0, 0, 0.05]}>
        <lineBasicMaterial color={IMAGE_COLOR} transparent opacity={0} />
      </lineLoop>
      {showRays && vertices.map((_, i) => (
        <line
          key={i}
          ref={el => { rayRefs.current[i] = el }}
          position={[0, 0, 0.03]}
        >
          <lineDashedMaterial color={RAY_COLOR} dashSize={0.15} gapSize={0.1} />
        </line>
      ))}
    </group>
  )
}
```

- [x] **Step 1: Implement `RevealAnimation.tsx`** — follow M1's `ImageShape.tsx` GSAP+imperative pattern closely

- [x] **Step 2: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/RevealAnimation.tsx
git commit -m "feat(dilations): add RevealAnimation — GSAP fade-in with optional origin rays"
```

---

## Task 6: Final Verification

- [x] **Step 1: Run all dilations tests**

```bash
pnpm vitest run src/components/modules/dilations
```

Expected: 32 math tests + 23 stage machine tests + usePredictReveal tests — all pass.

- [x] **Step 2: Run M1 regression check**

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: 179 tests pass.

- [x] **Step 3: Full build**

```bash
pnpm build
```

Expected: Clean. Zero TypeScript errors.

- [x] **Step 4: Commit if any cleanup needed**

```bash
git add <files>
git commit -m "fix(dilations): resolve Prompt 3 build issues"
```
