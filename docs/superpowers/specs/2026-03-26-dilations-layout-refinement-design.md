# Dilations Layout Refinement Design

**Date:** 2026-03-26
**Status:** Approved
**Goal:** Align the Dilations module layout and scene with the Rigid Motions reference implementation, fix known R3F gaps, and introduce targeted responsive refinements that make Dilations more polished than its predecessor.

---

## Context

Dilations Prompts 1–4 (PR #47) established working R3F primitives, math utilities, state management, and the Phase 1 (Scale Factor) round flow. The current module orchestrator uses a raw flex column with `DilationsHUD` and `ScaleFactorHUD` as absolute-positioned overlays over the canvas — a pattern that diverges from Rigid Motions' `ModuleLayout` and puts HTML controls inside the visual layer.

This refinement aligns the structural approach before building Phases 2–4, preserving all scene components, math, state, and round logic from the previous PR.

---

## Principles

- Each new module in the 3-module geometry sequence should be **more refined than the previous**. Rigid Motions is the foundation; Dilations improves on it.
- `ModuleLayout` stays in each module as its own copy. Promotion to `src/components/shared/` happens after observing patterns across all 3 modules.
- YAGNI: content-aware zoom is a candidate for a future pass once Phase 1 behavior is observed in the browser.

---

## Section 1: Layout & Module Structure

### New file: `src/components/modules/dilations/Layout.tsx`

Exact copy of `src/components/modules/rigid-motions/Layout.tsx`. No modifications to the component. The `ModuleLayout` component accepts 5 named slots plus an overlay `children` prop:

```
statusStrip   — <header> row, h-10, always visible
prompt        — shown in portrait above scene, in landscape top of controls panel
formulaReadout — always-reserved strip below prompt (min-h-8)
visualization — flex-1 main area, owns the R3F Canvas
controls      — button row at bottom of controls panel
children      — overlay slot (WebGL recovery, etc.)
```

Portrait layout: `flex-col` — status → prompt (portrait-only) → scene → [formula + controls]
Landscape layout: `flex-row` — status (full width) → [scene (flex-3) | controls panel (flex-2)]
Controls panel capped at `max-h-[60dvh]` in portrait so scene keeps ≥40% of viewport.

### Modified: `DilationsModule.tsx`

Rewired to use `ModuleLayout`. Slot assignments:

| Slot | Content |
|------|---------|
| `statusStrip` | Back button (ChevronLeft, 44px) + "Dilations & Similarity" title (desktop only) + phase label (right-aligned, `lab-silk lab-display-font`) |
| `prompt` | `<PromptReadout>` — label + text + amber flag |
| `formulaReadout` | Scale factor display ("k = 2") in Phase 1; coordinate rules in Phase 3; `null` otherwise |
| `visualization` | `<DilationsScene>` with phase scenes as children |
| `controls` | `<ControlStrip>` |
| `children` | WebGL context lost recovery overlay |

**No LEDs in status strip.** Phase label alone provides orientation. LEDs are deferred until the full 4-phase flow is built and the right tracking unit (phase vs. round) is clear.

### Files removed

- `DilationsHUD.tsx` — content distributes to `PromptReadout`, `ControlStrip`, and phase entry state
- `ScaleFactorHUD.tsx` — content moves to the `formulaReadout` slot

---

## Section 2: Scene & Canvas

### Rename: `DilationsCanvas.tsx` → `DilationsScene.tsx`

Matches Rigid Motions naming convention (`RigidMotionsScene.tsx`). Internal R3F content is unchanged except for the CoordinateGrid fixes below.

`DilationsModule.tsx` passes `<DilationsScene>` as the `visualization` prop. Phase scenes (`ScaleFactorScene`, future phases) remain as children of `DilationsScene`, passed through from the module orchestrator.

### CoordinateGrid fixes (inside `DilationsScene.tsx`)

**1. Geometry disposal**

Current implementation leaks geometries on unmount. Fix:

```tsx
useEffect(() => {
  return () => {
    gridGeometry.dispose()
    axisGeometry.dispose()
  }
}, [gridGeometry, axisGeometry])
```

**2. SpriteLabel axis labels**

Add integer labels on x and y axes using the existing `SpriteLabel` component. Label at even integers only: `0, 2, 4, 6, 8, 10, 12`. Styled with `--lab-text-muted`, matching Rigid Motions axis label appearance. Labels on both axes; origin labeled once at `(0, 0)`.

Showing every-other integer (rather than every integer as in Rigid Motions) is the first responsive refinement — reduces clutter on small viewports where the 16-unit world compresses more aggressively than Rigid Motions' symmetric grid.

### Camera framing improvement

Current: camera centered at `(6, 6)` — the geometric center of the 16-unit world.
Problem: the pedagogically important content (origin + pre-image + image) lives in the lower-left quadrant. On small viewports this wastes screen real estate.

**Fix:** shift camera center to `(4, 4)`. This keeps the origin visible with margin while ensuring k=3 image vertices (at 12, 12 worst case) remain in frame. Zoom formula unchanged: `Math.min(canvas.width, canvas.height) / WORLD_SIZE`.

**Future (not in this pass):** content-aware zoom per round, once Phase 1 behavior is observed across viewports.

---

## Section 3: New UI Components

### `src/components/modules/dilations/components/PromptReadout.tsx`

Copies the Rigid Motions `PromptReadout` interface exactly — all 6 props — for forward compatibility. Phase 1 uses only `label`, `text`, and `amber`; `notation`, `notationStyle`, and `trailingText` are reserved for Phase 3 coordinate rules and future earned reveals.

**Props:**
```typescript
interface PromptReadoutProps {
  label: string                          // Silk-screen label
  text: string                           // Main prompt copy
  amber?: boolean                        // Amber highlight on phase entry and earned reveals
  notation?: string                      // Notation line in lab-data-font (Phase 3+)
  notationStyle?: 'rule' | 'congruence'  // Color: accent green or earned amber
  trailingText?: string                  // Prose below notation in lab-display-font
}
```

The component implementation is identical to `rigid-motions/components/PromptReadout.tsx` — copy it directly.

**Label derivation** (computed in `DilationsModule.tsx`, passed as prop):

| Context | Label |
|---------|-------|
| `roundState === 'entry'` (phase boundary) | `"Phase N"` (e.g., `"Phase 1"`) |
| `roundState === 'active'` or `'prediction'` | `"Predict"` |
| `roundState === 'reveal'` (first time) | `"Discovered"` |
| `roundState === 'reveal'` (repeat) | `"Reveal"` |
| `roundState === 'completion'` | `"Complete"` |

**Amber** is `true` on phase entry (`roundState === 'entry'`) and on first-time reveals.

### `src/components/modules/dilations/components/ControlStrip.tsx`

Single primary button visible at a time, driven by `roundState`. Phase-aware for future phases.

| `roundState` | `config` condition | Button shown |
|---|---|---|
| `entry` | — | CONTINUE |
| `active` | — | _(none — student is dragging, or timed auto-advance is running)_ |
| `prediction` | `hasGhostDrag === true` | REVEAL |
| `prediction` | `hasSequenceBuilder === true` | CHECK |
| `reveal` | — | _(none — reveal animation plays)_ |
| `completion` | — | NEXT |

Note: `REVEAL` triggers `{ type: 'TRIGGER_REVEAL' }`. `CHECK` triggers `{ type: 'CHECK_SEQUENCE' }`. `NEXT` triggers `{ type: 'ADVANCE_ROUND' }`. `CONTINUE` (entry state) triggers `{ type: 'SET_ROUND_STATE', state: 'active' }`.

All buttons: 44px minimum touch target, `lab-silk lab-display-font`, `tracking-[0.1em]`, `duration-150` transition. Consistent with Rigid Motions `ControlStrip` button styling.

---

## Section 4: Phase Entry State (replaces auto-dismiss interstitials)

The current `DilationsHUD` shows a centered auto-dismiss text on phase change (fades after 2s). This is replaced with the existing `roundState: 'entry'` state in `useDilationsStage`.

**Behavior:**
- On phase boundary, `roundState` is set to `'entry'`
- `PromptReadout` renders with amber + "Phase N" label + phase intro copy
- `ControlStrip` shows CONTINUE
- Student reads and presses CONTINUE to begin the first round

This mirrors Rigid Motions' `coordinate-reveal` and `synthesis-reveal` pause states: student-controlled, not timed. More respectful of reading pace.

**`useDilationsStage`** already has `'entry'` in its `RoundState` union. The reducer dispatch for phase transitions needs to set `roundState: 'entry'`. Prompt copy for the entry state comes from `PHASE_INTROS` in `dilations-copy.ts` (see copy architecture below).

---

## Responsive Behavior Summary

| Concern | Approach |
|---------|----------|
| Portrait phone controls height | Inherited from `ModuleLayout`: `max-h-[60dvh]`, scene keeps ≥40% |
| Landscape phone layout | Inherited: `flex-row`, scene `flex-[3]`, controls `flex-[2]` |
| Camera center | Shifted to `(4, 4)` for better lower-left content framing |
| Axis label density | Every 2 integers (0, 2, 4…12) vs. every integer — less clutter on small viewports |
| Touch targets | 44px minimum on all interactive elements |
| No special phone mode | Not needed — content fits at fixed zoom across all tested viewport sizes |

---

## Copy Architecture

`DilationsHUD.tsx` currently owns three copy constants. When that file is deleted, these move to a new file:

**New file: `src/components/modules/dilations/dilations-copy.ts`** — mirrors `rigid-motions-copy.ts`.

Contents:
- `PHASE_LABELS: Record<PhaseId, string>` — keyed by `PhaseId` string literals (`'scale-factor'`, `'coordinate'`, etc.), not numeric. Values are display strings like `"PHASE 1 — Scale Factor"`. Used in the status strip.
- `PHASE_INTROS: Record<PhaseId, string>` — entry pause copy per phase (used in `PromptReadout` on `roundState === 'entry'`). Empty string for `'scale-factor'` (no entry pause on first load).
- `ROUND_PROMPTS: Partial<Record<RoundId, string>>` — predict prompt per round (used in `PromptReadout` during active/prediction states). Use `Partial<Record<RoundId, string>>` (not a full record) — only Phase 1 entries are required now; Phase 2–4 entries will be added when those phases are built. This mirrors how `rigid-motions-copy.ts` uses `Record<string, string>` for `PROMPT_TEXT` rather than an exhaustive typed record.

`DilationsModule.tsx` imports all three from `dilations-copy.ts`. `PromptReadout` and `ControlStrip` receive pre-computed strings as props — they don't import copy directly.

---

## Files Changed

| File | Change |
|------|--------|
| `dilations/Layout.tsx` | **New** — copy of `rigid-motions/Layout.tsx` |
| `dilations/components/PromptReadout.tsx` | **New** |
| `dilations/components/ControlStrip.tsx` | **New** |
| `dilations/DilationsModule.tsx` | **Modified** — use `ModuleLayout`, rewire slots |
| `dilations/DilationsScene.tsx` | **Renamed** from `DilationsCanvas.tsx` + CoordinateGrid fixes |
| `dilations/dilations-copy.ts` | **New** — `PHASE_LABELS`, `PHASE_INTROS`, `ROUND_PROMPTS` (moved from `DilationsHUD.tsx`) |
| `dilations/DilationsHUD.tsx` | **Deleted** — content distributed to `PromptReadout`, `ControlStrip`, `dilations-copy.ts` |
| `dilations/rounds/ScaleFactorRounds.tsx` | **Modified** — remove `ScaleFactorHUD` function (it was inline here, not a standalone file); `ScaleFactorDisplay` is a pure HTML component and is passed directly to the `formulaReadout` slot from `DilationsModule.tsx` |

---

## Out of Scope

- Content-aware zoom per round (deferred — observe fixed zoom in browser first)
- Progress LEDs in status strip (deferred — design after full 4-phase flow is built)
- Phases 2–4 implementation (separate prompts)
- Beat-indexed earned reveals (separate pass after Phase 1 UX is validated)
