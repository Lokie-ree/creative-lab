# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive math learning portfolio demonstrating pedagogical design through direct experience. Modules teach mathematical concepts through discovery, manipulation, and earned reveals—formulas appear as confirmation of understanding, not prerequisites.

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

**3D components go inside Canvas, controls stay outside.** The `Scene.tsx` orchestrates the R3F Canvas; `ControlPanel.tsx` and other HTML controls render separately.

**Module state flows through App.tsx.** View state (hero vs module), celebration modals, and parameter tracking are managed at the app level, passed down as props. Modules call `onComplete(values)` when done.

**Stage-based learning progression.** Modules use stages (observe → amplitude → frequency → challenge → reveal) to scaffold the learning journey.

**Adding a module.** Register in `src/config/modules.ts`, lazy-load the component, implement `ModuleProps`.

## Design System

### Colors (from `src/lib/colors.ts` → `src/index.css`)
- **accent.primary**: `#22d3ee` (cyan) — Active elements, success
  - CSS: `--lab-accent`
- **learning.primary**: `#f5a623` (amber) — Feedback, reveals
  - CSS: `--lab-accent-warm`, `--lab-earned`
- **background.primary**: `#0a0a0f` — Dark navy canvas
  - CSS: `--lab-bg`
- **ghost**: `#888888` — Target/locked elements
  - CSS: `--lab-ghost`

### Tailwind CSS 4
Use CSS variable syntax consistently:
- Spacing: `p-2`, `gap-3`, `m-4` (standard Tailwind scale)
- Colors: `bg-(--lab-bg)`, `text-(--lab-accent)` (parentheses syntax)
- Fonts: `font-[family-name:var(--font-display)]`
- Responsive: `text-sm sm:text-base md:text-lg` (mobile-first)

### Design Principles
- Dark mode default with focused, mathematical aesthetic
- Three semantic colors: accent (active), accentMuted (ghost/disabled), geometry (blue constructs)
- 60fps animations or instant—no jank
- R3F for continuous/synchronized motion, SVG for static/simple

## Pedagogy

**Challenge before explanation.** Users manipulate first, discover through exploration, receive formula as reward.

**Matching IS verification.** No quizzes or multiple choice. The act of matching the target proves understanding.

**No wrong answers.** "Getting closer..." not "incorrect". Glow intensity shifts, not error states.

**Earned reveals.** Formula appears after demonstrated understanding with user's discovered values highlighted.

## Bundle Optimization

Manual chunk splitting in `vite.config.ts`:
- `three`: three.js + R3F + drei
- `gsap`: gsap + @gsap/react
- `radix`: All Radix UI components

Heavy 3D code is lazy-loaded via React.lazy().

## Related Documentation

| Topic | Location |
|-------|----------|
| **Pedagogy & LSSM alignment (foundational)** | [docs/philosophy.md](./docs/philosophy.md), [docs/alignment-product.md](./docs/alignment-product.md) |
| Documentation index & module pipeline | [docs/README.md](./docs/README.md) |
| Current state, agent guidelines | [AGENT.md](./AGENT.md) |
| Vision, audience, principles | [PORTFOLIO_VISION.md](./PORTFOLIO_VISION.md) |
| Module PRDs, UX specs | `docs/modules/` |
| Design critiques, HUD direction | `docs/design/` |
| Implementation plans | `docs/plans/` |
