# Mockup file structure

Use this as the checklist when creating a new module mockup. Copy the section order from `RigidMotions.jsx`.

---

## 1. Design tokens

```js
const T = {
  bg:        "#0f0e0d",
  surface:   "#1a1917",
  surfaceHi: "#232220",
  border:    "#2e2c29",
  text:      "#b8b0a4",
  textDim:   "#6b6460",
  accent:    "#7cc87c",
  accentDim: "rgba(124,200,124,0.22)",
  ghost:     "#7a746a",
  danger:    "#c87c7c",
  info:      "#7caac8",
  white:     "#e8e2da",
};
```

Map these into `:root` in the CSS block. One source of truth for the mockup.

---

## 2. Global CSS (template literal)

Include at minimum:

- `:root` with `--lab-*` vars and font families
- `body`, scrollbar
- `.journey`, `.section-label`
- Viewport: `.viewport-tabs`, `.vp-tab`, `.vp-tab.active`
- State nav: `.state-nav`, `.state-btn`, `.state-btn.active`
- Module frame: `.module-frame`, `.module-frame.mobile` / `.tablet` / `.desktop`
- Device chrome: `.device-chrome`, `.device-chrome.mobile` (with pill notch via `::before`)
- Status strip: `.status-strip`, `.status-left`, `.status-dots`, `.sdot`, `.sdot.done`, `.sdot.active`
- Prompt: `.prompt-readout`, `.prompt-type-badge` (and `.reflect`, `.rotate`, `.capstone` variants), `.prompt-text`, `.prompt-sub`
- Canvas: `.canvas-area` (`.mobile`, `.tablet`, `.desktop` height variants), `.grid-svg`, `.canvas-hint`
- Feedback: `.feedback-banner`, `.feedback-banner.match` / `.miss` / `.close`
- Earned insight: `.earned-insight`
- Controls: `.control-strip`, `.ctrl-group`, `.ctrl-label`, `.ctrl-btn`, `.ctrl-btn.check`, `.ctrl-btn.reset`, `.ctrl-btn.selected`, `.ctrl-spacer`
- Sequence builder: `.seq-builder`, `.seq-step`, `.seq-step.empty`, `.seq-step-label`, `.seq-step-val`
- Formula: `.formula-readout`, `.formula-readout.active`, `.formula-readout.dim`
- Desktop panel: `.panel-section`, `.panel-section-title`, `.progress-stage`, `.progress-stage-fill`, `.vertex-table`, `.vertex-table.hidden`, `.notation-card`, `.notation-card.revealed`, `.insight-list`, `.insight-item`, `.insight-item.earned`, `.insight-dot`
- Journey: `.journey-overview`, `.overview-card`, `.overview-card.active`, `.oc-state`, `.oc-title`, `.oc-desc`, `.oc-badge` (`.l3`, `.l4`, `.l5`, `.transition`)
- Annotation: `.annotation`, `.annotation-icon`
- Top bar: `.top-bar`, `.top-bar-title`, `.top-bar-sub`, `.top-bar-badge`

---

## 3. Guide state index map

Before `STATES`, define a `GUIDE_STATE_MAP` that maps every mockup display state ID (including feedback substates) to its guide state index (0–N). This drives progress dots and the desktop panel — both reflect guide state, not display state.

```js
const GUIDE_STATE_MAP = {
  'predict':          0,
  'feedback-match':   0,  // same guide state as predict
  'feedback-miss':    0,
  'feedback-close':   0,
  'reflect':          1,
  'rotate':           2,
  'coord-reveal':     3,
  'predict-coords':   4,
  'capstone':         5,
};
```

Feedback substates always map to their parent predict state. The progress dot for that state remains active during feedback; it fills only when the student advances (NEXT).

---

## 4. State config shape

Each state object drives the entire module UI. Required shape:

```js
{
  id: 'unique-id',
  label: 'Short Label for Nav',
  badge: 'translate' | 'reflect' | 'rotate' | 'capstone',
  badgeClass: '' | 'reflect' | 'rotate' | 'capstone',
  prompt: 'UPPERCASE PROMPT',
  promptSub: 'Subtext for learner.',
  canvasState: 'key-for-canvas-logic',
  formula: '─── LOCKED ───' | '(x,y) → (x+4,y+2)',
  controls: ['reset', 'speed', 'check'] | ['flip', ...] | ['sequence'],
  showCoords: false | true,
  feedback: null | 'match' | 'miss' | 'close',
  closeHint: 'position' | 'orientation', // only when feedback === 'close'
  ald: 'L3' | 'L4' | 'L5',
  insight: null | "Earned insight quote.",
}
```

`STATES` is an array of these. Canvas component and layouts read `cfg` (current state config).

**Note on `coord-reveal`:** This is a discrete guide state with its own display config. Its `controls` array is empty (or contains only a CONTINUE action). Its `canvasState` shows both pre-image and image with no ghost. It is not a feedback substate.

---

## 5. Canvas / visual component

A component that takes at least:

- `width`, `height`
- `state` (from `cfg.canvasState`) — which scene to draw
- `showCoords` — whether coordinate labels are active

Renders SVG for the coordinate grid, pre-image, ghost (prediction), image (post-reveal or capstone), and state-specific constraint elements (vector, axis ticks, arcs, gap lines).

**Coordinate system:** All geometry is computed in math coordinates (origin center, y-up). Convert to SVG with:
```js
const scale = Math.min(width, height) / 18;  // maps ±9 math units to canvas
const ox = width / 2;
const oy = height / 2;
const toS = (p) => ({ x: ox + p.x * scale, y: oy - p.y * scale });
```

**Rotation arcs:** Compute as a 32-point polyline in math coordinates, then convert. CW in math coordinates = decreasing angle (subtract from `startAngle`):
```js
const endAngle = startAngle - Math.PI / 2; // CW 90° sweep
```

See `CoordGrid` in `RigidMotions.jsx` for the complete reference implementation.

---

## 6. Layout components

- **ModuleMobile({ cfg })** — Status strip, prompt readout, canvas area (with `CoordGridResponsive`), canvas overlays (feedback banner, earned insight, canvas hint), control strip, formula readout. Mobile status strip shows dots, SYS:NOM, and ESC; module title is hidden.

- **ModuleDesktop({ cfg })** — Full-width status strip; two-column body: left = prompt + canvas + controls + formula; right panel = progress bars (using `GUIDE_STATE_MAP` index), vertex coordinate table, coordinate rule card, earned insights list.

**Canvas hint guard:** The "drag to predict" hint must be hidden on post-match states, the capstone, the coordinate-reveal state, and any state where `cfg.feedback` is set. Use an explicit condition:
```jsx
{!cfg.feedback && cfg.id !== 'capstone' && cfg.id !== 'coord-reveal' && (
  <div className="canvas-hint">drag to predict</div>
)}
```

Both `ModuleMobile` and `ModuleDesktop` receive only `cfg` (current state config) as a prop — no internal guide state beyond what's in `cfg`.

---

## 7. Journey overview

`JOURNEY_CARDS`: array of `{ state, title, desc, badge }` for the journey overview grid. One card per guide state (not per display state). Badge maps to ALD level: `l3`, `l4`, `l5`, or `transition`. Clicking a card sets `stateIdx` to the first display state in that guide state's group.

---

## 8. Root App

- Inject `<style>{css}</style>`.
- Top bar: module name, standards string, "Module Mockup" badge.
- Section: "Module Journey" + journey overview (clickable cards).
- Section: "Interactive Mockup" + viewport tabs (mobile / tablet / desktop) + state nav (one button per `STATES` entry).
- Render: device chrome (for mobile) + `ModuleMobile`, or `ModuleDesktop` (for tablet and desktop), from `STATES[stateIdx]`.
- Annotation: designer-facing note that updates per state — describes what's on canvas, what controls are active, and what the student is doing at this moment.

---

## 9. Helpers

- **`CoordGridResponsive`** — Wraps canvas in a `ResizeObserver` div; passes live `width` and `height` to the canvas component.
- **`ControlStrip({ cfg, onSequenceChange })`** — Renders controls from `cfg.controls`. Branches on `'sequence'` to render the `SequenceBuilder` instead of predict controls. Manages local state for speed, flip, rotation degree, and rotation direction.
- **`SequenceStep({ stepNum, value, onChange, disabled })`** — Single capstone step slot. Renders type selector (TRANSLATE / REFLECT / ROTATE) and conditional parameter controls per type. Returns a structured `{ type, params }` object via `onChange`.
- **`sequenceLabel(step)`** — Pure helper that converts a `{ type, params }` object to a display string for the `FormulaReadout` (e.g., `"ROTATE · 90° CW"`). Used in both `ControlStrip` (capstone FormulaReadout) and `SequenceStep` (step value display).

---

## Checklist before "done"

- [ ] Every guide state from the design spec has at least one `STATES` entry.
- [ ] Feedback substates (match, miss, close) are represented as separate display states.
- [ ] `GUIDE_STATE_MAP` covers every `STATES[n].id`.
- [ ] Mobile, tablet, and desktop viewports render without layout breaks.
- [ ] State nav and journey cards switch state; annotation updates per state.
- [ ] Canvas hint is conditionally hidden (not shown post-match, on capstone, or on coord-reveal).
- [ ] Rotation arcs sweep in the correct direction for the specified transformation.
- [ ] Coordinate system uses scale `canvasSize / 18` (not `/ 14`).
- [ ] Tokens and fonts match Eurorack: Inter Tight (UI) + JetBrains Mono (data).
- [ ] Design spec validation: all required states, behaviors, and constraint elements are represented.