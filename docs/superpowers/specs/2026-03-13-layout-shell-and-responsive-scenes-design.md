# Design Spec: Layout Shell + Responsive Scenes
**Date:** 2026-03-13
**Status:** Approved
**Scope:** Rigid Motions layout refactor + desktop redesign, Sinewaves responsive scene fix, Capstone scaffolding copy, Capstone target visual fix

---

## Background

Three issues identified in NOTES.md (2026-03-13) drove this design:

1. **Mobile canvas dead zone** — Rigid Motions canvas takes ~40% of viewport height on mobile because `grid-rows-[2.5rem_auto_auto_1fr_auto]` lets variable-height chrome rows eat into the `1fr` scene row. Also: no `Layout.tsx` means Dilations (next module) has no shell to inherit.

2. **Capstone zero scaffolding** — The prompt row is explicitly `null` in capstone (`guideState !== 'capstone' ? (...) : null`). No copy exists for the idle capstone state in `rigid-motions-copy.ts`. Students arrive at the hardest cognitive moment in the module with zero framing.

3. **Capstone target visual ambiguity** — When `PreviewGhost` coincides with the capstone target, two filled triangles overlap, creating a starburst effect at the exact success moment.

Additionally, screenshots at iPad Mini (768×1024) and iPad Air (820×1180) in portrait revealed a fourth issue:

4. **Sinewaves scene broken on tablets** — `useIsMobileViewport` conflates device class with orientation. iPad Mini triggers the landscape layout config (circle clips off-screen); iPad Air triggers the phone layout (circle hidden entirely). No portrait-tablet layout mode exists.

---

## Workstream 1 — Rigid Motions Layout Shell

### New file: `src/components/modules/rigid-motions/Layout.tsx`

A slot-based layout component. `InstrumentModule.tsx` becomes pure orchestration — all grid/flex concerns move here.

**Interface:**
```tsx
interface ModuleLayoutProps {
  statusStrip: ReactNode
  prompt: ReactNode        // null in capstone → removed from DOM
  formulaReadout: ReactNode // null in Phase 1–2 → removed from DOM
  visualization: ReactNode
  controls: ReactNode
  children?: ReactNode     // overlays (WebGL recovery, etc.)
}
```

### Mobile layout (`< md`)

Outer container: `h-dvh flex flex-col overflow-hidden bg-(--lab-bg)`

Row structure (flex column):
- `statusStrip` — `shrink-0 h-10 border-b border-(--lab-border)`
- `prompt` — `shrink-0 border-b border-(--lab-border)` — **conditional**: `{prompt && <div ...>{prompt}</div>}`. When null (capstone), removed from DOM entirely — scene reclaims those ~56px.
- `visualization` — `flex-1 min-h-0 relative overflow-hidden` — gets all remaining space after visible chrome
- Bottom panel — `shrink-0 border-t border-(--lab-border)` — **fixed height, always two rows**:
  - Formula strip row — `border-b border-(--lab-border) min-h-[2rem]` — always rendered, empty in Phase 1–2. Filled in Phase 3+. Never removed from DOM — eliminates layout shift at coordinate-reveal transition.
  - Controls row — `controls` slot

**Why fixed panel height:** Formula strip is ~28px. Reserving it permanently costs 28px of scene space in Phase 2, but eliminates the layout shift when Phase 3 activates. The coordinate-reveal transition is a natural pause moment — a layout shift there would be jarring.

**Why collapse prompt:** Capstone is the hardest cognitive moment. Reclaiming ~56px gives the scene maximum room. The capstone now gets its own prompt copy (Workstream 3) so the row is never empty — it either has content or it's gone.

### Desktop layout (`≥ md`)

No sidebar. Scene gets full viewport width.

Structure: `h-dvh flex flex-col overflow-hidden`
- `statusStrip` — `shrink-0 h-10 border-b border-(--lab-border)` (full width)
- `visualization` — `flex-1 min-h-0 relative overflow-hidden` (full width, fills remaining height)
- Bottom panel — `shrink-0 border-t border-(--lab-border)`:
  - Formula strip row — same as mobile (full width, always reserved)
  - Controls row — `flex flex-row items-center px-6 py-3 gap-4`:
    - `prompt` slot — `flex-1` (left side — label + text)
    - `controls` slot — `shrink-0` (right side — action buttons)

In capstone (`prompt === null`): the controls row becomes full-width (prompt slot is absent), SequenceBuilder expands to use the available space horizontally.

### SequenceBuilder desktop adaptation

`SequenceBuilder` currently uses `flex-col` with `flex-wrap`. On desktop in the bottom panel, it gets full row width (~1000px+). No structural changes needed — `flex-wrap` already handles horizontal expansion. The two `SlotEditor` components naturally lay out side-by-side at wider widths.

### Removing prompt duplication

The current `InstrumentModule.tsx` renders the prompt twice — once in the mobile-only row, once in the desktop `<aside>`. After this change, a single `prompt` slot prop renders in the `Layout.tsx` controls row on desktop and as its own row on mobile. One source of truth.

### Impact on `InstrumentModule.tsx`

- Remove inline `grid-rows-[2.5rem_auto_auto_1fr_auto] md:grid-rows-[2.5rem_1fr] md:grid-cols-[1fr_280px]`
- Remove desktop `<aside>` with its duplicate prompt and controls
- Remove `md:hidden` / `md:flex` guards on mobile/desktop prompt rows
- Wrap everything in `<ModuleLayout ... />`
- Pass `prompt={guideState !== 'capstone' ? <PromptContent /> : null}` — the Layout handles null gracefully

---

## Workstream 2 — Sinewaves Scene Responsive

### Root cause

`useIsMobileViewport` uses two signals:
1. `viewport.width <= viewport.height` — R3F world-unit aspect ratio (perspective camera, fov=50 at z=6)
2. `window.innerWidth < 768`

At iPad Mini (768×1024 portrait): canvas is ~768×824px after chrome. R3F world units: aspect ≈ 0.93 → `isPortrait = true`. But `window.innerWidth = 768` → `isNarrowScreen = false`. `isMobile = true || false = true` → circle hidden.

Except: the landscape config fires first (scene-layout calculates `isPortrait` separately from `useIsMobileViewport`), producing a mismatch — scene uses landscape layout, `Visualization` component hides the circle. The iPad Mini screenshot shows the circle because the R3F viewport at that specific canvas size crosses the aspect threshold differently, resulting in inconsistent behavior depending on exact chrome heights.

Core problem: using R3F world-unit aspect ratio for layout decisions is fragile. Camera FOV inflates world-unit viewport — the aspect ratio in world units differs from the CSS pixel aspect ratio. **Layout decisions must use CSS pixel dimensions.**

### New hook: `useSceneMode`

Replaces `useIsMobileViewport`. Returns `'phone' | 'portrait' | 'landscape'`.

**File:** `src/components/modules/sinewaves/scene-layout.ts` (replaces `useIsMobileViewport`)

```ts
type SceneMode = 'phone' | 'portrait' | 'landscape'

function useSceneMode(): SceneMode {
  // isPhone: device class — never changes mid-session on real devices
  // Threshold: 600px — phones are <600px; tablets are ≥600px in both orientations
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

  // isPortrait: canvas shape — use R3F pixel size (not world units)
  const { size } = useThree()  // size.width / size.height are CSS pixels
  const isPortrait = size.width <= size.height
  const isPhone = windowWidth < 600

  if (!isPhone && isPortrait) return 'portrait'
  if (isPortrait && isPhone)  return 'phone'
  return 'landscape'
}
```

### Three layout configs

> **Note on portrait values:** The `portrait` config numbers below are starting estimates. The existing `portrait` config in `scene-layout.ts` was set when this mode was partially broken and may not transfer directly. Implementer should tune visually at target tablet sizes (768px and 820px portrait) after the mechanical fix is in place.

```ts
export const SCENE_LAYOUT = {
  landscape: {
    // Existing — unchanged
    circle: { xRatio: -0.32, yRatio: 0 },
    wave:   { xRatio: 0.1,   yRatio: 0 },
    scaleFactor: 0.20,
  },
  portrait: {
    // NEW — tablet portrait: stacked circle above, wave below
    circle: { xRatio: 0, yRatio: 0.25 },   // upper half, centered — tune visually
    wave:   { xRatio: 0, yRatio: -0.22 },   // lower half, centered — tune visually
    scaleFactor: 0.22,
  },
  phone: {
    // Existing mobile — wave only (circle hidden)
    wave: { xRatio: 0, yRatio: 0 },
    scaleFactor: 0.24,
  },
  scale: { min: 0.5, max: 1.1 },
  ghostOpacity: 0.5,
} as const
```

### Scale base dimension per mode

| Mode | Scale base | Rationale |
|---|---|---|
| `landscape` | `min(size.width, size.height)` | Shorter side fits both elements |
| `portrait` | `min(size.width, size.height / 2)` | Each element gets ~half the height |
| `phone` | `size.width` | Wave fills full width |

All scales clamped to `[0.5, 1.1]`.

### Updated `useSceneLayout`

Takes `mode: SceneMode` instead of deriving internally. Returns `{ mode, circle, wave, scale, connector }`.

### `Visualization` component changes

Replace `const isMobile = useIsMobileViewport()` with `const mode = useSceneMode()`.

- Unit circle: visible when `mode !== 'phone'` (shown on all tablets and desktops)
- Connector: shown when `mode === 'landscape'` and `stage === 'observe'` (unchanged)
- Portrait stacked: when `mode === 'portrait'`, circle at `circle.x/y`, wave at `wave.x/y` — no connector

### Orientation change responsiveness

The `orientationchange` listener on `useSceneMode` triggers a re-render with updated `window.innerWidth` and `size` immediately. The existing `ContextRecovery` handler in `RigidMotionsScene` (rAF-deferred `gl.setSize`) already handles the canvas re-measure on orientation flip. The same pattern should be verified in sinewaves — the R3F `Canvas` auto-resizes when its container resizes, so `size` in `useThree()` updates automatically.

---

## Workstream 3 — Capstone Scaffolding Copy

### Root cause

Two problems in `InstrumentModule.tsx`:
1. `{guideState !== 'capstone' ? (<prompt row>) : null}` — explicitly removes prompt in capstone
2. `PROMPT_TEXT` and `EARNED_REVEALS['capstone']` are both empty strings — no idle-state copy exists

### Fix: `rigid-motions-copy.ts`

Add `CAPSTONE_PROMPT_TEXT` keyed by capstone round ID:

```ts
export const CAPSTONE_PROMPT_TEXT: Record<CapstoneRoundId, string> = {
  'capstone-1': '...',  // warm-up framing — one step sufficient
  'capstone-2': '...',  // two-step framing — order matters
  'capstone-3': '...',  // two-step, non-commutativity hint
}
```

Exact copy strings are authored using the `educational-copywriter` skill during implementation. Constraints:
- Silk-screen label register: terse, instructional, no filler
- Must frame the task without giving away the answer
- `capstone-3` may hint that reversing the order changes the result (non-commutativity is the Level 5 pedagogical moment of the capstone)

### Fix: `InstrumentModule.tsx`

Extend `promptText` derivation to handle capstone idle state:

```ts
const promptText = (() => {
  if (guideState === 'capstone' && feedbackState === 'idle')
    return CAPSTONE_PROMPT_TEXT[capstoneRound.id as CapstoneRoundId]
  if (firstMatch && earnedRevealText) return earnedRevealText
  if (repeatMatch)  return 'Match.'
  if (isMiss)       return 'Not quite — adjust your position.'
  if (isClose)      return CLOSE_COPY[guideState] ?? 'Getting closer.'
  return PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.'
})()

const promptLabel =
  guideState === 'capstone'          ? 'Build' :
  guideState === 'coordinate-reveal' ? 'Reveal' :
  isCoordinateStage(guideState)      ? 'Coordinate Rule' :
  firstMatch                         ? 'Discovered' :
  isMiss || isClose                  ? 'Hint' :
  'Predict'
```

Remove the `guideState !== 'capstone'` guard on the prompt row. The `Layout.tsx` receives `prompt={<PromptContent />}` in all states — never `null` in capstone. The prompt slot is only null when there is genuinely no content (currently: never — all guide states now have copy).

---

## Workstream 4 — Capstone Target Visual Fix

### Root cause

The capstone target triangle is rendered as a filled shape (same as all other triangles in the scene). `PreviewGhost` is also filled with `--lab-accent`. When the student's sequence matches the target position, both filled triangles coincide — producing visual noise at the exact moment of success.

### Fix: Target outline-only rendering

The capstone target triangle renders as **outline-only**: dashed stroke in `--lab-ghost`, no fill. `PreviewGhost` remains filled with `--lab-accent`.

When coincident: dashed ghost-colored outline frames a solid accent-colored triangle. Visually clear at all positions including exact overlap.

The capstone target (`CapstoneTarget` in `RigidMotionsScene.tsx`) currently renders a `meshBasicMaterial` fill at `opacity={0.18}` plus a `lineBasicMaterial` outline. Fix: set `visible={false}` on the fill mesh (or `opacity={0}`). The outline-only target remains — a dashed ghost-colored border with no fill.

### Lock-in animation (polish)

When `feedbackState` transitions to `'match'` in capstone, fire a GSAP tween on the target outline color:

```
--lab-ghost → --lab-accent (150ms ease-out)
--lab-accent → --lab-ghost (250ms ease-in, 100ms delay)
```

Total: ~500ms. A brief "click" that visually confirms the sequence locked before NEXT appears. Implementation: `useEffect` on `feedbackState === 'match'`, GSAP tween on `material.color` via a ref to the `lineBasicMaterial` on the `CapstoneTarget` outline mesh.

---

## File Change Summary

| File | Change |
|---|---|
| `rigid-motions/Layout.tsx` | **New** — slot-based shell |
| `rigid-motions/InstrumentModule.tsx` | Remove inline grid, desktop aside, prompt duplication; add Layout wrapper; extend promptText for capstone; remove capstone prompt guard; consolidate `promptRef` + `promptRefDesktop` into single ref (fadeInReadout effect targets one element after duplication removed) |
| `rigid-motions/rigid-motions-copy.ts` | Add `CAPSTONE_PROMPT_TEXT` record |
| `rigid-motions/scene/RigidMotionsScene.tsx` | Target triangle → outline-only; lock-in animation on match |
| `sinewaves/scene-layout.ts` | Replace `useIsMobileViewport` with `useSceneMode`; add portrait config; update scale base per mode |
| `sinewaves/Scene.tsx` | Replace `isMobile` with `mode`; update circle visibility guard; add portrait stacked positioning |

---

## Out of Scope

- Sinewaves resize distortion (layout desync on viewport resize) — separate issue, lower priority
- Sinewaves match-success animation (`matchSuccessSequence` not wired) — lower priority
- Capstone Issue 3 starburst for the non-capstone predict stages — does not occur; only capstone has a PreviewGhost + static target coincidence
- Dilations module — next module in progression; uses this Layout.tsx as its shell but is a separate planning cycle
- `scene/math.ts` orphaned `snapToGrid` export — safe to delete, separate cleanup PR
