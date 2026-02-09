# Sinewaves: Resize, Animations, and Control Panel Audit

**Date:** 2026-02-09  
**Scope:** (1) Visualization/scene distortion on viewport resize; (2) Animations and match celebration structure and wiring; (3) Control panel spacing on mobile and use of ShadCN vs custom components.  
**Intent:** Audit only — no fixes implemented.

---

## Summary

Three lower-urgency areas were reviewed:

1. **Resize distortion:** Scene layout is driven by R3F `useThree().viewport` with no explicit resize handling. Distortion when returning to the original screen size may be due to viewport/Canvas sync, DPR, or stale layout state and needs targeted reproduction and fix.
2. **Animations and celebration:** A structured match-success sequence exists in `animations.ts` (`matchSuccessSequence`) but is **not wired** into the module. The UI uses a static overlay instead; the timeline (pulse → value highlight → feedback → continue) is unused.
3. **Control panel:** Sliders already use the project’s Radix-based (ShadCN-style) `Slider`; the main gaps are tight mobile spacing and custom instrument-control buttons that could be replaced or aligned with ShadCN `toggle-group` for consistency and touch targets.

---

## 1. Visualization/Scene Distortion on Resize

### Observed behavior

When the user changes screen size while in the module (e.g. resize browser or rotate device) and then returns to the original size, the visualization/scene can appear distorted.

### Current architecture

- **Scene.tsx:** Renders a single R3F `<Canvas>` with fixed `camera={{ position: [0, 0, 6], fov: 50 }}`. No `onCreated`, `onResize`, or explicit resize handling.
- **scene-layout.ts:** `useSceneLayout(stage)` and `useIsMobileViewport()` read `useThree().viewport` (width, height). Layout is computed from:
  - `viewport.width`, `viewport.height` for ratios and orientation
  - `window.innerWidth < 768` for mobile (narrow-screen) detection
- Positions (circle, wave) and `scale` are derived from viewport each render; there is no local state caching of layout.

### Likely causes (to confirm with reproduction)

1. **Canvas vs. container size:** R3F’s default behavior is to size the canvas to its container. If the container’s size is not updated correctly on resize (e.g. layout or CSS), the WebGL canvas and the layout math (which may assume a different size) can diverge and then “snap” incorrectly when resizing back.
2. **Device pixel ratio (DPR):** Scene uses `dpr={[1, 1.5]}`. DPR can change when moving between monitors or when the browser zoom or window size changes. If the canvas or viewport is not invalidated or updated when DPR changes, world-space calculations can be wrong after resize.
3. **Viewport update timing:** `useThree().viewport` in R3F is updated from the renderer. If there is a frame or timing gap between the DOM resize and the next R3F update, the scene could render one frame with mismatched dimensions; on resize-back, a similar mismatch could produce visible distortion.
4. **Mixed viewport sources:** Layout uses both R3F viewport and `window.innerWidth`. If one updates before the other (e.g. after a rotation or devtools toggle), circle/wave positions and “mobile” mode could be inconsistent.

### Recommended next steps (when implementing)

- Reproduce the distortion with a clear sequence (e.g. desktop → narrow → desktop) and note exact viewport dimensions and DPR at each step.
- Add a resize observer or R3F `onResize` (if available) and log viewport/canvas size and DPR to confirm they stay in sync.
- Consider forcing a full re-mount or R3F invalidate on resize if the library supports it, or ensure the Canvas container has explicit dimensions (e.g. `width: 100%`, `height: 100%`) so R3F and the layout always see the same size.
- If the cause is DPR, consider re-initializing or updating the renderer when `window.devicePixelRatio` changes.

### Files involved

- `src/components/modules/sinewaves/Scene.tsx` — Canvas, no resize handling
- `src/components/modules/sinewaves/scene-layout.ts` — `useSceneLayout`, `useIsMobileViewport` (viewport + `window.innerWidth`)
- `src/components/modules/sinewaves/Layout.tsx` — Container for the visualization (main); confirm how it gets size on resize

---

## 2. Animations and Match Celebration

### Current state

- **animations.ts** defines:
  - **consoleBootSequence:** Used on module mount; animates status strip, progress bar, prompt; calls `onReadyForScene` so the scene can boot. **Wired** in `InstrumentModule` via `useEffect` and refs.
  - **matchSuccessSequence:** Timeline: 0 ms pulse visualization (scale 1 → 1.05 → 1), 100 ms value highlight, 250 ms feedback message slide up, 450 ms continue button. Takes `MatchSuccessRefs` (visualization, valueHighlight, feedback, continueButton) and `onComplete`. **Not used anywhere** in the sinewaves module.
- **InstrumentModule.tsx:** On match, it sets `matchGlow` and `matchMessage` and renders a **static overlay**: a centered div with message + `ContinueButton`. It does **not** pass refs to the visualization, formula readout, or overlay elements, and does **not** call `matchSuccessSequence`.

So the celebration is “unstructured” in the sense that the designed sequence (pulse → highlight → feedback → button) exists in code but is never run; the user only sees an immediate static overlay.

### Gaps

- No refs for: visualization container, “value highlight” (e.g. formula readout or matched value), feedback text, continue button inside the overlay.
- No call to `matchSuccessSequence` when `matchGlow` / `matchMessage` are set.
- Overlay has no entrance animation; it appears instantly.
- `matchSuccess` is passed to `Scene` for the wave glow, but there is no coordinated timeline with the rest of the HUD.

### Recommended next steps (when implementing)

- Add refs in `InstrumentModule` (or a small wrapper) for: the visualization wrapper (for pulse), the formula readout or matched-value element (for highlight), the feedback message node, and the celebration continue button.
- When setting `matchGlow`/`matchMessage`, call `matchSuccessSequence(refs, () => { ... })` and in `onComplete` keep current behavior (e.g. leave overlay visible until user clicks Continue).
- Optionally animate the overlay itself (e.g. fade/scale in) via GSAP or CSS so the celebration feels staged rather than a single pop.
- Keep `prefers-reduced-motion` behavior: `matchSuccessSequence` already short-circuits and sets final state when reduced motion is preferred.

### Files involved

- `src/components/modules/sinewaves/animations.ts` — `matchSuccessSequence`, `MatchSuccessRefs`
- `src/components/modules/sinewaves/InstrumentModule.tsx` — match state, overlay, no refs or timeline call

---

## 3. Control Panel: Space and Components

### Current implementation

- **Layout:** `Layout.tsx` uses `gap-2 p-2` on mobile and `md:gap-4 md:p-4` on desktop. The control strip lives in the footer with `gap-2 pb-2` on mobile and `md:gap-4 md:pb-0` on desktop.
- **ControlStrip.tsx:** `gap-2 md:gap-4`; sliders row has `gap-2 sm:gap-4 md:gap-6`; action buttons use `gap-3`. So on mobile everything is **gap-2** (8px), which is tight for touch and visual breathing room.
- **ParameterSlider:** Uses `@/components/ui/slider` (Radix-based, ShadCN-style). Not a custom slider implementation; only the wrapper (label + value readout) is custom. Slider has custom thumb styling (e.g. glow) in `src/components/ui/slider.tsx`.
- **InstrumentControls.tsx:** Custom buttons for:
  - Play/Pause (TRACE)
  - Reset
  - Speed (cycle 1x → 2x → 0.5x)
  Buttons use `min-h-[44px]`, `gap-1.5`, `rounded`, border and focus styles. Labels (“Play”, “Pause”, “Reset”) are `hidden sm:inline`, so on mobile only icons show. No ShadCN `ToggleGroup` or shared button-group component.

### ShadCN alignment

- **Sliders:** The project already uses a Radix/ShadCN-style `Slider`; no need to replace the primitive. Possible improvements: ensure the same component (and variants) are used consistently; consider ShadCN “field-slider” or similar if you want a standard label+slider pattern.
- **Button group / pause / speed:** ShadCN has **toggle-group** (Radix Toggle Group). Speed (1x / 2x / 0.5x) is a natural fit for a single-select toggle group. Pause/Play could be a two-option toggle group (Pause | Play) for consistency. Reset can remain a separate button. Using `toggle-group` would standardize touch targets, focus, and keyboard behavior and reduce custom button styling.

### Issues

1. **Mobile spacing:** Control strip and footer use `gap-2` and `p-2` on mobile, so the control panel feels cramped. Sliders, instrument controls, and action buttons need more vertical and horizontal space.
2. **Custom instrument controls:** Pause and Speed are custom buttons. They work but don’t share the same patterns as the rest of the design system; toggle-group would align them with ShadCN and improve consistency.

### Recommended next steps (when implementing)

- **Breathing room on mobile:** Increase mobile spacing for the control area, e.g.:
  - Layout footer: `gap-3` or `gap-4` and `p-3` on mobile (or use a single spacing scale, e.g. `gap-3 p-3`).
  - ControlStrip: at least `gap-3` on mobile between sliders row, instrument controls, and action buttons; consider `gap-4` for the strip on small screens.
- **ShadCN usage:** Add or use ShadCN **toggle-group** for:
  - Speed: options 0.5x, 1x, 2x (single selection).
  - Optionally Pause/Play as a two-option toggle group.
- Keep **ParameterSlider** as-is regarding the Slider primitive; only adjust spacing and layout. If the design system gains a “field-slider” or labeled-slider block, consider migrating to that for consistency.

### Files involved

- `src/components/modules/sinewaves/Layout.tsx` — grid gap and padding (mobile)
- `src/components/modules/sinewaves/components/ControlStrip.tsx` — gap between sliders, controls, actions
- `src/components/modules/sinewaves/components/InstrumentControls.tsx` — custom buttons; candidate for toggle-group
- `src/components/ui/slider.tsx` — already Radix/ShadCN-style; optional variant or “field” usage

---

## 4. Registry scan: Button groups, Slider, Switch, Toggle, Toggle group, Tooltip

A full scan of the **@shadcn** registry was done for control and feedback primitives that could improve the sinewaves control panel or future modules. Below is the catalog; use it when designing the next module or refactoring controls.

### Add command (batch)

To add the core UI components in one go:

```bash
pnpm dlx shadcn@latest add @shadcn/button-group @shadcn/toggle-group @shadcn/toggle @shadcn/switch @shadcn/slider @shadcn/tooltip
```

(Project already has `slider`; add the others as needed.)

---

### Button group (@shadcn)

| Type   | Item                | Notes |
|--------|---------------------|-------|
| **ui** | `button-group`      | Primitive: groups buttons visually (e.g. shared borders, no double gutters). |
| example | `button-group-demo` | Multiple groups: back + Archive/Report + Snooze with dropdown; good for toolbar patterns. |
| example | `button-group-size` | Size variants. |
| example | `button-group-split` | Split button (primary + dropdown). |
| example | `button-group-input` | Button group with an input (e.g. search + actions). |
| example | `button-group-select` | Select-style with grouped options. |
| example | `button-group-nested` | Nested groups. |
| example | `button-group-popover` | Group with popover. |
| example | `button-group-dropdown` | Group with dropdown. |
| example | `button-group-separator` | With separators between segments. |
| example | `button-group-orientation` | Horizontal vs vertical. |
| example | `button-group-input-group`, `input-group-button`, `input-group-button-group` | Combined with input-group. |

**Use for:** Instrument toolbar (Pause | Reset | Speed) as a single visual group; consistent borders and touch targets; future modules with action rows.

---

### Slider (@shadcn)

| Type   | Item           | Notes |
|--------|----------------|-------|
| **ui** | `slider`       | Radix-based; project already uses this. |
| example | `slider-demo`  | Basic usage. |
| example | `field-slider` | Slider inside `Field` (FieldTitle, FieldDescription, live value in description). Good for “labeled slider with hint” pattern (e.g. amplitude/frequency with copy). |

**Use for:** Sinewaves already uses the slider primitive; consider **field-slider** pattern (or `Field` + Slider) for a consistent label + description + value readout and to align with ShadCN form patterns in the next module.

---

### Switch (@shadcn)

| Type   | Item              | Notes |
|--------|-------------------|-------|
| **ui** | `switch`          | Radix-based on/off toggle. |
| example | `switch-demo`     | Basic usage. |
| example | `field-switch`   | Switch with `Field` (label, description); horizontal layout. |
| example | `form-rhf-switch`, `form-tanstack-switch` | With React Hook Form / TanStack Form. |

**Use for:** Binary options (e.g. “Show ghost wave”, “Sound on”) in sinewaves or future modules; **field-switch** for settings with a label and short description.

---

### Toggle (@shadcn) — single pressable

| Type   | Item              | Notes |
|--------|-------------------|-------|
| **ui** | `toggle`          | Single toggle (pressed/unpressed), e.g. bold in a toolbar. |
| example | `toggle-demo`    | Basic. |
| example | `toggle-sm`, `toggle-lg` | Size variants. |
| example | `toggle-outline`  | Outline variant. |
| example | `toggle-disabled` | Disabled state. |
| example | `toggle-with-text` | Toggle with label. |
| example | `mode-toggle`    | Theme/mode switcher pattern. |

**Use for:** Single “sticky” state (e.g. “Trace on/off” as one button that stays pressed when active); differs from toggle-group which is for one-of-many.

---

### Toggle group (@shadcn) — one or many of N

| Type   | Item                   | Notes |
|--------|------------------------|-------|
| **ui** | `toggle-group`         | Radix Toggle Group: single or multiple selection from a set. |
| example | `toggle-group-demo`   | Multiple selection (e.g. Bold, Italic, Underline). |
| example | `toggle-group-single` | Single selection (one-of-many). |
| example | `toggle-group-sm`, `toggle-group-lg` | Size variants. |
| example | `toggle-group-spacing` | Spacing between items. |
| example | `toggle-group-outline` | Outline variant. |
| example | `toggle-group-disabled` | Disabled items. |

**Use for:** **Speed (0.5x | 1x | 2x)** as single-select toggle group; optionally **Pause | Play** as two-option group. Improves consistency, keyboard nav, and touch targets vs custom buttons.

---

### Tooltip (@shadcn)

| Type   | Item                 | Notes |
|--------|----------------------|-------|
| **ui** | `tooltip`            | Radix-based; Tooltip, TooltipTrigger, TooltipContent. |
| example | `tooltip-demo`       | Simple: trigger (e.g. Button) + content (“Add to library”). |
| example | `kbd-tooltip`        | Tooltip with keyboard shortcut hint. |
| example | `input-group-tooltip` | Tooltip with input group. |
| (chart) | `chart-tooltip-*`    | Chart-specific tooltips (formatter, label, indicator); less relevant for control panel. |

**Use for:** Icon-only controls on mobile (Pause, Reset, Speed) so hover/focus shows “Pause”, “Reset”, “Speed: 1x”. Improves accessibility and clarity when labels are `hidden sm:inline`. Same pattern for any future module with icon buttons.

---

### Summary: quick wins for this and next module

| Component     | Registry items to add (if missing) | Suggested use |
|--------------|------------------------------------|----------------|
| **Toggle group** | `toggle-group` (+ examples: single, outline, size) | Speed 0.5x / 1x / 2x; optionally Pause/Play. |
| **Tooltip**      | `tooltip`                          | All icon-only instrument controls (and any icon-only actions). |
| **Button group**| `button-group`                     | Group Pause + Reset + Speed into one toolbar chunk. |
| **Field + Slider** | `field` (if not present), `field-slider` example | Labeled amplitude/frequency with description; next module forms. |
| **Switch**      | `switch`, `field-switch`           | Future toggles (e.g. “Show ghost”, “Sound”). |
| **Toggle**      | `toggle`                           | Single sticky state (e.g. “Trace on”) if not using toggle-group. |

---

## Files to change (when implementing)

| Issue | Files |
|-------|--------|
| Resize distortion | `Scene.tsx`, `scene-layout.ts`, `Layout.tsx` (container sizing); possibly R3F/Canvas resize or DPR handling |
| Animations / celebration | `InstrumentModule.tsx` (refs, call `matchSuccessSequence`), optionally overlay markup for refs |
| Control panel spacing & components | `Layout.tsx`, `ControlStrip.tsx` (mobile gap/padding); `InstrumentControls.tsx` (toggle-group for speed, optionally pause); ShadCN components per **§4** (toggle-group, tooltip, button-group, etc.) |
