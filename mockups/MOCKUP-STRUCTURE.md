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
- Device chrome: `.device-chrome`, `.device-chrome.mobile` (notch optional)
- Status strip: `.status-strip`, `.status-left`, `.status-dots`, `.sdot.done` / `.active`
- Prompt: `.prompt-readout`, `.prompt-type-badge`, `.prompt-text`, `.prompt-sub`
- Canvas: `.canvas-area`, `.grid-svg`, `.canvas-hint`
- Feedback: `.feedback-banner`, `.feedback-banner.match` / `.miss` / `.close`
- Earned insight: `.earned-insight`
- Controls: `.control-strip`, `.ctrl-group`, `.ctrl-label`, `.ctrl-btn`, `.ctrl-btn.check` / `.reset` / `.selected`
- Formula: `.formula-readout`, `.formula-readout.active` / `.dim`
- Overlays: e.g. `.coord-reveal-overlay`, `.coord-reveal-card`
- Desktop: `.desktop-layout`, `.panel-section`, `.progress-stage`, `.vertex-table`, `.notation-card`, `.insight-list`
- Journey: `.journey-overview`, `.overview-card`, `.oc-badge`
- Annotation: `.annotation`
- Top bar: `.top-bar`, `.top-bar-title`, `.top-bar-sub`, `.top-bar-badge`

---

## 3. State config shape

Each state object should drive the whole module UI. Example shape:

```js
{
  id: 'unique-id',
  label: 'Short Label for Nav',
  badge: 'translate' | 'reflect' | 'rotate' | 'capstone',
  badgeClass: '' | 'reflect' | 'rotate' | 'capstone',
  prompt: 'UPPERCASE PROMPT',
  promptSub: 'Subtext for learner.',
  canvasState: 'key-for-canvas-logic',
  formula: '─── LOCKED ───' or '(x,y) → (x+4,y+2)',
  controls: ['reset', 'speed', 'check'] | ['flip', ...] | ['sequence'],
  showCoords: false | true,
  feedback: null | 'match' | 'miss' | 'close',
  ald: 'L3' | 'L4' | 'L5',
  insight: null | "Earned insight quote.",
  revealOverlay: true,  // optional
}
```

`STATES` is an array of these. Canvas component and layouts read `cfg` (current state).

---

## 4. Canvas / visual component

A component that takes at least:

- `width`, `height`
- `state` (or `cfg.canvasState`) — which scene to draw
- `showCoords` if coordinates are earned

Renders SVG (or placeholder) for pre-image, ghost, image, and any state-specific visuals (vector, axis ticks, arcs, gap lines). See `CoordGrid` in `RigidMotions.jsx`.

---

## 5. Layout components

- **ModuleMobile({ cfg })** — Status strip, prompt, canvas (with responsive wrapper), feedback/insight/overlay, control strip, formula readout.
- **ModuleDesktop({ cfg })** — Same strip; two-column body: left = prompt + canvas + controls + formula; right = progress, vertex table, notation card, earned insights.

Both receive the current state config; no internal state for “which stage” beyond what’s in `cfg`.

---

## 6. Journey overview

`JOURNEY_CARDS`: array of `{ state, title, desc, badge }` for the journey overview. Badge can map to ALD (e.g. `l3`, `l4`, `l5`) or `transition`. Clicking a card sets the selected state index (map card index to state index if not 1:1).

---

## 7. Root App

- Inject `<style>{css}</style>`.
- Top bar: module name, standards, “Module Mockup” badge.
- Section: “Module Journey” + journey overview (clickable cards).
- Section: “Interactive Mockup” + viewport tabs (mobile / tablet / desktop) + state nav (one button per `STATES` entry).
- Render: device chrome (for mobile) + `ModuleMobile` or `ModuleDesktop` from `STATES[stateIdx]`.
- Annotation: short designer note for current state (e.g. what’s on canvas, what’s interactive).

---

## 8. Optional helpers

- **ControlStrip({ cfg })** — Renders buttons from `cfg.controls` (flip, rotation, reset, speed, check, sequence).
- **CoordGridResponsive** — Wraps canvas in ResizeObserver, passes width/height.
- **Overlay components** — e.g. coordinate reveal modal; shown when `cfg.revealOverlay`.

---

## Checklist before “done”

- [ ] Every guide state from the design spec has a `STATES` entry.
- [ ] Mobile, tablet, and desktop viewports render correctly.
- [ ] State nav and journey cards switch state; annotation updates.
- [ ] Tokens and fonts match Eurorack (or document the delta).
- [ ] Design spec validation: all required states and behaviors represented.
