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

## Git Workflow

- **Always create a feature branch before starting work.** Never commit to `main`. If it's unclear which branch to use, ask.
- **Before creating a PR**, run `git log main..HEAD --oneline` to verify no already-merged commits are included. Rebase to clean up if needed.
- **Before executing a multi-step plan**, outline the steps and wait for explicit approval. Do not begin implementation until the user confirms.

## Visual Specs Convention

Before implementing any layout, camera, or container work in a new module, write a spec block in the relevant plan or design doc covering:

- **Container fill:** how the visualization area expands across viewport sizes
- **Camera / world size:** orthographic frustum, world-unit range, center point
- **Grid / axis bounds:** what coordinates are visible at each breakpoint
- **Z-layer map:** which elements occupy which depth layers

This prevents the camera-iteration and ghost-regression patterns that burned sessions in M1 and M2. Spec before first pixel, not after the first wrong render.

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

Back navigation (keyboard Escape) from modules; Celebration modal on completion.

### Key Patterns
- **3D inside Canvas, controls outside.** `Scene.tsx` (per module) owns the R3F Canvas; `ControlPanel` and other HTML controls live outside.
- **Module state flows through App.tsx.** View state (hero vs module), celebration modals, and parameter tracking are managed at the app level, passed down as props. Modules call `onComplete(values)` when done.
- **Predict-and-reveal (geometry modules).** Rigid Motions is the reference implementation for all three Grade 8 geometry modules. See [`src/components/modules/rigid-motions/ARCHITECTURE.md`](./src/components/modules/rigid-motions/ARCHITECTURE.md).
- **Adding a module.** Register in `src/config/modules.ts`, lazy-load the component, implement `ModuleProps`.

## Design System

### Aesthetic: Eurorack / Synth Module
Warm matte faceplate, phosphor green accent, silk-screened labels, scored dividers, no glow, no border-radius on module UI. No decorative corner screws — omitted by design.

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

**Last updated:** April 7, 2026

### App framing
The app is positioned as "IVLA STEM Club" — student-facing. The hero shows "IVLA STEM Club" with a `DotGrid` canvas background (interactive dot field with mouse proximity) and a `RotatingText` tagline ("Where we build / discover / explore / prove"). No personal name in the student-facing UI.

### Modules (see `src/config/modules.ts`)
- **sinewaves** — **Complete.** Trigonometry; unit circle → sine/cosine. Instrument-style HUD with Eurorack design system. No panel screws. StatusStrip touch targets 44px minimum. Landscape phones use wave-only mode (phone detection via `Math.min(innerWidth, innerHeight) < 500`).
- **vector-transformations** — Implemented. Linear algebra; matrix transformations on vectors.
- **phase-portraits** — Placeholder/coming-soon.
- **rigid-motions** — **Complete (all 4 phases + ISTE visibility sprint).** Grade 8 Geometry; 8.G.A.1–3. Predict-and-reveal loop (Phase 2), coordinate layer with `FormulaReadout` (Phase 3), two-step sequence builder capstone (Phase 4). ISTE visibility sprint (March 2026) added: phase labels (`PHASE_LABELS`), `synthesis-reveal` guide state (9th state, passive reveal between Phase 3 and capstone), 12 beat-indexed earned reveals (`EARNED_REVEALS` / `RevealBeat`), coordinate rule notation in `PromptReadout`, congruence language in celebration. Target: ISTE Live 2026. See [`src/components/modules/rigid-motions/ARCHITECTURE.md`](./src/components/modules/rigid-motions/ARCHITECTURE.md).
- **dilations** — **Complete (all 4 phases).** Grade 8 Geometry; 8.G.A.3–5. Phase 1: predict-and-reveal across 5 scale-factor rounds. Phase 2: coordinate rule rounds with formula strip. Phase 3: similarity sequences via chip-rail SequenceBuilder (3 rounds). Phase 4: AA criterion discovery, non-similar confirmation, 3-pair capstone with `CapstonePairNavigator`. See [`src/components/modules/dilations/ARCHITECTURE.md`](./src/components/modules/dilations/ARCHITECTURE.md).

### PWA / Offline
`vite-plugin-pwa` added with Workbox `generateSW` mode. Pre-caches all JS/CSS/HTML/woff2 assets (19 entries, ~3MB including Three.js chunk). Google Fonts cached via `CacheFirst`. App fully functional offline after first load. Config in `vite.config.ts`.

### Journey (hero → CourseHub → Constellation → module)
- All screens use `--lab-bg` warm faceplate background.
- All text uses lab tokens — no raw `gray-*` or `text-white` anywhere in the journey.
- CourseHub and Constellation use a consistent 2-row layout: `h-12 shrink-0` header (back button in flow) + `flex-1 justify-center` content area (`h-dvh`).
- CourseNode shape consistency: `SegmentArc` always renders; `total === 0` shows a dashed ghost circle so all nodes are circular.
- `Navigation.tsx` uses `from-[var(--lab-bg)]/70` gradient and lab text tokens.

### Module skeleton
Reusable hooks in `src/lib/skeleton/` (useModuleFlow, useStageUnlock, useChallengeAssist, useAccessibility, useErrorRecovery, useModuleAnalytics). `useAccessibility` now consumed by DilationsModule (screen reader announcements + haptic). Other hooks not yet used — rigid-motions built its own `useRigidMotionsState` hook directly.

### Rigid Motions — architecture notes
- **Standards:** 8.G.A.1, 8.G.A.2, 8.G.A.3 (Grade 8 Geometry)
- **Architecture doc:** [`src/components/modules/rigid-motions/ARCHITECTURE.md`](./src/components/modules/rigid-motions/ARCHITECTURE.md) — as-built reference
- **Design spec (Phase 3 & 4):** Archived — see git history for `2026-03-05-rigid-motions-design-spec-phase3-phase4-v1.1.md`
- **ISTE visibility sprint spec:** `docs/superpowers/specs/` — beat-indexed reveals, synthesis-reveal, phase labels
- **Shared types:** `TransformationParams` and related types live in `src/lib/types/transforms.ts` — imported by celebration components and rigid-motions module alike
- **Roadmap:** First module in three-module Grade 8 Geometry progression: (1) Rigid Motions ✓, (2) Dilations & Similarity, (3) Pythagorean Theorem

### Dilations — architecture notes
- **Standards:** 8.G.A.3 (dilations), 8.G.A.4 (similar figures), 8.G.A.5 (AA criterion)
- **Architecture doc:** [`src/components/modules/dilations/ARCHITECTURE.md`](./src/components/modules/dilations/ARCHITECTURE.md) — as-built reference
- **Build order:** `docs/modules/dilations/build-order-prompts.md` — 14-round sequence across 4 phases
- **All 4 phases complete:** Scale-factor (PRs #47–#49), coordinate (PRs #51–#52), solidification + drag polish (PRs #53–#54), similarity sequences (PR #56), Phase 3 polish (PRs #58, #60), Phase 4 AA Capstone (branch `feat/dilations-phase4-aa-capstone`)
- **Spec:** `docs/superpowers/specs/2026-04-04-dilations-phase4-aa-capstone-design.md` (archived)
- **Plan:** `docs/superpowers/plans/2026-04-04-dilations-phase4-aa-capstone.md` (complete)

## Outstanding Work

See `MARCH_AUDIT.md` for the full audit with root causes, fix strategies, and file references. All P0 and P1 issues resolved as of March 17, 2026; ISTE visibility sprint items resolved March 19, 2026. Summary of remaining work below.

### Polish (formerly P2)

- **RM-04: Coordinate values missing next to vertices on mobile capstone** — `coordinatesActive` is plumbed to `CoordinateGrid` but the `_coordinatesActive` parameter is unused. In-scene coordinate annotations (e.g. "(2, 1)" next to each vertex) are not yet implemented. Requires adding `SpriteLabel` calls when `coordinatesActive` is true.
- **STATE-04: Viewport resize during module interaction** — Canvas and CSS layout may desync on device rotation. Verify both modules handle resize cleanly.
- **Vertex label sizing** — Prime labels (A′/B′/C′) may clip at `planeWidth={0.55}` on small viewports. Consider zoom-aware dynamic sizing.
- **Control panel dividers inconsistent** — Standardize with `border-(--lab-border)` scored lines across all button groups in `ControlStrip.tsx`.

### Pedagogy

- **PED-01: Capstone entry copy reveals non-commutativity too early** — "try reversing the order" should only trigger after a miss, not as the entry prompt. Split `PROMPT_TEXT` into neutral entry + post-miss hint. Files: `rigid-motions-copy.ts`, `useRigidMotionsState.ts`.
- **`coordinate-reveal` stage is a passive reveal** — Student presses CONTINUE without earning the formula. `synthesis-reveal` (added in sprint) is a similar pause state but after coordinate predict rounds. The original concern about `coordinate-reveal` bridge copy remains open.
- **ALD alignment audit** — Phase labels (`PHASE_02`, `PHASE_03`, `PHASE_04`) and `synthesis-reveal` pause state added in sprint help clarify progression, but a formal audit of each transition against ALDs has not been done.
- **SW-02: Unit circle mobile portrait decision** — Deliberate choice needed: hide to give wave more canvas, or keep and accept smaller wave area. Observe student sessions, then document the decision.
- **PED-04: Commitment before feedback (deferred)** — Sinewaves can be completed by slider-sweeping. Do not retrofit until Dilations and Pythagorean Theorem are built; the generalized pattern will be clearer after three modules.

### Feature ideas — Rigid Motions (not yet scheduled)
- **Per-vertex color-coded rotation arcs** — All three `RotationArcs` arcs are `#7a746a`. Color each arc to match its vertex and pulse on alignment. Requires 3 vertex color constants, per-arc alignment detection, GSAP pulse.

### Next: Pythagorean Theorem (M3)
Third module in the Grade 8 geometry progression. Not yet spec'd — use `module-planning-pipeline` skill to begin.

### Sinewaves — lower-priority polish
- **Resize distortion:** Scene layout may desync with Canvas on viewport resize.
- **Match-success animation:** `matchSuccessSequence` in `animations.ts` exists but is not wired.
- **Mobile control spacing:** Control strip uses `gap-2` on mobile which feels cramped.

### Vestigial `color` field in `courses.ts`
CS course still has `color: '#a855f7'` (purple, off-palette). Field is no longer used in rendering. Remove from the `Course` type or replace when the CS course is built out.

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
| **Audit checklist (P0–PED, ISTE 2026 hardening)** | [docs/MARCH_AUDIT.md](./docs/MARCH_AUDIT.md) |
| **Pedagogy & LSSM alignment (foundational)** | [docs/philosophy.md](./docs/philosophy.md), [docs/product.md](./docs/product.md) |
| Documentation index & module pipeline | [docs/README.md](./docs/README.md) |
| Vision, audience, principles | [VISION.md](./VISION.md) |
| Sinewaves architecture | [src/components/modules/sinewaves/ARCHITECTURE.md](./src/components/modules/sinewaves/ARCHITECTURE.md) |
| Rigid Motions architecture | [src/components/modules/rigid-motions/ARCHITECTURE.md](./src/components/modules/rigid-motions/ARCHITECTURE.md) |
| Dilations architecture | [src/components/modules/dilations/ARCHITECTURE.md](./src/components/modules/dilations/ARCHITECTURE.md) |
| Module skeleton infrastructure | [src/lib/skeleton/README.md](./src/lib/skeleton/README.md) |
| Design critiques, HUD direction | `docs/design/` |
| Professional artifacts (resume, ISTE storyboards, module planning) | `docs/professional/` |
| AI-generated specs and implementation plans | `docs/superpowers/specs/`, `docs/superpowers/plans/` |
| Adding a module | Register in `src/config/modules.ts`; lazy-load component; implement `ModuleProps` |
