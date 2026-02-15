# Rigid Motions Module — Design

**Date:** February 12, 2026
**Status:** Approved
**Domain:** Geometry (G-CO.A.2, G-CO.A.5, G-CO.B.6)
**Course:** Geometry (new course)

---

## Core Question

> "What stays the same when a shape moves?"

Students discover the properties of rigid motions — translations, reflections, rotations — by predicting transformation outputs. The formal definition of congruence is the final earned reveal: two figures are congruent if one can be mapped onto the other by a sequence of rigid motions.

---

## Interaction Model: Predict & Reveal

Every geometry tool shows the student what a transformation does. This one asks the student to show *you* what it does. The student proves understanding by predicting, not by watching.

**The loop:**

1. **Present** — Source shape on a coordinate grid. Prompt describes the transformation in plain language: `TRANSLATE · 4 RIGHT, 2 UP`. No formal notation.
2. **Predict** — A translucent ghost copy appears. Student drags it to their predicted landing position. Rotation and flip are set via controls (not the canvas). Ghost snaps to grid intersections.
3. **Check** — Student taps CHECK. The actual transformation animates from the source shape (slides, flips, or pivots).
4. **Feedback** — Three outcomes:
   - **Nailed it** (within threshold): celebration pulse, earned insight, stage advances.
   - **Close** (partially off): "Almost — check the orientation." Ghost stays visible. Try again.
   - **Off** (significant miss): animation shows the gap. Nudge offered. Try again.
5. **Retry** — Reposition ghost, check again. No penalty, no score. The instrument is patient.

**Ghost shape mechanics:**
- Translucent (50% opacity), phosphor green outline (`--lab-accent`)
- Snaps to grid intersections
- Rotation set via toggle-group (0, 90, 180, 270 degrees)
- Flip set via toggle (normal/mirrored)
- On mobile: same controls, drag to position

**Reveal animation:**
- Source shape morphs along the transformation path (~600ms)
- Match: animated shape lands on ghost, both pulse green
- Miss: animated shape lands at correct position, dashed line connects to ghost placement

**Vertex-level escalation (challenge mode):**
- Student places individual vertices (A', B', C', D') instead of dragging the whole shape
- Shape auto-connects between placed vertices
- Higher precision threshold (each vertex within 1 grid unit)

---

## Earned Reveal Arc

| After mastering... | Student discovers... |
|---|---|
| Translations | Distances between points don't change when you slide a shape |
| Reflections | Distances and angles preserved, but orientation flips |
| Rotations | Distances and angles preserved, orientation preserved, everything pivots around a fixed point |
| All three | **Two figures are congruent if one can be mapped onto the other by a sequence of rigid motions.** |

The student earns the word "congruent" by demonstrating — through prediction — that they already understand what it means.

---

## Guide States

Six states. Each transformation type earns its own stage.

```
watch -> predict-translate -> predict-reflect -> predict-rotate -> challenge -> free
```

| State | What happens | Shapes |
|---|---|---|
| **watch** | Animated demos of each transformation type. Labels highlight preserved properties (distances, angles). | L-shape |
| **predict-translate** | Predict position after translation. Easiest — no orientation change. | L-shape, arrow |
| **predict-reflect** | Predict position + flip after reflection. Orientation reverses. | Arrow (orientation unmistakable) |
| **predict-rotate** | Predict position + rotation. Hardest single transform. | L-shape |
| **challenge** | Composed sequences (e.g., "reflect then translate"). Random targets. Vertex-level placement available. | Escalating: T-shape, Z-shape, irregular quads |
| **free** | Sandbox. Apply any transformations, explore compositions, discover that order matters. | All shapes available |

**Stage unlock:** 2-3 successful predictions per stage before advancing.

**Always interactive:** The student can drag the ghost in any state. The guide points attention, never locks the instrument.

---

## Controls (shadcn Components)

The canvas is for positioning (drag). The panel is for orientation and actions.

| Control | shadcn Component | Purpose |
|---|---|---|
| **ROTATION** | `toggle-group` | 0 / 90 / 180 / 270 degrees — sets ghost rotation |
| **FLIP** | `toggle` | Mirrors the ghost shape (for reflections). Pressed = mirrored. |
| **CHECK** | `button` | Submit prediction, trigger reveal animation |
| **RESET** | `button` | Reset ghost to starting position. `--lab-danger` styling. |
| **SPEED** | `toggle-group` | 0.5x / 1x / 2x — controls reveal animation speed |

**Context-sensitive visibility:**
- **predict-translate:** Only CHECK, RESET, SPEED (no orientation change needed)
- **predict-reflect:** FLIP visible, ROTATION hidden
- **predict-rotate:** ROTATION visible, FLIP hidden
- **challenge (composed):** Both ROTATION and FLIP visible
- **free:** All controls visible plus transformation-type selector

Controls evolve as the student progresses — new tools appear when relevant.

---

## Visual Design

Follows the sinewaves Eurorack instrument pattern.

**Layout (same 4-row grid as sinewaves):**

```
StatusStrip    — RIGID MOTIONS, 6 dots, SYS:NOM, ESC
PromptReadout  — REFLECT · OVER THE Y-AXIS / "Drag your prediction"
R3F Canvas     — Coordinate grid, source shape, ghost shape, axis markers
ControlStrip   — Toggle-groups, flip, CHECK/RESET, speed, proximity feedback
FormulaReadout — Earned insights (distances preserved, angles preserved)
```

**Grid and shapes:**
- Coordinate grid with major/minor lines, axis labels in `lab-data-font`
- Source shape: solid `--lab-text` (`#b8b0a4`), labeled vertices (A, B, C, D)
- Ghost shape: translucent `--lab-accent` (`#7cc87c` at 50%), dashed outline
- Revealed shape: solid `--lab-accent`, pulses on match
- Axis/point markers: dashed `--lab-ghost` (`#7a746a`)

**Shapes:**
- L-shape (4-5 vertices) — default, asymmetric, clear orientation
- Arrow (5 vertices) — alternate, orientation unmistakable
- Challenge mode adds: T-shape, Z-shape, irregular quadrilaterals
- All rendered as flat polygons with vertex dots and labels

**No new design tokens.** Uses existing `--lab-*` vars, `lab-silk`, `lab-display-font`, `lab-data-font`, scored dividers, panel screws.

---

## Architecture

Flat file structure. No barrel exports (direct imports only, per `bundle-barrel-imports` rule).

```
src/components/modules/rigid-motions/
  InstrumentModule.tsx          — Orchestrates state, guide progression
  Layout.tsx                    — InstrumentLayout (Eurorack panel)
  Scene.tsx                     — R3F Canvas
  guide-state.ts                — 6 states + config
  rigid-motions-constants.ts    — Thresholds, presets, shape definitions
  rigid-motions-copy.ts         — Prompts, insights, nudges
  challenge-utils.ts            — Target generation
  use-proximity.ts              — Position + angle scoring
  animations.ts                 — GSAP sequences
  Shape.tsx                     — R3F: polygon with labeled vertices
  GhostShape.tsx                — R3F: draggable prediction shape
  TransformationAxis.tsx        — R3F: axis line or rotation point
  GridLines.tsx                 — R3F: coordinate grid
  scene-layout.ts               — Viewport-aware positioning
  StatusStrip.tsx               — 6 guide-state dots, title, ESC
  PromptReadout.tsx             — Transformation prompt display
  ControlStrip.tsx              — Toggle-groups, flip, CHECK/RESET
  InstrumentControls.tsx        — CHECK, RESET, Speed
  FormulaReadout.tsx            — Earned insights
  types.ts                      — Shape, Transformation, TransformationType
  transform-math.ts             — Apply transforms to point arrays
  shape-library.ts              — L, arrow, T, Z shape definitions
  match-scoring.ts              — Centroid + angle comparison
```

**Module registration** — new entry in `src/config/modules.ts`:

```ts
{
  id: 'rigid-motions',
  title: 'Rigid Motions',
  domain: 'Geometry',
  description: 'What stays the same when a shape moves?',
  order: 2,
  courseId: 'geometry',
  component: () => import('@/components/modules/rigid-motions/InstrumentModule'),
}
```

**New Geometry course** in `src/config/courses.ts`:

```ts
{
  id: 'geometry',
  name: 'Geometry',
  icon: '△',
  color: '#7cc87c',
  order: 2,
  moduleIds: ['rigid-motions'],
}
```

**Reused from sinewaves (patterns, not shared code):**
- StatusStrip, PromptReadout, FormulaReadout — same API, same Eurorack styling
- Layout.tsx — same 4-row grid with panel screws and scored dividers
- Animation tokens and presets from `src/lib/animation/`
- All `--lab-*` design tokens and utility classes

**New to this module:**
- Draggable ghost shape on R3F canvas
- Toggle-group and toggle controls (shadcn) instead of sliders
- Shape polygon rendering with labeled vertices
- Transform math utilities (translation, reflection, rotation on point arrays)
- Multi-criteria match scoring (position centroid + orientation angle)

---

## Follow-up Notes

- Existing sinewaves and vector-transforms barrel exports (`components/index.ts`, `index.ts`) should be cleaned up in a separate pass.
- Similarity (dilations) is a natural follow-up module after rigid motions ships.
- The module skeleton hooks in `src/lib/skeleton/` could be adopted incrementally but are not required for initial build.
