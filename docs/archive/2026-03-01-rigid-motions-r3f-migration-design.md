# Rigid Motions: SVG → React Three Fiber Migration Design

**Date:** 2026-03-01
**Status:** Approved
**Scope:** Feature parity only. No new features. No Phase 2 logic.

---

## Context

Phase 1 of the Rigid Motions module is complete and working in SVG. This migration rebuilds `RigidMotionsScene.tsx` on the correct R3F technical foundation before Phase 2 begins. The sinewaves module (`src/components/modules/sinewaves/`) is the reference implementation for Canvas setup, R3F patterns, and GSAP wiring conventions.

---

## Files Changed

| File | Change |
|------|--------|
| `constants.ts` | Comment out `CANVAS_SIZE`, `SCALE`, `CENTER`; add `export const WORLD_SCALE = 1` |
| `scene/math.ts` | Remove SVG-constant import at top and re-export at bottom. All functions (`snapToGrid`, `mathToSVG`, etc.) stay untouched. |
| `scene/RigidMotionsScene.tsx` | Full rewrite — SVG → R3F Canvas with orthographic camera |
| `useRigidMotionsState.ts` | No change |
| `InstrumentModule.tsx` | No change |
| `controls/ControlStrip.tsx` | No change |

---

## Section 1: Canvas & Coordinate System

- `<Canvas orthographic>` with `camera={{ position: [0, 0, 10] }}`
- `WORLD_SCALE = 1` — math coordinates are world coordinates, no conversion
- Camera zoom computed inside the scene from `useThree().size`: `zoom = size.width / (GRID_RANGE * 2)`, applied via `useEffect` with `camera.updateProjectionMatrix()`
- Canvas background: `style={{ background: 'var(--lab-bg)' }}`
- Structure mirrors sinewaves: outer `RigidMotionsScene` renders the Canvas; inner `Visualization` component receives all props and lives inside the Canvas

---

## Section 2: Grid

Component: `<CoordinateGrid>` (internal to scene file)

- Pattern: `BufferGeometry` / `lineSegments` — identical to sinewaves `GridLines.tsx`
- Two point arrays built in `useMemo`: `axisPoints` (x=0 or y=0) and `gridPoints` (all others)
- Iterates integers from `-GRID_RANGE` to `+GRID_RANGE`
- **Axis lines:** `lineBasicMaterial` color `#3e3a34`, `opacity={0.4}`
- **Minor grid lines:** color `#28251f`, `opacity={0.2}`
- **Axis number labels:** `<Text>` from drei, integers `-CONTENT_RANGE` to `+CONTENT_RANGE` (skip 0)
  - X-axis labels: positioned below axis at y offset −0.4
  - Y-axis labels: positioned left of axis at x offset −0.4
  - Font: JetBrains Mono, size 0.5 world units, color `var(--lab-text-muted)`
- **Origin dot:** small `<mesh>` at (0,0,0), radius ≈ 0.12, fill `--lab-text-muted`

---

## Section 3: Triangles & Vertex Labels

### Pre-image triangle (static)

- **Outline:** `<Line>` from drei, `points={PRE_IMAGE_VERTICES}`, `closed`, color `--lab-text`, `lineWidth={1.5}`
- **Fill:** `<mesh>` with `THREE.ShapeGeometry` from `PRE_IMAGE_VERTICES`, `MeshBasicMaterial` transparent at `opacity={0.07}`, color `--lab-text`
- **Labels A, B, C:** `<Text>` from drei at each vertex, offset outward from centroid by ~0.5 world units (normalized direction: vertex − centroid), font JetBrains Mono, size 0.55, weight 600, color `--lab-text`

### Ghost triangle (reactive)

- Vertices: `PRE_IMAGE_VERTICES.map(([x, y]) => [x + ghostOffset[0], y + ghostOffset[1]])`
- **Outline:** `<Line>` with `dashed dashSize={0.3} gapSize={0.18}`, color `--lab-accent`, `lineWidth={1.5}`
- **Fill:** same `ShapeGeometry` approach, `opacity={0.12}`, color `--lab-accent`
- **Labels A′, B′, C′:** same `<Text>` offset logic, color `--lab-accent`
- Group opacity: ~0.7

---

## Section 4: Drag Interaction

An invisible `<mesh>` plane at z=−0.5 (behind all geometry) covering the full grid:

- Geometry: `<planeGeometry args={[GRID_RANGE * 2, GRID_RANGE * 2]} />`
- Material: `<meshBasicMaterial transparent opacity={0} />`

Pointer handlers on the plane mesh:
- `onPointerDown`: capture pointer, record `dragStartWorld` (intersection.point.x/y) and `offsetAtDragStart`
- `onPointerMove`: if dragging, compute `rawOffset = offsetAtDragStart + (currentPoint − dragStartWorld)`, clamp so ghost centroid stays within `±CONTENT_RANGE`, pass to `onGhostMove`
- `onPointerUp` / `onPointerLeave`: end drag

State: drag refs (`useRef`) to avoid stale closures — same pattern as current SVG impl.

Cursor: `style={{ cursor: isDragging ? 'grabbing' : 'grab' }}` on the Canvas wrapper div.

---

## Constraint Calculation

Pre-image centroid = mean of `PRE_IMAGE_VERTICES` ≈ (2.33, 2.33).

Max offset per axis = `CONTENT_RANGE − centroidComponent` (positive direction), `−CONTENT_RANGE − centroidComponent` (negative). Ghost centroid = pre-image centroid + offset, clamped to `[−CONTENT_RANGE, CONTENT_RANGE]`.

---

## Definition of Done

- Visual output matches Phase 1 SVG version: grid, axes, labels, pre-image △, ghost △ with prime labels
- Ghost drags smoothly and snaps via `snapToGrid` exactly as before
- `useRigidMotionsState` hook called identically — no signature changes
- `CANVAS_SIZE`, `SCALE`, `CENTER` commented out in `constants.ts`; `WORLD_SCALE = 1` added
- No SVG elements anywhere in the rigid-motions component tree
- No console errors
- No new features, no Phase 2 logic
