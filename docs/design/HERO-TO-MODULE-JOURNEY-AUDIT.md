# Hero → Module Journey Audit

**Date:** February 20, 2026
**Resolved:** February 23, 2026
**Scope:** Course Hub, Constellation, and course/module nodes (Hero → Courses → Constellation → Module).
**Reference:** Eurorack design system in [README.md](./README.md); "AI slop" patterns from [docs/archive/SINEWAVES-FRONTEND-DESIGN-AUDIT.md](../archive/SINEWAVES-FRONTEND-DESIGN-AUDIT.md).
**Goal:** Identify why the journey feels sloppy and less scalable so it can be aligned with hero and sinewaves.

---

## Resolution Status (February 23, 2026)

All P0 and P1 items, and all P2 items, have been resolved.

| Priority | Issue | Status | Commit |
|----------|-------|--------|--------|
| P0 | Cold background (CourseHub, Constellation) | ✅ Resolved | `7257ce5`, `397136e` |
| P0 | No design tokens in journey | ✅ Resolved | `4465f32` |
| P1 | Author-centric Course Hub copy | ✅ Resolved — "IVLA STEM Club" | `7257ce5` |
| P1 | Rounded + glow on nodes | ✅ Resolved — flat, no glow | `4465f32` |
| P1 | Off-palette color on nodes | ✅ Resolved — lab tokens only | `4465f32` |
| P2 | Inconsistent back control | ✅ Resolved — consistent 2-row layout | `397136e` |
| P2 | CourseNode shape inconsistency | ✅ Resolved — SegmentArc always renders | `c704eed` |
| P2 | Navigation.tsx cold palette | ✅ Resolved — lab tokens | `907de66` |
| — | Hero redesign | ✅ Done — DotGrid canvas, RotatingText, IVLA branding | `7257ce5` |
| — | StatusStrip touch targets | ✅ Resolved — 44px minimum | `3ac0fab` |

**Cohesion checklist from section 10 (all items now checked):**
- [x] CourseHub and Constellation use `--lab-bg` background
- [x] All journey text uses lab tokens
- [x] CourseHub headline is about content/journey, not the author
- [x] Course and module nodes have no glow, no off-palette colors
- [x] One back control pattern and one connector style
- [x] New module can be added by config only (no new one-off styles)

**One remaining vestigial item:** `courses.ts` CS course has `color: '#a855f7'` — the field is not rendered (glow removed) but exists in the type. Track in [README.md outstanding work](./README.md#outstanding-work).

---

---

## 1. Executive Summary

**Hero** and **sinewaves** feel aligned: warm faceplate (`--lab-bg`), phosphor green accent, lab typography and buttons. **Course Hub** and **Constellation** do not use the design system: they use a cold blue-black background, generic grays, and author-centric copy. The path from hero to module feels like three separate UIs; the nodes feel generic ("AI slop") and are not built from a shared, scalable pattern.

**Root causes:** (1) **Palette disconnect** — cold blue-black vs warm faceplate. (2) **No design tokens** in the journey — raw grays and white. (3) **Author-centric copy** on Course Hub. (4) **Rounded + glow + generic type** on nodes. (5) **Weak scalability** — per-course colors, no single "node" language.

---

## 2. Palette and Background

| Screen | Background | Uses design system? |
|--------|------------|---------------------|
| Hero | `var(--lab-bg)` (#1e1d1c) + phosphor green dot/glow | ✅ Yes |
| Sinewaves | `--lab-bg`, `--lab-surface`, etc. | ✅ Yes |
| **Course Hub** | **`radial-gradient(#0a0a0f → #050508)`** | ❌ No |
| **Constellation** | **Same cold blue-black gradient** | ❌ No |

**Evidence:** [CourseHub.tsx](../../src/components/constellation/CourseHub.tsx) (lines 25–27) and [Constellation.tsx](../../src/components/constellation/Constellation.tsx) (lines 77–79) both use:

```css
radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%)
```

That is the old cold dark from the pre-Eurorack audit. Hero and modules use warm `--lab-bg`. **Result:** As soon as the user leaves the hero, the app looks like a different product.

**Recommendation:** Use `bg-[var(--lab-bg)]` (or the same hero background treatment) for Course Hub and Constellation so the whole journey shares one "room."

---

## 3. Typography and UI Tokens

**Hero** uses `--lab-text-muted`, `--lab-accent`, `--lab-text-dim`, `--lab-bg` on CTA. **Course Hub / Constellation** use raw Tailwind grays and white: `text-white`, `text-gray-400`, `text-gray-300`, `text-gray-500`, `text-gray-600`; back button `text-gray-400 hover:text-white`. No `--lab-text`, `--lab-ghost`, or `lab-silk` / `lab-display-font`.

**Evidence:**

- **Constellation.tsx:** `text-white` (93), `text-gray-400` (85, 96), `bg-gray-600` (153).
- **CourseHub.tsx:** `text-gray-400` (33), `text-white` (53), `text-gray-400` (56).
- **ModuleNode.tsx:** `text-gray-400` (76), `text-white` (84), `text-gray-600` (93).
- **CourseNode.tsx:** `text-gray-300`, `text-gray-500`, `text-gray-600` (67, 73, 80).
- **NodeRings.tsx:** `stroke-gray-600` (46, 80).

So the journey screens don't use the design system at all; they feel like a generic dark UI.

**Recommendation:** Replace with semantic tokens: e.g. headings `text-[var(--lab-text)]`, secondary `text-[var(--lab-text-muted)]` or `--lab-ghost`, and use `lab-silk` / `lab-display-font` for labels so the journey matches hero and modules.

---

## 4. Copy and Focus (Author vs. Student)

**Hero** correctly leads with name + role + "This is what I built." **Course Hub** leads with **"Randall LaPoint, Jr."** as the main heading and **"Interactive Learning Experiences"** as sub — so the first screen after "Enter" is about the person, not the learner or the content. **Constellation** says "Choose a module to explore" which is generic and doesn't reinforce discovery or the instrument metaphor.

**Recommendation:** Shift Course Hub to a content/journey framing (e.g. course areas or "What do you want to explore?") and keep the personal intro on the hero. Constellation copy can reinforce discovery ("Pick a module," "Explore by course," etc.) in the same tone as the rest of the product.

---

## 5. Course and Module Nodes ("AI Slop" and Consistency)

Patterns that match the old frontend audit "AI slop" and reduce cohesion:

**CourseNode.tsx**

- Large **rounded-full** circles (w-28 h-28).
- **Glow:** `boxShadow: 0 0 20px ${course.color}33`.
- **Per-course color** from config (`course.color`) — one course is `#a855f7` (purple), others `#7cc87c`; purple is outside the Eurorack palette.
- **SegmentArc** uses `#4b5563` for incomplete segments (generic gray).
- Text: `text-gray-300 group-hover:text-white`.

**ModuleNode.tsx**

- **rounded-lg**, hover **scale-108**, **drop-shadow** `0 0 12px rgba(124,200,124,0.3)`.
- Focus ring offset `ring-offset-[#0a0a0f]` (cold blue again).
- **text-white** / **text-gray-400** / **text-gray-600**.
- "Coming soon" in italic gray.

So: rounded shapes, glow, and gray text everywhere. No shared "instrument panel" or "node" language with the rest of the app.

**Recommendation:** Treat nodes as part of the same system as the instrument UI: flat/panel feel, no glow, optional subtle border (e.g. `--lab-border`). Use a single accent (e.g. `--lab-accent`) for state (recommended, completed) and mute the rest with `--lab-ghost`/`--lab-text-muted`. Replace per-course hex colors with tokens or a small allowed set so the journey doesn't introduce random hues (e.g. no purple unless it's in the design system).

---

## 6. Scalability

**Courses:** Each course has its own `color` and `icon`. Adding a course means adding another color; there's no shared "course card" or "node" component that enforces one visual language.

**Modules:** Rendered as a list with domain + title + NodeRings; layout is flexible (vertical/horizontal) but the *style* (rounded, glow, gray) is ad hoc.

**Connectors:** Simple 1px line, `bg-gray-600` or `--lab-accent`; no reuse of "scored divider" or any shared connector component.

So the journey is not built from a small set of scalable primitives (e.g. one Node component, one Connector, one Back control) that share tokens and layout rules.

**Recommendation:** Define a single "journey" layer that uses: one background (same as hero/modules), one set of tokens for text and borders, one node component (or two: course vs module) with props for state (completed, recommended, disabled) and no per-entity hex colors, and one connector style (e.g. scored line or simple line with `--lab-border`/`--lab-ghost`). That will make new courses/modules additive without new one-off styles.

---

## 7. Back Button and Chrome

**CourseHub** uses an inline SVG chevron (lines 34–45). **Constellation** uses `ArrowLeft` from lucide + "Courses" label. Both use `text-gray-400 hover:text-white`; neither uses `--lab-*` or font utilities.

So the first two screens of the journey don't share one back control (icon + label + style), and they don't use the design system.

**Recommendation:** Single back component (or same pattern): one icon source (e.g. lucide), label "Courses" or "Back" as appropriate, styles using `--lab-text-muted` and `--lab-accent` or `--lab-text` on hover.

---

## 8. Navigation (Global)

**Navigation.tsx** uses `from-black/50`, `text-gray-400 hover:text-white`. It's shown when not on hero; again no lab tokens.

**Recommendation:** Use `--lab-bg` (or same as hero) and lab text tokens so the top bar feels part of the same world.

---

## 9. Summary: What to Fix (Before or After Saving)

| Priority | Issue | Where | Change |
|----------|--------|--------|--------|
| **P0** | Cold background | CourseHub, Constellation | Use `--lab-bg` (or hero-style background) |
| **P0** | No design tokens | All journey components | Replace gray-* / text-white with --lab-text, --lab-text-muted, --lab-ghost |
| **P1** | Author-centric Course Hub | CourseHub | Reframe to content/journey; move "Randall LaPoint, Jr." to hero only |
| **P1** | Rounded + glow on nodes | CourseNode, ModuleNode | Remove glow; align with instrument panel (flat, borders, no drop-shadow) |
| **P1** | Off-palette color | courses.ts (e.g. #a855f7) | Use only design-system colors (e.g. --lab-accent, muted variants) |
| **P2** | Inconsistent back control | CourseHub vs Constellation | One back pattern + lab tokens |
| **P2** | Scalability | Course + module nodes | Single node/connector language and tokens so new courses/modules don't add new styles |
| **P2** | Navigation bar | Navigation.tsx | Use lab background and text tokens |

---

## 10. Cohesion Checklist (Before Calling the Journey "Done")

- [ ] Course Hub and Constellation use the same background as Hero (e.g. `--lab-bg`).
- [ ] All journey text uses lab tokens (no raw `gray-*` or `text-white`).
- [ ] Course Hub headline is about content/journey, not the author's name.
- [ ] Course and module nodes use no glow and no off-palette colors.
- [ ] One back control pattern and one connector style.
- [ ] New course or module can be added by config only (no new one-off colors or node styles).

Doing the P0 and P1 items will make the hero and sinewaves experience feel visually and tonally connected; P2 and the checklist will make the journey cohesive and scalable so it doesn't feel sloppy or "AI slop" as you add more courses and modules.
