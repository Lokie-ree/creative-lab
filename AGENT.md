# AGENT.md

Instructions for AI agents working in this repository. Use this file for context; use [CLAUDE.md](./CLAUDE.md) for architecture, commands, and patterns.

## Project

**Creative Lab** — Interactive math learning portfolio. Modules teach concepts through discovery, manipulation, and earned reveals (formulas appear after understanding, not before).

**Narrative:** "I build interactive experiences that help people understand things they thought were hard."

## Current State

- **Flow:** Hero → Course Hub → Constellation (by course) → Module. Back navigation and Escape Hatch from modules; Celebration modal on completion.
- **Modules (see `src/config/modules.ts`):**
  - **sinewaves** — Active polish sprint. Trigonometry; unit circle → sine/cosine. Instrument-style HUD (InstrumentModule). See `docs/plans/2026-02-02-sinewaves-final-polish-design.md`.
  - **vector-transformations** — Implemented (in-app). Planning has shifted to major content clusters; see `docs/modules/algebra/` and `docs/modules/geometry/`. Specific next modules TBD.
  - **phase-portraits** — Placeholder/coming-soon.
- **Roadmap:** Organized by **major content clusters** (Algebra I, Geometry). Which modules to build next will be decided later; see `docs/modules/algebra/` and `docs/modules/geometry/` for product and technical framing.

## Active Work

**Sinewaves Polish Sprint** (`docs/plans/2026-02-02-sinewaves-final-polish-design.md`)
- Responsive scene layout with viewport-proportional positioning
- Extract constants/utils from InstrumentModule
- Tailwind-first component refactor
- Match detection consistency (single source of truth)
- **Stack:** React 19, TypeScript, Vite, React Three Fiber + drei, GSAP, Motion, Tailwind CSS 4, shadcn/ui (new-york). Path alias `@/` → `src/`.
- **State:** View, course, module, celebration, and dialogs are owned in `App.tsx`. Module state flows down; modules call `onComplete(values)` when done.

## Key Conventions

1. **3D inside Canvas, controls outside.** `Scene.tsx` (per module) owns the R3F Canvas; `ControlPanel` and other HTML controls live outside.
2. **Stage-based learning.** Modules use stages (e.g. observe → amplitude → frequency → challenge → reveal). See CLAUDE.md and module docs.
3. **Pedagogy:** Challenge before explanation; matching is verification; no "wrong" framing—use "getting closer" style feedback; formulas are earned reveals.
4. **Design:** Dark default, `src/lib/colors.ts` for tokens. 60fps or instant animations; R3F for continuous motion, SVG for static/simple.
5. **Tailwind 4 syntax.** Use `bg-(--lab-accent)` not `bg-[var(--lab-accent)]`. Mobile-first responsive: `text-sm sm:text-base`.

## Where to Look

| Need | Location |
|------|----------|
| **Pedagogy & product alignment (foundational)** | [docs/philosophy.md](./docs/philosophy.md), [docs/alignment-product.md](./docs/alignment-product.md) |
| Documentation index & module pipeline | [docs/README.md](./docs/README.md) |
| Commands, architecture, patterns, design system | [CLAUDE.md](./CLAUDE.md) |
| Vision, audience, principles | [PORTFOLIO_VISION.md](./PORTFOLIO_VISION.md) |
| Module design, PRDs, UX specs | `docs/modules/` |
| Design critiques, HUD direction | `docs/design/` |
| Implementation plans | `docs/plans/` |
| Adding a module | Register in `src/config/modules.ts`; lazy-load component; implement `ModuleProps` |

## Agent Guidelines

- **Preserve pedagogy.** Don’t add quizzes, multiple choice, or "wrong answer" messaging. Keep discovery-first and earned reveals.
- **Respect separation.** Don’t put HTML controls inside the Canvas or 3D inside control components.
- **Follow the design system.** Use `@/lib/colors` and existing UI/shadcn components; avoid one-off palettes or layout patterns that clash.
- **Check docs before big changes.** New modules or flow changes should align with [docs/philosophy.md](./docs/philosophy.md), [docs/alignment-product.md](./docs/alignment-product.md), `docs/modules/`, and PORTFOLIO_VISION.md.
