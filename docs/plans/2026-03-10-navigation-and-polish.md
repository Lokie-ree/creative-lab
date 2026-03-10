# Navigation Refactor & Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the floating EscapeHatch dropdown with an inline back chevron in the rigid-motions status strip, remove associated dead code, fix the mobile prompt-strip empty-space issue, add A′B′C′ vertex labels to the confirmed image after reveal, and tighten the control-strip footer padding.

**Architecture:** All changes are confined to four files: `App.tsx` (EscapeHatch removal + dead-code cleanup), `InstrumentModule.tsx` (back chevron, empty-div cleanup, footer padding), `ImageShape.tsx` (post-animation vertex labels), and `EscapeHatch.tsx` (deleted). No new files. No shared-component changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, React Three Fiber (`@react-three/fiber`), GSAP, Lucide React (ChevronLeft icon).

---

## Chunk 1: Commit stale docs + EscapeHatch removal

### Task 1: Commit stale plan docs from previous session

The previous session left two untracked docs files. Commit them as archived plans before writing new commits.

**Files:**
- Stage: `docs/plans/2026-03-09-rigid-motions-polish-layout-design.md`
- Stage: `docs/plans/2026-03-09-rigid-motions-polish-layout.md`

- [ ] **Step 1: Verify files are untracked**

```bash
git status --short docs/
```

Expected output includes:
```
?? docs/plans/2026-03-09-rigid-motions-polish-layout-design.md
?? docs/plans/2026-03-09-rigid-motions-polish-layout.md
```

- [ ] **Step 2: Stage and commit the stale docs**

```bash
git add docs/plans/2026-03-09-rigid-motions-polish-layout-design.md \
        docs/plans/2026-03-09-rigid-motions-polish-layout.md
git commit -m "docs: archive rigid-motions polish-layout design spec and plan from 2026-03-09"
```

---

### Task 2: Remove EscapeHatch from App.tsx and delete the component

EscapeHatch is a fixed-position dropdown ("LAB") that let users navigate back or skip to the celebration modal. We're replacing its "back" function with an inline chevron in the status strip (Task 3). The "skip to end" bypass is being removed entirely — students reach the celebration by completing the module.

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/components/layout/EscapeHatch.tsx`

- [ ] **Step 1: Read App.tsx to confirm current structure**

Read `src/App.tsx`. Confirm:
- Line 9: `import { EscapeHatch } from "./components/layout/EscapeHatch"`
- `handleSkipToEnd` callback (~line 151)
- `skippedToEnd` state (~line 90)
- `showCelebration` call in `handleModuleComplete` sets `setSkippedToEnd(false)` (~line 122)
- EscapeHatch render block (~lines 274–281): conditional on `view === 'module' && !showCelebration && activeModuleId !== 'sinewaves'`
- `skipped={skippedToEnd}` passed to `CelebrationModal` (~line 288)

- [ ] **Step 2: Remove EscapeHatch import**

In `src/App.tsx`, delete line:
```ts
import { EscapeHatch } from "./components/layout/EscapeHatch"
```

- [ ] **Step 3: Remove skippedToEnd state**

Delete:
```ts
const [skippedToEnd, setSkippedToEnd] = useState(false)
```

- [ ] **Step 4: Remove handleSkipToEnd callback**

Delete the entire `handleSkipToEnd` callback:
```ts
// Skip to end (from escape hatch)
const handleSkipToEnd = useCallback(() => {
  setSkippedToEnd(true)
  setCelebrationTab("deeper")
  setShowCelebration(true)
}, [])
```

- [ ] **Step 5: Remove setSkippedToEnd(false) from handleModuleComplete**

In `handleModuleComplete`, delete:
```ts
setSkippedToEnd(false)
```

Also delete `setSkippedToEnd(false)` from `handleBackToConstellation` if present.

- [ ] **Step 6: Remove skipped prop from CelebrationModal**

In the `<CelebrationModal>` JSX, delete the `skipped={skippedToEnd}` prop line. The prop defaults to `false` — no other changes needed in CelebrationModal.

- [ ] **Step 7: Remove the Navigation comment about EscapeHatch**

Find the comment on the `<Navigation>` element:
```tsx
{/* Navigation back button hidden - EscapeHatch handles navigation */}
```
Replace with:
```tsx
{/* Navigation back button hidden - module status strip handles back navigation */}
```

- [ ] **Step 8: Remove the EscapeHatch render block**

Delete the entire block (roughly lines 274–281):
```tsx
{/* Escape hatch - only visible in module view, not during celebration */}
{/* Hidden for sinewaves - Observatory HUD has its own status strip */}
{view === "module" && !showCelebration && activeModuleId !== "sinewaves" && (
  <EscapeHatch
    onBackToStart={handleBackToConstellation}
    onSkipToEnd={handleSkipToEnd}
  />
)}
```

- [ ] **Step 9: Delete EscapeHatch component file**

```bash
rm src/components/layout/EscapeHatch.tsx
```

- [ ] **Step 10: Build check**

```bash
pnpm build
```

Expected: No TypeScript errors. If `handleSkipToEnd` or `skippedToEnd` appear in unused-variable errors, ensure all references were removed. Fix any remaining references.

- [ ] **Step 11: Commit**

```bash
git add src/App.tsx
git rm src/components/layout/EscapeHatch.tsx
git commit -m "refactor: remove EscapeHatch — back navigation moves to module status strips"
```

---

## Chunk 2: Back chevron in rigid-motions status strip

### Task 3: Add ChevronLeft back button to rigid-motions InstrumentModule

The rigid-motions `InstrumentModule` receives `onBack` from `ModuleProps` but currently ignores it (the function signature only destructures `onComplete`). We'll accept `onBack` and render a `ChevronLeft` button in the status strip.

The current status strip header has `pl-20` on mobile — that padding was clearing the now-deleted EscapeHatch floating button. Remove it.

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

Reference: Sinewaves `InstrumentModule.tsx` → `StatusStrip` for the back-chevron visual pattern (though sinewaves uses a separate `StatusStrip` component; here the strip is inlined).

- [ ] **Step 1: Read InstrumentModule.tsx lines 22 and 145–186**

Confirm:
- Line 22: `export function InstrumentModule({ onComplete }: ModuleProps)` — `onBack` is not destructured
- Line 149: `<header className="flex items-center border-b border-(--lab-border) pl-20 pr-5 md:col-span-2 md:pl-6 md:pr-6">`
- Lines 151–185: the title span, LED dots, right spacer span structure

- [ ] **Step 2: Add onBack to the function signature**

Change:
```tsx
export function InstrumentModule({ onComplete }: ModuleProps) {
```
To:
```tsx
export function InstrumentModule({ onComplete, onBack }: ModuleProps) {
```

- [ ] **Step 3: Add ChevronLeft import**

At the top of the file, add:
```ts
import { ChevronLeft } from 'lucide-react'
```

- [ ] **Step 4: Replace the status strip header**

Replace the entire `<header>` element (the one with `pl-20`) with:

```tsx
{/* ── ROW 1: STATUS STRIP ─────────────────────────────── */}
<header className="flex items-center border-b border-(--lab-border) pl-2 pr-5 md:col-span-2 md:pl-4 md:pr-6">
  {/* Left: back chevron (all sizes) */}
  <button
    type="button"
    onClick={onBack}
    aria-label="Back to module list"
    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-(--lab-text-muted) transition-colors duration-150 hover:text-(--lab-text) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
  >
    <ChevronLeft className="h-4 w-4" />
  </button>

  {/* Title (desktop only) — sits right of chevron */}
  <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
    Rigid Motions
  </span>

  {/* Center: progress LEDs */}
  {guideState !== 'capstone' ? (
    <div
      className="flex flex-1 items-center justify-center gap-1"
      aria-label={`Step ${currentGuideIndex + 1} of ${GUIDE_STATE_TOTAL}`}
    >
      {Array.from({ length: GUIDE_STATE_TOTAL }, (_, i) => (
        <span
          key={i}
          className={[
            'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
            i < currentGuideIndex
              ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
              : i === currentGuideIndex
                ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
                : 'bg-(--lab-border) border-(--lab-led-upcoming-border)',
          ].join(' ')}
        />
      ))}
    </div>
  ) : (
    <div className="flex-1" aria-hidden />
  )}

  {/* Right: invisible spacer (desktop only) — balances title+chevron on the left */}
  <span
    className="hidden shrink-0 lab-silk lab-display-font font-bold md:block invisible"
    aria-hidden
  >
    Rigid Motions
  </span>
</header>
```

**Why this layout works:**
- Mobile: `[chevron][      LEDs centered      ][spacer hidden]` — chevron on left, LEDs appear centered in the remaining space (they use `flex-1 justify-center` so they center within their flex item, not the full header)
- Desktop: `[chevron][title][      LEDs centered      ][invisible title spacer]` — chevron + title on left, spacer on right makes the total left and right weights equal, so LEDs truly center

- [ ] **Step 5: Build check**

```bash
pnpm build
```

Expected: No TypeScript errors.

- [ ] **Step 6: Visual smoke test**

```bash
pnpm dev
```

Navigate to Rigid Motions. Verify:
- Back chevron visible in status strip on mobile widths
- Tapping/clicking chevron navigates back to constellation
- No leftward gap from the old `pl-20` padding
- LEDs appear centered in the strip

- [ ] **Step 7: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat: add back chevron to rigid-motions status strip — remove pl-20 EscapeHatch clearance"
```

---

## Chunk 3: Layout polish (prompt space + footer padding)

### Task 4: Remove empty div placeholders from grid rows 2 and 3

The mobile layout grid (`grid-rows-[2.5rem_auto_auto_1fr_auto]`) has rows 2 and 3 as `auto`. When those rows contain only empty `<div>` elements (no padding, no content), they still exist as box-model nodes. In CSS grid, `auto` rows with no content should collapse, but an empty `<div>` with no height may behave differently across browsers. Replace them with `null`.

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

- [ ] **Step 1: Locate the two empty placeholders**

In `InstrumentModule.tsx`, find:

1. Row 2 capstone placeholder (~line 206):
```tsx
) : <div aria-hidden className="md:hidden" />}
```

2. Row 3 formula placeholder (~line 218):
```tsx
{!showFormulaReadout && <div aria-hidden className="md:hidden" />}
```

- [ ] **Step 2: Replace row 2 capstone placeholder with null**

Change:
```tsx
) : <div aria-hidden className="md:hidden" />}
```
To:
```tsx
) : null}
```

- [ ] **Step 3: Remove the row 3 formula placeholder entirely**

Delete:
```tsx
{!showFormulaReadout && <div aria-hidden className="md:hidden" />}
```

The `{showFormulaReadout && <div className="md:hidden"><FormulaReadout .../></div>}` line above it remains. When `showFormulaReadout` is false, nothing is rendered for row 3 — the grid row collapses.

- [ ] **Step 4: Build check**

```bash
pnpm build
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "fix: remove empty grid-row placeholders in rigid-motions mobile layout"
```

---

### Task 5: Tighten control strip footer padding

The mobile footer `<footer>` wrapper uses `py-2` (8px vertical). On portrait tablets below the `md:` breakpoint (600–767px), this feels cramped. The desktop sidebar already uses `py-3`. Match them.

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

- [ ] **Step 1: Locate the footer element**

Find (~line 256):
```tsx
<footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2 md:hidden">
```

- [ ] **Step 2: Bump py-2 to py-3**

Change:
```tsx
<footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-3 md:hidden">
```

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "fix: bump rigid-motions control strip footer padding py-2 → py-3"
```

---

## Chunk 4: A′B′C′ vertex labels on confirmed ImageShape

### Task 6: Add A′B′C′ labels to ImageShape after reveal animation

After the GSAP reveal animation completes, students should see A′, B′, C′ labels at each confirmed vertex so they can map A→A′, B→B′, C→C′.

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/ImageShape.tsx`

Reference for the pattern:
- `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx` → `PreImageTriangle` function — uses `SpriteLabel` with `vertexLabelOffset` to position A/B/C labels on the pre-image triangle. This is exactly the pattern to replicate.
- `src/components/modules/rigid-motions/scene/scene-primitives.tsx` → `SpriteLabel` component signature
- `src/components/modules/rigid-motions/scene/scene-math.ts` → `vertexLabelOffset(v, centroid, margin)` returns `[x, y]`
- `src/components/modules/rigid-motions/transform-math.ts` → `centroidOf(verts)` returns `[x, y]`

The prime character is `′` (U+2032 PRIME), not `'` (apostrophe).

- [ ] **Step 1: Read ImageShape.tsx in full**

Read `src/components/modules/rigid-motions/scene/ImageShape.tsx`. Confirm:
- `onAnimationComplete` is called inside the GSAP `tl.onComplete` callback (line ~92)
- The component has `vertsRef` for the animated vertex positions
- `vertices` prop holds the final (target) vertex positions as `[number, number][]`
- No `useState` is currently imported

- [ ] **Step 2: Add imports**

Add to the import block at the top:
```ts
import { useRef, useEffect, useState } from 'react'
import { SpriteLabel } from './scene-primitives'
import { vertexLabelOffset } from './scene-math'
import { centroidOf } from '../transform-math'
```

Note: `useRef` and `useEffect` are already imported — only add `useState`, `SpriteLabel`, `vertexLabelOffset`, and `centroidOf`.

- [ ] **Step 3: Add labelsDone state**

Inside `ImageShape`, after the existing `useRef` declarations, add:
```ts
const [labelsDone, setLabelsDone] = useState(false)
```

- [ ] **Step 4: Call setLabelsDone in the GSAP onComplete**

Find the GSAP `tl` setup (the `useEffect` that runs once on mount). Change the `onComplete` in the timeline options:

```ts
// Before:
const tl = gsap.timeline({ onComplete: onAnimationComplete })

// After:
const tl = gsap.timeline({
  onComplete: () => {
    onAnimationComplete()
    setLabelsDone(true)
  },
})
```

- [ ] **Step 5: Define label constants above the return**

Add before the `return` statement:
```ts
const IMAGE_VERTEX_LABELS = ['A′', 'B′', 'C′'] as const
```

- [ ] **Step 6: Render SpriteLabels in the group**

In the `return` JSX, add the labels after the `<lineLoop>`:

```tsx
return (
  <group>
    {/* Fill — geometry managed imperatively via fillGeo ref */}
    <mesh ref={meshRef}>
      <meshBasicMaterial color="#7cc87c" transparent opacity={0.18} />
    </mesh>

    {/* Outline — geometry managed imperatively via outlineGeo ref */}
    <lineLoop ref={outlineRef}>
      <lineBasicMaterial color="#7cc87c" />
    </lineLoop>

    {/* A′B′C′ labels — appear after reveal animation completes */}
    {labelsDone && (() => {
      const centroid = centroidOf(vertices)
      return vertices.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <SpriteLabel
            key={IMAGE_VERTEX_LABELS[idx]}
            text={IMAGE_VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            color="#7cc87c"
            anchorX="center"
            anchorY="middle"
            planeWidth={0.55}
          />
        )
      })
    })()}
  </group>
)
```

- [ ] **Step 7: Build check**

```bash
pnpm build
```

Expected: No TypeScript errors. If `centroidOf` or `vertexLabelOffset` return type errors, check that `vertices` is `[number, number][]` (it should be — it matches `PRE_IMAGE_VERTICES` shape).

- [ ] **Step 8: Visual smoke test**

```bash
pnpm dev
```

Navigate to Rigid Motions. On any transformation stage, position the ghost at the target and press CHECK. Verify:
- The green confirmed image triangle animates in
- After the animation (~0.6s), A′, B′, C′ labels appear at the three vertices
- Labels are green (`#7cc87c`), offset outward from the triangle
- A′ corresponds to the vertex that A (the pre-image vertex labeled A) mapped to

- [ ] **Step 9: Commit**

```bash
git add src/components/modules/rigid-motions/scene/ImageShape.tsx
git commit -m "feat: add A′B′C′ vertex labels to confirmed ImageShape after reveal animation"
```

---

## Chunk 5: Final verification + commit new docs + push

### Task 7: Commit new plan docs, run full build, push all unpushed branches

- [ ] **Step 1: Run full build**

```bash
pnpm build
```

Expected: Zero TypeScript errors, zero unused-variable warnings.

- [ ] **Step 2: Commit design doc and implementation plan**

```bash
git add docs/plans/2026-03-10-navigation-and-polish-design.md \
        docs/plans/2026-03-10-navigation-and-polish.md
git commit -m "docs: add navigation-and-polish design spec and implementation plan"
```

- [ ] **Step 3: Check which branches have not been pushed**

```bash
git branch -vv
```

Look for branches with no `[origin/...]` tracking info, or branches ahead of their remote. Note them.

- [ ] **Step 4: Push current feature branch**

```bash
git push -u origin feature/rigid-motions-polish-layout
```

- [ ] **Step 5: Push main branch if it has unpushed commits**

```bash
git checkout main
git push origin main
git checkout feature/rigid-motions-polish-layout
```

- [ ] **Step 6: Verify final git log**

```bash
git log --oneline -8
```

Expected: Commits in this order (newest first):
1. docs: add navigation-and-polish design spec and implementation plan
2. feat: add A′B′C′ vertex labels to confirmed ImageShape after reveal animation
3. fix: bump rigid-motions control strip footer padding py-2 → py-3
4. fix: remove empty grid-row placeholders in rigid-motions mobile layout
5. feat: add back chevron to rigid-motions status strip — remove pl-20 EscapeHatch clearance
6. refactor: remove EscapeHatch — back navigation moves to module status strips
7. docs: archive rigid-motions polish-layout design spec and plan from 2026-03-09

---

## Verification Checklist

- [ ] `pnpm build` passes with no errors
- [ ] No EscapeHatch LAB button visible anywhere in the app
- [ ] Back chevron in rigid-motions status strip — 44px touch target, tapping navigates to constellation
- [ ] Status strip has no excess left gap on mobile (no `pl-20`)
- [ ] Desktop layout unchanged — scene left, sidebar right
- [ ] Sinewaves unaffected — its own StatusStrip and navigation unchanged
- [ ] Mobile portrait: no visible empty gap in prompt/formula area between phases
- [ ] Control strip footer has slightly more breathing room on small viewports
- [ ] After CHECK + successful match, A′B′C′ labels appear at confirmed vertices
- [ ] Labels are green, properly offset outward from the triangle
- [ ] A′ is at the vertex A mapped to, B′ at B, C′ at C
- [ ] All three transformation types (translate, reflect, rotate) show labels correctly
- [ ] Celebration modal still reachable via module completion (all tabs accessible)
