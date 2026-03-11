# Rigid Motions Polish & Layout Standardization — Design

**Date:** 2026-03-09
**Scope:** Status strip standardization, rigid-motions desktop sidebar layout, bug fixes from NOTES.md

---

## 1. Status Strip Standardization

### Decision
Remove the back chevron and ESC button from the sinewaves `StatusStrip`. The floating EscapeHatch LAB button is the canonical navigation for both modules.

### Sinewaves StatusStrip (after)
- Title (desktop only, left side with invisible right spacer to balance)
- LED progress dots (centered)
- No SYS:NOM, no back chevron, no ESC button

### Rigid Motions status strip (after)
- "RIGID MOTIONS" title (desktop only, left side)
- LED progress dots (centered)
- Invisible right spacer for optical balance

### Implementation notes
- Edit `src/components/modules/sinewaves/components/StatusStrip.tsx`: remove `onBack` prop, back chevron button, ESC button, SYS:NOM span. Add invisible spacer on the right to balance the title.
- The rigid-motions status strip is inlined in `InstrumentModule.tsx` — apply the same centered-LEDs + spacer pattern there.
- No shared StatusStrip component needed yet — LED semantics differ between modules.

---

## 2. Rigid Motions Desktop Sidebar Layout

### Layout structure (desktop ≥768px)

```
┌─────────────────────────────────────┐
│           STATUS STRIP              │  full-width header row
├──────────────────────┬──────────────┤
│                      │  PROMPT      │
│                      ├──────────────┤
│       SCENE          │  FORMULA     │
│                      │  (phases 3+) │
│                      ├──────────────┤
│                      │  CONTROLS    │
└──────────────────────┴──────────────┘
```

### Layout structure (mobile)
Unchanged vertical stack: header → prompt → formula → scene → controls.

### Specifics
- Grid: `grid-rows-[2.5rem_1fr]` on desktop, scene+sidebar in second row as `grid-cols-[1fr_auto]`
- Sidebar width: `w-[280px]` (matches sinewaves formula panel width)
- Sidebar has `border-l border-(--lab-border)` scored divider
- Sidebar content stacks: prompt (top) → formula (phases 3+ only) → controls (fills remaining height, `flex-1`)
- The sequence builder (capstone) lives in the sidebar controls area and fills available height — no more cramped footer
- Sidebar is not scrollable by default; content is designed to fit

### Mobile layout (unchanged)
`grid-rows-[2.5rem_auto_auto_1fr_auto]` — header → prompt → formula → scene → controls

---

## 3. Bug Fixes (from NOTES.md)

### Bug 1 & 3 — Remove vertex coordinate labels from R3F scene

**Problem:** `SpriteLabel` components rendering coordinate pairs (e.g., `A(-3,-2)`, `A'(2,0)`) on both source and ghost triangles cause smearing/ghosting during drag. They also clutter the scene and duplicate data already shown in `FormulaReadout`.

**Fix:**
- Audit all `SpriteLabel` usages in `src/components/modules/rigid-motions/scene/`
- Remove any `SpriteLabel` rendering coordinate pairs from the source triangle
- Remove all `SpriteLabel` instances from the ghost triangle entirely
- Retain only single-letter vertex name labels (A, B, C) on the source (pre-image) triangle
- `FormulaReadout` remains the sole source of coordinate data

**Scope:** `RigidMotionsScene.tsx`, `ImageShape.tsx`, `PreviewGhost.tsx`, any other scene primitives with vertex labels.

### Bug 2 — Gate match evaluation behind CHECK only

**Problem:** Match-check logic fires automatically from position watchers (`useEffect` or `useFrame`) when the ghost reaches the correct position. This collapses Predict → Verify → Reveal into Predict → Reveal. Hints also surface based on proximity alone.

**Fix:**
- Audit `useRigidMotionsState.ts`: find any match evaluation running outside of `handleCheck`
- Move all match evaluation to be called exclusively from `handleCheck`
- `useEffect` and `useFrame` watchers may update proximity/visual state only — never `feedbackState`
- Gap lines and `ReflectionAxisTicks` keep their visual proximity feedback (color changes) but must not trigger state transitions
- Hints (`close` feedback) surface only after at least one CHECK press with a non-match result — gate behind a `hasCheckedOnce` flag or equivalent

**Scope:** `useRigidMotionsState.ts`, `GapLines.tsx`, `ReflectionAxisTicks.tsx`.

---

## What Must NOT Change

- `FormulaReadout` coordinate display (this is the correct home for all coordinate data)
- `ReflectionAxisTicks` visual proximity feedback (color change to green) — keep, just don't let it trigger state transitions
- Rotation arc visual display
- Gap line rendering and color feedback
- CHECK button existence and position
- `useRigidMotionsState.ts` internal state shape (renderer-agnostic constraint)
- Predict → Verify → Reveal state machine flow
- Single-letter vertex labels (A, B, C) on source triangle

---

## Verification Checklist

- [ ] Sinewaves StatusStrip has no back chevron, no ESC, no SYS:NOM
- [ ] Both modules: LED dots are centered, title is desktop-only
- [ ] Rigid-motions desktop shows sidebar layout (scene left, controls right)
- [ ] Rigid-motions mobile is unchanged vertical stack
- [ ] Sequence builder has full sidebar height on desktop — no cramped footer
- [ ] Dragging ghost triangle at any speed produces no label smearing
- [ ] Scene is visually cleaner — rotation arcs and gap lines unobstructed
- [ ] Single-letter A/B/C labels remain on source triangle
- [ ] No coordinate pair labels anywhere in the R3F scene
- [ ] Pressing CHECK is the only action that evaluates match state
- [ ] Gap lines approaching zero and turning green do NOT advance the stage
- [ ] Hints only surface after at least one CHECK press with a non-match result
- [ ] FormulaReadout still shows full coordinate mappings
- [ ] All three transformation stages behave correctly
- [ ] Capstone phase has same fixes applied
