# Sinewaves Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Observatory HUD aesthetic for sinewaves module with user-controlled pacing and centralized animations.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, GSAP, React Three Fiber

**Design Reference:** `docs/plans/2026-01-28-sinewaves-redesign.md`

---

## Architecture Decisions

### Component Strategy: New Files, Parallel Development

Create new Observatory HUD components as separate files. Existing components (`ExplorePrompt`, `FormulaPreview`, `AnimatedPanel`) remain untouched until Module.tsx switches over. This allows:
- Building new components in isolation
- No broken intermediate state
- Clean swap when Module.tsx is rewritten
- Old components deleted in final cleanup

### Component Mapping

| Category | Existing | New | Strategy |
|----------|----------|-----|----------|
| **Replace** | `SinewavesLayout` | New grid-based `Layout.tsx` | Rewrite in place (module-specific) |
| **Replace** | `ProgressBar` | `StatusStrip.tsx` | New file in `components/` |
| **Replace** | `ExplorePrompt` | `PromptReadout.tsx` | New file (old stays until swap) |
| **Replace** | `FormulaPreview` | `FormulaReadout.tsx` | New file (old stays until swap) |
| **Remove** | `DelayIndicator` | — | Simply don't use it |
| **Deprecate** | `AnimatedPanel` | — | Presets replace its logic; delete in cleanup |
| **Reposition** | `ControlPanel`, `QuestionCard`, `FeedbackBanner` | Same components | Move into grid control strip |
| **Unchanged** | `Scene`, `UnitCircle`, `SineWave`, `Connector` | — | Keep as-is |

### CSS Token Location

All CSS custom properties go in `src/index.css` where existing `--lab-*` tokens live:
- Spacing tokens (`--space-1` through `--space-12`)
- Font tokens (`--font-display`, `--font-body`, `--font-data`)
- Animation timing tokens (`--duration-fast`, etc.)

### ControlStrip Composition Pattern

`ControlStrip` is a **layout container**, not a smart component. It provides:
- Centered max-width wrapper
- Flex column with gap
- No conditional logic

Module.tsx decides what children render based on stage:
- Observe: `<ContinueButton />`
- Explore: `<Slider />` + label
- Match: `<Slider />` + feedback
- Reveal: action buttons

### Animation Separation

| Location | Responsibility |
|----------|----------------|
| `src/lib/animation/tokens.ts` | Timing constants (duration, easing, stagger) |
| `src/lib/animation/presets.ts` | Generic single-element GSAP animations |
| `src/components/modules/sinewaves/animations.ts` | Sinewaves-specific orchestration sequences |

**Boundary:** Generic library handles single-element animations; module file composes them into multi-element sequences.

### Console Boot Coordination

The "console coming alive" entrance sequence coordinates HTML (GSAP) and R3F (useFrame) animations:

- **Prop-in:** Module passes `bootPhase: 'hidden' | 'booting' | 'ready'` to Scene
- **Callback-out:** Scene calls `onBootComplete()` when visualization is ready
- **Flow:** `hidden` → `booting` (circle draws, rotation starts, wave builds) → `ready` (Continue appears)

---

## Phase 0: Snapshot Current State

### Task 0: Capture Before Screenshots

**Purpose:** Document the current module appearance before any changes. Essential for portfolio case study and "before/after" comparisons.

**Step 1: Run the dev server**

Run: `pnpm dev`

**Step 2: Capture screenshots at each stage**

Navigate through the module and capture screenshots of:
- Observe stage (initial view)
- Amplitude explore stage
- Amplitude match complete
- Frequency explore stage
- Frequency match complete
- Challenge observe stage
- Challenge diagnose stage
- Challenge match stage
- Reveal stage

Save to `docs/screenshots/sinewaves-before/` with naming pattern:
- `01-observe.png`
- `02-amplitude-explore.png`
- `03-amplitude-match.png`
- etc.

**Step 3: Capture at multiple viewport sizes**

Repeat for:
- Mobile (375px width)
- Tablet (768px width)
- Desktop (1280px width)

Use subfolders: `mobile/`, `tablet/`, `desktop/`

**Step 4: Commit screenshots**

```bash
git add docs/screenshots/
git commit -m "docs: capture before screenshots of sinewaves module"
```

---

## Phase 1: Foundation

### Task 1: Create Animation Tokens

**Files:**
- Create: `src/lib/animation/tokens.ts`

**Step 1: Create the animation tokens file**

```typescript
// src/lib/animation/tokens.ts
/**
 * Centralized animation timing tokens
 * All animation durations, easing, and stagger values in one place
 */

export const duration = {
  instant: 0,
  fast: 150,      // micro-interactions, hovers
  normal: 300,    // standard transitions
  slow: 500,      // emphasis, staged reveals
  dramatic: 800,  // major state changes
} as const

export const easing = {
  out: 'power3.out',       // primary exit easing
  inOut: 'power2.inOut',   // bidirectional transitions
  in: 'power2.in',         // entrance acceleration
} as const

export const stagger = {
  tight: 50,    // rapid sequence
  normal: 100,  // standard stagger
  loose: 150,   // deliberate sequence
} as const

// CSS custom properties version for use in stylesheets
export const cssTokens = `
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-dramatic: 800ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
`
```

**Step 2: Create index file for animation module**

Create: `src/lib/animation/index.ts`

```typescript
// src/lib/animation/index.ts
export * from './tokens'
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm build`
Expected: Build succeeds with no type errors

**Step 4: Commit**

```bash
git add src/lib/animation/
git commit -m "feat(animation): add centralized timing tokens"
```

---

### Task 2: Create Animation Presets

**Files:**
- Create: `src/lib/animation/presets.ts`
- Modify: `src/lib/animation/index.ts`

**Step 1: Create GSAP animation presets**

```typescript
// src/lib/animation/presets.ts
import gsap from 'gsap'
import { duration, easing, stagger } from './tokens'

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Convert ms to seconds for GSAP
 */
const toSeconds = (ms: number) => ms / 1000

/**
 * Fade in a readout panel (prompt or formula)
 */
export function fadeInReadout(
  element: gsap.TweenTarget,
  options?: { delay?: number; onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0 })
    options?.onComplete?.()
    return
  }

  return gsap.fromTo(
    element,
    { opacity: 0, y: -8 },
    {
      opacity: 1,
      y: 0,
      duration: toSeconds(duration.normal),
      ease: easing.out,
      delay: options?.delay ? toSeconds(options.delay) : 0,
      onComplete: options?.onComplete,
    }
  )
}

/**
 * Fade out a readout panel
 */
export function fadeOutReadout(
  element: gsap.TweenTarget,
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 0 })
    options?.onComplete?.()
    return
  }

  return gsap.to(element, {
    opacity: 0,
    y: -8,
    duration: toSeconds(duration.fast),
    ease: easing.inOut,
    onComplete: options?.onComplete,
  })
}

/**
 * Success pulse animation for match threshold
 */
export function pulseSuccess(
  element: gsap.TweenTarget,
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    options?.onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete: options?.onComplete })
  tl.to(element, {
    scale: 1.02,
    filter: 'brightness(1.2)',
    duration: toSeconds(duration.normal),
    ease: easing.out,
  }).to(element, {
    scale: 1,
    filter: 'brightness(1)',
    duration: toSeconds(duration.normal),
    ease: easing.inOut,
  })

  return tl
}

/**
 * Staged reveal - sequential fade-in of multiple elements
 * Used for post-match celebration sequence
 */
export function stagedReveal(
  elements: gsap.TweenTarget[],
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    elements.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))
    options?.onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete: options?.onComplete })

  elements.forEach((element, index) => {
    tl.fromTo(
      element,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(duration.normal),
        ease: easing.out,
      },
      index * toSeconds(stagger.normal)
    )
  })

  return tl
}

/**
 * Stage transition - coordinated exit and entrance
 */
export function stageTransition(
  exitElements: gsap.TweenTarget[],
  enterElements: gsap.TweenTarget[],
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    exitElements.forEach((el) => gsap.set(el, { opacity: 0 }))
    enterElements.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))
    options?.onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete: options?.onComplete })

  // Exit all elements in parallel
  exitElements.forEach((element) => {
    tl.to(
      element,
      {
        opacity: 0,
        duration: toSeconds(duration.fast),
        ease: easing.inOut,
      },
      0
    )
  })

  // Brief hold
  tl.addLabel('enter', `+=${toSeconds(stagger.tight)}`)

  // Enter elements with stagger
  enterElements.forEach((element, index) => {
    tl.fromTo(
      element,
      { opacity: 0, y: -8 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(duration.normal),
        ease: easing.out,
      },
      `enter+=${index * toSeconds(stagger.normal)}`
    )
  })

  return tl
}
```

**Step 2: Update index to export presets**

```typescript
// src/lib/animation/index.ts
export * from './tokens'
export * from './presets'
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/lib/animation/
git commit -m "feat(animation): add GSAP animation presets"
```

---

### Task 2B: Create Sinewaves Animation Orchestration

**Files:**
- Create: `src/components/modules/sinewaves/animations.ts`

**Step 1: Create sinewaves-specific orchestration file**

This file composes generic presets into sinewaves-specific sequences.

```typescript
// src/components/modules/sinewaves/animations.ts
import gsap from 'gsap'
import { duration, easing, stagger } from '@/lib/animation/tokens'
import { fadeInReadout, fadeOutReadout, stagedReveal } from '@/lib/animation/presets'

/**
 * Convert ms to seconds for GSAP
 */
const toSeconds = (ms: number) => ms / 1000

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Refs needed for console boot sequence
 */
export interface BootRefs {
  statusStrip: HTMLElement | null
  progressBar: HTMLElement | null
  prompt: HTMLElement | null
}

/**
 * Console boot sequence - "power on" entrance animation
 * Coordinates HTML elements; Scene handles its own boot via prop
 */
export function consoleBootSequence(
  refs: BootRefs,
  onReadyForScene: () => void
) {
  if (prefersReducedMotion()) {
    // Skip to ready state
    if (refs.statusStrip) gsap.set(refs.statusStrip, { opacity: 1 })
    if (refs.progressBar) gsap.set(refs.progressBar, { scaleX: 1 })
    if (refs.prompt) gsap.set(refs.prompt, { opacity: 1, x: 0 })
    onReadyForScene()
    return
  }

  const tl = gsap.timeline()

  // Status strip fades in
  if (refs.statusStrip) {
    tl.fromTo(
      refs.statusStrip,
      { opacity: 0 },
      { opacity: 1, duration: toSeconds(duration.fast) }
    )
  }

  // Progress bar draws left-to-right
  if (refs.progressBar) {
    tl.fromTo(
      refs.progressBar,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration: toSeconds(duration.normal), ease: easing.out },
      '-=0.1'
    )
  }

  // Prompt readout materializes
  if (refs.prompt) {
    tl.fromTo(
      refs.prompt,
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: toSeconds(duration.normal), ease: easing.out },
      '+=0.1'
    )
  }

  // Signal Scene to start its boot animation
  tl.call(onReadyForScene, [], '+=0.2')

  return tl
}

/**
 * Refs needed for match success sequence
 */
export interface MatchSuccessRefs {
  visualization: HTMLElement | null
  feedback: HTMLElement | null
  continueButton: HTMLElement | null
}

/**
 * Match success sequence - staged reveal after hitting target
 * Timeline: hold → pulse → feedback → button
 */
export function matchSuccessSequence(
  refs: MatchSuccessRefs,
  onComplete: () => void
) {
  if (prefersReducedMotion()) {
    if (refs.feedback) gsap.set(refs.feedback, { opacity: 1, y: 0 })
    if (refs.continueButton) gsap.set(refs.continueButton, { opacity: 1, y: 0 })
    onComplete()
    return
  }

  const tl = gsap.timeline({ onComplete })

  // Hold - brief pause for visual confirmation (300ms)
  tl.addLabel('hold', 0)

  // Pulse visualization glow
  if (refs.visualization) {
    tl.to(
      refs.visualization,
      {
        filter: 'brightness(1.15)',
        duration: toSeconds(duration.normal),
        ease: easing.out,
      },
      'hold'
    ).to(refs.visualization, {
      filter: 'brightness(1)',
      duration: toSeconds(duration.normal),
      ease: easing.inOut,
    })
  }

  // Feedback text fades in
  if (refs.feedback) {
    tl.fromTo(
      refs.feedback,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      `-=${toSeconds(duration.fast)}`
    )
  }

  // Continue button appears
  if (refs.continueButton) {
    tl.fromTo(
      refs.continueButton,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      `+=${toSeconds(stagger.normal)}`
    )
  }

  return tl
}

/**
 * Stage transition sequence
 * Orchestrates exit of current readouts and entrance of new ones
 */
export function stageTransitionSequence(
  exitRefs: { prompt: HTMLElement | null; formula: HTMLElement | null },
  onMidpoint: () => void,
  enterRefs: { prompt: HTMLElement | null; formula: HTMLElement | null },
  onComplete?: () => void
) {
  if (prefersReducedMotion()) {
    if (exitRefs.prompt) gsap.set(exitRefs.prompt, { opacity: 0 })
    if (exitRefs.formula) gsap.set(exitRefs.formula, { opacity: 0 })
    onMidpoint()
    if (enterRefs.prompt) gsap.set(enterRefs.prompt, { opacity: 1, y: 0 })
    if (enterRefs.formula) gsap.set(enterRefs.formula, { opacity: 1, y: 0 })
    onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete })

  // Exit current readouts
  const exitElements = [exitRefs.prompt, exitRefs.formula].filter(Boolean)
  exitElements.forEach((el) => {
    tl.to(el, { opacity: 0, duration: toSeconds(duration.fast), ease: easing.inOut }, 0)
  })

  // Midpoint - state update happens here
  tl.call(onMidpoint, [], `+=${toSeconds(stagger.tight)}`)

  // Enter new readouts with stagger
  tl.addLabel('enter')
  if (enterRefs.prompt) {
    tl.fromTo(
      enterRefs.prompt,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      'enter'
    )
  }
  if (enterRefs.formula) {
    tl.fromTo(
      enterRefs.formula,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      `enter+=${toSeconds(stagger.normal)}`
    )
  }

  return tl
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/animations.ts
git commit -m "feat(sinewaves): add animation orchestration sequences"
```

---

### Task 3: Add Custom Fonts

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

**Step 1: Add Google Fonts to index.html**

Add inside `<head>` after existing links:

```html
<!-- Custom fonts for Observatory HUD -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Step 2: Add font CSS variables to index.css**

Add to `:root` section in `src/index.css` after existing lab tokens:

```css
  /* Typography - Observatory HUD */
  --font-display: 'JetBrains Mono', monospace;
  --font-body: 'DM Sans', sans-serif;
  --font-data: 'JetBrains Mono', monospace;
```

**Step 3: Verify fonts load**

Run: `pnpm dev`
Open browser, check Network tab for font files loading
Expected: DM Sans and JetBrains Mono fonts load successfully

**Step 4: Commit**

```bash
git add index.html src/index.css
git commit -m "feat(fonts): add JetBrains Mono and DM Sans"
```

---

### Task 4: Add Spacing Tokens to CSS

**Files:**
- Modify: `src/index.css`

**Step 1: Add Observatory HUD spacing tokens**

Add to `:root` section after font tokens:

```css
  /* Spacing - Observatory HUD semantic scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Animation timing (CSS version) */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(tokens): add Observatory HUD spacing scale"
```

---

## Phase 2: Layout Components

### Task 5: Create SinewavesLayout Component

**Files:**
- Create: `src/components/modules/sinewaves/Layout.tsx`

**Step 1: Create the layout component**

```tsx
// src/components/modules/sinewaves/Layout.tsx
import { type ReactNode } from 'react'

interface SinewavesLayoutProps {
  statusStrip: ReactNode
  promptReadout: ReactNode
  formulaReadout?: ReactNode
  visualization: ReactNode
  controlStrip: ReactNode
  children?: ReactNode // For overlays (celebrations, etc.)
}

/**
 * Observatory HUD layout for sinewaves module
 *
 * Mobile-first CSS Grid with 4 regions:
 * - Status strip (48px fixed)
 * - Readouts (auto height, stack on mobile, row on desktop)
 * - Primary display (flex-1, fills remaining space)
 * - Control strip (auto height)
 */
export function SinewavesLayout({
  statusStrip,
  promptReadout,
  formulaReadout,
  visualization,
  controlStrip,
  children,
}: SinewavesLayoutProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateRows: 'var(--space-12) auto 1fr auto',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--lab-bg)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* STATUS STRIP */}
      <header className="flex items-center">
        {statusStrip}
      </header>

      {/* READOUTS - stack on mobile, row on lg+ */}
      <div
        className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:gap-[var(--space-6)]"
      >
        <div className="flex-1">{promptReadout}</div>
        {formulaReadout && (
          <div className="lg:w-[280px] lg:flex-shrink-0">{formulaReadout}</div>
        )}
      </div>

      {/* PRIMARY DISPLAY - sacred, protected space */}
      <main className="relative min-h-0 flex-1">
        {visualization}
      </main>

      {/* CONTROL STRIP */}
      <footer className="flex flex-col items-center gap-[var(--space-3)]">
        {controlStrip}
      </footer>

      {/* OVERLAYS (celebrations, transitions) */}
      {children}
    </div>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/Layout.tsx
git commit -m "feat(sinewaves): add Observatory HUD layout component"
```

---

### Task 6: Create StatusStrip Component

**Files:**
- Create: `src/components/modules/sinewaves/components/StatusStrip.tsx`

**Step 1: Create the status strip component**

```tsx
// src/components/modules/sinewaves/components/StatusStrip.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

interface StatusStripProps {
  userName?: string
  avatarUrl?: string
  currentStage: number
  totalStages: number
  progress: number // 0-100
}

/**
 * Status strip showing user avatar, progress bar, and stage indicator
 */
export function StatusStrip({
  userName = 'Learner',
  avatarUrl,
  currentStage,
  totalStages,
  progress,
}: StatusStripProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex w-full items-center gap-[var(--space-4)]">
      {/* Avatar + Name */}
      <div className="flex items-center gap-[var(--space-3)]">
        <Avatar className="h-8 w-8 border border-[var(--lab-border)]">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback
            className="text-xs"
            style={{
              backgroundColor: 'var(--lab-surface)',
              color: 'var(--lab-text-muted)',
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <span
          className="hidden text-sm font-medium sm:inline"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--lab-text)',
          }}
        >
          {userName}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex-1">
        <Progress
          value={progress}
          className="h-1"
          style={{
            backgroundColor: 'var(--lab-surface)',
          }}
        />
      </div>

      {/* Stage indicator */}
      <span
        className="text-sm font-medium tabular-nums"
        style={{
          fontFamily: 'var(--font-data)',
          color: 'var(--lab-accent)',
        }}
      >
        {currentStage}/{totalStages}
      </span>
    </div>
  )
}
```

**Step 2: Create components index file**

Create: `src/components/modules/sinewaves/components/index.ts`

```typescript
export * from './StatusStrip'
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/components/
git commit -m "feat(sinewaves): add StatusStrip component"
```

---

### Task 7: Create PromptReadout Component

**Files:**
- Create: `src/components/modules/sinewaves/components/PromptReadout.tsx`
- Modify: `src/components/modules/sinewaves/components/index.ts`

**Step 1: Create the prompt readout component**

```tsx
// src/components/modules/sinewaves/components/PromptReadout.tsx
import { forwardRef } from 'react'

interface PromptReadoutProps {
  title: string
  description?: string
  className?: string
}

/**
 * Prompt readout panel with left-edge cyan glow
 * Observatory HUD instrument panel aesthetic
 */
export const PromptReadout = forwardRef<HTMLDivElement, PromptReadoutProps>(
  function PromptReadout({ title, description, className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{
          backgroundColor: 'var(--lab-surface)',
          borderRadius: '4px',
          padding: 'var(--space-4)',
          // Left edge glow
          borderLeft: '2px solid var(--lab-accent)',
          boxShadow: 'inset 4px 0 8px -4px rgba(34, 211, 238, 0.3)',
        }}
        data-stage-overlay
      >
        <h2
          className="text-base font-medium sm:text-lg"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--lab-text)',
            marginBottom: description ? 'var(--space-2)' : 0,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-sm"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--lab-text-muted)',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
    )
  }
)
```

**Step 2: Update components index**

```typescript
// src/components/modules/sinewaves/components/index.ts
export * from './StatusStrip'
export * from './PromptReadout'
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/components/
git commit -m "feat(sinewaves): add PromptReadout component"
```

---

### Task 8: Create FormulaReadout Component

**Files:**
- Create: `src/components/modules/sinewaves/components/FormulaReadout.tsx`
- Modify: `src/components/modules/sinewaves/components/index.ts`

**Step 1: Create the formula readout component**

```tsx
// src/components/modules/sinewaves/components/FormulaReadout.tsx
import { forwardRef } from 'react'

interface FormulaReadoutProps {
  amplitude: number
  frequency: number
  highlightAmplitude?: boolean
  highlightFrequency?: boolean
  className?: string
}

/**
 * Formula readout panel with corner bracket accents
 * Shows the formula being built: y = A sin(f t)
 */
export const FormulaReadout = forwardRef<HTMLDivElement, FormulaReadoutProps>(
  function FormulaReadout(
    {
      amplitude,
      frequency,
      highlightAmplitude = false,
      highlightFrequency = false,
      className = '',
    },
    ref
  ) {
    const amplitudeColor = highlightAmplitude
      ? 'var(--lab-accent)'
      : 'var(--lab-text)'
    const frequencyColor = highlightFrequency
      ? 'var(--lab-accent)'
      : 'var(--lab-text)'

    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{
          backgroundColor: 'var(--lab-surface)',
          borderRadius: '4px',
          padding: 'var(--space-4)',
        }}
        data-stage-overlay
      >
        {/* Corner brackets */}
        <div
          className="pointer-events-none absolute left-2 top-2 h-3 w-3"
          style={{
            borderLeft: '1px solid var(--lab-accent)',
            borderTop: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />
        <div
          className="pointer-events-none absolute right-2 top-2 h-3 w-3"
          style={{
            borderRight: '1px solid var(--lab-accent)',
            borderTop: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-2 left-2 h-3 w-3"
          style={{
            borderLeft: '1px solid var(--lab-accent)',
            borderBottom: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-2 right-2 h-3 w-3"
          style={{
            borderRight: '1px solid var(--lab-accent)',
            borderBottom: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />

        {/* Formula */}
        <div
          className="text-center text-lg sm:text-xl"
          style={{
            fontFamily: 'var(--font-data)',
            color: 'var(--lab-text)',
          }}
        >
          <span>y = </span>
          <span style={{ color: amplitudeColor, fontWeight: 500 }}>
            {amplitude.toFixed(1)}
          </span>
          <span> sin(</span>
          <span style={{ color: frequencyColor, fontWeight: 500 }}>
            {frequency.toFixed(1)}
          </span>
          <span> t)</span>
        </div>

        {/* Label */}
        <p
          className="mt-2 text-center text-xs uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--lab-text-muted)',
          }}
        >
          You're Building
        </p>
      </div>
    )
  }
)
```

**Step 2: Update components index**

```typescript
// src/components/modules/sinewaves/components/index.ts
export * from './StatusStrip'
export * from './PromptReadout'
export * from './FormulaReadout'
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/components/
git commit -m "feat(sinewaves): add FormulaReadout component"
```

---

### Task 9: Create ControlStrip Component

**Files:**
- Create: `src/components/modules/sinewaves/components/ControlStrip.tsx`
- Modify: `src/components/modules/sinewaves/components/index.ts`

**Step 1: Create the control strip component**

```tsx
// src/components/modules/sinewaves/components/ControlStrip.tsx
import { type ReactNode } from 'react'

interface ControlStripProps {
  children: ReactNode
  className?: string
}

/**
 * Control strip container for sliders, buttons, and feedback
 * Centers content with max-width constraint on desktop
 */
export function ControlStrip({ children, className = '' }: ControlStripProps) {
  return (
    <div
      className={`w-full max-w-md mx-auto ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      {children}
    </div>
  )
}
```

**Step 2: Update components index**

```typescript
// src/components/modules/sinewaves/components/index.ts
export * from './StatusStrip'
export * from './PromptReadout'
export * from './FormulaReadout'
export * from './ControlStrip'
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/components/
git commit -m "feat(sinewaves): add ControlStrip component"
```

---

### Task 10: Create ContinueButton Component

**Files:**
- Create: `src/components/modules/sinewaves/components/ContinueButton.tsx`
- Modify: `src/components/modules/sinewaves/components/index.ts`

**Step 1: Create the continue button component**

```tsx
// src/components/modules/sinewaves/components/ContinueButton.tsx
import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'

interface ContinueButtonProps {
  onClick: () => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * User-initiated progression button
 * Replaces countdown timers - user clicks when ready
 */
export const ContinueButton = forwardRef<HTMLButtonElement, ContinueButtonProps>(
  function ContinueButton(
    { onClick, disabled = false, children = 'Continue', className = '' },
    ref
  ) {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        className={`min-w-[120px] ${className}`}
        style={{
          fontFamily: 'var(--font-display)',
          borderColor: 'var(--lab-accent)',
          color: 'var(--lab-accent)',
          backgroundColor: 'transparent',
          transition: 'all var(--duration-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {children}
      </Button>
    )
  }
)
```

**Step 2: Update components index**

```typescript
// src/components/modules/sinewaves/components/index.ts
export * from './StatusStrip'
export * from './PromptReadout'
export * from './FormulaReadout'
export * from './ControlStrip'
export * from './ContinueButton'
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/components/
git commit -m "feat(sinewaves): add ContinueButton component"
```

---

## Phase 3: Module Integration

### Task 11: Create Module.tsx Shell

**Files:**
- Create: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Create minimal module shell**

This task creates the basic structure. Subsequent tasks will add stage logic.

```tsx
// src/components/modules/sinewaves/Module.tsx
import { useState, useCallback } from 'react'
import { SinewavesLayout } from './Layout'
import {
  StatusStrip,
  PromptReadout,
  FormulaReadout,
  ControlStrip,
  ContinueButton,
} from './components'
import { Scene } from './Scene'
import { SINEWAVE_COPY } from '@/config/sinewave-copy'

// Stage types
type ViewStage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'

interface SinewavesModuleProps {
  onComplete?: () => void
}

/**
 * Sinewaves learning module with Observatory HUD design
 * User-controlled pacing, staged reveals, mobile-first layout
 */
export function SinewavesModule({ onComplete }: SinewavesModuleProps) {
  // Core state
  const [stage, setStage] = useState<ViewStage>('observe')
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, setFrequency] = useState(1)

  // Stage-based content
  const getStageContent = useCallback(() => {
    switch (stage) {
      case 'observe':
        return {
          prompt: SINEWAVE_COPY.stages.observe.prompt,
          description: SINEWAVE_COPY.stages.observe.subtext,
          showFormula: false,
          showContinue: true,
        }
      case 'amplitude':
        return {
          prompt: SINEWAVE_COPY.stages.amplitude.prompt,
          description: SINEWAVE_COPY.stages.amplitude.subtext,
          showFormula: true,
          showContinue: false,
        }
      case 'frequency':
        return {
          prompt: SINEWAVE_COPY.stages.frequency.prompt,
          description: SINEWAVE_COPY.stages.frequency.subtext,
          showFormula: true,
          showContinue: false,
        }
      case 'challenge':
        return {
          prompt: SINEWAVE_COPY.stages.challenge.observe.prompt,
          description: SINEWAVE_COPY.stages.challenge.observe.subtext,
          showFormula: true,
          showContinue: false,
        }
      case 'reveal':
        return {
          prompt: SINEWAVE_COPY.stages.reveal.title,
          description: SINEWAVE_COPY.stages.reveal.description,
          showFormula: true,
          showContinue: false,
        }
    }
  }, [stage])

  const content = getStageContent()

  // Progress calculation (0-100)
  const stageProgress: Record<ViewStage, number> = {
    observe: 5,
    amplitude: 25,
    frequency: 50,
    challenge: 75,
    reveal: 100,
  }

  const stageNumber: Record<ViewStage, number> = {
    observe: 1,
    amplitude: 2,
    frequency: 3,
    challenge: 4,
    reveal: 4,
  }

  // Handlers
  const handleContinue = useCallback(() => {
    if (stage === 'observe') {
      setStage('amplitude')
    }
  }, [stage])

  return (
    <SinewavesLayout
      statusStrip={
        <StatusStrip
          currentStage={stageNumber[stage]}
          totalStages={4}
          progress={stageProgress[stage]}
        />
      }
      promptReadout={
        <PromptReadout
          title={content.prompt}
          description={content.description}
        />
      }
      formulaReadout={
        content.showFormula ? (
          <FormulaReadout
            amplitude={amplitude}
            frequency={frequency}
            highlightAmplitude={stage === 'amplitude'}
            highlightFrequency={stage === 'frequency'}
          />
        ) : undefined
      }
      visualization={
        <Scene
          amplitude={amplitude}
          frequency={frequency}
          showGhostWave={stage !== 'observe'}
          showConnector={stage === 'observe'}
        />
      }
      controlStrip={
        <ControlStrip>
          {content.showContinue && (
            <ContinueButton onClick={handleContinue} />
          )}
          {/* Slider and other controls will be added in subsequent tasks */}
        </ControlStrip>
      }
    />
  )
}

export default SinewavesModule
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds (may have warnings about unused imports - that's ok)

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): add Module shell with Observatory HUD layout"
```

---

### Task 12: Wire Up Amplitude Stage

**Files:**
- Modify: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Add amplitude slider and match detection**

Add imports at top:

```tsx
import { Slider } from '@/components/ui/slider'
```

Add state for amplitude target and match status:

```tsx
const [amplitudeTarget] = useState(1.5) // Fixed target
const [amplitudeMatched, setAmplitudeMatched] = useState(false)
```

Add match detection effect (add after state declarations):

```tsx
import { useEffect, useRef } from 'react'

// Match detection
const matchThreshold = 0.1
useEffect(() => {
  if (stage === 'amplitude' && !amplitudeMatched) {
    if (Math.abs(amplitude - amplitudeTarget) <= matchThreshold) {
      setAmplitudeMatched(true)
      // Trigger staged reveal (will be animated in later task)
      setTimeout(() => setStage('frequency'), 1500)
    }
  }
}, [stage, amplitude, amplitudeTarget, amplitudeMatched])
```

Update control strip in render (replace placeholder comment):

```tsx
controlStrip={
  <ControlStrip>
    {content.showContinue && (
      <ContinueButton onClick={handleContinue} />
    )}
    {stage === 'amplitude' && (
      <div className="w-full">
        <div
          className="mb-2 flex justify-between text-sm"
          style={{
            fontFamily: 'var(--font-data)',
            color: 'var(--lab-text-muted)',
          }}
        >
          <span>Amplitude</span>
          <span style={{ color: 'var(--lab-accent)' }}>
            {amplitude.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[amplitude]}
          onValueChange={([value]) => setAmplitude(value)}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>
    )}
  </ControlStrip>
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Test manually**

Run: `pnpm dev`
Navigate to sinewaves module, verify:
- Observe stage shows Continue button
- Clicking Continue shows amplitude stage with slider
- Moving slider updates formula display
- Matching 1.5 transitions to frequency stage

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): add amplitude stage with slider and match detection"
```

---

### Task 13: Wire Up Frequency Stage

**Files:**
- Modify: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Add frequency target and match detection**

Add state:

```tsx
const [frequencyTarget] = useState(2) // Fixed target
const [frequencyMatched, setFrequencyMatched] = useState(false)
```

Add match detection for frequency (after amplitude detection):

```tsx
useEffect(() => {
  if (stage === 'frequency' && !frequencyMatched) {
    if (Math.abs(frequency - frequencyTarget) <= 0.15) {
      setFrequencyMatched(true)
      setTimeout(() => setStage('challenge'), 1500)
    }
  }
}, [stage, frequency, frequencyTarget, frequencyMatched])
```

Update control strip to include frequency slider:

```tsx
{stage === 'frequency' && (
  <div className="w-full">
    <div
      className="mb-2 flex justify-between text-sm"
      style={{
        fontFamily: 'var(--font-data)',
        color: 'var(--lab-text-muted)',
      }}
    >
      <span>Frequency</span>
      <span style={{ color: 'var(--lab-accent)' }}>
        {frequency.toFixed(1)}
      </span>
    </div>
    <Slider
      value={[frequency]}
      onValueChange={([value]) => setFrequency(value)}
      min={0.5}
      max={3}
      step={0.1}
      className="w-full"
    />
  </div>
)}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): add frequency stage with match detection"
```

---

### Task 14: Wire Up Challenge Stage

**Files:**
- Modify: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Add challenge state and logic**

Add types and state:

```tsx
type ChallengePhase = 'observe' | 'diagnose' | 'match'
type ChallengeParam = 'amplitude' | 'frequency'

const [challengePhase, setChallengePhase] = useState<ChallengePhase>('observe')
const [challengeParam, setChallengeParam] = useState<ChallengeParam>('amplitude')
const [challengeTarget, setChallengeTarget] = useState({ amplitude: 1.5, frequency: 2 })
```

Add challenge initialization (when entering challenge stage):

```tsx
useEffect(() => {
  if (stage === 'challenge' && challengePhase === 'observe') {
    // Randomize which parameter changes
    const param = Math.random() > 0.5 ? 'amplitude' : 'frequency'
    setChallengeParam(param)

    // Generate target values
    const newTarget = {
      amplitude: param === 'amplitude' ? 1 + Math.random() : amplitude,
      frequency: param === 'frequency' ? 1 + Math.random() * 2 : frequency,
    }
    setChallengeTarget(newTarget)
  }
}, [stage])
```

Update getStageContent for challenge phases:

```tsx
case 'challenge':
  if (challengePhase === 'observe') {
    return {
      prompt: SINEWAVE_COPY.stages.challenge.observe.prompt,
      description: SINEWAVE_COPY.stages.challenge.observe.subtext,
      showFormula: true,
      showContinue: true,
    }
  } else if (challengePhase === 'diagnose') {
    return {
      prompt: SINEWAVE_COPY.stages.challenge.diagnose.question,
      description: undefined,
      showFormula: true,
      showContinue: false,
    }
  } else {
    return {
      prompt: SINEWAVE_COPY.stages.challenge.match.prompt,
      description: undefined,
      showFormula: true,
      showContinue: false,
    }
  }
```

Update handleContinue:

```tsx
const handleContinue = useCallback(() => {
  if (stage === 'observe') {
    setStage('amplitude')
  } else if (stage === 'challenge' && challengePhase === 'observe') {
    setChallengePhase('diagnose')
  }
}, [stage, challengePhase])
```

Add challenge controls to control strip:

```tsx
{stage === 'challenge' && challengePhase === 'diagnose' && (
  <div className="flex gap-2">
    {SINEWAVE_COPY.stages.challenge.diagnose.choices.map((choice) => (
      <Button
        key={choice.value}
        variant="outline"
        onClick={() => {
          if (choice.value === challengeParam || choice.value === 'both') {
            setChallengePhase('match')
          }
        }}
        style={{
          fontFamily: 'var(--font-display)',
          borderColor: 'var(--lab-border)',
          color: 'var(--lab-text)',
        }}
      >
        {choice.label}
      </Button>
    ))}
  </div>
)}

{stage === 'challenge' && challengePhase === 'match' && (
  <div className="w-full">
    <div
      className="mb-2 flex justify-between text-sm"
      style={{
        fontFamily: 'var(--font-data)',
        color: 'var(--lab-text-muted)',
      }}
    >
      <span>{challengeParam === 'amplitude' ? 'Amplitude' : 'Frequency'}</span>
      <span style={{ color: 'var(--lab-accent)' }}>
        {challengeParam === 'amplitude'
          ? amplitude.toFixed(1)
          : frequency.toFixed(1)}
      </span>
    </div>
    <Slider
      value={[challengeParam === 'amplitude' ? amplitude : frequency]}
      onValueChange={([value]) => {
        if (challengeParam === 'amplitude') {
          setAmplitude(value)
        } else {
          setFrequency(value)
        }
      }}
      min={challengeParam === 'amplitude' ? 0.5 : 0.5}
      max={challengeParam === 'amplitude' ? 2 : 3}
      step={0.1}
      className="w-full"
    />
  </div>
)}
```

Add challenge match detection:

```tsx
useEffect(() => {
  if (stage === 'challenge' && challengePhase === 'match') {
    const target = challengeParam === 'amplitude'
      ? challengeTarget.amplitude
      : challengeTarget.frequency
    const current = challengeParam === 'amplitude' ? amplitude : frequency
    const threshold = challengeParam === 'amplitude' ? 0.1 : 0.15

    if (Math.abs(current - target) <= threshold) {
      setTimeout(() => setStage('reveal'), 1500)
    }
  }
}, [stage, challengePhase, challengeParam, amplitude, frequency, challengeTarget])
```

**Step 2: Add Button import**

```tsx
import { Button } from '@/components/ui/button'
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): add challenge stage with diagnose and match phases"
```

---

### Task 15: Wire Up Reveal Stage

**Files:**
- Modify: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Add reveal stage controls**

Update control strip for reveal:

```tsx
{stage === 'reveal' && (
  <div className="flex gap-3">
    <Button
      variant="outline"
      onClick={() => {
        // Reset for another challenge
        setStage('challenge')
        setChallengePhase('observe')
        setAmplitude(1)
        setFrequency(1)
      }}
      style={{
        fontFamily: 'var(--font-display)',
        borderColor: 'var(--lab-border)',
        color: 'var(--lab-text)',
      }}
    >
      Try Another
    </Button>
    <Button
      onClick={() => onComplete?.()}
      style={{
        fontFamily: 'var(--font-display)',
        backgroundColor: 'var(--lab-accent)',
        color: 'var(--lab-bg)',
      }}
    >
      Finish
    </Button>
  </div>
)}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Manual test**

Run: `pnpm dev`
Walk through entire flow:
1. Observe → Continue
2. Amplitude → Match 1.5
3. Frequency → Match 2.0
4. Challenge → Observe → Diagnose → Match
5. Reveal → Try Another / Finish

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): add reveal stage with completion options"
```

---

## Phase 4: Animations

### Task 16: Add Staged Reveal to Match Success

**Files:**
- Modify: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Add refs for animated elements**

```tsx
import { useRef } from 'react'

const feedbackRef = useRef<HTMLDivElement>(null)
const buttonRef = useRef<HTMLButtonElement>(null)
```

**Step 2: Import animation presets**

```tsx
import { stagedReveal, pulseSuccess } from '@/lib/animation'
```

**Step 3: Create feedback banner component**

Add above the Module component:

```tsx
interface MatchFeedbackProps {
  message: string
  visible: boolean
}

const MatchFeedback = forwardRef<HTMLDivElement, MatchFeedbackProps>(
  function MatchFeedback({ message, visible }, ref) {
    if (!visible) return null

    return (
      <div
        ref={ref}
        className="rounded px-4 py-2 text-center text-sm"
        style={{
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          border: '1px solid var(--lab-accent)',
          color: 'var(--lab-accent)',
          fontFamily: 'var(--font-body)',
          opacity: 0, // Start hidden for animation
        }}
      >
        {message}
      </div>
    )
  }
)
```

**Step 4: Add match feedback state**

```tsx
const [showMatchFeedback, setShowMatchFeedback] = useState(false)
const [matchFeedbackMessage, setMatchFeedbackMessage] = useState('')
```

**Step 5: Replace setTimeout with staged reveal**

Update amplitude match detection:

```tsx
useEffect(() => {
  if (stage === 'amplitude' && !amplitudeMatched) {
    if (Math.abs(amplitude - amplitudeTarget) <= matchThreshold) {
      setAmplitudeMatched(true)
      setMatchFeedbackMessage(SINEWAVE_COPY.matchCelebration.amplitude)
      setShowMatchFeedback(true)

      // Staged reveal
      const elements = [feedbackRef.current].filter(Boolean)
      stagedReveal(elements as HTMLElement[], {
        onComplete: () => {
          setTimeout(() => {
            setShowMatchFeedback(false)
            setStage('frequency')
          }, 1000)
        },
      })
    }
  }
}, [stage, amplitude, amplitudeTarget, amplitudeMatched])
```

**Step 6: Add MatchFeedback to control strip**

```tsx
controlStrip={
  <ControlStrip>
    <MatchFeedback
      ref={feedbackRef}
      message={matchFeedbackMessage}
      visible={showMatchFeedback}
    />
    {/* ... rest of controls */}
  </ControlStrip>
}
```

**Step 7: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 8: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): add staged reveal animation for match success"
```

---

### Task 17: Add Stage Transition Animations

**Files:**
- Modify: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Import stageTransition preset**

```tsx
import { stagedReveal, pulseSuccess, stageTransition } from '@/lib/animation'
```

**Step 2: Add refs for readouts**

```tsx
const promptRef = useRef<HTMLDivElement>(null)
const formulaRef = useRef<HTMLDivElement>(null)
```

**Step 3: Pass refs to readout components**

Update render:

```tsx
promptReadout={
  <PromptReadout
    ref={promptRef}
    title={content.prompt}
    description={content.description}
  />
}
formulaReadout={
  content.showFormula ? (
    <FormulaReadout
      ref={formulaRef}
      amplitude={amplitude}
      frequency={frequency}
      highlightAmplitude={stage === 'amplitude'}
      highlightFrequency={stage === 'frequency'}
    />
  ) : undefined
}
```

**Step 4: Create animated stage transition function**

```tsx
const animateStageTransition = useCallback(
  (nextStage: ViewStage) => {
    const exitElements = [promptRef.current, formulaRef.current].filter(Boolean)
    const enterElements = [promptRef.current, formulaRef.current].filter(Boolean)

    stageTransition(exitElements as HTMLElement[], enterElements as HTMLElement[], {
      onComplete: () => {
        // Stage update happens in the middle of animation
      },
    })

    // Update state during transition
    setTimeout(() => setStage(nextStage), 200)
  },
  []
)
```

**Step 5: Use animated transition in handleContinue**

```tsx
const handleContinue = useCallback(() => {
  if (stage === 'observe') {
    animateStageTransition('amplitude')
  } else if (stage === 'challenge' && challengePhase === 'observe') {
    setChallengePhase('diagnose')
  }
}, [stage, challengePhase, animateStageTransition])
```

**Step 6: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): add animated stage transitions"
```

---

### Task 17B: Add Boot Phase to Scene Component

**Files:**
- Modify: `src/components/modules/sinewaves/Scene.tsx`

**Step 1: Add bootPhase prop to SceneProps**

```typescript
type BootPhase = 'hidden' | 'booting' | 'ready'

interface SceneProps {
  // ... existing props
  bootPhase?: BootPhase
  onBootComplete?: () => void
}
```

**Step 2: Pass bootPhase to Visualization and handle callback**

Update the Scene component to pass bootPhase down and call onBootComplete when visualization is ready:

```typescript
export function Scene({
  amplitude,
  frequency,
  phase,
  target,
  stage,
  isPaused,
  onPauseChange,
  stageTargets,
  isVisible = true,
  bootPhase = 'ready',
  onBootComplete,
}: SceneProps) {
  // ... existing code

  return (
    <Canvas ...>
      <Visualization
        // ... existing props
        bootPhase={bootPhase}
        onBootComplete={onBootComplete}
      />
    </Canvas>
  )
}
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/Scene.tsx
git commit -m "feat(sinewaves): add bootPhase prop to Scene"
```

---

### Task 17C: Add Circle Draw Animation to UnitCircle

**Files:**
- Modify: `src/components/modules/sinewaves/UnitCircle.tsx`

**Step 1: Add drawProgress state and boot handling**

```typescript
interface UnitCircleProps {
  // ... existing props
  bootPhase?: 'hidden' | 'booting' | 'ready'
  onDrawComplete?: () => void
}
```

**Step 2: Implement progressive circle draw**

Add state to track draw progress (0-1) and animate it during boot:

```typescript
const [drawProgress, setDrawProgress] = useState(bootPhase === 'ready' ? 1 : 0)

// Animate draw progress when booting
useEffect(() => {
  if (bootPhase === 'booting' && drawProgress === 0) {
    // Animate from 0 to 1 over 600ms
    const startTime = performance.now()
    const duration = 600

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDrawProgress(progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        onDrawComplete?.()
      }
    }

    requestAnimationFrame(animate)
  }
}, [bootPhase, drawProgress, onDrawComplete])
```

**Step 3: Update circle rendering to use drawProgress**

Modify the circle line to only render up to `drawProgress`:

```typescript
// Generate partial circle points based on draw progress
const circlePoints = useMemo(() => {
  const segments = Math.floor(64 * drawProgress)
  return generateScaledCirclePoints(amplitude, segments)
}, [amplitude, drawProgress])
```

**Step 4: Don't start rotation until draw is complete**

```typescript
useFrame((state) => {
  // Don't animate if still drawing
  if (drawProgress < 1) return

  // ... existing rotation logic
})
```

**Step 5: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/modules/sinewaves/UnitCircle.tsx
git commit -m "feat(sinewaves): add circle draw animation for boot sequence"
```

---

### Task 17D: Integrate Console Boot in Module

**Files:**
- Modify: `src/components/modules/sinewaves/Module.tsx`

**Step 1: Add boot phase state**

```typescript
type BootPhase = 'hidden' | 'booting' | 'ready'
const [bootPhase, setBootPhase] = useState<BootPhase>('hidden')
```

**Step 2: Add refs for boot sequence elements**

```typescript
const statusStripRef = useRef<HTMLDivElement>(null)
const progressBarRef = useRef<HTMLDivElement>(null)
```

**Step 3: Import and use consoleBootSequence**

```typescript
import { consoleBootSequence } from './animations'

// Trigger boot on mount
useEffect(() => {
  const refs = {
    statusStrip: statusStripRef.current,
    progressBar: progressBarRef.current,
    prompt: promptRef.current,
  }

  consoleBootSequence(refs, () => {
    setBootPhase('booting')
  })
}, [])
```

**Step 4: Handle Scene boot completion**

```typescript
const handleSceneBootComplete = useCallback(() => {
  setBootPhase('ready')
}, [])

// In render:
<Scene
  // ... existing props
  bootPhase={bootPhase}
  onBootComplete={handleSceneBootComplete}
/>
```

**Step 5: Only show Continue button when boot is complete**

```typescript
{content.showContinue && bootPhase === 'ready' && (
  <ContinueButton onClick={handleContinue} />
)}
```

**Step 6: Verify build and test**

Run: `pnpm build`
Run: `pnpm dev`
Expected: Module loads with "console coming alive" sequence

**Step 7: Commit**

```bash
git add src/components/modules/sinewaves/Module.tsx
git commit -m "feat(sinewaves): integrate console boot sequence"
```

---

## Phase 5: Polish

### Task 18: Responsive Testing & Fixes

**Files:**
- May modify: `src/components/modules/sinewaves/Layout.tsx`
- May modify: `src/components/modules/sinewaves/components/*.tsx`

**Step 1: Test at mobile breakpoint (375px)**

Run: `pnpm dev`
Open DevTools, set viewport to 375px width
Verify:
- All regions visible without horizontal scroll
- Text readable (min 16px body)
- Touch targets at least 44x44px
- Slider usable with touch

**Step 2: Test at tablet breakpoint (768px)**

Set viewport to 768px width
Verify:
- Formula + controls layout appropriately
- Good use of horizontal space
- No wasted whitespace

**Step 3: Test at desktop breakpoint (1280px)**

Set viewport to 1280px width
Verify:
- Readouts side by side
- Visualization has proper aspect ratio
- Controls centered with max-width

**Step 4: Fix any issues found**

Document fixes in commit message

**Step 5: Commit**

```bash
git add .
git commit -m "fix(sinewaves): responsive layout adjustments"
```

---

### Task 19: Accessibility Verification

**Files:**
- May modify: Multiple files

**Step 1: Keyboard navigation test**

- Tab through all interactive elements
- Verify focus rings visible
- Verify logical tab order

**Step 2: Screen reader test**

- Verify all buttons have accessible names
- Verify slider has label
- Verify stage changes are announced

**Step 3: Reduced motion test**

Enable "Reduce motion" in OS settings
Verify animations respect `prefers-reduced-motion`

**Step 4: Fix any issues**

**Step 5: Commit**

```bash
git add .
git commit -m "fix(sinewaves): accessibility improvements"
```

---

### Task 20: Final Integration Test

**Step 1: Full flow test**

Run: `pnpm dev`
Complete entire module flow:
1. Land on observe stage
2. Click Continue (user-initiated)
3. Adjust amplitude to match 1.5
4. See staged reveal feedback
5. Transition to frequency
6. Adjust frequency to match 2.0
7. See staged reveal feedback
8. Transition to challenge
9. Observe the changed wave
10. Click Continue
11. Diagnose which parameter changed
12. Match the target
13. Transition to reveal
14. Click Finish

**Step 2: Verify animations**

- Stage transitions smooth
- Match feedback appears with stagger
- No janky or interrupted animations

**Step 3: Verify mobile experience**

Test same flow on mobile viewport

**Step 4: Build verification**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 5: Final commit**

```bash
git add .
git commit -m "feat(sinewaves): complete Observatory HUD redesign implementation"
```

---

## Summary

This plan implements the Observatory HUD redesign in 26 tasks across 6 phases:

0. **Snapshot** (Task 0): Capture before screenshots at all stages and viewport sizes
1. **Foundation** (Tasks 1-4 + 2B): Animation tokens, generic presets, sinewaves orchestration, fonts, spacing
2. **Layout Components** (Tasks 5-10): Grid layout, status strip, readouts, controls
3. **Module Integration** (Tasks 11-15): Wire up all stages with new components
4. **Animations** (Tasks 16-17 + 17B-17D): Staged reveals, transitions, console boot sequence
5. **Polish** (Tasks 18-20): Responsive fixes, accessibility, final testing

### Architecture Summary

- **Component mapping:** Replace 4 components, reposition 3, keep 5 unchanged
- **Animation separation:** Generic presets in `src/lib/animation/`, sinewaves orchestration in module folder
- **Boot coordination:** Prop-in (`bootPhase`) / callback-out (`onBootComplete`) pattern for HTML/R3F sync

Each task is small, testable, and committed independently for easy rollback if needed.
