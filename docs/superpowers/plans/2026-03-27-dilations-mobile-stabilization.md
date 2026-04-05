# Dilations Mobile Stabilization Plan

## Status: Complete
> Implemented 2026-03-27. Merged as PR #52 (mobile stabilization) and PRs #53–#54 (solidification + drag quality fixes).

> **For agentic workers:** Use `superpowers:executing-plans` or `superpowers:subagent-driven-development` to implement this plan task-by-task.

**Branch:** `feat/dilations-mobile-stabilization`
**Goal:** Fix drag jank, scene blank margins, portrait cramped layout, and journey landscape whitespace — all identified during mobile testing of the deployed site.

---

## Background

Four issues from live mobile testing:

1. **Drag jank** — GhostTriangle fires two React setState calls per pointermove (`setCenterPos` + `onPositionChange` → `setNudgePosition`), causing two re-renders per frame plus ShapeGeometry rebuild on every move.
2. **Scene blank margins** — Portrait canvas is taller than it is wide, but the coordinate grid is square (16×16 world units). The Three.js camera maps the SHORT dimension to 16 units, leaving dark blank strips above/below the grid on tall/narrow viewports.
3. **Portrait layout cramped** — With 5 layout rows (status | prompt | canvas | formula | controls) and an over-tall canvas consuming flex space, controls feel squeezed. Making the canvas aspect-square frees vertical space for controls.
4. **Journey landscape whitespace** — CourseHub and Constellation use `justify-center` in `flex-1` content areas. On landscape phones (short viewport), centered content leaves visible blank space below the module/course list.

---

## Root Causes

### Drag (Task 1)
`GhostTriangle.tsx` uses `useState<Vec2 | null>` for `centerPos`. On every `pointermove`:
1. `setCenterPos(snapped)` → React re-render #1 → geometry rebuilt via `useMemo`
2. `onPositionChange?.(snapped)` → `setNudgePosition` in parent → re-render #2 → `externalPosition` prop flows back to ghost → re-render #3

Three re-renders per event, plus `ShapeGeometry` + `BufferGeometry` construction on each render.

M1's DragPlane avoids the geometry rebuild issue by passing offset as a group position, not as vertex data.

**Fix:** Use `useRef<Vec2>` for drag position. Update `groupRef.current.position` in `useFrame`. Build geometry once at origin from `scaledShape`. Never call `onPositionChange` during active drag (only on drop for keyboard nudge sync).

### Scene margins (Task 2)
`CameraSetup` uses `scale = Math.min(size.width, size.height) / WORLD_SIZE`. On portrait (width=390, height=600): `scale = 390/16 = 24.375`. `worldH = 600/24.375 = 24.6` units. Grid only covers y ∈ [-2, 14] (16 units). The extra ~8.6 world units (4.3 above + 4.3 below) appear as blank dark canvas.

**Fix A (grid):** Extend `CoordinateGrid` grid lines beyond `WORLD_MIN`/`WORLD_MAX`. Lines drawn from ~-20 to ~30 (GPU clips to viewport). Labels stay at [2,4,6,8,10,12] only. No blank edges.

**Fix B (layout):** In portrait, constrain canvas container to `aspect-square` so the canvas is never taller than it is wide — eliminating the excess height where blank space appears.

Both fixes are applied: A makes the canvas content look intentional if any margin remains; B prevents the over-tall canvas and gives space back to controls.

### Portrait cramped (Task 2 + Task 3)
`Layout.tsx` canvas `<main>`: currently `flex-1 min-h-[40dvh]` — absorbs all available vertical space in portrait. With the canvas consuming 500-600px on tall phones, the controls panel (formula + button) fights for the remaining 80-100px.

**Fix:** In portrait (`[@media(orientation:portrait)]`):
- Canvas `<main>`: `aspect-square w-full shrink-0` — takes exactly width×width pixels, no excess
- Controls panel: `flex-1 min-h-0` — absorbs remaining space after square canvas
- Result: controls get proportional height; canvas fills the grid exactly

### Journey whitespace (Task 4)
CourseHub and Constellation: `flex-1 flex-col items-center justify-center px-4`. On landscape phones with few items, `justify-center` centers the small list vertically — equal blank above and below. User perceives the blank below as wasted space.

**Fix:** Switch to `justify-start` with top padding (`pt-[8dvh]` or similar) so content anchors near the top, leaving any extra space at the bottom where it's less noticeable.

---

## Tasks

### Task 1 — GhostTriangle: imperative drag (zero re-renders during move)

**File:** `src/components/modules/dilations/components/GhostTriangle.tsx`

**Changes:**
- Replace `const [centerPos, setCenterPos] = useState<Vec2 | null>(null)` with `const centerPosRef = useRef<Vec2>(/* pre-image centroid initial value */)`
- Add `const groupRef = useRef<THREE.Group>(null)`
- Build geometry once from `scaledShape` (already centered at origin): `const { fillGeo, outlineGeo } = useMemo(() => buildTriangleGeometries(scaledShape), [scaledShape])`
- Remove `positioned = translateTriangle(...)` and `buildTriangleGeometries(positioned)` useMemos — geometry no longer repositioned
- In `useFrame`: `groupRef.current?.position.set(displayCenter.x, displayCenter.y, 0)` where `displayCenter = externalPosition ?? centerPosRef.current`
- In `handleMove`: `centerPosRef.current = snapped` (no setState, no re-render) — drop the `onPositionChange?.(snapped)` call from here
- In `handleUp`: `centerPosRef.current = snapped; onDrop(snapped); onPositionChange?.(snapped)` (single sync on drop only)
- Attach `groupRef` to the `<group>` wrapper that holds fill + outline meshes
- Initial `centerPosRef` value: `triangleCentroid(vertices)` (pre-image centroid — consistent with current behavior)

**Expected result:** Zero React re-renders during drag. Ghost moves purely through Three.js per-frame updates. `onPositionChange` still syncs keyboard nudge state on drop.

**Verification:** `pnpm vitest run src/components/modules/dilations` passes. Drag is smooth on simulated mobile viewport (Chrome DevTools).

---

### Task 2 — DilationsScene: extend coordinate grid + portrait canvas sizing

**Files:** `src/components/modules/dilations/DilationsScene.tsx`, `src/components/modules/dilations/Layout.tsx`

#### 2a — Extend grid lines (DilationsScene.tsx)

In `CoordinateGrid`, change the grid loop to draw beyond `WORLD_MIN`/`WORLD_MAX`:

```ts
const GRID_DRAW_MIN = -20
const GRID_DRAW_MAX = 30
```

Keep the integer loop but extend range. The axis detection (`i === 0`) stays the same. Three.js clips the line segments at the camera frustum — no extra draw cost beyond the geometry setup (done once).

Keep `WORLD_MIN = -2`, `WORLD_MAX = 14` for camera framing and WORLD_SIZE = 16. Only the grid LINE drawing range changes.

Also clean up the comment: "World range: x ∈ [-2, 14], y ∈ [-2, 14] — accommodates k=3 dilation of canonical triangle" → "World range: x ∈ [-2, 14], y ∈ [-2, 14]. Grid lines extend beyond range to fill viewport."

#### 2b — Portrait canvas aspect-square (Layout.tsx)

In `<main>` (the visualization container), change the class string:

**Before:**
```
flex-1 min-h-[40dvh] relative overflow-hidden [@media(orientation:landscape)]:flex-1 [@media(orientation:landscape)]:min-h-0 [@media(orientation:landscape)]:min-w-0
```

**After:**
```
relative overflow-hidden
[@media(orientation:portrait)]:aspect-square [@media(orientation:portrait)]:w-full [@media(orientation:portrait)]:shrink-0
[@media(orientation:landscape)]:flex-1 [@media(orientation:landscape)]:min-h-0 [@media(orientation:landscape)]:min-w-0
```

In the controls panel `<div>`, change `shrink-0` to `flex-1 min-h-0` for portrait, keeping all landscape overrides:

**Before:**
```
shrink-0 border-t border-(--lab-border) [@media(orientation:landscape)]:w-72 ...
```

**After:**
```
flex-1 min-h-0 border-t border-(--lab-border)
[@media(orientation:landscape)]:flex-none [@media(orientation:landscape)]:w-72 ...
```

(In landscape, `flex-none` = `shrink-0 grow-0` prevents it from growing or shrinking.)

**Verification:** At viewport 390×844 (iPhone 14 portrait): canvas is square (390×390), controls get ~350px. At 844×390 (iPhone 14 landscape): canvas fills `flex-1`, controls panel is 288px wide. Grid fills canvas in both orientations.

---

### Task 3 — CourseHub + Constellation: landscape whitespace

**Files:** `src/components/constellation/CourseHub.tsx`, `src/components/constellation/Constellation.tsx`

In the `flex-1` content div of each:

**Before:** `flex flex-1 flex-col items-center justify-center px-4`

**After:** `flex flex-1 flex-col items-center px-4 pt-[10dvh] [@media(orientation:landscape)]:pt-[6dvh]`

This anchors content near the top with proportional padding, leaving leftover space at the bottom (far less noticeable than blank below centered content). `justify-center` removed.

Both files get the same change.

**Verification:** On simulated landscape 844×390: course/module list appears near the top with breathing room, no excessive blank at bottom.

---

## Non-goals (deferred to later)

- Wrong-prediction feedback (#3) — separate UX pass
- Discovered insights emphasis (#5) — design iteration
- k=½ triangle zoom (#6) — dynamic camera requires Phase 2 context
- Vertex label sizing polish (#4) — low priority polish pass

---

## Pre-flight

```bash
git checkout main && git pull
git checkout -b feat/dilations-mobile-stabilization
pnpm vitest run  # baseline: all tests pass before any change
```

## Post-task verification

```bash
pnpm vitest run src/components/modules/dilations
pnpm build
```

## Definition of done

- [ ] All dilations tests pass
- [ ] `pnpm build` clean (no new type errors)
- [ ] Ghost drag: no geometry rebuild during pointermove (verify by adding console.count to buildTriangleGeometries — should fire once per round, not per drag event)
- [ ] Portrait 390×844: canvas is square, controls visible with breathing room
- [ ] Landscape 844×390: canvas fills scene area, controls 288px panel
- [ ] CourseHub + Constellation: content near top in landscape, no prominent blank at bottom
