# Sinewaves Module — Observatory HUD Design Direction

**Commitment:** The sinewaves module looks and feels like a **control room readout** — you’re at the console, watching the wave get traced. One clear aesthetic, executed with precision.

---

## 1. What “Observatory HUD” Means Here

**Mood:** Mission control / telescope control room / oscilloscope lab. Dark, focused, technical. The screen is your instrument panel: primary display (the viz) dominates; status, readouts, and controls sit in defined regions and don’t compete.

**One thing someone remembers:** *“I was in the control room, watching the dot trace the wave.”* Not “I used a learning app” — “I was at the console.”

**References (vibe, not literal copy):**  
NASA mission control, radio telescope UIs, oscilloscope displays, sci‑fi HUDs (e.g. Alien, Ex Machina). Dense information when it matters; generous space around the main display so the eye lands there first.

**Differentiation from “generic learning app”:**  
We don’t look like a card-based course UI. We look like a **single-screen instrument**: one main display, a thin status strip, readout panels, and controls. Hierarchy is obvious; typography and color read as “technical” and “live.”

---

## 2. Design Principles (Observatory HUD)

| Principle | Meaning for this module |
|-----------|-------------------------|
| **Primary display is sacred** | The circle + wave viz is the main scope. Nothing overlaps it; chrome is pushed into strips and corners. |
| **Readouts, not cards** | Prompt and formula feel like **readouts** (labels, values, mono where it’s data) — not marketing cards. |
| **Status strip, not header** | Top band is a **status strip**: progress = stage/mission step; minimal height; one clear row. |
| **Sharp accents on dark** | Cyan = live/active; amber = learning moment / “earned”; muted = secondary. No timid, even distribution. |
| **Technical typography** | Display or mono for “instrument” feel; one clear hierarchy (primary readout vs labels). |
| **One composed moment** | First load or stage change feels like the console coming online: strip → readout → display (or similar). |

---

## 3. Typography

**Direction:** Technical, legible, characterful. Pair a **display or technical font** for headings/primary readout with a **refined mono** for data (formula, values).

**Concrete choices (recommendations; can swap for alternatives that fit the same roles):**

- **Primary readout / prompt title:** A display or semi-mono with character — e.g. **JetBrains Mono**, **IBM Plex Mono**, or **Geist Mono** for a “control panel” feel. Avoid Inter, Roboto, system UI.
- **Body / secondary:** Same family in a lighter weight or a complementary sans — e.g. **IBM Plex Sans** or **Geist** for labels and subtext so it stays readable.
- **Data / formula:** Mono only — formula, numbers, “You’re building” use the mono face. Tabs, alignment, and weight (e.g. semibold for discovered values) do the hierarchy.

**Implementation:**  
Load one or two families in `index.html` (e.g. Google Fonts or self-host). Use CSS variables (e.g. `--font-display`, `--font-mono`) and apply in Layout (ObservatoryLayout), PromptReadout, FormulaReadout, and StatusStrip “readout” components. Progress strip can stay minimal (no big type) but any stage label should use the same system.

---

## 4. Color & Theme

**Direction:** Dark room; cyan = live signal; amber = “earned” or learning moment. Keep existing `--lab-*` palette but **use it with HUD intent**.

**Roles:**

- **Background:** Deep dark (`--lab-bg`). Optional: very subtle gradient (e.g. slightly cooler at top, warmer at bottom) or a tiny amount of noise/grain so it’s not flat. No bright gradients — atmosphere, not decoration.
- **Primary accent (cyan):** Live data, active control, “you are here.” Formula values once discovered, progress fill, primary buttons, viz stroke. Use at full strength for few elements so they pop.
- **Learning accent (amber):** “Earned” moment — e.g. match celebration, reveal highlight. Use sparingly so it feels like an event.
- **Readout panels (prompt, formula):** Dark surface with a **single edge glow or border** (e.g. cyan at 10–20% opacity on one side) so they read as “panels” not cards. Text: primary for main readout, muted for labels.
- **Status strip:** Dark; progress bar can be a thin cyan fill. No big blocks of color — strip stays low-profile.

**EscapeHatch / nav:** Align with the same system (e.g. `--lab-*` and same border/glow language) so the top-left feels part of the console, not a different app.

---

## 5. Spatial Composition

**Direction:** One main display; everything else is strip or panel. Clear regions, semantic spacing.

**Regions:**

1. **Status strip (top)**  
   Single row: progress + optional stage label. Height: one semantic unit (e.g. 40px or 48px). EscapeHatch sits in this strip (e.g. left) or just below it so the top doesn’t have two competing “headers.”  
   **Spacing:** Strip has internal padding (e.g. 12px vertical); content below starts at **strip height + one unit** (e.g. 48px + 24px = 72px from top).

2. **Primary readout (prompt)**  
   One panel: “What you’re watching.” Centered or slightly offset; max-width so it doesn’t span the whole width. Starts at **strip + 1 unit**.  
   Feels like a **label above the main scope**, not a hero card. So: smaller type, less padding than current “card” treatment; optional thin border or bottom glow that ties to the viz area.

3. **Secondary readout (formula)**  
   “What you’re building.” Positioned so it doesn’t compete with the prompt — e.g. **same row as prompt but right-aligned**, or **next row, right-aligned**. Same panel language (dark + edge glow). Mono, data-like.

4. **Primary display (viz)**  
   Starts after readouts with **one consistent gap** (e.g. 24px). Gets all remaining vertical space minus the **controls strip** at the bottom. No overlap from strip or readouts; padding is consistent (e.g. 24px horizontal on large screens).

5. **Controls strip (bottom)**  
   One horizontal band: sliders, buttons, or question. Height defined by content but with a **minimum bottom padding** (e.g. 24px from viewport bottom). Same “strip” idea as top — contained, not floating cards.

**Spacing scale (semantic):**  
Define a small scale and use it everywhere, e.g.:

- `--space-1: 4px`
- `--space-2: 8px`
- `--space-3: 12px`
- `--space-4: 16px`
- `--space-6: 24px`
- `--space-8: 32px`
- `--space-12: 48px`

Then: strip height = `--space-12`; gap below strip = `--space-6`; gap between readout and viz = `--space-6`; viz side padding = `--space-6`. Replace ad hoc `top-12`/`top-20`/`pt-40` with these tokens so the layout is “observatory” by construction.

---

## 6. Hierarchy

**Direction:** One dominant, one secondary, rest supporting.

| Level | Element | Treatment |
|-------|---------|-----------|
| **Primary** | Circle + wave viz | Largest area; no overlap; optional very subtle vignette or border so it reads as “the scope.” |
| **Secondary** | Prompt (what you’re watching) | Readout panel; clear but not bigger than needed; one weight/size step above labels. |
| **Tertiary** | Formula (what you’re building) | Same panel style; smaller or equal to prompt; mono. |
| **Chrome** | Status strip, controls strip, EscapeHatch | Minimal height; muted borders; no competing with readouts or viz. |

Progress bar stays subtle (thin cyan fill). “Earned” moments (match, reveal) can briefly use amber or a slight scale/pulse so they feel like **events** on the console.

---

## 7. Motion

**Direction:** One composed moment; rest is subtle.

- **Console coming online:** On load or major stage change, one short sequence: status strip in → readout in → viz in (or similar). Staggered (e.g. 80–120ms apart), short duration (200–300ms). No bouncy or playful motion — “system ready.”
- **Progress:** Optional: progress bar fill is animated (e.g. ease-out) when stage advances.
- **Readouts:** Prompt and formula can fade/slide in when they appear; keep it short and minimal.
- **Celebration:** Existing pulse/reveal is fine; can add a brief amber glow or “readout highlight” so it feels like a console event.

Avoid: scattered micro-interactions, decorative motion. Prefer: one clear “boot” or “stage change” beat, then calm.

---

## 8. Responsiveness

**Direction:** Same “instrument” metaphor at every size; layout adapts, hierarchy doesn’t flip.

- **Mobile:**  
  - Status strip: same or slightly tighter.  
  - Prompt and formula: stack vertically (prompt then formula) or prompt full-width, formula below right-aligned.  
  - Viz: same padding scale; may need smaller circle/wave (handled in Scene).  
  - Controls: full-width strip; one column of buttons if needed.

- **Tablet:**  
  - Prompt and formula can sit on one row (prompt center/left, formula right) if width allows; otherwise stack.  
  - Use the same spacing tokens; only breakpoint where “row vs stack” changes.

- **Desktop:**  
  - One row for readouts (prompt center, formula right); more horizontal padding on viz.  
  - No extra chrome; same regions, more space.

**Breakpoints:**  
Use at least two: one for “readouts stack vs row” (e.g. 640px or 768px), one for “comfortable desktop” (e.g. 1024px) for padding/max-width. All spacing still from the semantic scale.

---

## 9. Implementation Checklist (High Level)

- [ ] **Fonts:** Add 1–2 families (display/semi-mono + optional sans); CSS vars; apply in Layout (ObservatoryLayout), PromptReadout, FormulaReadout.
- [ ] **Spacing scale:** Define `--space-*` (or use existing `--spacing-*` consistently) and use in Layout and ObservatoryModule for strip height, gaps, viz padding.
- [x] **Layout regions:** ObservatoryLayout has explicit “status strip,” “readout row/stack,” “primary display,” “controls strip” with token-based positioning.
- [ ] **Readout panels:** PromptReadout and FormulaReadout: panel style (dark + single-edge glow/border), mono for data, smaller “label” text; feel like readouts, not cards.
- [ ] **Color:** Optional subtle background gradient or grain; cyan/amber used per roles above; EscapeHatch aligned to `--lab-*`.
- [ ] **Motion:** One “console on” or “stage change” sequence (strip → readout → viz); optional progress fill animation.
- [ ] **Responsiveness:** Readouts stack on narrow, row on wide; same tokens at all breakpoints.

---

## 10. Success Criteria

- A first-time user can say what the **one main thing** on the screen is (the viz).
- Prompt and formula feel like **readouts**, not marketing copy or cards.
- Top and bottom feel like **strips**, not a pile of floating boxes.
- Typography and color feel **technical** and **intentional**, not default.
- One moment (load or stage change) feels **composed**.
- The overall impression is **“I’m at the console”** — observatory HUD — not “I’m in an app.”

This document is the commitment. Implementation should reference it so the sinewaves module stays cohesive and memorable.
