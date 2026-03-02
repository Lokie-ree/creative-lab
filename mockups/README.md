# Mockups

Interactive React/JSX prototypes for design validation before implementation. Mockups demonstrate every guide state, all viewports, and the full user journey using the Eurorack design system. They are the **single source of visual truth** between design spec and build.

**Exemplar:** `RigidMotions.jsx` — use it as the template for the next module.

---

## Purpose

1. **Design validation** — Verify layout, hierarchy, and states against the design spec before writing production components.
2. **Stakeholder review** — Share a runnable prototype (all states + mobile/tablet/desktop) without relying on the live app.
3. **Implementation reference** — Build React components to match the validated mockup; tokens and structure map directly.

---

## Exemplar: RigidMotions.jsx

**File:** `RigidMotions.jsx`  
**Design Spec:** [docs/plans/2026-02-19-rigid-motions-design-spec.md](../docs/plans/2026-02-19-rigid-motions-design-spec.md)

Single-file React mockup. Contains:

- **Design tokens** → `:root` CSS variables (Eurorack palette)
- **Guide state index map** → `GUIDE_STATE_MAP` mapping every display state ID (including feedback substates) to its guide state index; drives progress dots and desktop panel
- **All display states** → Data-driven; one config object per display state (prompt, canvas, controls, formula, feedback, ALD)
- **Viewport switcher** → Mobile (with device chrome), tablet, desktop
- **State nav** → Jump to any display state; journey overview cards for high-level flow
- **Annotation** → Designer-facing note describing the current state — what's on canvas, what controls are active, what the student is doing

**How to view:** Mount the default export in a route (e.g. `/mockups/rigid-motions`) or open the file as a reference. The mockup is self-contained (tokens + CSS inline; no app theme required).

**Display states covered:**

| Display state | Guide state | Notes |
|---|---|---|
| `predict` | predict-translate | Ghost visible; translation vector live |
| `feedback-match` | predict-translate | Image settles on ghost; earned insight fires |
| `feedback-miss` | predict-translate | Gap lines from ghost to correct position |
| `feedback-close` | predict-translate | Specific hint (orientation or position) |
| `reflect` | predict-reflect | FLIP toggle; axis ticks |
| `rotate` | predict-rotate | Degree + CW/CCW toggles; rotation arcs |
| `coord-reveal` | coordinate-reveal | FormulaReadout; coordinates activate on both shapes |
| `predict-coords` | predict-with-coordinates | Coordinates live; composed sequences |
| `capstone` | capstone | Sequence builder; live preview ghost |

---

## Mockup format and structure

New module mockups must follow the same structure as `RigidMotions.jsx`. See [MOCKUP-STRUCTURE.md](./MOCKUP-STRUCTURE.md) for required sections, order, and implementation notes. In short:

| Section | Purpose |
|--------|---------|
| Design tokens `T` | Single source for colors; inject into `:root` |
| Global `css` | Fonts, layout, all component classes |
| `GUIDE_STATE_MAP` | Maps display state IDs → guide state index; drives progress dots and desktop panel |
| `STATES` | Array of display state configs; drives prompt, canvas, formula, controls, feedback, ALD |
| Canvas component | SVG that renders by `canvasState` (pre-image, ghost, image, constraint elements) |
| `ModuleMobile` / `ModuleDesktop` | Layouts that take `cfg` and render the full instrument; architecturally distinct (not just scaled) |
| `JOURNEY_CARDS` | One card per guide state; maps to display state index on click |
| Root `App` | Top bar, journey overview, viewport tabs, state nav, device chrome, module render, annotation |

---

## Design system alignment

Mockups use the same Eurorack tokens as production:

| Token | Value | Role |
|---|---|---|
| `--lab-bg` | `#0f0e0d` | Canvas and app background |
| `--lab-surface` | `#1a1917` | Module panel, control strip |
| `--lab-surface-hi` | `#232220` | Prompt readout, elevated surfaces |
| `--lab-border` | `#2e2c29` | All dividers and borders |
| `--lab-text` | `#b8b0a4` | Pre-image shape, primary text |
| `--lab-text-dim` | `#6b6460` | Labels, secondary text |
| `--lab-accent` | `#7cc87c` | Ghost, confirmed image, active states |
| `--lab-ghost` | `#7a746a` | Constraint elements, muted overlays |
| `--lab-danger` | `#c87c7c` | RESET button, miss feedback |
| `--lab-info` | `#7caac8` | Close feedback, reflect badge |
| `--lab-white` | `#e8e2da` | Prompt text (highest contrast) |

**Fonts:** Production uses **Inter Tight** (display/body) and **JetBrains Mono** (data/readouts). Mockups use the same fonts; import from Google Fonts in the CSS block.

**Coordinate system:** Scale factor is `canvasSize / 18`, mapping ±9 math units to the canvas dimension. Content is constrained to ±6 units. This is the authoritative value — do not use `/ 14`.

---

## Workflow

When designing a new module:

1. **Create design spec** — Pedagogy, ALD progression, interactions (per module-planning-pipeline).
2. **Build mockup** — Copy [MOCKUP-STRUCTURE.md](./MOCKUP-STRUCTURE.md), implement a single JSX file following `RigidMotions.jsx`.
3. **Validate against spec** — Confirm every required guide state, viewport, and constraint element is represented and matches the spec. Update both the mockup and spec if discrepancies are found.
4. **Implement** — Build React components to match the validated mockup.
5. **Document as-built** — Add `ARCHITECTURE.md` in the module folder after implementation.

Mockups are design-validation artifacts. They are not maintained as living docs after implementation; the codebase and `ARCHITECTURE.md` are.

---

## Other references

- **Sinewaves:** Module complete; see `src/components/modules/sinewaves/ARCHITECTURE.md` for as-built. Historical Eurorack layout reference only — **RigidMotions.jsx is the current exemplar.**