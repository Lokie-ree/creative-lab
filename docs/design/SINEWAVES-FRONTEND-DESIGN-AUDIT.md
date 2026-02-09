# Sinewaves Module — Frontend Design Audit

**Audit date:** February 9, 2026  
**Reference:** `.claude/skills/frontend-design/SKILL.md`  
**Scope:** `src/components/modules/sinewaves/` and related tokens (`src/lib/colors.ts`, `src/index.css`, `src/components/ui/slider.tsx`)

---

## Executive Summary

The sinewaves module has a clear **instrument/HUD** concept and solid UX (always-visible controls, progressive prompts, match feedback). It also leans heavily on patterns the frontend-design skill flags as generic: **cyan-on-dark palette**, **monospace-as-technical**, **glow accents**, **rounded card + shadow** for the celebration overlay, and **modal-style blocking overlay** for match success. Addressing these would make the module feel more distinctive and less like default “AI” output while keeping the scientific-instrument intent.

---

## 1. Design Direction

| Criterion | Status | Notes |
|-----------|--------|------|
| **Purpose** | ✅ Clear | Scientific instrument for learning sine waves; “oscilloscope, not slideshow.” |
| **Tone** | ⚠️ Partial | Instrument/HUD is defined, but execution defaults to “dark + cyan” which reads as generic tech. |
| **Constraints** | ✅ Met | R3F, performance, accessibility (focus, aria, reduced motion) considered. |
| **Differentiation** | ❌ Weak | “One thing someone will remember” is underdeveloped; currently “cyan HUD” is forgettable. |

**Recommendation:** Double down on a single memorable trait—e.g. **warm oscilloscope** (amber/cream on dark, minimal cyan), **paper-and-ink** (off-white, single accent, no glow), or **hardware panel** (chalky labels, matte surfaces, no soft shadows). Then align palette, type, and effects to that direction.

---

## 2. Typography

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Modular scale, fluid sizing (clamp) | ❌ | Fixed `text-sm`, `text-base`, `sm:text-lg`, `lg:text-lg`; no fluid type scale. |
| Distinctive display + refined body | ⚠️ | Display and data use **JetBrains Mono**; body uses **DM Sans**. |
| Avoid overused fonts | ⚠️ | DM Sans is common; JetBrains Mono is a standard “code” font. |
| Don’t use monospace as “technical” shorthand | ❌ | `--font-display`, `--font-data` both JetBrains Mono; reinforces “developer instrument” cliché. |
| No big rounded icons above headings | ✅ | No such pattern. |

**Recommendation:**

- Introduce a **fluid type scale** (e.g. `clamp(0.875rem, 2vw + 0.75rem, 1.125rem)`) for readouts and labels.
- Consider a **display face** that reads as “instrument” without being monospace (e.g. a condensed sans or a technical serif) and reserve monospace only for the formula line if needed.
- Align with design direction: e.g. hardware panel → stencil or engraved-style type; warm oscilloscope → same or slightly warmer sans.

---

## 3. Color & Theme

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Cohesive palette, dominant + accent | ⚠️ | Cyan accent dominates; amber only for “earned” moment. Palette is coherent but clichéd. |
| Modern CSS (oklch, color-mix, light-dark) | ❌ | Hex in `colors.ts` and `index.css` (`#22d3ee`, `#0a0a0f`, etc.). No oklch in sinewaves. |
| Tint neutrals toward brand | ❌ | Neutrals are gray (`#2a2a3a`, `#888888`); no tint toward accent or warm. |
| No gray text on colored backgrounds | ⚠️ | `--lab-text-muted` on `--lab-surface`; skill suggests a shade of the background instead. |
| No pure black/white | ✅ | `#0a0a0f` for bg; no `#000` / `#fff`. |
| **Don’t: cyan-on-dark, neon accents** | ❌ | Primary accent is cyan on dark; slider thumb uses glow (`rgba(34,211,238,0.5)`). |
| **Don’t: gradient text for impact** | ✅ | Not used. |
| **Don’t: default dark + glowing accents** | ❌ | Dark default with cyan borders, left-edge glow, thumb glow. |

**Recommendation:**

- Shift to a **single strong direction**: e.g. warm instrument (amber/cream as primary accent, cyan only for data/values) or full oklch-based palette with a non-cyan accent.
- Replace hex with **oklch** (and optional `color-mix`) in `colors.ts` / CSS for consistency and future theming.
- Use **shades of the panel color** for secondary text on `--lab-surface` instead of neutral gray.
- Remove or greatly reduce **glow**: slider thumb and PromptReadout left-edge shadow. Keep accent color and contrast without blur/glow.

---

## 4. Layout & Space

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Rhythm through varied spacing | ⚠️ | `gap-2` / `gap-4`, `p-2` / `p-4`; some variation but still repetitive. |
| Fluid spacing with clamp | ❌ | No clamp-based spacing in sinewaves layout. |
| Asymmetry, break grid intentionally | ⚠️ | Grid is regular; corner brackets add focus but layout is symmetric. |
| Don’t wrap everything in cards | ⚠️ | Prompt and Formula are in rounded panels; could be more “instrument” and less card-like. |
| Don’t center everything | ⚠️ | Formula “You’re Building” and formula text are centered; StatusStrip dots centered. |
| Same spacing everywhere | ⚠️ | Many `gap-2`/`gap-4`; could differentiate readout vs. controls vs. viz. |

**Recommendation:**

- Differentiate **spacing by zone**: e.g. tighter HUD/readout, more breath around the viz, consistent but distinct control strip.
- Consider **left-aligned** prompt and formula with a clear hierarchy (e.g. prompt left, formula right on desktop) to feel more “panel” than “card.”
- Use **clamp()** for key gaps/padding so spacing scales with viewport.

---

## 5. Visual Details

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Intentional decorative elements | ⚠️ | Corner brackets and left-edge accent support “instrument” but risk cliché. |
| **Don’t: glassmorphism everywhere** | ✅ | No glass/blur in sinewaves. |
| **Don’t: thick colored border on one side** | ⚠️ | PromptReadout: `border-l-2 border-l-(--lab-accent)` — literal “left edge accent” trope. |
| **Don’t: sparklines as decoration** | ✅ | N/A. |
| **Don’t: rounded rectangles + generic shadow** | ❌ | Celebration overlay: `rounded-lg ... shadow-lg border border-(--lab-accent)/20` (InstrumentModule.tsx). |
| **Don’t: modals when avoidable** | ❌ | Match success uses full-screen overlay + centered card; blocks entire instrument. |

**Recommendation:**

- **Celebration:** Prefer a non-blocking pattern: e.g. a **banner or strip** above/below the viz, or a short inline message near the formula/controls, with a small “Continue” so the user keeps context.
- **Celebration card:** If a card is kept, avoid generic “rounded-lg + shadow-lg”; e.g. flat panel with a single accent edge or instrument-style frame.
- **PromptReadout:** If keeping a left edge, make it clearly part of the chosen direction (e.g. warm accent, or structural only with no glow). Consider a top or bottom rule instead to reduce “AI accent bar” feel.

---

## 6. Motion

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Motion for state change, entrances/exits | ✅ | Boot sequence, fadeInReadout, match glow. |
| Exponential easing (ease-out-quart etc.) | ✅ | Tokens use `power3.out` / `power2.out`; presets use `easing.out`. |
| **Don’t: animate layout (width/height)** | ✅ | Opacity and transform (x, y, scale) used. |
| **Don’t: bounce/elastic easing** | ❌ | `animations.ts` `matchSuccessSequence`: `ease: 'back.out(1.7)'` for scale pulse — bouncy. |

**Recommendation:**

- Replace **back.out** in the match-success pulse with a **smooth deceleration** (e.g. `power2.out` or `power3.out`) so the instrument feels precise, not playful.

---

## 7. Interaction

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Progressive disclosure | ✅ | Guide states reveal focus (prompt + highlight) without hiding controls. |
| Empty states that teach | ✅ | Proximity feedback (“Getting closer…”, “Almost there…”). |
| Intentional, responsive surfaces | ✅ | 44px targets, focus rings, clear buttons. |
| **Don’t: every button primary** | ✅ | Outline/secondary for Continue; TRACE/RESET/SPEED have clear hierarchy. |

**Recommendation:** No major changes; keep current interaction model and hierarchy.

---

## 8. Responsive

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Container queries | ❌ | Breakpoints are viewport-based (md:, sm:), not @container. |
| Adapt, don’t just shrink | ✅ | Mobile: stacked layout, circle hidden, wave centered; 6-row vs 4-row grid. |
| Don’t hide critical functionality on mobile | ✅ | Prompt and formula always visible; sliders and controls present. |

**Recommendation:** Consider **@container** for the instrument wrapper so layout responds to the module’s width (e.g. in a sidebar or split view) as well as viewport.

---

## 9. UX Writing

| Guideline | Status | Evidence |
|-----------|--------|----------|
| Every word earns its place | ⚠️ | FormulaReadout label “You’re Building” may be redundant with the formula itself. |
| Don’t repeat what’s visible | ⚠️ | Same; “You’re Building” repeats the idea of the formula. |

**Recommendation:** Remove “You’re Building” or replace with a single word that adds context (e.g. “Live” or “Output”) only if it adds meaning.

---

## 10. AI Slop Test

**“If you said ‘AI made this,’ would they believe you immediately?”**

**Verdict: Yes, in places.** The combination of:

- Cyan-on-dark with glow
- Monospace for “tech”
- Left-edge accent bar on the prompt
- Rounded card + shadow on the celebration overlay
- Full-screen modal for success

matches common 2024–2025 AI-generated UI patterns. The **instrument concept**, **always-visible controls**, **proximity feedback**, and **concise copy** are stronger and more intentional; the **visual language** (color, type, decorative accents, celebration pattern) is where it feels generic.

---

## 11. Priority Recommendations

1. **Palette and glow (high):** Move off cyan-as-primary and reduce/remove glow (slider, PromptReadout). Align with one clear direction (e.g. warm instrument or oklch-based system).
2. **Celebration pattern (high):** Replace full-screen modal with a non-blocking pattern (banner or inline) and avoid rounded-lg + shadow-lg.
3. **Typography (medium):** Fluid scale; reconsider monospace-for-everything; choose one distinctive display face for the direction.
4. **Motion (medium):** Replace `back.out` in match-success with a non-bouncy ease.
5. **Spacing and alignment (medium):** Differentiate spacing by zone; consider left-aligned readouts; optional container queries.
6. **Micro-copy (low):** Drop or refine “You’re Building” under the formula.

---

## 12. What’s Working

- **Concept:** “Scientific instrument, everything visible” is clear and implemented.
- **Guide states:** Prompt + highlight + ghost/connector logic support learning without hiding controls.
- **Progressive feedback:** Proximity messages and match glow (concept) are good; only the overlay and easing need refinement.
- **Accessibility:** Reduced motion, focus management, aria labels, 44px targets.
- **Grid lines:** Subtle grid in Scene supports “instrument” feel.
- **Copy:** Match celebration and guide prompts are short and clear.

Using this audit as a checklist while applying the frontend-design skill should make the sinewaves module feel more distinctive and intentional without losing its strengths.
