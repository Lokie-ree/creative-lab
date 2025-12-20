# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server with HMR
pnpm build      # Type-check with tsc and build for production
pnpm lint       # Run ESLint on all TypeScript files
pnpm preview    # Preview production build locally
```

## Architecture

This is a React 19 + TypeScript + Vite 7 project with Tailwind CSS v4.

### Key Configuration

- **Path alias**: `@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`)
- **Tailwind v4**: Uses the new `@tailwindcss/vite` plugin and CSS-first configuration in `src/index.css`
- **Theming**: shadcn/ui-style CSS custom properties with light/dark mode support via `.dark` class
- **Animations**: Uses `tw-animate-css` for Tailwind animation utilities

### Utilities

- `src/lib/utils.ts`: Contains `cn()` helper for merging Tailwind classes (uses `clsx` + `tailwind-merge`)

### Styling Pattern

Colors use semantic CSS variables (e.g., `--background`, `--primary`, `--destructive`) with OKLCH color space. Reference them via Tailwind classes like `bg-background`, `text-foreground`, `text-primary`.
