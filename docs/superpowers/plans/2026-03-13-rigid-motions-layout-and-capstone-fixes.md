# Rigid Motions: Layout Shell + Capstone Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a reusable `Layout.tsx` shell for the Rigid Motions module (and future modules), replace the broken 280px desktop sidebar with a full-width bottom panel, add missing capstone scaffolding copy, and fix the capstone target triangle visual.

**Architecture:** New `Layout.tsx` owns all flex/grid structure via named slots; `InstrumentModule.tsx` becomes pure orchestration. A new `PromptReadout` component encapsulates the prompt animation, rendering in both mobile (above scene) and desktop (bottom-panel left) positions via responsive visibility. The bottom panel has a fixed two-row structure: formula strip row (always reserved) + controls row. Capstone target outline is fixed by disabling the fill mesh; a GSAP tween fires on match for the lock-in moment.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, GSAP, React Three Fiber

**Spec:** `docs/superpowers/specs/2026-03-13-layout-shell-and-responsive-scenes-design.md` — Workstreams 1, 3, 4

---

## Chunk 1: Foundation — Layout.tsx + PromptReadout + Capstone Copy

### Files
- Create: `src/components/modules/rigid-motions/Layout.tsx`
- Create: `src/components/modules/rigid-motions/components/PromptReadout.tsx`
- Modify: `src/components/modules/rigid-motions/rigid-motions-copy.ts`

---

### Task 1: Create `Layout.tsx`

**File:** `src/components/modules/rigid-motions/Layout.tsx`

This is a pure layout shell. No state. No imports from rigid-motions internals.

- [ ] **Step 1: Create the file**

```tsx
// src/components/modules/rigid-motions/Layout.tsx
import { type ReactNode } from 'react'

interface ModuleLayoutProps {
  statusStrip: ReactNode
  /** null → row removed from DOM; scene reclaims the space */
  prompt: ReactNode
  /** null → formula strip row is empty but its height is always reserved */
  formulaReadout: ReactNode
  visualization: ReactNode
  controls: ReactNode
  /** Overlays: WebGL recovery, celebrations, etc. */
  children?: ReactNode
}

/**
 * Eurorack faceplate layout for rigid-motions (and future geometry modules).
 *
 * Mobile (<md): flex column — status | prompt? | scene | [formula strip | controls]
 * Desktop (≥md): flex column — status | scene | [formula strip | prompt + controls]
 *
 * The bottom panel always reserves two rows so the scene height never shifts
 * when the formula readout appears at Phase 3 entry.
 *
 * The prompt slot renders in two DOM positions (mobile row above scene, desktop
 * controls-row left side) via responsive visibility. Both instances receive the
 * same React node — PromptReadout handles its own animation internally.
 */
export function ModuleLayout({
  statusStrip,
  prompt,
  formulaReadout,
  visualization,
  controls,
  children,
}: ModuleLayoutProps) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-(--lab-bg)">

      {/* ── STATUS STRIP ───────────────────────────── */}
      <header className="shrink-0 h-10 flex items-center border-b border-(--lab-border)">
        {statusStrip}
      </header>

      {/* ── PROMPT (mobile only — above scene) ─────── */}
      {/* bg-(--lab-surface) matches the existing mobile prompt row background */}
      {prompt && (
        <div className="shrink-0 bg-(--lab-surface) border-b border-(--lab-border) md:hidden">
          {prompt}
        </div>
      )}

      {/* ── VISUALIZATION ──────────────────────────── */}
      <main className="flex-1 min-h-0 relative overflow-hidden">
        {visualization}
      </main>

      {/* ── BOTTOM PANEL ───────────────────────────── */}
      <footer className="shrink-0 border-t border-(--lab-border)">

        {/* Formula strip — always two rows; this one is always reserved */}
        <div className="border-b border-(--lab-border) min-h-8">
          {formulaReadout}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-4 px-5 py-3 md:px-6">
          {/* Desktop: prompt on left side of controls row */}
          {prompt && (
            <div className="hidden md:flex flex-1 min-w-0">
              {prompt}
            </div>
          )}
          {/* Controls — full width on mobile, shrink on desktop */}
          <div className="w-full md:w-auto md:shrink-0">
            {controls}
          </div>
        </div>

      </footer>

      {/* ── OVERLAYS ───────────────────────────────── */}
      {children}

    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd C:/Users/rplap/OneDrive/Desktop/personal/creative-lab
pnpm exec tsc --noEmit
```

Expected: No errors on the new file (it has no imports from the rest of the module yet).

---

### Task 2: Create `PromptReadout` component

**File:** `src/components/modules/rigid-motions/components/PromptReadout.tsx`

This replaces the two inline `promptRef` / `promptRefDesktop` patterns in `InstrumentModule.tsx`. Each instance handles its own `fadeInReadout` animation when `text` changes. Rendering both instances in `Layout.tsx` (mobile + desktop) works correctly because each instance has its own ref.

- [ ] **Step 1: Create the file**

```tsx
// src/components/modules/rigid-motions/components/PromptReadout.tsx
import { useRef, useEffect } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'

interface PromptReadoutProps {
  label: string
  text: string
  amber?: boolean
}

/**
 * Prompt label + text with fade-in animation on text change.
 * Used in both mobile (above-scene) and desktop (bottom-panel left) positions.
 * Each instance manages its own ref and animation.
 */
export function PromptReadout({ label, text, amber = false }: PromptReadoutProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) fadeInReadout(ref.current)
  }, [text])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className="px-5 py-1.5 md:px-4 md:py-3"
    >
      <div className="mb-0.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
        {label}
      </div>
      <p className={[
        'text-sm font-medium lab-display-font',
        amber ? 'text-(--lab-earned)' : 'text-(--lab-text)',
      ].join(' ')}>
        {text}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors.

---

### Task 3: Add `CAPSTONE_PROMPT_TEXT` to copy file

**File:** `src/components/modules/rigid-motions/rigid-motions-copy.ts`

Add per-round idle-state copy for the capstone. This is the framing the student sees when they first arrive at each capstone round, before they press CHECK SEQUENCE.

Before writing, read the file to confirm current contents match expectations:

- [ ] **Step 1: Confirm `CapstoneRoundId` is already exported (line ~47)**

Read `src/components/modules/rigid-motions/rigid-motions-copy.ts`. Verify `export type CapstoneRoundId = 'capstone-1' | 'capstone-2' | 'capstone-3'` exists.

- [ ] **Step 2: Insert the record between `CAPSTONE_EARNED_REVEALS` and `CAPSTONE_COMPLETION_COPY`**

`CAPSTONE_COMPLETION_COPY` already exists at lines ~54–58, immediately after `CAPSTONE_EARNED_REVEALS`. Insert the new block **between** the closing `}` of `CAPSTONE_EARNED_REVEALS` and the start of `CAPSTONE_COMPLETION_COPY` — not after the end of the file.

```ts
/**
 * Prompt shown when the student first arrives at each capstone round (idle state).
 * Frames the task without giving away the answer.
 * capstone-3 hints at non-commutativity — the module's Level 5 pedagogical moment.
 */
export const CAPSTONE_PROMPT_TEXT: Record<CapstoneRoundId, string> = {
  'capstone-1': 'Build a sequence that maps the white triangle onto the target. One transformation is enough.',
  'capstone-2': 'This one takes two steps. Build your sequence — the order you choose determines the result.',
  'capstone-3': 'Two steps again. If your first attempt misses, try reversing the order.',
}
```

> **Note on copy:** These strings are starting points. Run through the `educational-copywriter` skill after implementation to refine register and length. The intent is: warm-up framing (capstone-1), two-step framing with order hint (capstone-2), non-commutativity nudge without spoiling (capstone-3).

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit chunk 1 foundation**

```bash
git add src/components/modules/rigid-motions/Layout.tsx \
        src/components/modules/rigid-motions/components/PromptReadout.tsx \
        src/components/modules/rigid-motions/rigid-motions-copy.ts
git commit -m "feat(rigid-motions): add Layout.tsx shell, PromptReadout component, capstone prompt copy"
```

---

## Chunk 2: InstrumentModule Refactor

### Files
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

**Before starting:** Read the full current `InstrumentModule.tsx`. The refactor touches most of the render return, so full context is essential.

---

### Task 4: Wire `InstrumentModule.tsx` to the new shell

The goal: replace the inline grid with `<ModuleLayout>`, consolidate the two `promptRef`/`promptRefDesktop` refs into zero (animation is now inside `PromptReadout`), eliminate the `<aside>`, and extend `promptText`/`promptLabel` to handle capstone idle state.

- [ ] **Step 1: Update imports**

Add two new import lines at the top of `InstrumentModule.tsx`:

```tsx
import { ModuleLayout } from './Layout'
import { PromptReadout } from './components/PromptReadout'
```

**Extend** the existing `rigid-motions-copy` import (currently line 14) to add `CAPSTONE_PROMPT_TEXT` — do not add a second import from the same path:

```tsx
// Before:
import { PROMPT_TEXT, CLOSE_COPY, EARNED_REVEALS, CAPSTONE_EARNED_REVEALS, CAPSTONE_COMPLETION_COPY, BEHIND_THIS, type CapstoneRoundId } from './rigid-motions-copy'

// After (add CAPSTONE_PROMPT_TEXT to the destructure):
import { PROMPT_TEXT, CLOSE_COPY, EARNED_REVEALS, CAPSTONE_EARNED_REVEALS, CAPSTONE_PROMPT_TEXT, CAPSTONE_COMPLETION_COPY, BEHIND_THIS, type CapstoneRoundId } from './rigid-motions-copy'
```

Remove `fadeInReadout` from the `@/lib/animation/presets` import — it is now inside `PromptReadout`.

- [ ] **Step 2: Remove the two prompt refs and their useEffect**

Delete these lines (currently ~93–98):

```tsx
const promptRef = useRef<HTMLDivElement>(null)
const promptRefDesktop = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (promptRef.current) fadeInReadout(promptRef.current)
  if (promptRefDesktop.current) fadeInReadout(promptRefDesktop.current)
}, [promptText])
```

The animation is now handled inside each `PromptReadout` instance.

Also check the `useRef` import at line 7 — if `promptRef` and `promptRefDesktop` were the **only** `useRef` usages, remove `useRef` from the React import destructure. If `useRef` is used elsewhere in the file (e.g., for `contextLost` or keyboard state), keep it. The TypeScript build in Step 7 will flag it as an unused import if it needs removing.

- [ ] **Step 3: Extend `promptText` to handle capstone idle state**

Find the current `promptText` derivation (currently ~78–84). Replace it:

```tsx
const promptText = (() => {
  if (guideState === 'capstone' && feedbackState === 'idle')
    return CAPSTONE_PROMPT_TEXT[capstoneRound.id as CapstoneRoundId]
  if (firstMatch && earnedRevealText) return earnedRevealText
  if (repeatMatch)  return 'Match.'
  if (isMiss)       return 'Not quite — adjust your position.'
  if (isClose)      return CLOSE_COPY[guideState] ?? 'Getting closer.'
  return PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.'
})()
```

- [ ] **Step 4: Update `promptLabel` to include capstone**

Find the current `promptLabel` derivation (~86–92). Replace it:

```tsx
const promptLabel =
  guideState === 'capstone'          ? 'Build' :
  guideState === 'coordinate-reveal' ? 'Reveal' :
  isCoordinateStage(guideState)      ? 'Coordinate Rule' :
  firstMatch                         ? 'Discovered' :
  isMiss || isClose                  ? 'Hint' :
  'Predict'
```

- [ ] **Step 5: Replace the render return**

Replace the entire `return (...)` block with:

```tsx
return (
  <ModuleLayout
    statusStrip={
      /* Layout.tsx already wraps this in <header> — use a fragment here, not another <header> */
      <div className="flex items-center w-full pl-2 pr-5 md:pl-4 md:pr-6">
        {/* Left: back chevron */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to module list"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-(--lab-text-muted) transition-colors duration-150 hover:text-(--lab-text) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Title (desktop only) */}
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

        {/* Right: invisible spacer to balance title on left */}
        <span
          className="hidden shrink-0 lab-silk lab-display-font font-bold md:block invisible"
          aria-hidden
        >
          Rigid Motions
        </span>
      </div>
    }
    prompt={
      <PromptReadout
        label={promptLabel}
        text={promptText}
        amber={firstMatch}
      />
    }
    formulaReadout={showFormulaReadout ? (
      <FormulaReadout
        round={currentRound}
        ghostVertices={liveGhostVertices}
        feedbackState={feedbackState}
      />
    ) : null}
    visualization={
      <>
        <RigidMotionsScene
          ghostOffset={ghostOffset}
          onGhostMove={handleGhostMove}
          guideState={guideState}
          feedbackState={feedbackState}
          currentRound={currentRound}
          flipped={flipped}
          rotationDegrees={rotationDegrees}
          rotationDirection={rotationDirection}
          coordinatesActive={coordinatesActive}
          onAnimationComplete={handleAnimationComplete}
          capstoneSequence={capstoneSequence}
          capstoneTargetVertices={capstoneRound.targetVertices}
          onContextLost={() => setContextLost(true)}
          onContextRestored={() => setContextLost(false)}
        />
        {contextLost && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-(--lab-bg)/90 z-10">
            <span className="lab-silk lab-display-font text-(--lab-text-muted)">
              SYS:REC — Visualization paused
            </span>
            <button
              type="button"
              onClick={() => setContextLost(false)}
              className="min-h-[44px] border border-(--lab-border) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus:ring-2 focus:ring-(--lab-accent)"
            >
              Tap to Resume
            </button>
          </div>
        )}
      </>
    }
    controls={
      <ControlStrip
        guideState={guideState}
        feedbackState={feedbackState}
        flipped={flipped}
        rotationDegrees={rotationDegrees}
        rotationDirection={rotationDirection}
        onCheck={handleCheck}
        onNext={handleNext}
        onReset={handleReset}
        onFlip={handleFlip}
        onRotation={handleRotation}
        capstoneSequence={capstoneSequence}
        onSequenceChange={handleSequenceChange}
        onCheckSequence={handleCheckSequence}
        onCapstoneNext={handleCapstoneNext}
      />
    }
  />
)
```

- [ ] **Step 6: Run TypeScript check**

```bash
pnpm exec tsc --noEmit
```

Expected: No errors. If there are unused import errors, remove the imports flagged (e.g., `fadeInReadout` if not removed in Step 1).

- [ ] **Step 7: Run the full build**

```bash
pnpm build
```

Expected: Clean build. `tsc -b` (used by build) enforces `noUnusedLocals` — any leftover unused variables from the refactor will surface here.

- [ ] **Step 8: Visual verification in dev server**

```bash
pnpm dev
```

Navigate to Rigid Motions module. Check:
- [ ] Mobile viewport (375px wide): prompt is visible above scene with `bg-(--lab-surface)` background, scene fills remaining height
- [ ] Capstone on mobile: "Build" label + capstone-1 copy row appears above scene (prompt is never null after this refactor — capstone now always has copy), sequence builder in footer
- [ ] Desktop (1024px+): scene is full viewport width, prompt on left in bottom panel controls row, controls on right
- [ ] Desktop capstone: "Build" + capstone-1 copy on left, SequenceBuilder on right
- [ ] Phase 3 (coordinate-reveal or predict-with-coordinates): formula strip row shows FormulaReadout
- [ ] Phase 1–2: formula strip row is empty but reserves space (no layout shift when Phase 3 activates)

- [ ] **Step 9: Run existing tests**

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: All tests pass. These tests cover pure math/logic functions — no layout tests.

- [ ] **Step 10: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "refactor(rigid-motions): wire Layout.tsx shell, consolidate prompt, extend capstone copy"
```

---

## Chunk 3: Capstone Target Visual Fix

### Files
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`

**Before starting:** Read `RigidMotionsScene.tsx` in full. Find the capstone target triangle rendering — it's a group that renders `capstoneTargetVertices` as a filled mesh + outline. Search for `capstoneTarget` or `targetVertices` in the file to locate it.

---

### Task 5: Make capstone target outline-only

The capstone target currently renders a `meshBasicMaterial` fill (opacity ~0.18) plus a `lineBasicMaterial` outline. The fill creates the starburst when `PreviewGhost` coincides with it. Fix: hide the fill mesh.

- [ ] **Step 1: Locate the capstone target fill mesh in `RigidMotionsScene.tsx`**

Search for `CapstoneTarget` in `RigidMotionsScene.tsx` and locate the fill mesh inside it. The actual code uses `color="#7cc87c"` (hardcoded accent hex), not `colors.ghost`. It will look something like:

```tsx
<mesh geometry={targetFillGeom}>
  <meshBasicMaterial color="#7cc87c" transparent opacity={0.18} />
</mesh>
```

Note the exact line numbers before editing.

- [ ] **Step 2: Disable the fill by adding `visible={false}`**

Change:
```tsx
<mesh geometry={targetFillGeom}>
  <meshBasicMaterial color={colors.ghost} transparent opacity={0.18} />
</mesh>
```

To:
```tsx
<mesh geometry={targetFillGeom} visible={false}>
  <meshBasicMaterial color={colors.ghost} transparent opacity={0.18} />
</mesh>
```

`visible={false}` is cheaper than opacity-0 for Three.js geometry that will never be shown again in this state.

- [ ] **Step 3: Verify the outline still renders**

The `lineBasicMaterial` outline mesh immediately adjacent should remain untouched. Confirm it is dashed (using `LineDashedMaterial` or a dash pattern) in `--lab-ghost` color. If it is solid, this is acceptable — the outline-only approach works with either solid or dashed.

- [ ] **Step 4: Build and visual check**

```bash
pnpm build
pnpm dev
```

Navigate to capstone stage. Build sequence capstone-2 (REF Y-AXIS → TRANSLATE +2,+3) until the PreviewGhost lands on the target.

Check:
- [ ] Target no longer has a filled interior — only the outline is visible
- [ ] PreviewGhost (filled, accent-colored) is clearly readable when coincident with target outline
- [ ] No starburst/overlap visual chaos at coincidence

---

### Task 6: Add lock-in flash animation on match

When `feedbackState` transitions to `'match'` in capstone, briefly flash the target outline from ghost color to accent and back. This signals "locked in" before NEXT appears.

**Important:** `CapstoneTarget` is a self-contained component that currently only receives `{ vertices }` as a prop. `feedbackState` is not available inside it. This task adds `feedbackState` as a new prop to `CapstoneTarget` so the animation can fire from inside that component where the material ref lives.

- [ ] **Step 1: Add `feedbackState` prop to `CapstoneTarget`**

Find the `CapstoneTarget` component definition in `RigidMotionsScene.tsx`. It currently accepts only `{ vertices }`. Extend its props interface to include `feedbackState`:

```tsx
// Before:
function CapstoneTarget({ vertices }: { vertices: [number, number][] }) {

// After:
function CapstoneTarget({
  vertices,
  feedbackState,
}: {
  vertices: [number, number][]
  feedbackState: FeedbackState
}) {
```

`FeedbackState` is already imported in `RigidMotionsScene.tsx` (from `'../types'`).

Find where `<CapstoneTarget />` is rendered in `Visualization` and pass the new prop:

```tsx
// Before:
<CapstoneTarget vertices={capstoneTargetVertices} />

// After:
<CapstoneTarget vertices={capstoneTargetVertices} feedbackState={feedbackState} />
```

- [ ] **Step 2: Add a ref for the outline material and set its initial color to ghost**

Inside `CapstoneTarget`, add a ref for the outline material:

```tsx
const targetOutlineRef = useRef<THREE.LineBasicMaterial>(null)
```

The current outline `lineBasicMaterial` uses `color="#7cc87c"` (accent green). Change it to `colors.ghost` so the flash tween goes ghost → accent → ghost as intended, and attach the ref:

```tsx
// Before:
<lineBasicMaterial color="#7cc87c" />

// After:
<lineBasicMaterial ref={targetOutlineRef} color={colors.ghost} />
```

`colors` may not be imported in `RigidMotionsScene.tsx`. If not, add at the top:
```tsx
import { colors } from '@/lib/colors'
```

- [ ] **Step 4: Add the lock-in useEffect inside `CapstoneTarget`**

Inside `CapstoneTarget` (after the ref declaration), add:

```tsx
useEffect(() => {
  if (feedbackState !== 'match' || !targetOutlineRef.current) return
  const mat = targetOutlineRef.current
  const accent = new THREE.Color(colors.accent.primary)
  const ghost  = new THREE.Color(colors.ghost)

  gsap.to(mat.color, {
    r: accent.r, g: accent.g, b: accent.b,
    duration: 0.15,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to(mat.color, {
        r: ghost.r, g: ghost.g, b: ghost.b,
        duration: 0.25,
        delay: 0.1,
        ease: 'power2.in',
      })
    },
  })
}, [feedbackState])
```

Note: no `onUpdate` callbacks are needed. R3F's render loop reads `material.color` directly each frame — `needsUpdate = true` is only for shader recompile, not runtime color changes.

Verify `gsap` is imported at the top of `RigidMotionsScene.tsx`. If not, add:
```tsx
import gsap from 'gsap'
```

`useRef`, `useEffect`, and `THREE` are already imported in `RigidMotionsScene.tsx`.

- [ ] **Step 3: Build and visual check**

```bash
pnpm build
pnpm dev
```

Navigate to capstone. Build a correct sequence and press CHECK SEQUENCE.

Check:
- [ ] On match: target outline briefly flashes accent green (~150ms), then returns to ghost color (~250ms)
- [ ] The flash is subtle — a "click" not a full celebration
- [ ] No TypeScript errors, no console warnings about material updates

- [ ] **Step 4: Run all rigid-motions tests**

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: All pass. The visual change does not affect any math/logic tests.

- [ ] **Step 5: Final build check**

```bash
pnpm build
```

Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
git commit -m "fix(rigid-motions): capstone target outline-only + lock-in flash on match"
```

---

## Done

All three chunks complete. The rigid-motions module now has:
- A reusable `Layout.tsx` shell (ready for Dilations to inherit)
- Full-width scene on desktop with prompt + controls in bottom panel
- Capstone framing copy for all three rounds
- Clean target visual on sequence match
