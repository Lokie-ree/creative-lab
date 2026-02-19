# Design — Current Direction

**Last updated:** February 19, 2026

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
- **No panel screws.** Decorative corner screws take up space and add no value; the design direction omits them. Updated mockups: `mockups/eurorack-sinewaves.html`, `mockups/eurorack-sinewaves-mobile.html`.
- Transitions: always explicit `duration-150`

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
- **Visual reference:** `mockups/eurorack-sinewaves.html` (desktop), `mockups/eurorack-sinewaves-mobile.html` (mobile). Use these for layout, spacing, and component treatment; panel screws are intentionally omitted (see Implementation vs mockups below).

*Specs:* [SINEWAVES-REFACTOR-SPEC.md](./SINEWAVES-REFACTOR-SPEC.md), [plans/2026-02-05-sinewaves-instrument-refactor.md](../plans/2026-02-05-sinewaves-instrument-refactor.md), [plans/2026-02-10-sinewaves-eurorack-reskin.md](../plans/2026-02-10-sinewaves-eurorack-reskin.md)

### Vector Transformations — IMPLEMENTED

Linear algebra module — matrix transformations on 2D vectors. Progressive unlock, challenge mode, discovery badges. Uses its own flow (does not consume skeleton infrastructure).

### Phase Portraits — PLACEHOLDER

Single `Module.tsx` with "Coming Soon" message.

### Rigid Motions — DESIGNED (next build)

Grade 8 Geometry module (8.G.A.1–3) — translations, reflections, rotations, congruence. "Predict & Reveal" interaction pattern (student drags ghost shape to predicted position, animation confirms/corrects). Scalene triangle as the single shape family across all stages. Distinct from sinewaves' continuous-parameter instrument.

- **Guide states:** predict-translate → predict-reflect → predict-rotate → coordinate-reveal → predict-with-coordinates → capstone
- **ALD progression:** L3 (spatial reasoning, no coordinates) → L4 (coordinate rules activate) → L5 (inverse task: identify the sequence)
- **Controls:** Discrete (shadcn toggle/toggle-group) rather than continuous sliders; capstone uses a two-slot sequence builder
- **Design spec (v2):** [plans/2026-02-19-rigid-motions-design-spec.md](../plans/2026-02-19-rigid-motions-design-spec.md)
- **Part of:** Three-module Grade 8 geometry progression (Rigid Motions → Dilations & Similarity → Pythagorean Theorem)

---

## Implementation vs mockups (Sinewaves)

When evaluating the current sinewaves implementation against the updated mockups (`mockups/eurorack-sinewaves.html`, `mockups/eurorack-sinewaves-mobile.html`), keep the following in mind:

- **Panel screws:** The current implementation includes four decorative `PanelScrew` components at the layout corners. The design direction is to **omit** them: they consume space and add no functional or meaningful aesthetic value. The mockups do not rely on corner screws; the screw-related CSS variables in the mockups are used only for the fader thumb (metallic cap), not for standalone screw graphics.
- **Reference:** Use the mockups for layout density, status strip, readout treatment, scored dividers, fader ticks, and instrument buttons. Do not add or retain decorative corner screws to match the design direction.

---

## Outstanding work

### Global — hardcoded cyan — RESOLVED

All cyan (`#22d3ee`, `cyan-*`) replaced with `--lab-accent` tokens across hero, constellation, escape hatch, and comment references. Zero cyan remaining in `src/`.

### Global — barrel imports — RESOLVED

All 6 barrel `index.ts` files deleted; `App.tsx` uses direct file imports. `lucide-react` barrel imports left as-is — Vite ESM tree-shaking handles these efficiently (audit penalty was Next.js-specific).

### Global — deleted stale files — RESOLVED

`ControlPanel.tsx`, `SlideTransition.tsx`, `transitions/index.ts` removed and committed.

### Sinewaves — align with design direction (panel screws)

The current implementation includes four decorative corner screws (`PanelScrew` in `Layout.tsx`). The design direction is to omit them; see **Implementation vs mockups** above. When touching the layout, remove the screws to match the mockups and free space.

### Sinewaves — lower-priority polish

These are documented in [SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md](./SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md). None block the next module.

1. **Resize distortion:** Scene layout may desync with Canvas on viewport resize. Needs reproduction and targeted fix.
2. **Match-success animation:** `matchSuccessSequence` exists in `animations.ts` but is not wired — celebration uses a static overlay instead of the staged timeline (pulse → highlight → feedback → continue).
3. **Mobile control spacing:** Control strip uses `gap-2` on mobile which feels cramped. Toggle-group for Speed would improve consistency and touch targets.

### Sinewaves — match-proximity bugs — RESOLVED

Ghost wave sync, snap-to-target, `challengeParam` for challenge stage — all fixed. See [SINEWAVES-MATCH-PROXIMITY-AUDIT.md](./SINEWAVES-MATCH-PROXIMITY-AUDIT.md).

### Infrastructure — skeleton not consumed

Reusable hooks in `src/lib/skeleton/` (useModuleFlow, useStageUnlock, useChallengeAssist, etc.) are implemented and tested but not yet consumed by any module. Rigid Motions is the natural first consumer.

### Performance — medium/low findings

localStorage versioning, conditional rendering (`&&` vs ternary), `useTransition` for module loading, `useMemo` for primitives, event listener dedup. See [VERCEL-REACT-BEST-PRACTICES-AUDIT.md](./VERCEL-REACT-BEST-PRACTICES-AUDIT.md).

---

## Documents in this folder

| Document | Purpose | Status |
|----------|---------|--------|
| **README.md** (this file) | Current direction, status, and outstanding work | Active |
| [SINEWAVES-REFACTOR-SPEC.md](./SINEWAVES-REFACTOR-SPEC.md) | Instrument layout, guide states, responsive grid | Complete — reference |
| [SINEWAVES-FRONTEND-DESIGN-AUDIT.md](./SINEWAVES-FRONTEND-DESIGN-AUDIT.md) | AI slop audit (cyan, glow, modal) — led to Eurorack direction | Superseded |
| [SINEWAVES-MATCH-PROXIMITY-AUDIT.md](./SINEWAVES-MATCH-PROXIMITY-AUDIT.md) | Ghost wave sync, snap-to-target, challenge params | Resolved |
| [SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md](./SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md) | Resize distortion, match animation wiring, control spacing, shadcn registry scan | Open (low priority) |
| [VERCEL-REACT-BEST-PRACTICES-AUDIT.md](./VERCEL-REACT-BEST-PRACTICES-AUDIT.md) | React performance audit (barrel imports, localStorage, etc.) | Open |

Implementation plans live in [docs/plans/](../plans/).
