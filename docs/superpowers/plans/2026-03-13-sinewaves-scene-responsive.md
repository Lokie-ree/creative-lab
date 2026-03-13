# Sinewaves: Scene Responsive Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the sinewaves scene so tablets in portrait orientation show the unit circle in a stacked layout (circle above, wave below), phones continue showing wave-only, and all orientations respond correctly to rotation.

**Architecture:** Replace `useIsMobileViewport` with `useSceneMode` which returns `'phone' | 'portrait' | 'landscape'` based on `window.innerWidth` (device class) and R3F `size` in CSS pixels (canvas shape). Add a `portrait` config to `SCENE_LAYOUT`. Update `Visualization` in `Scene.tsx` to gate the unit circle on `mode !== 'phone'` instead of `!isMobile`, and position it using the portrait config when stacked.

**Tech Stack:** React 19, TypeScript, React Three Fiber (`useThree`), Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-03-13-layout-shell-and-responsive-scenes-design.md` — Workstream 2

---

## Chunk 1: `scene-layout.ts` — `useSceneMode` hook + portrait config

### Files
- Modify: `src/components/modules/sinewaves/scene-layout.ts`

**Before starting:** Read `src/components/modules/sinewaves/scene-layout.ts` in full. Note these file-level constants near the top — they must be preserved throughout all edits:
- `WAVE_WIDTH` (e.g. `const WAVE_WIDTH = 4`) — used in wave centering for phone mode
- `clamp` helper function (used in `useSceneLayout` for clamping scale)

---

### Task 1: Add portrait config and `useSceneMode` hook

The current file has two layout configs (`landscape`, `portrait`) and two hooks (`useSceneLayout`, `useIsMobileViewport`). This task adds a third config key (`phone`) to separate phone-portrait from tablet-portrait, updates `useSceneLayout` to accept `mode` instead of deriving it internally, and replaces `useIsMobileViewport` with `useSceneMode`.

- [ ] **Step 1: Add `SceneMode` type and update `SCENE_LAYOUT`**

In `scene-layout.ts`, add `SceneMode` type and add the `phone` config. The existing `portrait` config values are starting estimates — tune visually after implementation:

```ts
export type SceneMode = 'phone' | 'portrait' | 'landscape'

export const SCENE_LAYOUT = {
  landscape: {
    // Unchanged
    circle: { xRatio: -0.32, yRatio: 0 },
    wave:   { xRatio: 0.1,   yRatio: 0 },
    scaleFactor: 0.20,
  },
  portrait: {
    // NEW — tablet portrait: stacked, circle above wave. Tune visually at 768px and 820px portrait.
    circle: { xRatio: 0, yRatio: 0.25 },
    wave:   { xRatio: 0, yRatio: -0.22 },
    scaleFactor: 0.22,
  },
  phone: {
    // Wave only — no circle. xRatio 0 = centered. y stays 0 since wave fills the canvas.
    wave: { xRatio: 0, yRatio: 0 },
    scaleFactor: 0.24,
  },
  scale: { min: 0.5, max: 1.1 },
  ghostOpacity: 0.5,
} as const
```

Replace the existing `SCENE_LAYOUT` constant entirely. The only structural change is adding `phone` and renaming `portrait.wave` to match the new stacked intent.

- [ ] **Step 2: Add `useSceneMode` hook**

Add this hook after `SCENE_LAYOUT`. It replaces `useIsMobileViewport`. `useSceneMode` calls `useThree()` — it must be called inside an R3F Canvas context (which it is, from `Visualization` in `Scene.tsx`).

```ts
/**
 * Derives the scene layout mode from device width and canvas shape.
 *
 * - 'phone'     — narrow device (<600px); wave only, no unit circle
 * - 'portrait'  — tablet/desktop canvas that is taller than wide; stacked layout
 * - 'landscape' — canvas wider than tall (all phones in landscape, tablets + desktops in landscape)
 *
 * Uses window.innerWidth for device class (stable, not affected by camera FOV).
 * Uses R3F size (CSS pixels) for portrait/landscape — avoids the world-unit aspect
 * ratio bug where perspective camera FOV inflates world-unit viewport dimensions.
 */
export function useSceneMode(): SceneMode {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handler, { passive: true })
    window.addEventListener('orientationchange', handler, { passive: true })
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])

  const { size } = useThree()
  const isPortrait = size.width <= size.height
  const isPhone = windowWidth < 600

  if (isPhone && isPortrait)  return 'phone'      // phone portrait: wave only
  if (!isPhone && isPortrait) return 'portrait'   // tablet portrait: stacked
  return 'landscape'                              // everything landscape (any width)
}
```

- [ ] **Step 3: Update `useSceneLayout` to accept `mode` instead of deriving it internally**

The current `useSceneLayout(stage: string)` derives `isPortrait` and `isMobile` internally. Update it to accept `mode: SceneMode` as a parameter and derive positions from the correct config.

**Config selection:** `SCENE_LAYOUT.phone` has no `circle` key (phone mode hides the circle). Use `SCENE_LAYOUT.landscape` for positions in phone mode. Phone gets its own `scaleFactor` (0.24) extracted separately.

**`SceneLayoutResult` interface:** Remove `isPortrait: boolean` from the return type. `Scene.tsx` callers already have `mode` from `useSceneMode()` and can derive `mode === 'portrait'` locally. Removing `isPortrait` from the return prevents stale semantics (old `isPortrait` was a world-unit ratio; new `isPortrait` would mean "tablet portrait" specifically, excluding phone portrait).

Replace the entire `useSceneLayout` function with:

```ts
/**
 * Derives world-space positions for circle and wave from the current scene mode.
 *
 * @param stage - Current stage to determine connector visibility
 * @param mode  - Scene mode from useSceneMode()
 */
export function useSceneLayout(stage: string, mode: SceneMode): SceneLayoutResult {
  const { viewport, size } = useThree()
  const { width, height } = viewport

  // Position config: phone mode uses landscape positions (circle won't render for phone)
  const config = (mode === 'portrait')
    ? SCENE_LAYOUT.portrait
    : SCENE_LAYOUT.landscape

  // Scale factor: phone uses its own scaleFactor, others use config's
  const scaleFactor = (mode === 'phone')
    ? SCENE_LAYOUT.phone.scaleFactor
    : config.scaleFactor

  // Scale base: portrait uses half height (each element gets ~50% of canvas height)
  const baseDimension = (mode === 'portrait')
    ? Math.min(size.width, size.height / 2)
    : Math.min(size.width, size.height)

  const scale = clamp(
    baseDimension * scaleFactor,
    SCENE_LAYOUT.scale.min,
    SCENE_LAYOUT.scale.max
  )

  const circle = {
    x: width * config.circle.xRatio,
    y: height * config.circle.yRatio,
  }

  // Phone: center wave. Portrait/Landscape: use config ratio.
  const wave = (mode === 'phone')
    ? { x: -WAVE_WIDTH / 2, y: 0 }
    : { x: width * config.wave.xRatio, y: height * config.wave.yRatio }

  // Connector only in landscape during observe stage
  const connector = (mode === 'landscape' && stage === 'observe')
    ? { startX: circle.x, endX: wave.x }
    : null

  return { circle, wave, scale, connector }
}
```

Also update the `SceneLayoutResult` interface — remove `isPortrait: boolean`. Find the existing interface definition in `scene-layout.ts` and remove that field. It will look something like:

```ts
// Before — remove isPortrait
export interface SceneLayoutResult {
  isPortrait: boolean  // ← DELETE this line
  circle: { x: number; y: number }
  wave: { x: number; y: number }
  scale: number
  connector: { startX: number; endX: number } | null
}
```

- [ ] **Step 4: Keep `useIsMobileViewport` as a deprecated re-export (for safety)**

`useIsMobileViewport` may be imported in other files not covered by this plan. Add a deprecated wrapper that returns the old boolean for backward compatibility:

```ts
/**
 * @deprecated Use useSceneMode() instead.
 * Kept temporarily to avoid breaking any consumers not updated in this plan.
 */
export function useIsMobileViewport(): boolean {
  const mode = useSceneMode()
  return mode === 'phone'
}
```

- [ ] **Step 5: Verify the build passes**

```bash
pnpm build
```

Expected: Clean build with no errors. If `SceneLayoutResult` no longer has `isPortrait` and callers in `Scene.tsx` still destructure it, TypeScript will surface the error here. (Note: `pnpm build` uses `tsc -b` which enforces `noUnusedLocals` — more strict than `tsc --noEmit`.)

- [ ] **Step 6: Commit chunk 1**

```bash
git add src/components/modules/sinewaves/scene-layout.ts
git commit -m "feat(sinewaves): add useSceneMode hook, portrait config, fix tablet portrait detection"
```

---

## Chunk 2: `Scene.tsx` — wire mode, portrait stacked positioning

### Files
- Modify: `src/components/modules/sinewaves/Scene.tsx`

**Before starting:** Read `src/components/modules/sinewaves/Scene.tsx` in full.

---

### Task 2: Update `Visualization` to use `useSceneMode`

The current `Visualization` component calls `useIsMobileViewport()` and gates the unit circle on `!isMobile`. This task replaces that with `useSceneMode()` and updates the circle visibility guard and positioning.

- [ ] **Step 1: Update imports in `Scene.tsx`**

Find the current import from `./scene-layout`:

```ts
import { useSceneLayout, useIsMobileViewport, SCENE_LAYOUT } from './scene-layout'
```

Replace with:

```ts
import { useSceneLayout, useSceneMode, SCENE_LAYOUT } from './scene-layout'
```

- [ ] **Step 2: Replace `useIsMobileViewport` with `useSceneMode` in `Visualization`**

Find:
```ts
const { isPortrait, circle, wave, scale, connector } = useSceneLayout(stage)
const isMobile = useIsMobileViewport()
```

Replace with:
```ts
const mode = useSceneMode()
const { circle, wave, scale, connector } = useSceneLayout(stage, mode)
const isPortrait = mode === 'portrait'
```

Note: `isPortrait` is now derived locally from `mode` rather than returned from `useSceneLayout`. This is needed because `SceneLayoutResult` no longer includes `isPortrait` (updated in Chunk 1).

- [ ] **Step 3: Update unit circle visibility gate**

Find:
```tsx
{/* Unit circle — hidden on mobile */}
{!isMobile && (
  <group position={[circle.x, circle.y, 0]} scale={scale}>
```

Replace with:
```tsx
{/* Unit circle — hidden on phones, visible on tablets and desktops */}
{mode !== 'phone' && (
  <group position={[circle.x, circle.y, 0]} scale={scale}>
```

- [ ] **Step 4: Update connector visibility gate**

Find:
```tsx
{!isMobile && showConnector && connector && (
```

Replace with:
```tsx
{mode !== 'phone' && showConnector && connector && (
```

- [ ] **Step 5: Update wave group positioning for portrait mode**

Find the wave group:
```tsx
<group position={[wave.x, wave.y, 0]} scale={isPortrait ? scale : 1}>
```

In landscape mode, the wave group uses scale `1` (the scale is applied to the circle group; wave inherits a separate world-space position). In portrait mode (stacked), the wave should also use `scale` so it matches the circle size. Replace with:

```tsx
<group position={[wave.x, wave.y, 0]} scale={(isPortrait || mode === 'phone') ? scale : 1}>
```

This preserves existing landscape behavior (scale=1 on wave), applies scale in portrait (stacked), and applies scale in phone mode (wave-only, centered).

- [ ] **Step 6: Run the full build**

```bash
pnpm build
```

Expected: Clean build. TypeScript errors from missing `mode` argument or stale `isPortrait` destructuring will surface here.

- [ ] **Step 7: Visual verification in dev server**

```bash
pnpm dev
```

Use browser DevTools device emulation to test each mode:

**Phone portrait — 390×844 (iPhone 14):**
- [ ] Unit circle hidden
- [ ] Sine wave centered in canvas
- [ ] No starburst or off-screen elements

**Phone landscape — 844×390 (iPhone 14 rotated):**
- [ ] Unit circle visible (landscape mode)
- [ ] Circle left, wave right, connector visible in observe stage
- [ ] Both elements fit within canvas bounds — no clipping

**Tablet portrait — 768×1024 (iPad Mini):**
- [ ] Unit circle visible in upper half of canvas
- [ ] Sine wave visible in lower half of canvas
- [ ] No connector line (not landscape, connector is null)
- [ ] Both elements fully within canvas bounds — no left-edge clipping

**Tablet portrait — 820×1180 (iPad Air):**
- [ ] Unit circle visible in upper half (was previously hidden)
- [ ] Sine wave visible in lower half
- [ ] No left-edge clipping

**Tablet landscape — 1024×768 (iPad rotated):**
- [ ] Circle left, wave right, connector in observe stage
- [ ] Same behavior as before (landscape config unchanged)

**Desktop — 1280×800:**
- [ ] Circle left, wave right, connector in observe stage
- [ ] No regressions from existing behavior

> **Visual tuning note:** The portrait config values (`yRatio: 0.25` / `yRatio: -0.22`, `scaleFactor: 0.22`) are starting estimates. If circle or wave clips against the top/bottom edge or is too small, adjust these values in `SCENE_LAYOUT.portrait` and re-verify. The goal is both elements fully visible with breathing room.

- [ ] **Step 8: Run existing sinewaves tests**

```bash
pnpm vitest run src/components/modules/sinewaves
```

Expected: All pass. These tests cover pure logic — no layout tests.

- [ ] **Step 9: Commit**

```bash
git add src/components/modules/sinewaves/Scene.tsx
git commit -m "fix(sinewaves): use useSceneMode for tablet portrait stacked layout, fix circle visibility"
```

---

## Done

Sinewaves scene now has three distinct layout modes:
- **phone** (`< 600px`): wave only, centered — unchanged
- **portrait** (tablet/desktop canvas taller than wide): circle top, wave bottom — new
- **landscape** (canvas wider than tall, any device): circle left, wave right — unchanged

Tablets in portrait show the unit circle. iPad Mini and iPad Air both work correctly. Orientation changes trigger an immediate re-layout via the `orientationchange` listener on `useSceneMode`.
