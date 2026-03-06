# Rigid Motions UX Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply 15 targeted UX polish changes to the rigid motions module to make it conference-ready for ISTE Live 2026.

**Architecture:** Changes are organized from lowest-risk to highest-risk. Tasks 1–2 are pure CSS/config with zero logic. Task 3 adds a read-only progress indicator. Tasks 4–5 wire existing copy that was defined but never rendered. Task 6 removes design system violations. Execute in order; each task is independently committable.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, React Three Fiber, GSAP. Tests via Vitest (`pnpm vitest run`). Build via `pnpm build` (runs `tsc -b` — stricter than `tsc --noEmit`).

**Design spec:** `docs/plans/2026-03-06-rigid-motions-ux-polish-design.md`

---

## Task 1: Scene Space — Camera Centering + Tighter Zoom

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx` (line 527)
- Modify: `src/components/modules/rigid-motions/scene/scene-layout.ts` (line 23)

**Context:**
The camera sits at `[0, 2, 10]` — the Y=2 offset was from an old Q1-centered triangle. The pre-image now spans Q2/Q3. With the camera centered at Y=0, content fills the viewport better.

The zoom currently fits `GRID_RANGE * 2 = 18` world units across the shorter side. All shapes and labels live within `CONTENT_RANGE = 6` (±6). Fitting `(CONTENT_RANGE + 1) * 2 = 14` units makes the triangle visibly larger without clipping anything.

**Step 1: Fix camera position**

In `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`, find line 527:
```tsx
camera={{ position: [0, 2, 10] }}
```
Change to:
```tsx
camera={{ position: [0, 0, 10] }}
```

**Step 2: Fix zoom calculation**

In `src/components/modules/rigid-motions/scene/scene-layout.ts`:

Current imports (line 3):
```ts
import { GRID_RANGE } from '../constants'
```
Change to:
```ts
import { GRID_RANGE, CONTENT_RANGE } from '../constants'
```

Current zoom (line 23):
```ts
const zoom = shorterSide / (GRID_RANGE * 2)
```
Change to:
```ts
const zoom = shorterSide / ((CONTENT_RANGE + 1) * 2)
```

Also update the comment on line 21 from:
```ts
  // Orthographic zoom: pixels per world unit, fitted to the shorter side
  // so the full grid is always visible regardless of aspect ratio.
```
to:
```ts
  // Orthographic zoom: pixels per world unit, fitted to CONTENT_RANGE+1
  // so all shapes and labels are visible with breathing room at the grid edge.
```

**Step 3: Verify CONTENT_RANGE is exported from constants**

Check `src/components/modules/rigid-motions/constants.ts` — `CONTENT_RANGE` should already be exported. Confirm with a quick read; no change needed.

**Step 4: Build**

```bash
pnpm build
```
Expected: `✓ built in ~20s`, zero TypeScript errors.

**Step 5: Visual check**

```bash
pnpm dev
```
Navigate to rigid motions. The triangle should appear larger; origin should be roughly centered in the viewport. Ghost starts in Q4, which should still be visible.

**Step 6: Commit**

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx \
        src/components/modules/rigid-motions/scene/scene-layout.ts
git commit -m "feat(rigid-motions): center camera and tighten zoom for more scene space"
```

---

## Task 2: Chrome Tightening

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`
- Modify: `src/components/modules/rigid-motions/scene/FormulaReadout.tsx`

**Context:**
Five small padding reductions that collectively give the scene ~20% more vertical space on mobile. The header also loses the `SYS:NOM` status indicator (no actionable meaning for students; it's being replaced by progress LEDs in Task 3).

**Step 1: Reduce header height**

In `InstrumentModule.tsx`, find the outer grid div (line 116):
```tsx
<div className="grid h-dvh w-screen overflow-hidden bg-(--lab-bg) grid-rows-[3rem_auto_auto_1fr_auto]">
```
Change `3rem` to `2.5rem`:
```tsx
<div className="grid h-dvh w-screen overflow-hidden bg-(--lab-bg) grid-rows-[2.5rem_auto_auto_1fr_auto]">
```

**Step 2: Reduce header left padding**

In `InstrumentModule.tsx`, find the header element (line 120):
```tsx
<header className="flex items-center gap-4 border-b border-(--lab-border) pl-24 pr-5 md:pr-6">
```
Change `pl-24` to `pl-20`:
```tsx
<header className="flex items-center gap-4 border-b border-(--lab-border) pl-20 pr-5 md:pr-6">
```

**Step 3: Remove SYS:NOM**

In `InstrumentModule.tsx`, find and remove this element (lines 124–126):
```tsx
        <span className="ml-auto shrink-0 lab-silk text-(--lab-success) lab-data-font">
          SYS:NOM
        </span>
```
Delete it entirely. The `ml-auto` for the progress LEDs (Task 3) will be added there instead.

**Step 4: Reduce prompt row padding**

In `InstrumentModule.tsx`, find the prompt row div (line 131):
```tsx
          className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-2.5 md:px-6"
```
Change `py-2.5` to `py-1.5`:
```tsx
          className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-1.5 md:px-6"
```

**Step 5: Reduce formula readout padding**

In `src/components/modules/rigid-motions/scene/FormulaReadout.tsx`, find the wrapper div (line 83):
```tsx
      className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-2.5 md:px-6"
```
Change `py-2.5` to `py-1.5`:
```tsx
      className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-1.5 md:px-6"
```

**Step 6: Reduce control strip padding**

In `InstrumentModule.tsx`, find the footer element (line 192):
```tsx
      <footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2.5 md:px-6 md:py-3">
```
Change `py-2.5 md:py-3` to `py-2 md:py-2.5`:
```tsx
      <footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2 md:px-6 md:py-2.5">
```

**Step 7: Build**

```bash
pnpm build
```
Expected: zero errors.

**Step 8: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx \
        src/components/modules/rigid-motions/scene/FormulaReadout.tsx
git commit -m "feat(rigid-motions): tighten chrome padding and remove SYS:NOM for more scene space"
```

---

## Task 3: Progress LEDs

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

**Context:**
The sinewaves module has progress dots in its StatusStrip. Rigid motions has no progress indicator. Add 8 non-interactive dots to the header showing position in the guide state sequence.

The guide state machine in `src/components/modules/rigid-motions/guide-state.ts` exports `getGuideStateConfig(state)` which returns `{ index: 0–7, ... }`. Use that to determine current position.

**Step 1: Import getGuideStateConfig**

In `InstrumentModule.tsx`, confirm `getGuideStateConfig` is already imported (it's used for `successesRequired` in `useRigidMotionsState`). Check the import at line 16:
```tsx
import { isCoordinateStage } from './guide-state'
```
Add `getGuideStateConfig`:
```tsx
import { isCoordinateStage, getGuideStateConfig } from './guide-state'
```

**Step 2: Add the LED strip to the header**

In `InstrumentModule.tsx`, the header currently looks like this after Task 2:
```tsx
      <header className="flex items-center gap-4 border-b border-(--lab-border) pl-20 pr-5 md:pr-6">
        <span className="shrink-0 lab-silk lab-display-font font-bold text-(--lab-text)">
          Rigid Motions
        </span>
      </header>
```

Replace with:
```tsx
      <header className="flex items-center gap-4 border-b border-(--lab-border) pl-20 pr-5 md:pr-6">
        <span className="shrink-0 lab-silk lab-display-font font-bold text-(--lab-text)">
          Rigid Motions
        </span>
        {guideState !== 'capstone' && (() => {
          const currentIndex = getGuideStateConfig(guideState).index
          const TOTAL = 8
          return (
            <div
              className="ml-auto flex items-center gap-1"
              aria-label={`Step ${currentIndex + 1} of ${TOTAL}`}
            >
              {Array.from({ length: TOTAL }, (_, i) => (
                <span
                  key={i}
                  className={[
                    'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                    i < currentIndex
                      ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
                      : i === currentIndex
                        ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
                        : 'bg-(--lab-border) border-(--lab-led-upcoming-border)',
                  ].join(' ')}
                />
              ))}
            </div>
          )
        })()}
        {guideState === 'capstone' && <div className="ml-auto" aria-hidden />}
      </header>
```

**Step 3: Build**

```bash
pnpm build
```
Expected: zero TypeScript errors.

**Step 4: Visual check in dev**

```bash
pnpm dev
```
Navigate to rigid motions. Verify:
- 8 dots appear in the header right side
- First dot is green (current), remaining 7 are dim
- After completing a predict stage and pressing Next, dots update
- In capstone state, dots are hidden

**Step 5: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat(rigid-motions): add 8-dot progress indicator to header"
```

---

## Task 4: Miss and Close Feedback Text

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`
- Reference: `src/components/modules/rigid-motions/rigid-motions-copy.ts` (read-only — copy is already defined)

**Context:**
Currently, `feedbackState === 'miss'` has no visible text for sighted users — only a screen reader announcement via `useAccessibility`. The `CLOSE_COPY` map in `rigid-motions-copy.ts` has text for close states but is also never rendered. This wires both.

`CLOSE_COPY` entries:
```ts
'predict-translate': 'Adjust the position',
'predict-rotate':    'Check the rotation',
'predict-with-coordinates-translate': 'Check your coordinates',
```
(reflect and coordinate stages have no close state — by design per match-scoring logic)

**Step 1: Import CLOSE_COPY**

In `InstrumentModule.tsx`, find the copy import (line 14):
```tsx
import { PROMPT_TEXT } from './rigid-motions-copy'
```
Change to:
```tsx
import { PROMPT_TEXT, CLOSE_COPY } from './rigid-motions-copy'
```

**Step 2: Update the prompt text derivation**

Find the existing `promptText` and `promptLabel` derivations (lines 70–74):
```tsx
  const promptText = PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.'
  const promptLabel =
    guideState === 'coordinate-reveal' ? 'Reveal' :
    isCoordinateStage(guideState)      ? 'Coordinate Rule' :
    'Predict'
```

Replace with:
```tsx
  const isMiss = feedbackState === 'miss'
  const isClose = feedbackState === 'close'

  const promptText =
    isMiss
      ? 'Not quite — adjust your position.'
      : isClose
        ? (CLOSE_COPY[guideState] ?? 'Getting closer.')
        : (PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.')

  const promptLabel =
    guideState === 'coordinate-reveal' ? 'Reveal' :
    isCoordinateStage(guideState)      ? 'Coordinate Rule' :
    isMiss || isClose                  ? 'Hint' :
    'Predict'
```

**Step 3: Build**

```bash
pnpm build
```
Expected: zero errors.

**Step 4: Visual check**

In dev, navigate to rigid motions. Press CHECK with the ghost in the wrong position:
- Miss state: header label shows "Hint", prompt shows "Not quite — adjust your position."
- Close state (translate, ghost near but not at target): prompt shows "Adjust the position"
- After reset or match: prompt returns to the prediction text

**Step 5: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat(rigid-motions): show miss/close feedback text in prompt row"
```

---

## Task 5: Earned Reveals

**Files:**
- Modify: `src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts`
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`
- Reference: `src/components/modules/rigid-motions/rigid-motions-copy.ts` (read-only)

**Context:**
`EARNED_REVEALS` in `rigid-motions-copy.ts` has text for all 7 non-capstone guide states (e.g., "Every point moved the same direction and distance..."). `CAPSTONE_EARNED_REVEALS` has text keyed by capstone round ID.

Both are defined and never rendered. This task wires them: on the first match per stage, the prompt row shows the earned reveal in amber. Subsequent matches in the same stage show a brief confirmation.

**Step 1: Add shownReveals state to the hook**

In `src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts`:

1. Update the `RigidMotionsState` interface (around line 12) to add:
```ts
  shownReveals: Set<string>  // guideState keys + capstone round IDs
```

2. In `useRigidMotionsState()`, after the other useState declarations (around line 70), add:
```ts
  const [shownReveals, setShownReveals] = useState<Set<string>>(new Set())
```

3. In `handleCheck`, after `setFeedbackState(result)` (line 133), add:
```ts
    if (result === 'match') {
      setShownReveals(prev => {
        if (prev.has(guideState)) return prev
        const next = new Set(prev)
        next.add(guideState)
        return next
      })
    }
```

4. In `handleCheckSequence`, after `setFeedbackState(result)` (line 198), add:
```ts
    if (result === 'match') {
      setShownReveals(prev => {
        const key = capstoneRound.id
        if (prev.has(key)) return prev
        const next = new Set(prev)
        next.add(key)
        return next
      })
    }
```

5. Add `shownReveals` to the return object at the bottom.

**Step 2: Import EARNED_REVEALS and CAPSTONE_EARNED_REVEALS in InstrumentModule**

In `InstrumentModule.tsx`, update the copy import:
```tsx
import { PROMPT_TEXT, CLOSE_COPY, EARNED_REVEALS, CAPSTONE_EARNED_REVEALS } from './rigid-motions-copy'
```

**Step 3: Destructure shownReveals from the hook**

In `InstrumentModule.tsx`, add `shownReveals` and `capstoneRound` to the hook destructure (they may already be destructured — check and add if missing):
```tsx
  const {
    // ... existing
    shownReveals,
    capstoneRound,
    // ...
  } = useRigidMotionsState()
```

**Step 4: Update prompt text derivation to include earned reveals**

Replace the `promptText` / `promptLabel` block from Task 4 with this updated version:

```tsx
  const isMiss   = feedbackState === 'miss'
  const isClose  = feedbackState === 'close'
  const isMatch  = feedbackState === 'match'

  // Earned reveal key: capstone uses round ID, all others use guide state
  const revealKey = guideState === 'capstone' ? capstoneRound.id : guideState
  const firstMatch = isMatch && !shownReveals.has(revealKey)
  const repeatMatch = isMatch && shownReveals.has(revealKey)

  const earnedRevealText =
    guideState === 'capstone'
      ? CAPSTONE_EARNED_REVEALS[capstoneRound.id]
      : EARNED_REVEALS[guideState]

  const promptText =
    firstMatch && earnedRevealText
      ? earnedRevealText
      : repeatMatch
        ? 'Match.'
        : isMiss
          ? 'Not quite — adjust your position.'
          : isClose
            ? (CLOSE_COPY[guideState] ?? 'Getting closer.')
            : (PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.')

  const promptLabel =
    guideState === 'coordinate-reveal' ? 'Reveal' :
    isCoordinateStage(guideState)      ? 'Coordinate Rule' :
    firstMatch                         ? 'Discovered' :
    isMiss || isClose                  ? 'Hint' :
    'Predict'
```

**Step 5: Style the earned reveal text in amber**

The prompt `<p>` tag currently has `text-(--lab-text)`. When showing an earned reveal, it should use amber (`--lab-earned`). Update:

```tsx
          <p className={[
            'text-sm font-medium lab-display-font',
            firstMatch ? 'text-(--lab-earned)' : 'text-(--lab-text)',
          ].join(' ')}>
            {promptText}
          </p>
```

**Step 6: Build**

```bash
pnpm build
```
Expected: zero TypeScript errors. The `Set<string>` type is standard — no new dependencies.

**Step 7: Visual check**

In dev:
1. Play through predict-translate. On first CHECK that matches: prompt turns amber and shows the earned reveal text ("Every point moved the same direction..."). Label shows "Discovered".
2. Press Next, complete another translate round. Second match: prompt shows "Match." (no repeat reveal).
3. Advance to predict-reflect, get a match: new reveal text appears (first time for this stage).
4. Capstone: after first match, capstone earned reveal text appears.

**Step 8: Commit**

```bash
git add src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts \
        src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat(rigid-motions): wire earned reveals — show on first match per stage in amber"
```

---

## Task 6: Design System Fixes

**Files:**
- Modify: `src/components/modules/rigid-motions/controls/SequenceBuilder.tsx`
- Modify: `src/components/layout/EscapeHatch.tsx`
- Modify: `src/index.css`

**Context:**
The design system specifies "no border-radius on module UI." Three `rounded` violations exist in SequenceBuilder, one in EscapeHatch. The SequenceBuilder also has number inputs with browser-default spinners that clash with the Eurorack aesthetic.

**Step 1: Remove rounded from SequenceBuilder slot wrapper**

In `src/components/modules/rigid-motions/controls/SequenceBuilder.tsx`, find line 78:
```tsx
    'border border-(--lab-border) rounded p-2 flex flex-col gap-2',
```
Remove `rounded`:
```tsx
    'border border-(--lab-border) p-2 flex flex-col gap-2',
```

**Step 2: Remove rounded from SequenceBuilder dx input**

Find line 149:
```tsx
              className="w-14 lab-data-font text-sm text-center bg-(--lab-surface) border border-(--lab-border) text-(--lab-text) rounded py-1 min-h-[44px]"
```
Remove `rounded`:
```tsx
              className="w-14 lab-data-font text-sm text-center bg-(--lab-surface) border border-(--lab-border) text-(--lab-text) py-1 min-h-[44px]"
```

**Step 3: Remove rounded from SequenceBuilder dy input**

Find line 159 (same pattern as dx):
```tsx
              className="w-14 lab-data-font text-sm text-center bg-(--lab-surface) border border-(--lab-border) text-(--lab-text) rounded py-1 min-h-[44px]"
```
Remove `rounded`:
```tsx
              className="w-14 lab-data-font text-sm text-center bg-(--lab-surface) border border-(--lab-border) text-(--lab-text) py-1 min-h-[44px]"
```

**Step 4: Remove rounded-lg from EscapeHatch trigger**

In `src/components/layout/EscapeHatch.tsx`, find line 22:
```tsx
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--lab-surface)]/80 text-[var(--lab-ghost)] hover:bg-[var(--lab-surface)] hover:text-[var(--lab-text)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgba(124,200,124,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--lab-bg)]">
```
Remove `rounded-lg`:
```tsx
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--lab-surface)]/80 text-[var(--lab-ghost)] hover:bg-[var(--lab-surface)] hover:text-[var(--lab-text)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgba(124,200,124,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--lab-bg)]">
```

**Step 5: Hide number input spinners in global CSS**

In `src/index.css`, add after the `.animate-ring-pulse` block (after line 95), before `:root`:
```css
/* Hide number input spinners — Eurorack aesthetic */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
```

**Step 6: Build**

```bash
pnpm build
```
Expected: zero errors.

**Step 7: Visual check**

In dev, navigate to the capstone (advance through all 7 predict stages or use the Skip to End escape hatch). Verify:
- SequenceBuilder slot borders are sharp (no rounded corners)
- dx/dy inputs have no spinner arrows
- LAB dropdown trigger in top-left has sharp corners
- No visual regression elsewhere

**Step 8: Commit**

```bash
git add src/components/modules/rigid-motions/controls/SequenceBuilder.tsx \
        src/components/layout/EscapeHatch.tsx \
        src/index.css
git commit -m "fix: remove rounded violations from SequenceBuilder/EscapeHatch, hide number input spinners"
```

---

## Final Verification

After all 6 tasks:

```bash
pnpm build
```
Expected: clean build, zero TypeScript errors.

```bash
pnpm vitest run src/components/modules/rigid-motions
```
Expected: all existing tests pass (no new tests required — the new logic is rendering-layer state, not pure math).

**Manual walkthrough checklist:**
- [ ] Triangle appears larger, camera is centered
- [ ] Header is slimmer; progress dots track through all 8 states
- [ ] Prompt shows "Not quite" on miss (visible text, not just screen reader)
- [ ] Prompt shows earned reveal text in amber on first match per stage
- [ ] Capstone slot borders are sharp; spinners are gone; LAB button is sharp
- [ ] No visual regression on sinewaves or hero screens (EscapeHatch is shared)
