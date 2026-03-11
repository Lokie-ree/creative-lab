# Navigation Refactor & Polish — Design

**Date:** 2026-03-10
**Scope:** Remove EscapeHatch, add back chevron to rigid-motions status strip, fix prompt-strip empty space, add A′B′C′ labels to confirmed ImageShape, tighten control strip padding on small viewports.

---

## Item A — Navigation: Remove EscapeHatch, Add Back Chevron

### Decision
Replace the floating EscapeHatch LAB dropdown with an inline back chevron in the rigid-motions status strip, matching the pattern already used throughout the journey (CourseHub, Constellation back buttons).

### App.tsx changes
- Remove `EscapeHatch` import and render block
- Remove `handleSkipToEnd` callback and `skippedToEnd` state (skip-to-end is a developer bypass; module completion is the real path to celebration)
- Stop passing `skipped` prop to `CelebrationModal` (it already defaults to `false`)

### InstrumentModule.tsx changes
- Accept `onBack` from `ModuleProps` (prop is already passed from DynamicModule → was previously ignored)
- Add `ChevronLeft` button in the status strip header, left side
  - Mobile: positioned left of the LED bar, 44px touch target
  - Desktop: replaces the invisible left-side spacer — chevron takes that left slot, matching the right-side invisible spacer pattern but with a real interactive element
- Remove `pl-20` from the header (that padding was clearing the floating EscapeHatch button)
- Mobile header left padding becomes `pl-3` (balanced with `pr-5`)

### EscapeHatch.tsx
- Delete the file — no remaining consumers

---

## Item C1 — Prompt Strip Empty Space

### Problem
On mobile portrait, when `showFormulaReadout` is false, grid row 3 renders `<div aria-hidden className="md:hidden" />` — an empty element that collapses to 0 height but may still introduce a trace of spacing depending on browser. The looser feeling is likely caused by the capstone empty placeholder in row 2 combined with the formula placeholder in row 3 both occupying grid rows simultaneously.

### Fix
Replace empty div placeholders with `null`. CSS grid `auto` rows with `null` content collapse completely. Specifically:
- `{!showFormulaReadout && <div aria-hidden className="md:hidden" />}` → remove (render nothing when formula is not shown)
- The capstone row-2 placeholder `<div aria-hidden className="md:hidden" />` → replace with `null`

---

## Item C2 — A′B′C′ Labels on Confirmed ImageShape

### Decision
After the reveal animation completes, render `SpriteLabel` at each final vertex position with labels A′, B′, C′ so students can trace A→A′, B→B′, C→C′.

### Timing
Labels appear after animation (0.6s GSAP), not during. During animation the ghost + animating image are both visible — adding labels mid-motion is noisy.

### Implementation
- Add `const [labelsDone, setLabelsDone] = useState(false)` to `ImageShape`
- In the GSAP `onComplete` callback, call both `onAnimationComplete()` and `setLabelsDone(true)`
- When `labelsDone`, render `SpriteLabel` for each vertex at `vertexLabelOffset(v, centroid, 0.5)` offset position, color `#7cc87c`, planeWidth `0.55`
- Import: `SpriteLabel` from `./scene-primitives`; `vertexLabelOffset` from `./scene-math`; `centroidOf` from `../transform-math`
- Label strings: `['A′', 'B′', 'C′']` (unicode prime ′ U+2032)

---

## Item C3 — Control Strip Padding on Small Viewports

### Problem
The mobile footer wrapper uses `py-2` (8px top/bottom). On portrait tablets below the `md:` breakpoint (~600–767px), this feels cramped — especially the SequenceBuilder capstone view.

### Fix
Bump footer to `py-3` uniformly. The desktop sidebar already uses `py-3`, so this makes the two layouts consistent.

---

## What Must NOT Change

- `CelebrationModal` `skipped` prop and `DiscoveryTab` logic — leave the prop, just stop passing it (it defaults to `false`)
- `FormulaReadout` coordinate display
- Pre-image A/B/C labels in `RigidMotionsScene`
- Existing LED progress dot layout and semantics
- `onBack` already being passed from `App.tsx → DynamicModule → InstrumentModule` (prop exists, just ignored)

---

## Verification Checklist

- [ ] No EscapeHatch visible anywhere in the app
- [ ] Back chevron in rigid-motions status strip — tappable, 44px, calls `onBack`
- [ ] Back chevron navigates to constellation
- [ ] Status strip header has no excess left padding on mobile (no `pl-20` gap)
- [ ] Desktop layout: left column is scene, right sidebar unchanged
- [ ] Mobile portrait: no visible gap in prompt/formula area between phases
- [ ] After CHECK reveals image, A′B′C′ labels appear at confirmed vertex positions
- [ ] A′ label is at the vertex that was A, B′ at B, C′ at C
- [ ] Control strip footer has `py-3` — not cramped on small viewports
- [ ] `pnpm build` passes with no TypeScript errors
