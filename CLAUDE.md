# CLAUDE.md

Instructions for AI agents working in this repository. Single source of truth for architecture, commands, patterns, design system, current state, and guidelines.

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
pnpm storybook        # Storybook dev server at port 6006
```

**Tests** (Vitest with dual environments):
```bash
pnpm vitest run                                        # All tests
pnpm vitest run src/components/modules/rigid-motions  # Single module
pnpm vitest --browser                                  # Browser/Storybook tests
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
Warm matte faceplate, phosphor green accent, silk-screened labels, scored dividers, no glow, no border-radius on module UI. No decorative corner screws — omitted by design. Module mockup exemplar: `mockups/RigidMotions.jsx`. See `mockups/README.md`.

### Colors (from `src/lib/colors.ts` → `src/index.css`)
- **accent.primary**: `#7cc87c` (phosphor green) — Active elements — CSS: `--lab-accent`
- **accent.primaryHover**: `#96e496` — CSS: `--lab-accent-hover`
- **accent.primaryMuted**: `#4a8a4a` — CSS: `--lab-accent-muted`
- **learning.primary**: `#f5a623` (amber) — Feedback, reveals — CSS: `--lab-accent-warm`, `--lab-earned`
- **background.primary**: `#1e1d1c` (warm faceplate) — CSS: `--lab-bg`
- **background.secondary**: `#252422` — CSS: `--lab-surface`
- **text.primary**: `#b8b0a4` (silk cream) — CSS: `--lab-text`
- **text.secondary**: `#8a847a` (silk dim) — CSS: `--lab-text-muted`
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

**Palette is complete — no hardcoded cyan, no raw gray-* classes anywhere in `src/`.** All journey screens (hero, CourseHub, Constellation, Navigation) use lab tokens.

## Pedagogy

- **Challenge before explanation.** Users manipulate first, discover through exploration, receive formula as reward.
- **Matching IS verification.** No quizzes or multiple choice. The act of matching the target proves understanding.
- **No wrong answers.** "Getting closer..." not "incorrect". Glow intensity shifts, not error states.
- **Earned reveals.** Formula appears after demonstrated understanding with user's discovered values highlighted.

## Bundle Optimization

Manual chunk splitting in `vite.config.ts`: `three`, `gsap`, `radix`. Heavy 3D code is lazy-loaded via React.lazy().

## Current State

**Last updated:** March 5, 2026

### App framing
The app is positioned as "IVLA STEM Club" — student-facing. The hero shows "IVLA STEM Club" with a `DotGrid` canvas background (interactive dot field with mouse proximity) and a `RotatingText` tagline ("Where we build / discover / explore / prove"). No personal name in the student-facing UI.

### Modules (see `src/config/modules.ts`)
- **sinewaves** — **Complete.** Trigonometry; unit circle → sine/cosine. Instrument-style HUD with Eurorack design system. No panel screws. StatusStrip touch targets 44px minimum.
- **vector-transformations** — Implemented. Linear algebra; matrix transformations on vectors.
- **phase-portraits** — Placeholder/coming-soon.
- **rigid-motions** — **Complete (all 4 phases).** Grade 8 Geometry; 8.G.A.1–3. Predict-and-reveal loop (Phase 2), coordinate layer with `FormulaReadout` (Phase 3), two-step sequence builder capstone (Phase 4). Conference-ready for ISTE Live 2026. See [`src/components/modules/rigid-motions/ARCHITECTURE.md`](./src/components/modules/rigid-motions/ARCHITECTURE.md).

### Journey (hero → CourseHub → Constellation → module)
- All screens use `--lab-bg` warm faceplate background.
- All text uses lab tokens — no raw `gray-*` or `text-white` anywhere in the journey.
- CourseHub and Constellation use a consistent 2-row layout: `h-12 shrink-0` header (back button in flow) + `flex-1 justify-center` content area (`h-dvh`).
- CourseNode shape consistency: `SegmentArc` always renders; `total === 0` shows a dashed ghost circle so all nodes are circular.
- `Navigation.tsx` uses `from-[var(--lab-bg)]/70` gradient and lab text tokens.

### Module skeleton
Reusable hooks in `src/lib/skeleton/` (useModuleFlow, useStageUnlock, useChallengeAssist, useAccessibility, useErrorRecovery, useModuleAnalytics). Not yet consumed by any module — rigid-motions built its own `useRigidMotionsState` hook directly.

### Rigid Motions — architecture notes
- **Standards:** 8.G.A.1, 8.G.A.2, 8.G.A.3 (Grade 8 Geometry)
- **Architecture doc:** [`src/components/modules/rigid-motions/ARCHITECTURE.md`](./src/components/modules/rigid-motions/ARCHITECTURE.md) — as-built reference
- **Design spec (Phase 3 & 4, archived):** [`docs/archive/2026-03-05-rigid-motions-design-spec-phase3-phase4-v1.1.md`](./docs/archive/2026-03-05-rigid-motions-design-spec-phase3-phase4-v1.1.md)
- **Shared types:** `TransformationParams` and related types live in `src/lib/types/transforms.ts` — imported by celebration components and rigid-motions module alike
- **Roadmap:** First module in three-module Grade 8 Geometry progression: (1) Rigid Motions ✓, (2) Dilations & Similarity, (3) Pythagorean Theorem

## Outstanding Work

### Next module: Dilations & Similarity
- Grade 8 Geometry progression — follows Rigid Motions
- Use `module-planning-pipeline` skill to generate the design spec
- Follow the rigid-motions file structure as reference implementation

### Sinewaves — lower-priority polish
- **Resize distortion:** Scene layout may desync with Canvas on viewport resize.
- **Match-success animation:** `matchSuccessSequence` in `animations.ts` exists but is not wired — celebration uses a static overlay instead of the staged timeline.
- **Mobile control spacing:** Control strip uses `gap-2` on mobile which feels cramped.

### Vestigial `color` field in `courses.ts`
CS course still has `color: '#a855f7'` (purple, off-palette). The field is no longer used in rendering (glow removed), but it's in the `Course` type. Either remove the field from the type or replace with a design-system color when the CS course is built out.

### Performance audit (medium/low priority)
See [`VERCEL-REACT-BEST-PRACTICES-AUDIT.md`](./docs/design/VERCEL-REACT-BEST-PRACTICES-AUDIT.md): localStorage versioning, conditional rendering patterns, `useTransition` for module loading.

## Agent Guidelines

- **Preserve pedagogy.** Don't add quizzes, multiple choice, or "wrong answer" messaging. Keep discovery-first and earned reveals.
- **Respect separation.** Don't put HTML controls inside the Canvas or 3D inside control components.
- **Follow the design system.** Use `@/lib/colors` and existing UI/shadcn components; avoid one-off palettes or layout patterns that clash.
- **Check docs before big changes.** New modules or flow changes should align with [docs/philosophy.md](./docs/philosophy.md), [docs/product.md](./docs/product.md), and [VISION.md](./VISION.md). Use the `module-planning-pipeline` skill for new module planning.

## Related Documentation

| Topic | Location |
|-------|----------|
| **Pedagogy & LSSM alignment (foundational)** | [docs/philosophy.md](./docs/philosophy.md), [docs/product.md](./docs/product.md) |
| Documentation index & module pipeline | [docs/README.md](./docs/README.md) |
| Vision, audience, principles | [VISION.md](./VISION.md) |
| Sinewaves architecture | [src/components/modules/sinewaves/ARCHITECTURE.md](./src/components/modules/sinewaves/ARCHITECTURE.md) |
| Rigid Motions architecture | [src/components/modules/rigid-motions/ARCHITECTURE.md](./src/components/modules/rigid-motions/ARCHITECTURE.md) |
| Module skeleton infrastructure | [src/lib/skeleton/README.md](./src/lib/skeleton/README.md) |
| Design critiques, HUD direction | `docs/design/` |
| Active implementation plans | `docs/plans/` (empty — all rigid motions specs archived March 2026) |
| Completed plans & resolved audits | `docs/archive/` |
| Adding a module | Register in `src/config/modules.ts`; lazy-load component; implement `ModuleProps` |
