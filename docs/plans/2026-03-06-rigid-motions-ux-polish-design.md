# Rigid Motions UX Polish — Design Spec

**Date:** 2026-03-06
**Status:** Approved — ready for implementation
**Scope:** Visual polish and layout optimization for the rigid motions module. Math/logic is correct and untouched. This module becomes the exemplar for Dilations & Similarity.

---

## Background

The rigid motions module is functionally complete across all 4 phases. This pass addresses:
- Dead space in the visualization (camera centering, zoom)
- Header chrome consuming more vertical space than needed
- Progress visibility (no indicator of where you are in the sequence)
- Feedback that is screen-reader-only (sighted users get no text feedback)
- Earned reveals defined in copy but never rendered
- Design system violations (rounded corners, old syntax)

---

## Section 1 — Scene Space

### Change 1: Camera centering
**File:** `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`
**Change:** `<Canvas orthographic camera={{ position: [0, 2, 10] }}` → `position: [0, 0, 10]`

The Y=2 offset was an artifact of the original Q1-centered triangle. The pre-image now spans Q2/Q3 and targets range y ∈ [−6, 4], so the content center is closer to Y=0. Centering the camera eliminates the dead space at the bottom of the scene.

### Change 2: Tighter zoom
**File:** `src/components/modules/rigid-motions/scene/scene-layout.ts`
**Change:** `zoom = shorterSide / (GRID_RANGE * 2)` → `zoom = shorterSide / ((CONTENT_RANGE + 1) * 2)`

`GRID_RANGE = 9` means the zoom fits ±9 world units. `CONTENT_RANGE = 6` means all shapes and labels live within ±6. The extra unit (±7 total) gives breathing room at the grid edge without wasting space on the outer 2 units of empty grid. Result: the triangle and all targets appear noticeably larger in the viewport.

---

## Section 2 — Chrome Tightening

Five padding/spacing reductions that give the scene ~20% more vertical space on a typical phone:

### Change 3: Header height
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx`
**Change:** `grid-rows-[3rem_auto_auto_1fr_auto]` → `grid-rows-[2.5rem_auto_auto_1fr_auto]`

### Change 4: Header left padding
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx`
**Change:** `pl-24` → `pl-20` on the header element
The EscapeHatch LAB button is ~72px wide at `left-4`; `pl-20` (80px) gives adequate clearance.

### Change 5: Prompt and formula row padding
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx` and `scene/FormulaReadout.tsx`
**Change:** `py-2.5` → `py-1.5` on both the prompt row div and the FormulaReadout wrapper

### Change 6: Control strip padding
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx`
**Change:** `py-2.5 md:py-3` → `py-2 md:py-2.5` on the footer element

### Change 7: Remove SYS:NOM
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx`
**Change:** Remove the `<span>SYS:NOM</span>` from the header entirely.

SYS:NOM is a status indicator with no actionable meaning for students. Removing it frees space for the progress LEDs (Change 8) and reduces chrome noise.

---

## Section 3 — Progress LEDs

### Change 8: 8-dot progress indicator in header
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx`
**Change:** Add a non-interactive LED strip to the header showing progress through the 8 guide states.

Pattern from sinewaves `StatusStrip.tsx`:
- 7px dots with `rounded-full`
- Completed: `bg-(--lab-success) border-(--lab-led-completed-border)`
- Current: `bg-(--lab-accent) border-(--lab-accent-muted)`
- Upcoming: `bg-(--lab-border) border-(--lab-led-upcoming-border)`
- Source of truth: `getGuideStateConfig(guideState).index` (0-based, 0–7)

Non-interactive — rigid motions has no click-back (linear progression only). No `role="list"` or `aria-label` per dot needed; add a single `aria-label` on the container: `Step {index+1} of 8`.

---

## Section 4 — Feedback & Earned Reveals

### Change 9: Prompt row shows contextual feedback
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx`
**Change:** The prompt row currently always shows `PROMPT_TEXT[currentRound.id]`. After `handleCheck` is pressed:
- `feedbackState === 'close'`: show `CLOSE_COPY[guideState]` in place of prompt text (already defined in `rigid-motions-copy.ts`, never rendered)
- `feedbackState === 'match'`: show the earned reveal text (see Change 10), or a brief "Match" confirmation if earned reveal already shown
- `feedbackState === 'idle'` or capstone: unchanged

The prompt label changes accordingly: `'Predict'` → `'Hint'` on close, `'Predict'` stays on idle.

### Change 10: Earned reveals (first match per stage)
**Files:** `hooks/useRigidMotionsState.ts`, `InstrumentModule.tsx`, `rigid-motions-copy.ts`
**Change:** Track which guide states have shown their earned reveal using a `Set<GuideState>` in state. On first match per stage, swap the prompt row to show the earned reveal text in amber (`text-(--lab-earned)`). On subsequent matches in the same stage, show a brief confirmation instead.

`EARNED_REVEALS` in `rigid-motions-copy.ts` already has text for all 7 non-capstone guide states. Wire it.

State addition to `useRigidMotionsState`:
```typescript
const [shownReveals, setShownReveals] = useState<Set<GuideState>>(new Set())
```

On `handleCheck` returning `match`: if `!shownReveals.has(guideState)`, add to set. `InstrumentModule` uses `shownReveals.has(guideState)` to decide which text to show.

Return `shownReveals` from the hook (or a derived boolean `earnedRevealShown`).

### Change 11: Capstone earned reveals
**Files:** Same as Change 10, plus `rigid-motions-copy.ts`
**Change:** `CAPSTONE_EARNED_REVEALS` is also defined but unwired. When `guideState === 'capstone'` and `feedbackState === 'match'`, show `CAPSTONE_EARNED_REVEALS[capstoneRound.id]` in the prompt row (amber). Same first-match-only logic, keyed by `capstoneRound.id`.

---

## Section 5 — Design System Fixes

### Change 12: Remove `rounded` from SequenceBuilder
**File:** `src/components/modules/rigid-motions/controls/SequenceBuilder.tsx`
**Change:** Remove `rounded` from 3 elements (slot wrapper, dx input, dy input). Replace with no border-radius — module UI has no rounded corners per design system.

### Change 13: Remove `rounded-lg` from EscapeHatch trigger
**File:** `src/components/layout/EscapeHatch.tsx`
**Change:** Remove `rounded-lg` from the LAB button class string (line 22).

### Change 14: Hide number input spinners
**File:** `src/index.css`
**Change:** Add CSS to hide the browser-default number input spinners (the up/down arrows on `<input type="number">`):
```css
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
input[type="number"] { -moz-appearance: textfield; }
```
The SequenceBuilder dx/dy inputs are `type="number"` and currently show native spinners that clash with the Eurorack aesthetic.

### Change 15: Miss feedback text
**File:** `src/components/modules/rigid-motions/InstrumentModule.tsx`
**Change:** When `feedbackState === 'miss'`, show "Not quite — adjust your position." in the prompt area. Currently miss state has no text feedback for sighted users (only screen reader via `useAccessibility`). This closes that gap.

The existing `announce('Not quite. Try adjusting the position.')` in the accessibility hook stays; this adds a visible counterpart.

---

## Files Changed Summary

| File | Changes |
|------|---------|
| `scene/RigidMotionsScene.tsx` | Camera position Y: 2→0 |
| `scene/scene-layout.ts` | Zoom: GRID_RANGE→CONTENT_RANGE+1 |
| `InstrumentModule.tsx` | Header height, padding, SYS:NOM removal, progress LEDs, feedback text |
| `scene/FormulaReadout.tsx` | Reduce padding |
| `controls/SequenceBuilder.tsx` | Remove 3x `rounded` |
| `layout/EscapeHatch.tsx` | Remove `rounded-lg` |
| `hooks/useRigidMotionsState.ts` | Add `shownReveals` Set, return it |
| `src/index.css` | Hide number input spinners |

Total: 8 files, 15 targeted changes. No new files needed.
