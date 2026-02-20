# Mockups

Static HTML prototypes for design validation before implementation. Each mockup demonstrates layout, interactions, and visual design using the Eurorack design system.

---

## Purpose

Mockups serve three functions:

1. **Design validation** — Verify visual design and layout before writing React components
2. **Stakeholder review** — Share interactive prototypes without requiring dev environment
3. **Implementation reference** — Provide pixel-perfect specifications for component development

All mockups use production design tokens (`--lab-*` CSS variables) and production fonts (Inter Tight, JetBrains Mono).

---

## Current Mockups

### Rigid Motions Module

**File:** `rigid-motions-all-states.html`  
**Design Spec:** [docs/plans/2026-02-19-rigid-motions-design-spec.md](../docs/plans/2026-02-19-rigid-motions-design-spec.md)  
**Status:** Design validation complete, ready for implementation

Demonstrates all 6 guide states:

1. **Predict-Translate** — Translation vector from pre-image to ghost
2. **Predict-Reflect** — Reflection axis ticks showing equidistance
3. **Predict-Rotate** — Rotation arcs sweeping around origin
4. **Coordinate Reveal** — Earned moment with coordinate rules in FormulaReadout
5. **Predict with Coordinates** — Composed sequences with coordinate labels active
6. **Capstone** — Sequence builder for inverse task (identify the transformation)

**Responsive:** Desktop (≥768px) and mobile (<768px) layouts both demonstrated. Mobile uses stacked readouts, compact status strip, and 44px touch targets.

**How to view:**

```bash
# Windows
start mockups/rigid-motions-all-states.html

# macOS
open mockups/rigid-motions-all-states.html
```

Or open directly in browser, or serve the repo and navigate to `/mockups/`.

### Sinewaves Module

**Status:** Module complete; mockups archived  
**Reference:** See `src/components/modules/sinewaves/ARCHITECTURE.md` for as-built implementation

---

## Design System Alignment

All mockups follow the Eurorack design system defined in `src/index.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--lab-bg` | `#1e1d1c` | Warm faceplate background |
| `--lab-surface` | `#252422` | Readout backgrounds |
| `--lab-accent` | `#7cc87c` | Phosphor green (active elements, ghost shapes) |
| `--lab-text` | `#b8b0a4` | Silk cream (body text) |
| `--lab-ghost` | `#7a746a` | Muted elements (constraint visuals, locked params) |
| `--lab-success` | `#5a7a5a` | Earthy green (completed states) |
| `--lab-danger` | `#8a4a4a` | Muted red (reset/danger actions) |

**Typography:**
- **UI text:** Inter Tight (display, body, labels)
- **Data/coordinates:** JetBrains Mono (formulas, readouts, numeric values)

**Layout:**
- 4-row grid on desktop: StatusStrip | Readouts | Canvas | ControlStrip
- 6-row stack on mobile: StatusStrip | PromptReadout | FormulaReadout | Canvas | ControlStrip
- Scored dividers between sections (1px `--lab-border`)

---

## Mockup Workflow

When designing a new module:

1. **Create design spec** — Define pedagogy, ALD progression, interactions
2. **Build static mockup** — HTML/CSS prototype with all states
3. **Validate against spec** — Verify mockup satisfies all design requirements
4. **Implement components** — Build React components matching validated mockup
5. **Document as-built** — Create ARCHITECTURE.md after implementation complete

Mockups are **not** maintained after implementation. They serve as design validation artifacts, not living documentation.
