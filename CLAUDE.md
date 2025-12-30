# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev      # Start Vite dev server (port 5173)
pnpm build    # TypeScript check + Vite production build
pnpm lint     # ESLint validation
pnpm preview  # Preview production build locally
```

Package manager: **pnpm**

## Tech Stack

- **React 19** + **TypeScript ~5.9** + **Vite 7.2**
- **React Three Fiber 9.4** + **Three.js 0.182** for 3D visualization
- **GSAP 3.14** + **Motion 12.23** for animations
- **Tailwind CSS 4.1** + **shadcn/ui** (Radix primitives) for styling
- Path alias: `@/*` → `src/*`

## Architecture Overview

### Application Flow

The app is an interactive math learning module teaching sinusoidal waves through exploration:

```
Hero → Module → CelebrationModal
```

### Module Stage Machine (src/components/Module.tsx)

```
observe → amplitude → frequency → challenge → reveal
```

Each parameter stage (`amplitude`, `frequency`) follows:
```
explore → match → reflect → next stage
```

**Challenge stage** follows:
```
diagnose ("What changed?") → match (single slider) → reveal
```

**Pedagogical pattern ("Earned Reveal"):** Users explore parameters via sliders, match target waves to earn micro-celebrations, answer prediction questions to reinforce understanding. Formula appears only after successful completion.

### Key Component Hierarchy

```
App (view routing)
└── Module (stage machine, parameter state)
    ├── Scene (R3F canvas, responsive layout)
    │   ├── UnitCircle (rotating circle)
    │   ├── SineWave (wave graph)
    │   └── Connector (y-value link)
    ├── ControlPanel (parameter sliders)
    ├── QuestionCard (MCQ)
    └── FeedbackBanner
```

### State Management

- React hooks for UI state (no external state library)
- `useRef` for continuous animation loops (angle, time)
- `useMemo` for match score calculations
- Props drilling from Module → Scene/ControlPanel

### Responsive Design

`Scene.tsx` detects portrait vs landscape:
- **Portrait:** Circle on top, wave below
- **Landscape:** Circle left, wave right

### Design Tokens

Colors defined in `src/lib/colors.ts` and CSS variables in `src/index.css`:
- Accent (cyan): `#22d3ee`
- Learning (amber): `#f5a623`
- Background (navy): `#0a0a0f`

## R3F Performance Rules

- **Never** call `setState` inside `useFrame`
- Reuse geometries/materials via `useMemo`
- Pre-allocate vectors, reuse with `.set()`
- Wave trail capped at ~200 points
- DPR set to `[1, 1.5]` for mobile

## Key Files

| Purpose | File |
|---------|------|
| View routing | `src/App.tsx` |
| Stage machine & core logic | `src/components/Module.tsx` |
| 3D visualization setup | `src/components/modules/sinusoidal/Scene.tsx` |
| Match calculation | `src/hooks/useMatchScore.ts` |
| Design tokens | `src/lib/colors.ts` |

## Adding shadcn/ui Components

MCP server configured in `.cursor/mcp.json` for shadcn CLI:
```bash
npx shadcn@latest add <component>
```

Components land in `src/components/ui/`.

## Deployment

- **Platform:** Vercel
- **Live:** https://creative-lab-five.vercel.app/
- **Build output:** `dist/`
