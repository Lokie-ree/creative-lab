# Rigid Motions Module Architecture

## Overview

The rigid motions module teaches geometric transformations (translations, rotations, reflections) through interactive prediction. Phase 1 covers translation: the student drags a ghost triangle to predict where the pre-image will land after a transformation.

**Core Learning Goal**: Build intuition for rigid motions by predicting and verifying triangle placements on a coordinate grid.

**Doc scope**: Phase 1 implementation. Design spec: `docs/plans/2026-02-19-rigid-motions-design-spec.md`. R3F migration plan: `docs/plans/2026-03-01-rigid-motions-r3f-migration.md`.

---

## File Structure

```
src/components/modules/rigid-motions/
├── InstrumentModule.tsx          # Entry: layout, state wiring
├── constants.ts                  # Grid range, content range, triangle vertices, labels
├── hooks/
│   └── useRigidMotionsState.ts   # Ghost offset state + clamped move handler
├── scene/
│   ├── RigidMotionsScene.tsx     # R3F Canvas shell + all 3D components
│   ├── scene-layout.ts           # useRigidMotionsLayout — camera zoom from viewport
│   ├── scene-math.ts             # ghostVertices, clampOffset, vertexLabelOffset
│   └── __tests__/
│       └── scene-math.test.ts    # Unit tests for math utilities
└── controls/
    └── ControlStrip.tsx          # CHECK button (disabled in Phase 1)
```

---

## Component Hierarchy

```
InstrumentModule
└── grid: [status strip | prompt | scene | control strip]
    ├── header — module title (all viewports); EscapeHatch (LAB dropdown) floats fixed top-0 left-4 h-12 outside this header
    ├── div    — "Predict" label + prompt text
    ├── main   — RigidMotionsScene
    │   └── Canvas (R3F, orthographic)
    │       ├── ContextRecovery   — webglcontextlost / webglcontextrestored handlers
    │       ├── CameraSetup       — syncs orthographic zoom to viewport via useFrame
    │       ├── CoordinateGrid    — grid lines, axis lines, origin dot, SpriteLabel axis numbers
    │       ├── PreImageTriangle  — static white triangle with SpriteLabel vertex labels
    │       ├── GhostTriangle     — draggable green dashed triangle with SpriteLabel labels
    │       └── DragPlane         — invisible full-screen mesh that captures pointer events
    └── footer — ControlStrip (CHECK button)
```

---

## Key Technical Decisions

### SpriteLabel instead of `@react-three/drei` `Text`

**Never use `<Text>` from `@react-three/drei` in this project's R3F scenes.**

`Text` uses `troika-three-text`, which creates its own offscreen WebGL context for SDF font rendering. In development, React StrictMode double-mounts every component. The combination of the R3F `WebGLRenderer` context + troika's font context + StrictMode remounting exhausts the browser's WebGL context limit (~8 in Chromium). The browser then forcibly kills the oldest context — the main scene — causing an immediate blank canvas on load.

**Verified by Playwright** (2026-03-02): `THREE.WebGLRenderer: Context Lost` fired immediately on every module mount when `Text` was present. Removing it eliminated the error entirely. Context remained healthy across multiple resize events.

**The fix**: `SpriteLabel` — renders text onto a 2D `<canvas>`, uploads it as a `THREE.CanvasTexture`, and displays it on a `PlaneGeometry` mesh. Zero extra WebGL contexts.

```tsx
// ❌ Never — creates an offscreen WebGL context via troika
import { Text } from '@react-three/drei'
<Text position={[x, y, z]} fontSize={0.5} color="#fff">label</Text>

// ✅ Use SpriteLabel instead
<SpriteLabel text="label" position={[x, y, z]} color="#fff" planeWidth={0.6} />
```

`SpriteLabel` is defined locally in `RigidMotionsScene.tsx`. If a second module needs it, extract to `src/lib/r3f/SpriteLabel.tsx`.

### Orthographic camera + zoom via useFrame

The camera uses `THREE.OrthographicCamera`. Zoom is computed in `useRigidMotionsLayout` from the R3F viewport size: `zoom = shorterSide / (GRID_RANGE * 2)`. `CameraSetup` applies it each frame (with a deadband to avoid unnecessary matrix updates). This keeps the full ±9 grid always visible regardless of aspect ratio.

The camera is positioned at `[0, 2, 10]` (not `[0, 0, 10]`). The Y offset of 2 shifts the viewport upward so the active content zone — pre-image triangle at A(1,1)/B(4,2)/C(2,4) and ghost starting at (6–9, 1–4) — is vertically centered in the canvas rather than riding the top half with dead negative-quadrant space below.

### Drag via invisible DragPlane

Dragging the ghost triangle is handled by an invisible `PlaneGeometry` mesh (`DragPlane`) that covers the full canvas. On `pointerdown`, it captures window-level `pointermove`/`pointerup` events for smooth out-of-bounds dragging. The ghost offset is clamped in `clampOffset` so the ghost centroid stays within `±CONTENT_RANGE`.

### Context recovery

`ContextRecovery` (inside the Canvas) listens for `webglcontextlost` and calls `e.preventDefault()` to keep the context alive for browser-side restoration. On `webglcontextrestored` it calls `gl.setSize()` to re-sync dimensions. This handles GPU pressure events (e.g. switching tabs) without remounting the Canvas.

---

## State

`useRigidMotionsState` owns `ghostOffset: [number, number]` — the translation vector from pre-image to ghost. `handleGhostMove` clamps via `clampOffset` before setting state. Phase 2 will add answer-checking state here.

---

## Constants (`constants.ts`)

| Constant | Value | Purpose |
|---|---|---|
| `GRID_RANGE` | 9 | Grid extends ±9 on each axis |
| `CONTENT_RANGE` | 6 | Labels and vertices constrained to ±6 |
| `PRE_IMAGE_VERTICES` | `[1,1],[4,2],[2,4]` | Scalene triangle (no equal sides/angles) |
| `GHOST_INITIAL_OFFSET` | `[5, 0]` | Ghost starts 5 units right of pre-image |

---

## Lessons Learned

1. **`Text` from drei is forbidden** — see "SpriteLabel" section above. This burned us on initial implementation and was diagnosed via Playwright browser testing.
2. **StrictMode + WebGL**: React StrictMode's double-mount is the amplifier. Any R3F component that creates a secondary WebGL context (troika, offscreen canvas renderers) will hit the browser limit in dev.
3. **Playwright is the right tool** for diagnosing WebGL context issues — `isContextLost()`, `getContext()` call counts, and console event monitoring all work reliably.
4. **Axis label collision at ±1**: The `CoordinateGrid` loop renders both an x-axis label and a y-axis label for every integer `i`. At `i = ±1`, the two labels share the same grid square near the origin and overlap. Fix: x-axis labels sit at `y = -0.7` (not `-0.55`) and y-axis labels have their right edge at `x = -0.65` (not `-0.5`). Do not tighten these offsets without checking the ±1 collision zone.
5. **Camera Y offset centers the active zone**: The pre-image and ghost triangles live in Q1 (y ≈ 1–4). A camera at `[0, 0, 10]` wastes the bottom half of the canvas on empty negative quadrant. Setting `position.y = 2` centers the action. `CameraSetup` only manages zoom, not position, so the offset is stable across viewport resizes.
