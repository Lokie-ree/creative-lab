# Design — Current Direction

**Last updated:** February 12, 2026

This folder holds design specs and audits for creative-lab. Below is the current direction; individual docs add detail and implementation plans.

---

## Current direction

### Product / UX

- **Sinewaves = scientific instrument, not a tutorial.** Everything is always visible and interactive. Pedagogy lives in what the instrument draws your attention to, not in what it withholds. Think oscilloscope, not slideshow.
- **Five guide states:** watch → match-amplitude → match-frequency → challenge → free. No sub-phases; prompts only. User can always drag any slider; the guide points at the interesting part.
- **Match feedback:** Wave glows (amber/earthy green), prompt advances. No blocking modal — inline banner or strip so the instrument stays visible.
- **Controls:** TRACE (play/pause), RESET, SPEED (0.5x / 1x / 2x). Always visible. Grid lines behind the viz; silk-screen style labels; StatusStrip with SINEWAVES title, progress dots, SYS:NOM, ESC.

*Source:* [SINEWAVES-REFACTOR-SPEC.md](./SINEWAVES-REFACTOR-SPEC.md)

### Visual / brand

- **Chosen direction: Eurorack / synth module.** Matte faceplate, phosphor green accent, silk-screened labels, scored dividers, no glow. Moves the app off “AI slop” (cyan-on-dark, monospace-as-technical, glow, blocking modal).
- **Palette:** Warm neutrals (`#1e1d1c` faceplate, `#252422`, `#2e2c28`), phosphor green accent (`#7cc87c`), cream/silk text (`#b8b0a4`), muted red for RESET/danger (`#8a4a4a`). No cyan; no blur/glow.
- **Typography:** Inter Tight for display and body; JetBrains Mono for data/readouts. Labels: small, UPPERCASE, wide tracking (silk-screen).
- **Components:** Rectangular fader thumbs (no rounded glow); flat panels with scored borders; optional corner screws; no rounded cards or left-edge accent bar.

*Source:* [plans/2026-02-10-sinewaves-eurorack-reskin.md](../plans/2026-02-10-sinewaves-eurorack-reskin.md), mockup `mockups/eurorack-sinewaves.html`

### Implementation status

- **Refactor (instrument layout, guide states, grid lines):** Complete.
- **Eurorack reskin:** Complete. Tokens, sliders, panels, R3F, bug fixes, typography, and polish all done.
- **Bug fixes (design-relevant):** Ghost wave sync, snap-to-target, inline celebration banner, easing — all resolved.
- **Remaining:** Hero and constellation still have hardcoded cyan values (see AGENT.md Follow-up Items).

*Sources:* [SINEWAVES-REFACTOR-SPEC.md](./SINEWAVES-REFACTOR-SPEC.md), [plans/2026-02-10-sinewaves-eurorack-reskin.md](../plans/2026-02-10-sinewaves-eurorack-reskin.md), [SINEWAVES-MATCH-PROXIMITY-AUDIT.md](./SINEWAVES-MATCH-PROXIMITY-AUDIT.md), [SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md](./SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md)

---

## Documents in this folder

| Document | Purpose |
|----------|---------|
| **README.md** (this file) | Current direction and index. |
| [SINEWAVES-REFACTOR-SPEC.md](./SINEWAVES-REFACTOR-SPEC.md) | Instrument layout, guide states, responsive grid, what to keep/remove/add. |
| [SINEWAVES-FRONTEND-DESIGN-AUDIT.md](./SINEWAVES-FRONTEND-DESIGN-AUDIT.md) | Frontend-design skill audit: what was generic (cyan, glow, modal) and recommendations; superseded by Eurorack as the chosen direction. |
| [SINEWAVES-MATCH-PROXIMITY-AUDIT.md](./SINEWAVES-MATCH-PROXIMITY-AUDIT.md) | Ghost/user wave sync and snap-to-target; challenge-stage ghost params. |
| [SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md](./SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md) | Resize distortion, match-success sequence wiring, control panel spacing and ShadCN alignment. |
| [VERCEL-REACT-BEST-PRACTICES-AUDIT.md](./VERCEL-REACT-BEST-PRACTICES-AUDIT.md) | React/Vercel best-practices audit. |

Implementation plans (with task order and file lists) live in [docs/plans/](../plans/), e.g. the Eurorack reskin plan.
