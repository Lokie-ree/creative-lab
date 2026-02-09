# AGENT.md

Instructions for AI agents working in this repository. Single source for architecture, commands, patterns, design system, current state, and guidelines.

## Project

**Creative Lab** — Interactive math learning portfolio. Modules teach concepts through discovery, manipulation, and earned reveals (formulas appear after understanding, not before).

**Narrative:** "I build interactive experiences that help people understand things they thought were hard."

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server at http://localhost:5173
pnpm build            # Type check (tsc -b) + production build
pnpm lint             # Run ESLint
pnpm preview          # Preview production build
pnpm analyze          # Build + open bundle stats
```

## Architecture

### Tech Stack
- **React 19** + **TypeScript** with Vite
- **React Three Fiber** + **@react-three/drei** for 3D visualization
- **GSAP** + **Motion** for animation
- **Tailwind CSS 4** + **shadcn/ui** (new-york style) for styling

### Path Aliases
`@/` maps to `./src/`

### Component Structure
```
src/components/
├── modules/<name>/     # Module-specific (lazy-loaded)
│   ├── Layout.tsx      # Module's grid layout
│   ├── Scene.tsx       # R3F Canvas + 3D elements
│   ├── <Name>Module.tsx # Main orchestrator
│   └── components/     # Module-specific UI
├── hero/               # Landing page
├── controls/           # HTML controls (outside Canvas)
├── feedback/           # Banners, prompts, formula reveals
├── celebration/        # Success modals with tabs
├── shared/             # Reusable animated components
├── dialogs/            # Process/Resume modals
├── transitions/        # Animation wrappers
└── ui/                 # shadcn/ui primitives
```

### Navigation Flow
Hero → Course Hub → Constellation (by course) → Module

Back navigation and Escape Hatch from modules; Celebration modal on completion.

### Key Patterns
- **3D inside Canvas, controls outside.** `Scene.tsx` (per module) owns the R3F Canvas; `ControlPanel` and other HTML controls live outside.
- **Module state flows through App.tsx.** View state (hero vs module), celebration modals, and parameter tracking are managed at the app level, passed down as props. Modules call `onComplete(values)` when done.
- **Stage-based learning.** Modules use stages (e.g. observe → amplitude → frequency → challenge → reveal). See module docs.
- **Adding a module.** Register in `src/config/modules.ts`, lazy-load the component, implement `ModuleProps`.

## Design System

### Colors (from `src/lib/colors.ts` → `src/index.css`)
- **accent.primary**: `#22d3ee` (cyan) — Active elements, success — CSS: `--lab-accent`
- **learning.primary**: `#f5a623` (amber) — Feedback, reveals — CSS: `--lab-accent-warm`, `--lab-earned`
- **background.primary**: `#0a0a0f` — Dark navy canvas — CSS: `--lab-bg`
- **ghost**: `#888888` — Target/locked elements — CSS: `--lab-ghost`

### Tailwind CSS 4
- Spacing: `p-2`, `gap-3`, `m-4` (standard scale)
- Colors: `bg-(--lab-bg)`, `text-(--lab-accent)` (parentheses syntax, not `bg-[var(--lab-accent)]`)
- Fonts: `font-[family-name:var(--font-display)]`
- Responsive: `text-sm sm:text-base md:text-lg` (mobile-first)

### Design Principles
- Dark mode default with focused, mathematical aesthetic
- Three semantic colors: accent (active), accentMuted (ghost/disabled), geometry (blue constructs)
- 60fps animations or instant—no jank
- R3F for continuous/synchronized motion, SVG for static/simple

## Pedagogy

- **Challenge before explanation.** Users manipulate first, discover through exploration, receive formula as reward.
- **Matching IS verification.** No quizzes or multiple choice. The act of matching the target proves understanding.
- **No wrong answers.** "Getting closer..." not "incorrect". Glow intensity shifts, not error states.
- **Earned reveals.** Formula appears after demonstrated understanding with user's discovered values highlighted.

## Bundle Optimization

Manual chunk splitting in `vite.config.ts`: `three`, `gsap`, `radix`. Heavy 3D code is lazy-loaded via React.lazy().

## Current State

- **Modules (see `src/config/modules.ts`):**
  - **sinewaves** — Actively polishing. Trigonometry; unit circle → sine/cosine. Instrument-style HUD (InstrumentModule). Instrument refactor completed; see [docs/plans/2026-02-05-sinewaves-instrument-refactor.md](./docs/plans/2026-02-05-sinewaves-instrument-refactor.md).
  - **vector-transformations** — Implemented (in-app). Planning has shifted to major content clusters; see `docs/modules/algebra/` and `docs/modules/geometry/`. Specific next modules TBD.
  - **phase-portraits** — Placeholder/coming-soon.
- **Roadmap:** Organized by **major content clusters** (Algebra I, Geometry). Which modules to build next will be decided later; see `docs/modules/algebra/` and `docs/modules/geometry/` for product and technical framing.

## Active Work

**Sinewaves** — Actively polishing this module. The instrument refactor (layout, constants/utils extraction, Tailwind-first refactor, match detection) was completed per [docs/plans/2026-02-05-sinewaves-instrument-refactor.md](./docs/plans/2026-02-05-sinewaves-instrument-refactor.md). Ongoing polish and follow-ups reference that plan.

## Agent Guidelines

- **Preserve pedagogy.** Don’t add quizzes, multiple choice, or "wrong answer" messaging. Keep discovery-first and earned reveals.
- **Respect separation.** Don’t put HTML controls inside the Canvas or 3D inside control components.
- **Follow the design system.** Use `@/lib/colors` and existing UI/shadcn components; avoid one-off palettes or layout patterns that clash.
- **Check docs before big changes.** New modules or flow changes should align with [docs/philosophy.md](./docs/philosophy.md), [docs/product.md](./docs/product.md), `docs/modules/`, and PORTFOLIO_VISION.md.

## Related Documentation

| Topic | Location |
|-------|----------|
| **Pedagogy & LSSM alignment (foundational)** | [docs/philosophy.md](./docs/philosophy.md), [docs/product.md](./docs/product.md) |
| Documentation index & module pipeline | [docs/README.md](./docs/README.md) |
| Vision, audience, principles | [PORTFOLIO_VISION.md](./PORTFOLIO_VISION.md) |
| Module PRDs, UX specs | `docs/modules/` |
| Design critiques, HUD direction | `docs/design/` |
| Implementation plans | `docs/plans/` |
| Adding a module | Register in `src/config/modules.ts`; lazy-load component; implement `ModuleProps` |
