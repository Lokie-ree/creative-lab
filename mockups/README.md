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
- **All guide states** → Data-driven; one config object per state (prompt, canvas, controls, formula, feedback, ALD)
- **Viewport switcher** → Mobile, tablet, desktop (with device chrome for mobile)
- **State nav** → Jump to any state; journey overview cards for flow
- **Annotation** → Designer-facing note describing the current state

**How to view:** Mount the default export in a route (e.g. `/mockups/rigid-motions`) or open the file as the reference. The mockup is self-contained (tokens + CSS in file; no app theme required).

**States covered:** Predict (translate, reflect, rotate), feedback (match/miss), coordinate reveal, predict-with-coordinates, capstone. Matches the six-stage journey in the design spec.

---

## Mockup format and structure

New module mockups should follow the same structure as `RigidMotions.jsx`. See [MOCKUP-STRUCTURE.md](./MOCKUP-STRUCTURE.md) for the required sections and order. In short:

| Section | Purpose |
|--------|---------|
| Design tokens `T` | Single source for colors; inject into `:root` |
| Global `css` | Fonts, scrollbar, section labels, viewport tabs, state nav, module frame, status strip, prompt, canvas, controls, formula, overlays, desktop panel, journey cards, annotations |
| Canvas/visual component | SVG or placeholder that renders by state (e.g. `CoordGrid`) |
| `STATES` | Array of state configs driving prompt, canvas, formula, controls, feedback, ALD |
| `ModuleMobile` / `ModuleDesktop` | Layouts that take current state `cfg` and render strip, prompt, canvas, controls, formula (desktop + side panel) |
| `JOURNEY_CARDS` | High-level journey for overview; maps to state indices |
| Root `App` | Top bar, journey overview, viewport tabs, state nav, device chrome, module, annotation |

---

## Design system alignment

Mockups use the same Eurorack tokens as production. In `RigidMotions.jsx`: `--lab-bg`, `--lab-surface`, `--lab-surface-hi`, `--lab-border`, `--lab-text`, `--lab-text-dim`, `--lab-accent`, `--lab-ghost`, `--lab-danger`, `--lab-info`, `--lab-white`. **Fonts:** Production uses **Inter Tight** (display/body) and **JetBrains Mono** (data); mockups may use different typefaces for speed—align with `src/index.css` when implementing.

---

## Workflow

When designing a new module:

1. **Create design spec** — Pedagogy, ALD progression, interactions (per module-planning-pipeline).
2. **Build mockup** — Copy [MOCKUP-STRUCTURE.md](./MOCKUP-STRUCTURE.md), then implement a single JSX file following `RigidMotions.jsx` (tokens, states, viewports, journey, annotation).
3. **Validate against spec** — Confirm every required state and viewport is represented and matches the spec.
4. **Implement** — Build React components to match the validated mockup.
5. **Document as-built** — Add `ARCHITECTURE.md` in the module folder after implementation.

Mockups are design-validation artifacts. They are not maintained as living docs after implementation; the codebase and ARCHITECTURE.md are.

---

## Other references

- **Sinewaves:** Module complete; see `src/components/modules/sinewaves/ARCHITECTURE.md` for as-built. Historical Eurorack layout reference only if needed; **RigidMotions.jsx is the current exemplar.**
