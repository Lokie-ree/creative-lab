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
- **Guide-state learning (sinewaves).** Five states: watch → match-amplitude → match-frequency → challenge → free. All controls always visible; only prompts and highlights change. See [sinewaves ARCHITECTURE.md](./src/components/modules/sinewaves/ARCHITECTURE.md).
- **Adding a module.** Register in `src/config/modules.ts`, lazy-load the component, implement `ModuleProps`.

## Design System

### Aesthetic: Eurorack / Synth Module
Warm matte faceplate, phosphor green accent, silk-screened labels, scored dividers, panel screws, no glow, no border-radius on module UI. Mockup reference: `mockups/eurorack-sinewaves.html`.

### Colors (from `src/lib/colors.ts` → `src/index.css`)
- **accent.primary**: `#7cc87c` (phosphor green) — Active elements — CSS: `--lab-accent`
- **accent.primaryHover**: `#96e496` — CSS: `--lab-accent-hover`
- **accent.primaryMuted**: `#4a8a4a` — CSS: `--lab-accent-muted`
- **learning.primary**: `#f5a623` (amber) — Feedback, reveals — CSS: `--lab-accent-warm`, `--lab-earned`
- **background.primary**: `#1e1d1c` (warm faceplate) — CSS: `--lab-bg`
- **background.secondary**: `#252422` — CSS: `--lab-surface`
- **text.primary**: `#b8b0a4` (silk cream) — CSS: `--lab-text`
- **text.secondary**: `#7a746a` (silk dim) — CSS: `--lab-text-muted`
- **ghost**: `#7a746a` — Target/locked elements — CSS: `--lab-ghost`
- **success**: `#5a7a5a` (earthy green) — CSS: `--lab-success`
- **danger**: `#8a4a4a` (muted red) — CSS: `--lab-danger`
- **screw.border/bg/slot**: `#4a4844`/`#3a3836`/`#1a1918` — CSS: `--lab-screw-*`
- **led.completedBorder/upcomingBorder**: `#3e5e3e`/`#3a3632` — CSS: `--lab-led-*`

### Fonts
- **Display & Body**: `Inter Tight` (`--font-display`, `--font-body`) — silk-screen labels, UI text
- **Data**: `JetBrains Mono` (`--font-data`) — numeric readouts, formula, monospace values

### Utility Classes (`src/index.css`)
- **`lab-silk`** — Silk-screen label treatment: uppercase, 9px, 0.15em tracking, font-semibold. Composable — does NOT set font-family.
- **`lab-display-font`** — `font-family: var(--font-display)` (Inter Tight)
- **`lab-data-font`** — `font-family: var(--font-data)` (JetBrains Mono)
- Always pair `lab-silk` with a font: `lab-silk lab-display-font` or `lab-silk lab-data-font`
- **Tracking scale:** `0.2em` (micro-labels ≤8px) · `0.15em` (standard 9px) · `0.1em` (buttons ≥10px)
- **Transitions:** Always use explicit `duration-150` on interactive elements

### Tailwind CSS 4
- Spacing: `p-2`, `gap-3`, `m-4` (standard scale)
- Colors: `bg-(--lab-bg)`, `text-(--lab-accent)` (parentheses syntax, not `bg-[var(--lab-accent)]`)
- Fonts: `lab-display-font`, `lab-data-font` (utility classes, not inline `font-[family-name:...]`)
- Responsive: `text-sm sm:text-base md:text-lg` (mobile-first)
- Silk-screen labels: `lab-silk lab-display-font` (+ override size/tracking as needed)

### Design Principles
- Dark warm faceplate with Eurorack panel aesthetic
- Semantic colors: accent (phosphor green active), success (earthy green), danger (muted red), learning (amber)
- No glow effects, no rounded corners on module UI, scored dividers between sections
- 60fps animations or instant—no jank
- R3F for continuous/synchronized motion, SVG for static/simple

### Hardcoded Cyan (outside sinewaves — not yet migrated)
See "Follow-up Items" in Current State section for full file list.

## Pedagogy

- **Challenge before explanation.** Users manipulate first, discover through exploration, receive formula as reward.
- **Matching IS verification.** No quizzes or multiple choice. The act of matching the target proves understanding.
- **No wrong answers.** "Getting closer..." not "incorrect". Glow intensity shifts, not error states.
- **Earned reveals.** Formula appears after demonstrated understanding with user's discovered values highlighted.

## Bundle Optimization

Manual chunk splitting in `vite.config.ts`: `three`, `gsap`, `radix`. Heavy 3D code is lazy-loaded via React.lazy().

## Current State

- **Modules (see `src/config/modules.ts`):**
  - **sinewaves** — **Complete.** Trigonometry; unit circle → sine/cosine. Instrument-style HUD (InstrumentModule) with Eurorack design system. Instrument refactor and Eurorack reskin both done. See [docs/plans/2026-02-05-sinewaves-instrument-refactor.md](./docs/plans/2026-02-05-sinewaves-instrument-refactor.md) and [docs/plans/2026-02-10-sinewaves-eurorack-reskin.md](./docs/plans/2026-02-10-sinewaves-eurorack-reskin.md).
  - **vector-transformations** — Implemented (in-app). Linear algebra; matrix transformations on vectors.
  - **phase-portraits** — Placeholder/coming-soon.
- **Module skeleton** — Reusable hooks in `src/lib/skeleton/` (useModuleFlow, useStageUnlock, useChallengeAssist, useAccessibility, useErrorRecovery, useModuleAnalytics). Not yet consumed by existing modules; available for next module. See [docs/plans/2026-01-27-module-skeleton-infrastructure.md](./docs/plans/2026-01-27-module-skeleton-infrastructure.md).
- **Roadmap:** Organized by **major content clusters** (Algebra I, Geometry). Next: three-module Grade 8 Geometry progression — (1) Rigid Motions & Congruence (8.G.A.1–3), (2) Dilations, Similarity & Right Triangles (8.G.A.3–4, 8.G.B), (3) Pythagorean Theorem (8.G.B.7–8). Design spec: `docs/plans/2026-02-19-rigid-motions-design-spec.md`.

## Follow-up Items

- **Hero and constellation hardcoded cyan:** These files still use `rgba(34,211,238,...)`, `#22d3ee`, `stroke-cyan-400`, `fill-cyan-400`:
  - `src/components/constellation/ModuleNode.tsx`
  - `src/components/constellation/NodeRings.tsx`
  - `src/components/constellation/Constellation.tsx`
  - `src/components/hero/HeroContent.tsx`
  - `src/components/hero/HeroBackground.tsx`
  - `src/config/courses.ts` (course color)
- **Audits to address when relevant:** [VERCEL-REACT-BEST-PRACTICES-AUDIT.md](./docs/design/VERCEL-REACT-BEST-PRACTICES-AUDIT.md) (barrel imports, localStorage versioning, conditional rendering)

## Agent Guidelines

- **Preserve pedagogy.** Don’t add quizzes, multiple choice, or "wrong answer" messaging. Keep discovery-first and earned reveals.
- **Respect separation.** Don’t put HTML controls inside the Canvas or 3D inside control components.
- **Follow the design system.** Use `@/lib/colors` and existing UI/shadcn components; avoid one-off palettes or layout patterns that clash.
- **Check docs before big changes.** New modules or flow changes should align with [docs/philosophy.md](./docs/philosophy.md), [docs/product.md](./docs/product.md), and [PORTFOLIO_VISION.md](./PORTFOLIO_VISION.md). Use the `module-planning-pipeline` skill for new module planning.

## Related Documentation

| Topic | Location |
|-------|----------|
| **Pedagogy & LSSM alignment (foundational)** | [docs/philosophy.md](./docs/philosophy.md), [docs/product.md](./docs/product.md) |
| Documentation index & module pipeline | [docs/README.md](./docs/README.md) |
| Vision, audience, principles | [PORTFOLIO_VISION.md](./PORTFOLIO_VISION.md) |
| Sinewaves architecture | [src/components/modules/sinewaves/ARCHITECTURE.md](./src/components/modules/sinewaves/ARCHITECTURE.md) |
| Module skeleton infrastructure | [src/lib/skeleton/README.md](./src/lib/skeleton/README.md) |
| Design critiques, HUD direction | `docs/design/` |
| Implementation plans | `docs/plans/` |
| Adding a module | Register in `src/config/modules.ts`; lazy-load component; implement `ModuleProps` |
