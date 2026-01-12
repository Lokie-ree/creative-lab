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
- **GSAP** for animation
- **Tailwind CSS 4** + **shadcn/ui** (new-york style) for styling

### Path Aliases
`@/` maps to `./src/`

### Component Structure
```
src/components/
├── modules/<name>/     # Module-specific 3D scenes (lazy-loaded)
├── hero/               # Landing page
├── controls/           # HTML controls (outside Canvas)
├── feedback/           # Banners, prompts, formula reveals
├── celebration/        # Success modals with tabs
├── shared/             # Reusable animated components
├── dialogs/            # Process/Resume modals
├── transitions/        # Animation wrappers
└── ui/                 # shadcn/ui primitives
```

### Key Patterns

**3D components go inside Canvas, controls stay outside.** The `Scene.tsx` orchestrates the R3F Canvas; `ControlPanel.tsx` and other HTML controls render separately.

**Module state flows through App.tsx.** View state (hero vs module), celebration modals, and parameter tracking are managed at the app level, passed down as props.

**Stage-based learning progression.** Modules use stages (observe → amplitude → frequency → challenge → reveal) to scaffold the learning journey.

## Design System

### Colors (from `src/lib/colors.ts`)
- **accent.primary**: `#22d3ee` (cyan) — Active elements, success
- **learning.primary**: `#f5a623` (amber) — Feedback, reveals
- **background.primary**: `#0a0a0f` — Dark navy canvas
- **ghost**: `#888888` — Target/locked elements

### Design Principles
- Dark mode default with Brilliant-inspired aesthetic
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

## Skills

A `brilliant-math-producer` skill exists at `.claude/skills/brilliant-math-producer/skill.md` with detailed guidance on design decisions, pedagogy, animation strategy, and component organization.
