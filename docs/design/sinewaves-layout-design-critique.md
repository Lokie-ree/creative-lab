# Sinewaves Module — Brutally Honest Design Critique

**Lens:** [frontend-design SKILL](.claude/plugins/cache/every-marketplace/compounding-engineering/2.8.3/skills/frontend-design/SKILL.md) — distinctive, production-grade interfaces; no generic AI aesthetics.

---

## 1. Design direction: unclear and undercommitted

**Skill:** *"Commit to a BOLD aesthetic direction. Pick an extreme. What makes this UNFORGETTABLE?"*

**Reality:** The module doesn’t commit. It’s “dark + cyan accent + math” — safe, generic “learning app” territory. There’s no clear extreme: not brutally minimal (too much chrome), not editorial (no strong typography or rhythm), not luxury (no refinement in spacing or materials). The tone is **vague** (“focused, mathematical”) instead of **specific** (e.g. “terminal + chalkboard,” “observatory HUD,” “textbook diagram come to life”). Without a sharp direction, spacing and hierarchy stay arbitrary.

**Verdict:** The layout reflects that vagueness. It’s competent, not memorable.

---

## 2. Typography: default and forgettable

**Skill:** *"Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter. Pair a distinctive display font with a refined body font."*

**Reality:**

- **No custom typeface** is set. `index.html` has no font link; the app uses the browser/system default (Segoe UI, SF Pro, etc.). That’s the definition of generic.
- **ExplorePrompt** uses `text-base sm:text-lg font-semibold` and `text-xs sm:text-sm` — standard weights and sizes, no character.
- **FormulaPreview** uses `font-mono` (good for math) but still inherits the system mono. Nothing says “this is a math learning experience” through type.
- **ProgressBar** is a 4px strip with no typography; the header band has no label, scale, or type at all.

**Verdict:** Typography is system-default and interchangeable. It does not elevate or differentiate. Per the skill: *"NEVER converge on common choices."* This converges.

---

## 3. Spatial composition: predictable and cramped

**Skill:** *"Unexpected layouts. Asymmetry. Generous negative space OR controlled density. No layout slop."*

**Reality:**

- **Layout is a vertical stack:** header band → prompt → formula → viz → controls. Centered prompt, right-aligned formula, centered controls. No asymmetry, no grid-breaking, no surprise.
- **Top band is still cramped:** `min-h-10` (40px) for the header, then `top-12` / `top-14` for the prompt, `top-20` / `top-24` for the formula. In practice the EscapeHatch (user menu) sits at `top-4 left-4` **outside** the layout — so you have: [EscapeHatch] [progress bar] and then [prompt] and [formula] all in the same visual “ceiling.” They’re not truly separated into clear regions; they’re different absolute layers fighting for the same top 120px.
- **Negative space is inconsistent:** Big gap between viz and bottom controls (often empty), while the top is compressed. The skill asks for *either* generous negative space *or* controlled density; here it’s neither — tight at top, loose at bottom.
- **No semantic spacing system in the layout:** Values are `top-12`, `top-14`, `top-20`, `top-24` — Tailwind steps, not a scale derived from the design (e.g. “one unit = header, two units = content start”). So it feels arbitrary, not “meticulously refined.”

**Verdict:** Layout is safe and stacked; spacing is ad hoc. It doesn’t create a clear, confident composition.

---

## 4. Hierarchy: weak and competing

**Skill:** *"Clear hierarchy. Dominant colors with sharp accents. One thing someone will remember."*

**Reality:**

- **Hero (the viz)** is correct: the circle + wave dominate. That part works.
- **Above the fold:** Progress bar (1px tall, easy to miss), EscapeHatch (fixed, separate from layout), explore prompt (glass box), and formula (when present) all sit in the same vertical band. Nothing clearly says “read this first” vs “secondary.” The prompt is the main instruction but doesn’t own the top visually — it shares space with chrome.
- **Progress bar** is so subtle (`h-1`, dark on dark) it barely reads as “header.” The “reserved band” doesn’t read as a real region; it’s just a few rems of empty space with a thin line at the bottom.
- **Formula** when visible: same z-index tier as other UI; it doesn’t feel like an “earned reveal” so much as another floating block. No weight or color hierarchy that makes it feel special.

**Verdict:** Hierarchy is implied by order, not by size, weight, or space. The top doesn’t tell a clear story.

---

## 5. Color and theme: safe, not sharp

**Skill:** *"Commit to a cohesive aesthetic. Dominant colors with sharp accents outperform timid, evenly-distributed palettes."*

**Reality:**

- **Palette is fine:** Dark bg, cyan accent, muted text. Coherent.
- **Usage is timid:** One accent color, used for borders, buttons, and highlights. No secondary accent (e.g. learning/amber) used boldly in the layout. No contrast moment that makes one element unmistakably primary.
- **Background:** Solid `var(--lab-bg)`. No depth, texture, or gradient — the skill explicitly calls out “atmosphere and depth rather than defaulting to solid colors.” The viz sits on flat dark; there’s no environmental feel.
- **EscapeHatch** uses `zinc-*` while the rest uses `--lab-*`; a small inconsistency that suggests the top-left isn’t part of the same design system.

**Verdict:** The palette is consistent but not committed. It doesn’t take a risk or create a signature look.

---

## 6. Motion and delight: underused

**Skill:** *"Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions."*

**Reality:**

- ExplorePrompt and FormulaPreview have GSAP entrance/exit; AnimatedPanel handles transitions. So motion exists.
- There’s no **orchestrated** moment: no staggered reveal of header → prompt → viz, no single “page load” beat that feels designed. Transitions are per-component, not one composition.
- Progress bar has no motion; the header band appears static. No micro-interaction on the bar (e.g. subtle fill animation) to make it feel alive.

**Verdict:** Motion is present but not used to reinforce hierarchy or create one memorable moment.

---

## 7. Responsiveness: brittle

**Reality:**

- Breakpoints are `sm:` (640px). One step. No `md`/`lg` tuning for the sinewaves layout itself — so tablet is “big mobile,” desktop is “bigger mobile.”
- Explore prompt: `w-[calc(100vw-2rem)] sm:max-w-md`. On narrow mobile, the prompt can feel wide and the formula (when present) will sit in the same vertical band; overlap or crowding depends on content length.
- Visualization uses `pt-40` and stage-dependent `pb-*`. Those are magic numbers, not derived from a responsive scale. On short viewports (e.g. landscape mobile) the top chrome can eat a large share of the screen.

**Verdict:** Layout is responsive in name only. It doesn’t rethink composition per viewport; it mostly scales.

---

## 8. Summary: what’s actually wrong

| Area | Problem |
|------|--------|
| **Direction** | No bold, specific aesthetic; “dark + math” is vague. |
| **Typography** | System defaults only; no distinctive or paired type. |
| **Spacing** | Arbitrary Tailwind steps; top band cramped; bottom underused. |
| **Hierarchy** | Top chrome (progress, nav, prompt, formula) competes; no clear “first / second” read. |
| **Color** | Coherent but timid; no depth or signature moment. |
| **Motion** | Per-component, not one composed moment. |
| **Responsiveness** | Single breakpoint; layout doesn’t adapt structure. |

**One-line:** The sinewaves layout is **functional and consistent** but **unmemorable and under-designed**. It doesn’t violate the skill’s “never” list in an obvious way (no purple gradient, no Inter), but it doesn’t fulfill “distinctive, production-grade, meticulously refined” either. It feels like a sensible first pass, not a committed design.

---

## 9. What would fix it (without prescribing pixels)

1. **Pick one clear direction** (e.g. “observatory HUD,” “chalkboard,” “terminal”) and drive spacing, type, and color from that.
2. **Introduce real typography:** a display or body font that’s not system default; use it consistently for prompt, formula, and any header text.
3. **Define a spacing scale** (e.g. 4/8/12/16/24/32/48) and use it everywhere; replace one-off `top-12`/`top-20` with named tokens and clear roles (e.g. “header height,” “content start,” “first content gap”).
4. **Make the top tell a story:** one dominant element (e.g. prompt as the “title” of the step), with progress and formula clearly secondary (smaller, lower contrast, or moved).
5. **Use the vertical canvas:** either give the viz more room and push chrome into a true strip, or embrace density with a clear grid. Avoid “a bit tight at top, a bit empty at bottom.”
6. **Add one moment of depth or motion:** e.g. subtle gradient or grain on the background, or one coordinated entrance (header → prompt → viz) so the first load feels designed.
7. **Responsive structure:** at least one breakpoint where the layout *changes* (e.g. prompt width, formula position, or header density), not just scales.

This document is the honest baseline. **Commitment:** [Observatory HUD design direction](sinewaves-observatory-hud-direction.md) — a cohesive, memorable direction for the sinewaves module.
