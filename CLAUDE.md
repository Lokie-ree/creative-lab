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

**Last updated:** March 16, 2026

### App framing
The app is positioned as "IVLA STEM Club" — student-facing. The hero shows "IVLA STEM Club" with a `DotGrid` canvas background (interactive dot field with mouse proximity) and a `RotatingText` tagline ("Where we build / discover / explore / prove"). No personal name in the student-facing UI.

### Modules (see `src/config/modules.ts`)
- **sinewaves** — **Complete.** Trigonometry; unit circle → sine/cosine. Instrument-style HUD with Eurorack design system. No panel screws. StatusStrip touch targets 44px minimum.
- **vector-transformations** — Implemented. Linear algebra; matrix transformations on vectors.
- **phase-portraits** — Placeholder/coming-soon.
- **rigid-motions** — **Complete (all 4 phases).** Grade 8 Geometry; 8.G.A.1–3. Predict-and-reveal loop (Phase 2), coordinate layer with `FormulaReadout` (Phase 3), two-step sequence builder capstone (Phase 4). Target: ISTE Live 2026. See [`src/components/modules/rigid-motions/ARCHITECTURE.md`](./src/components/modules/rigid-motions/ARCHITECTURE.md).

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
- **Design spec (Phase 3 & 4):** Archived — see git history for `2026-03-05-rigid-motions-design-spec-phase3-phase4-v1.1.md`
- **Shared types:** `TransformationParams` and related types live in `src/lib/types/transforms.ts` — imported by celebration components and rigid-motions module alike
- **Roadmap:** First module in three-module Grade 8 Geometry progression: (1) Rigid Motions ✓, (2) Dilations & Similarity, (3) Pythagorean Theorem

## Outstanding Work

See `MARCH_AUDIT.md` for the full audit with root causes, fix strategies, and file references. Summary below.

### P0 — Fix immediately

- **STATE-01: Celebration modal state leak** — `DiscoveryTab.tsx` falls through to the sinewaves formula path (`y = sin(t)`) when `moduleId === 'rigid-motions'` but `completedSequence` is empty. Two-part fix: (1) defensive guard in `DiscoveryTab.tsx` when `completedSequence` is null/empty; (2) atomic state update in `App.tsx` so `completedSequence` and `showCelebration` are set together. Files: `src/components/celebration/DiscoveryTab.tsx`, `src/App.tsx`.

### P1 — Fix before demo

**Rigid Motions layout (mobile):**
- **RM-01: Landscape capstone scene too small** — Fixed-row grid doesn't redistribute space in landscape. Switch to 2-column layout (canvas 60–70% left, controls right) or increase canvas flex-grow. File: `InstrumentModule.tsx`.
- **RM-02: SequenceBuilder cramped in landscape** — Switch to column layout (step 1 above step 2) in landscape. File: `ControlStrip.tsx`.
- **RM-03: Portrait SequenceBuilder dominates viewport** — Cap builder height; minimum canvas 40% of viewport. Consider bottom-sheet pattern. File: `InstrumentModule.tsx`.

**Rigid Motions UX (iPad-tested):**
- **Match reward too subtle** — Add scale burst on image, screen-edge flash in `--lab-accent`, and/or `navigator.vibrate` haptic.
- **Offline: no service worker** — App fails without WiFi. Add service worker or in-app offline message.
- **Translation inputs trigger native keyboard** — Replace `type="number"` in `SequenceBuilder.tsx` with stepper +/−1 buttons capped at ±CONTENT_RANGE.
- **Unicode arrows render inconsistently on iOS** — `↔` / `↕` / `→` fall back to emoji on iPad. Replace with plain text or SVG.

**Sinewaves:**
- **SW-01: Wave hidden off-screen in landscape** — Verify `useIsMobileViewport` returns true for landscape phones (`window.innerWidth < 768`). Check `SCENE_LAYOUT.landscape.wave.xRatio`. Files: `scene-layout.ts`, `Scene.tsx`.

**State & navigation:**
- **STATE-02: Escape during GSAP reveal** — Animation may continue after unmount. Verify GSAP timelines are killed in cleanup (`useGSAP` context scope).
- **STATE-03: Back-navigation mid-capstone** — Partial sequence + back + re-enter should reset to `predict-translate`, not resume partial capstone state.
- **NAV-01: Full navigation path on each device class** — Verify Hero → CourseHub → Constellation → Module → Back on all breakpoints. Check DotGrid touch, RotatingText readability, SegmentArc tap targets ≥44px.

### P2 — Polish

- **RM-04: Missing coordinate labels on mobile capstone** — A′, B′, C′ render without coordinate numbers on mobile. Check `coordinatesActive` threading to capstone scene. Files: `SpriteLabel.tsx`, `RigidMotionsScene.tsx`.
- **RM-05: Status strip dots missing on capstone** — Dots absent in landscape and desktop. Check z-index and color token in `InstrumentModule.tsx`.
- **STATE-04: Viewport resize during module interaction** — Canvas and CSS layout may desync on device rotation. Verify both modules handle resize cleanly.
- **STATE-05: Double-tap / rapid CHECK presses** — Rapid CHECK could fire `handleCheck` multiple times. Verify only one match is counted and guide state advances exactly once.
- **STATE-06: stageRoundIndex boundary on Phase 3 entry** — Verify no out-of-bounds access when a stage has only one round definition.
- **Grid lines too faint** — `CoordinateGrid` `opacity={0.2}` nearly invisible on iPad. Increase to ≈`0.35`.
- **Vertex label sizing** — Prime labels (A′/B′/C′) may clip at `planeWidth={0.55}`. Apply dynamic sizing.
- **Capstone target has no vertex labels** — `CapstoneTarget` renders no A′/B′/C′ labels. Student can't identify vertices while building the sequence.
- **Control panel dividers inconsistent** — Standardize with `border-(--lab-border)` scored lines.

### Pedagogy

- **PED-01: Capstone entry copy reveals non-commutativity too early** — "try reversing the order" should only trigger after a miss, not as the entry prompt. Split `PROMPT_TEXT` into neutral entry + post-miss hint. Files: `rigid-motions-copy.ts`, `useRigidMotionsState.ts`.
- **PED-02: Capstone completion copy alignment** — Verify `CAPSTONE_COMPLETION_COPY` keys (`capstone-1/2/3`) match round IDs from `capstone-utils.ts`.
- **PED-03: Earned reveal pacing** — Read all reveal strings in sequence. Each should reward the specific thing the student just demonstrated. Flag generic or disconnected copy.
- **`coordinate-reveal` stage is a passive reveal** — Student presses CONTINUE without earning the formula. Revisit: bridge copy connecting Phase 2 actions to the notation, or require one prediction before confirmation.
- **ALD alignment audit needed** — Audit each stage transition against ALDs (Level 3 entry → Level 4 primary → Level 5 capstone).
- **SW-02: Unit circle mobile portrait decision** — Deliberate choice needed: hide to give wave more canvas, or keep and accept smaller wave area. Observe student sessions, then document the decision.
- **PED-04: Commitment before feedback (deferred)** — Sinewaves can be completed by slider-sweeping. Do not retrofit until Dilations and Pythagorean Theorem are built; the generalized pattern will be clearer after three modules.

### Feature ideas — Rigid Motions (not yet scheduled)
- **Per-vertex color-coded rotation arcs** — All three `RotationArcs` arcs are `#7a746a`. Color each arc to match its vertex and pulse on alignment. Requires 3 vertex color constants, per-arc alignment detection, GSAP pulse.

### Next module: Dilations & Similarity
- Grade 8 Geometry progression — follows Rigid Motions
- Use `module-planning-pipeline` skill to generate the design spec
- Follow the rigid-motions file structure as reference implementation

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
| Module skeleton infrastructure | [src/lib/skeleton/README.md](./src/lib/skeleton/README.md) |
| Design critiques, HUD direction | `docs/design/` |
| Professional artifacts (resume, ISTE storyboards, module planning) | `docs/professional/` |
| Adding a module | Register in `src/config/modules.ts`; lazy-load component; implement `ModuleProps` |
