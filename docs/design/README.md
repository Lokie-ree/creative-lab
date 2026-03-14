# Design — Current Direction

**Last updated:** February 23, 2026

This folder holds design specs and audits for creative-lab. Below is the current direction, implementation status, and outstanding work.

---

## Design system

### Aesthetic — Eurorack / synth module

Matte faceplate, phosphor green accent, silk-screened labels, scored dividers, no glow. Each module is a self-contained instrument panel.

### Palette

| Token | Hex | Role |
|-------|-----|------|
| `--lab-accent` | `#7cc87c` | Phosphor green — primary accent |
| `--lab-bg` | `#1e1d1c` | Warm faceplate background |
| `--lab-text` | `#b8b0a4` | Silk cream — body text |
| `--lab-ghost` | `#7a746a` | Muted / ghost elements |
| `--lab-success` | `#5a7a5a` | Earthy green — match/success |
| `--lab-danger` | `#8a4a4a` | Muted red — reset/danger |
| `--lab-earned` | `#f5a623` | Amber — earned reveals |

### Typography

- **Display & body:** Inter Tight (`--font-display`, `--font-body`)
- **Data / readouts:** JetBrains Mono (`--font-data`)
- **Labels:** `lab-silk` utility (uppercase, 9px, 0.15em tracking) — always paired with `lab-display-font` or `lab-data-font`

### Components

- Slider thumb: rectangular fader (`h-6 w-3`), no rounded, no glow
- Scored dividers: `border-b border-(--lab-border)`
- **No panel screws.** Decorative corner screws omitted by design direction. Mockups reflect this.
- Transitions: always explicit `duration-150`
- Touch targets: 44px minimum (WCAG / Apple HIG) — use `min-h-[44px] min-w-[44px]` on buttons; never use `::before` pseudo-element expansion when ancestor has `overflow-hidden`

*Tokens defined in:* `src/lib/colors.ts` → `src/index.css` (--lab-* vars)

---

## Modules — status

### Sinewaves — COMPLETE

Scientific instrument ("oscilloscope, not slideshow"). Everything always visible and interactive. Pedagogy lives in what the instrument draws your attention to, not in what it withholds.

- **Guide states:** watch → match-amplitude → match-frequency → challenge → free
- **Match feedback:** Inline banner near controls (no blocking modal). Snap-to-target on match detection.
- **Controls:** TRACE (play/pause), RESET, SPEED (0.5x / 1x / 2x). Grid lines, silk-screen labels, StatusStrip.
- **Architecture:** `InstrumentModule.tsx` orchestrates state; `Scene.tsx` owns R3F Canvas
- **Reference:** `src/components/modules/sinewaves/ARCHITECTURE.md`
- **Visual reference:** For layout and component treatment, see sinewaves in codebase; panel screws are intentionally omitted. For **new modules**, use `mockups/RigidMotions.jsx` as the mockup exemplar.

*Specs:* [SINEWAVES-REFACTOR-SPEC.md](./SINEWAVES-REFACTOR-SPEC.md); implementation plans in [archive/](../archive/) (2026-02-05 instrument refactor, 2026-02-10 Eurorack reskin).

### Vector Transformations — IMPLEMENTED

Linear algebra module — matrix transformations on 2D vectors. Progressive unlock, challenge mode, discovery badges. Uses its own flow (does not consume skeleton infrastructure).

### Phase Portraits — PLACEHOLDER

Single `Module.tsx` with "Coming Soon" message.

### Rigid Motions — DESIGNED, NOT STARTED (next build)

Grade 8 Geometry module (8.G.A.1–3) — translations, reflections, rotations, congruence. "Predict & Reveal" interaction pattern (student drags ghost shape to predicted position, animation confirms/corrects). Scalene triangle as the single shape family across all stages. Distinct from sinewaves' continuous-parameter instrument.

- **Guide states:** predict-translate → predict-reflect → predict-rotate → coordinate-reveal → predict-with-coordinates → capstone
- **ALD progression:** L3 (spatial reasoning, no coordinates) → L4 (coordinate rules activate) → L5 (inverse task: identify the sequence)
- **Controls:** Discrete (shadcn toggle/toggle-group) rather than continuous sliders; capstone uses a two-slot sequence builder
- **Design spec (v2):** [plans/2026-02-19-rigid-motions-design-spec.md](../plans/2026-02-19-rigid-motions-design-spec.md) — **implementation-ready**
- **Mockup:** `mockups/RigidMotions.jsx` — exemplar; validated against spec
- **Not yet in `modules.ts`.** Listed in `courses.ts` (Geometry course, `moduleIds: ['rigid-motions']`). Add the `modules.ts` entry as the first step of implementation.
- **Part of:** Three-module Grade 8 geometry progression (Rigid Motions → Dilations & Similarity → Pythagorean Theorem)

---

## Implementation notes (Sinewaves)

For layout density, status strip, readout treatment, and controls: see sinewaves implementation and `mockups/RigidMotions.jsx` (mockup exemplar).

**Panel screws:** Decorative corner screws were removed from `Layout.tsx` in commit `7257ce5`. The design direction omits them. Do not re-add.

---

## Outstanding work

**Canonical list:** [CLAUDE.md § Outstanding Work](../../CLAUDE.md#outstanding-work). Summary below.

### Rigid Motions — Complete

All 4 phases shipped. See [`src/components/modules/rigid-motions/ARCHITECTURE.md`](../../src/components/modules/rigid-motions/ARCHITECTURE.md) for as-built documentation.

### Sinewaves — lower-priority polish

Documented in [SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md](./SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md). None block Rigid Motions.

1. **Resize distortion:** Scene layout may desync with Canvas on viewport resize.
2. **Match-success animation:** `matchSuccessSequence` in `animations.ts` exists but is not wired — celebration uses a static overlay instead of the staged timeline.
3. **Mobile control spacing:** Control strip `gap-2` feels cramped on mobile.

### Vestigial `color` field in `courses.ts`

The `Course` type has a `color` field; CS course has `color: '#a855f7'` (purple, off-palette). The field is not used in rendering (glow removed in 4465f32). Either remove the field from the type or replace with a design-system color when the CS course is built.

### Infrastructure — skeleton not consumed

Reusable hooks in `src/lib/skeleton/` (useModuleFlow, useStageUnlock, useChallengeAssist, etc.) implemented but not consumed. Rigid Motions built its own `useRigidMotionsState` hook directly.

### Performance — medium/low findings

localStorage versioning, conditional rendering (`&&` vs ternary), `useTransition` for module loading, `useMemo` for primitives, event listener dedup. See [VERCEL-REACT-BEST-PRACTICES-AUDIT.md](./VERCEL-REACT-BEST-PRACTICES-AUDIT.md).

---

## Resolved (archived)

The following items from earlier audits are now complete:

| Item | Resolved in |
|------|-------------|
| Hardcoded cyan everywhere | `4465f32` |
| Barrel imports | `8a4e5f5` |
| Stale files (`ControlPanel.tsx`, etc.) | `4465f32` |
| Panel screws (sinewaves `Layout.tsx`) | `7257ce5` |
| Cold background on CourseHub / Constellation | `7257ce5` + `397136e` |
| Generic grays / no lab tokens in journey | `4465f32` |
| Author name in student-facing UI | `7257ce5` |
| Rounded + glow on course/module nodes | `4465f32` |
| CourseNode shape inconsistency | `c704eed` |
| StatusStrip touch targets (44px minimum) | `3ac0fab` |
| Vertical centering on CourseHub / Constellation | `397136e` |
| Navigation.tsx cold palette | `907de66` |

Full audit history: see git log.

---

## Documents in this folder

| Document | Purpose | Status |
|----------|---------|--------|
| **README.md** (this file) | Current direction, status, and outstanding work | Active |
| [SINEWAVES-REFACTOR-SPEC.md](./SINEWAVES-REFACTOR-SPEC.md) | Instrument layout, guide states, responsive grid | Complete — reference |
| [SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md](./SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md) | Resize distortion, match animation wiring, control spacing | Open (low priority) |
| [VERCEL-REACT-BEST-PRACTICES-AUDIT.md](./VERCEL-REACT-BEST-PRACTICES-AUDIT.md) | React performance audit (localStorage versioning, etc.) | Open (low priority) |
