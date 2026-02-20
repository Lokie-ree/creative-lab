# Sinewaves Instrument Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Status:** Complete

**Goal:** Transform the sinewaves module from a staged tutorial into an always-visible scientific instrument with simplified state management.

**Architecture:** Replace the complex stage machine with 5 simple guide states. All UI elements (sliders, formula, prompt) are always visible—only prompts and highlights change per state. Mobile shows wave-only visualization; desktop shows full circle-wave instrument.

**Tech Stack:** React 19, TypeScript, React Three Fiber, GSAP, Tailwind CSS 4, shadcn/ui

---

## Reference: Design Decisions

These decisions were made during planning. Refer back if implementation questions arise.

| # | Topic | Decision |
|---|-------|----------|
| 1 | Auto-advance in `watch` | Immediate skip on slider drag |
| 2 | Connector visibility | Landscape only, in `watch` and `free` states |
| 3 | SPEED control | 3-state toggle (0.5x→1x→2x), resets to 1x on state advance |
| 4 | RESET button | Full reset always (sliders to 1.0, restart animation) |
| 5 | Grid lines | Wave area only |
| 6 | Mobile unit circle | No circle on mobile — wave-only experience |
| 7 | SYS:NOM | Static decorative chrome |
| 8 | Match glow timing | 800ms before auto-advance |
| 9 | "Try Another" flow | Returns to `challenge` state with new random target |
| 10 | Boot sequence | Keep current, refine later if needed |
| 11 | ESC button | Same action as back chevron |
| 12 | Small mobile (<375px) | Basic responsive scaling, no special breakpoint |
| 13 | Dot navigation | Enabled — users can revisit completed states |
| 14 | Formula display | No theta line, just `y = A · sin(f·t)` |
| 15 | HUD strip layout | Desktop: `[←] SINEWAVES ●●●○○ SYS:NOM [ESC]` / Mobile: `[←] ●●●○○ SYS:NOM` |
| 16 | Ghost wave transitions | Instant appear/disappear |
| 17 | Z-index | Watch for overlay issues with HUD strip elements |

---

## Task 1: Create Guide State Types and Constants

**Files:**
- Create: `src/components/modules/sinewaves/guide-state.ts`

This task establishes the new simplified state model that replaces the complex stage machine.

**Step 1: Create the guide state type file**

```typescript
// src/components/modules/sinewaves/guide-state.ts

/**
 * Guide states for the instrument.
 * The instrument is always fully visible and interactive.
 * Guide states only change: prompts, formula highlights, ghost wave visibility.
 */
export type GuideState = 'watch' | 'match-amplitude' | 'match-frequency' | 'challenge' | 'free'

/**
 * Map guide states to dot navigation indices (0-indexed)
 */
export const GUIDE_STATE_TO_INDEX: Record<GuideState, number> = {
  'watch': 0,
  'match-amplitude': 1,
  'match-frequency': 2,
  'challenge': 3,
  'free': 4,
}

export const INDEX_TO_GUIDE_STATE: GuideState[] = [
  'watch',
  'match-amplitude',
  'match-frequency',
  'challenge',
  'free',
]

export const TOTAL_GUIDE_STATES = 5

/**
 * Guide state configuration
 */
export interface GuideStateConfig {
  prompt: string
  showGhost: boolean
  showConnector: boolean // Only applies in landscape
  highlightAmplitude: boolean
  highlightFrequency: boolean
}

/**
 * Prompt copy for each guide state
 */
export const GUIDE_STATE_PROMPTS: Record<GuideState, string> = {
  'watch': 'Watch how the circle drives the wave',
  'match-amplitude': 'Match the ghost wave — try the amplitude slider',
  'match-frequency': 'Now match this one — try frequency',
  'challenge': 'Something changed. Can you match it?',
  'free': 'Every sine wave is circular motion in disguise.',
}

/**
 * Get configuration for a guide state
 */
export function getGuideStateConfig(
  state: GuideState,
  challengeParam?: 'amplitude' | 'frequency'
): GuideStateConfig {
  switch (state) {
    case 'watch':
      return {
        prompt: GUIDE_STATE_PROMPTS.watch,
        showGhost: false,
        showConnector: true,
        highlightAmplitude: false,
        highlightFrequency: false,
      }
    case 'match-amplitude':
      return {
        prompt: GUIDE_STATE_PROMPTS['match-amplitude'],
        showGhost: true,
        showConnector: false,
        highlightAmplitude: true,
        highlightFrequency: false,
      }
    case 'match-frequency':
      return {
        prompt: GUIDE_STATE_PROMPTS['match-frequency'],
        showGhost: true,
        showConnector: false,
        highlightAmplitude: false,
        highlightFrequency: true,
      }
    case 'challenge':
      return {
        prompt: GUIDE_STATE_PROMPTS.challenge,
        showGhost: true,
        showConnector: false,
        highlightAmplitude: challengeParam === 'amplitude',
        highlightFrequency: challengeParam === 'frequency',
      }
    case 'free':
      return {
        prompt: GUIDE_STATE_PROMPTS.free,
        showGhost: false,
        showConnector: true,
        highlightAmplitude: true,
        highlightFrequency: true,
      }
  }
}

/**
 * Speed multiplier options for the instrument
 */
export const SPEED_OPTIONS = [0.5, 1, 2] as const
export type SpeedMultiplier = typeof SPEED_OPTIONS[number]

/**
 * Get next speed in the cycle
 */
export function cycleSpeed(current: SpeedMultiplier): SpeedMultiplier {
  const index = SPEED_OPTIONS.indexOf(current)
  const nextIndex = (index + 1) % SPEED_OPTIONS.length
  return SPEED_OPTIONS[nextIndex]
}
```

**Step 2: Verify file created correctly**

Run: `pnpm exec tsc --noEmit src/components/modules/sinewaves/guide-state.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/guide-state.ts
git commit -m "feat(sinewaves): add guide state types and constants

Introduces simplified 5-state guide model replacing complex stage machine.
States: watch, match-amplitude, match-frequency, challenge, free

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Update Layout for Always-Visible Elements

**Files:**
- Modify: `src/components/modules/sinewaves/Layout.tsx`

The new layout shows all elements at every breakpoint. Mobile stacks vertically; desktop arranges horizontally.

**Step 1: Replace Layout.tsx with new responsive grid**

```typescript
// src/components/modules/sinewaves/Layout.tsx
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InstrumentLayoutProps {
  statusStrip: ReactNode
  promptReadout: ReactNode
  formulaReadout: ReactNode
  visualization: ReactNode
  controlStrip: ReactNode
  children?: ReactNode // For overlays (celebrations, etc.)
}

/**
 * Instrument layout for sinewaves module
 *
 * All elements always visible at every breakpoint.
 * Mobile (<768px): Vertical stack — status | prompt | formula | viz | sliders | buttons
 * Desktop (≥768px): 4-row grid — status strip | readouts side-by-side | viz | controls
 */
export function InstrumentLayout({
  statusStrip,
  promptReadout,
  formulaReadout,
  visualization,
  controlStrip,
  children,
}: InstrumentLayoutProps) {
  return (
    <div
      className={cn(
        'relative grid min-h-screen w-screen overflow-hidden',
        'bg-(--lab-bg) font-[family-name:var(--font-body)]',
        // Mobile: 6-row layout (all elements visible)
        'grid-rows-[auto_auto_auto_1fr_auto_auto] gap-2 p-2',
        // Desktop: 4-row layout with side-by-side readouts
        'md:grid-rows-[3rem_auto_1fr_auto] md:gap-4 md:p-4'
      )}
    >
      {/* ROW 1: STATUS STRIP */}
      <header className="flex items-center">
        {statusStrip}
      </header>

      {/* ROW 2: PROMPT READOUT (mobile: own row, desktop: combined with formula) */}
      <div className="md:hidden">
        {promptReadout}
      </div>

      {/* ROW 3: FORMULA READOUT (mobile: own row, desktop: combined with prompt) */}
      <div className="md:hidden">
        {formulaReadout}
      </div>

      {/* DESKTOP ONLY: Combined readouts row */}
      <div className="hidden md:flex md:flex-row md:gap-6">
        <div className="flex-1">{promptReadout}</div>
        <div className="w-[280px] shrink-0">{formulaReadout}</div>
      </div>

      {/* ROW 4: PRIMARY VISUALIZATION */}
      <main className="relative min-h-0 flex-1">
        {visualization}
      </main>

      {/* ROW 5-6: CONTROL STRIP (sliders + buttons) */}
      <footer className="flex flex-col items-center gap-3 pb-4 md:pb-0">
        {controlStrip}
      </footer>

      {/* OVERLAYS (celebrations, transitions) */}
      {children}
    </div>
  )
}

// Keep old export for backwards compatibility during migration
export { InstrumentLayout as ObservatoryLayout }
```

**Step 2: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: No errors (or only unrelated errors)

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/Layout.tsx
git commit -m "feat(sinewaves): update layout for always-visible elements

- All elements now visible at every breakpoint
- Mobile: 6-row vertical stack
- Desktop: 4-row with side-by-side readouts
- Renamed to InstrumentLayout (ObservatoryLayout kept for compat)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update StatusStrip with HUD Chrome

**Files:**
- Modify: `src/components/modules/sinewaves/components/StatusStrip.tsx`

Add SINEWAVES title, SYS:NOM status, ESC button. Different layouts for mobile vs desktop.

**Step 1: Update StatusStrip component**

```typescript
// src/components/modules/sinewaves/components/StatusStrip.tsx
import { forwardRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusStripProps {
  currentStage: number
  totalStages: number
  onBack?: () => void
  onStageSelect?: (index: number) => void
  className?: string
}

const STAGE_LABELS = ['Watch', 'Amplitude', 'Frequency', 'Challenge', 'Free']

/**
 * HUD status strip with navigation and chrome
 *
 * Desktop: [←] SINEWAVES  ●●●○○  SYS:NOM  [ESC]
 * Mobile:  [←] ●●●○○ SYS:NOM
 */
export const StatusStrip = forwardRef<HTMLDivElement, StatusStripProps>(
  function StatusStrip(
    {
      currentStage,
      totalStages,
      onBack,
      onStageSelect,
      className = '',
    },
    ref
  ) {
    const canNavigateToStage = (index: number) => {
      if (!onStageSelect) return false
      const oneBased = index + 1
      return oneBased <= currentStage
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full items-center gap-3 md:gap-4',
          className
        )}
      >
        {/* Back chevron — always visible when onBack provided */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center justify-center rounded p-1 transition-colors hover:bg-(--lab-surface) focus:outline-none focus:ring-2 focus:ring-(--lab-accent)"
            aria-label="Back to course"
          >
            <ChevronLeft className="h-5 w-5 text-(--lab-text-muted) md:h-6 md:w-6" />
          </button>
        )}

        {/* SINEWAVES title — desktop only */}
        <span
          className="hidden shrink-0 text-sm font-medium uppercase tracking-wider text-(--lab-text) md:block font-[family-name:var(--font-display)]"
        >
          Sinewaves
        </span>

        {/* Progress dots — centered, with navigation */}
        <nav
          className="flex flex-1 items-center justify-center"
          aria-label={`Module progress: stage ${currentStage} of ${totalStages}`}
        >
          <ol className="flex items-center gap-3" role="list">
            {Array.from({ length: totalStages }, (_, i) => {
              const oneBased = i + 1
              const isCompleted = oneBased < currentStage
              const isCurrent = oneBased === currentStage
              const clickable = canNavigateToStage(i)
              const stageLabel = STAGE_LABELS[i] ?? 'Stage'
              const stageStatus = isCompleted
                ? 'completed'
                : isCurrent
                  ? 'current'
                  : 'upcoming'
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && onStageSelect?.(i)}
                    className={cn(
                      'relative h-2 w-2 rounded-full transition-colors',
                      "before:absolute before:-inset-4 before:content-['']",
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--lab-bg)',
                      clickable ? 'cursor-pointer' : 'cursor-default',
                      isCompleted && 'bg-(--lab-accent)',
                      isCurrent && 'bg-(--lab-accent) ring-2 ring-(--lab-accent) ring-offset-2 ring-offset-(--lab-bg)',
                      !isCompleted && !isCurrent && 'bg-(--lab-border) opacity-60'
                    )}
                    aria-label={`${stageLabel}, ${stageStatus}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  />
                </li>
              )
            })}
          </ol>
        </nav>

        {/* SYS:NOM status — decorative chrome */}
        <span
          className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-(--lab-text-muted) md:text-xs font-[family-name:var(--font-data)]"
        >
          SYS:NOM
        </span>

        {/* ESC button — desktop only */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="hidden shrink-0 rounded border border-(--lab-border) px-2 py-1 text-xs font-medium uppercase tracking-wider text-(--lab-text-muted) transition-colors hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus:ring-2 focus:ring-(--lab-accent) md:block font-[family-name:var(--font-data)]"
            aria-label="Exit module"
          >
            ESC
          </button>
        )}
      </div>
    )
  }
)
```

**Step 2: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/components/StatusStrip.tsx
git commit -m "feat(sinewaves): update StatusStrip with HUD chrome

- Desktop: [←] SINEWAVES ●●●○○ SYS:NOM [ESC]
- Mobile: [←] ●●●○○ SYS:NOM
- Removed unused statusText and title props
- Simplified stage labels

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Instrument Controls Component

**Files:**
- Create: `src/components/modules/sinewaves/components/InstrumentControls.tsx`

New component for TRACE/RESET/SPEED buttons.

**Step 1: Create the InstrumentControls component**

```typescript
// src/components/modules/sinewaves/components/InstrumentControls.tsx
import { cn } from '@/lib/utils'
import { Play, Pause, RotateCcw } from 'lucide-react'
import type { SpeedMultiplier } from '../guide-state'

interface InstrumentControlsProps {
  isPaused: boolean
  speed: SpeedMultiplier
  onTogglePause: () => void
  onReset: () => void
  onCycleSpeed: () => void
  className?: string
}

/**
 * Instrument control buttons: TRACE (play/pause), RESET, SPEED
 * Always visible, independent of guide state
 */
export function InstrumentControls({
  isPaused,
  speed,
  onTogglePause,
  onReset,
  onCycleSpeed,
  className,
}: InstrumentControlsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {/* TRACE (play/pause) */}
      <button
        type="button"
        onClick={onTogglePause}
        className={cn(
          'flex items-center gap-1.5 rounded border px-3 py-1.5',
          'text-xs font-medium uppercase tracking-wider',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-(--lab-accent)',
          'font-[family-name:var(--font-data)]',
          isPaused
            ? 'border-(--lab-accent) text-(--lab-accent)'
            : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)'
        )}
        aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
      >
        {isPaused ? (
          <Play className="h-3 w-3" />
        ) : (
          <Pause className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">{isPaused ? 'Play' : 'Pause'}</span>
      </button>

      {/* RESET */}
      <button
        type="button"
        onClick={onReset}
        className={cn(
          'flex items-center gap-1.5 rounded border border-(--lab-border) px-3 py-1.5',
          'text-xs font-medium uppercase tracking-wider text-(--lab-text-muted)',
          'transition-colors hover:border-(--lab-accent) hover:text-(--lab-accent)',
          'focus:outline-none focus:ring-2 focus:ring-(--lab-accent)',
          'font-[family-name:var(--font-data)]'
        )}
        aria-label="Reset wave and sliders"
      >
        <RotateCcw className="h-3 w-3" />
        <span className="hidden sm:inline">Reset</span>
      </button>

      {/* SPEED (cycling toggle) */}
      <button
        type="button"
        onClick={onCycleSpeed}
        className={cn(
          'flex items-center gap-1.5 rounded border border-(--lab-border) px-3 py-1.5',
          'text-xs font-medium uppercase tracking-wider text-(--lab-text-muted)',
          'transition-colors hover:border-(--lab-accent) hover:text-(--lab-accent)',
          'focus:outline-none focus:ring-2 focus:ring-(--lab-accent)',
          'font-[family-name:var(--font-data)]',
          'min-w-[4rem]'
        )}
        aria-label={`Speed: ${speed}x. Click to change.`}
      >
        {speed}x
      </button>
    </div>
  )
}
```

**Step 2: Export from index**

Add to `src/components/modules/sinewaves/components/index.ts`:

```typescript
export * from './InstrumentControls'
```

**Step 3: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/components/InstrumentControls.tsx src/components/modules/sinewaves/components/index.ts
git commit -m "feat(sinewaves): add InstrumentControls component

TRACE/RESET/SPEED buttons for instrument control panel.
- TRACE: play/pause toggle
- RESET: resets sliders to 1.0 and restarts animation
- SPEED: cycles through 0.5x, 1x, 2x

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update ControlStrip for Always-Visible Sliders

**Files:**
- Modify: `src/components/modules/sinewaves/components/ControlStrip.tsx`

Simplify to always show both sliders. Remove conditional rendering logic.

**Step 1: Update ControlStrip component**

```typescript
// src/components/modules/sinewaves/components/ControlStrip.tsx
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ControlStripProps {
  amplitudeSlider: ReactNode
  frequencySlider: ReactNode
  instrumentControls: ReactNode
  actionButtons?: ReactNode // Continue, Try Another, Complete
  className?: string
}

/**
 * Control strip with always-visible sliders and instrument controls
 *
 * Layout:
 * - Mobile: sliders stacked, then buttons row
 * - Desktop: sliders side-by-side, then buttons row
 */
export const ControlStrip = forwardRef<HTMLDivElement, ControlStripProps>(
  function ControlStrip(
    { amplitudeSlider, frequencySlider, instrumentControls, actionButtons, className = '' },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto flex w-full max-w-2xl flex-col items-center gap-4',
          className
        )}
      >
        {/* Sliders row */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-6">
          <div className="flex-1">{amplitudeSlider}</div>
          <div className="flex-1">{frequencySlider}</div>
        </div>

        {/* Instrument controls row */}
        {instrumentControls}

        {/* Action buttons (Continue, Try Another, Complete) */}
        {actionButtons && (
          <div className="flex items-center gap-3">
            {actionButtons}
          </div>
        )}
      </div>
    )
  }
)
```

**Step 2: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: No errors (ObservatoryModule will have errors until we update it)

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/components/ControlStrip.tsx
git commit -m "refactor(sinewaves): simplify ControlStrip for always-visible sliders

- Both sliders always visible
- Removed hint, formula props (now in readout row)
- Added instrumentControls and actionButtons slots
- Responsive: stacked on mobile, side-by-side on desktop

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Add Grid Lines to Scene

**Files:**
- Create: `src/components/modules/sinewaves/GridLines.tsx`
- Modify: `src/components/modules/sinewaves/Scene.tsx`

Add subtle coordinate grid behind the wave visualization.

**Step 1: Create GridLines component**

```typescript
// src/components/modules/sinewaves/GridLines.tsx
import { useMemo } from 'react'
import * as THREE from 'three'

interface GridLinesProps {
  width?: number
  height?: number
  majorSpacing?: number
  minorSpacing?: number
  majorOpacity?: number
  minorOpacity?: number
  axisOpacity?: number
}

/**
 * Subtle coordinate grid for the wave visualization area
 * Major lines every 1 unit, minor lines every 0.5 unit
 */
export function GridLines({
  width = 5,
  height = 3,
  majorSpacing = 1,
  minorSpacing = 0.5,
  majorOpacity = 0.15,
  minorOpacity = 0.08,
  axisOpacity = 0.25,
}: GridLinesProps) {
  const { minorLines, majorLines, axes } = useMemo(() => {
    const minorPoints: THREE.Vector3[] = []
    const majorPoints: THREE.Vector3[] = []
    const axisPoints: THREE.Vector3[] = []

    const halfWidth = width / 2
    const halfHeight = height / 2

    // Vertical lines
    for (let x = -halfWidth; x <= halfWidth + width; x += minorSpacing) {
      const isMajor = Math.abs(x % majorSpacing) < 0.01
      const isAxis = Math.abs(x) < 0.01
      const points = isAxis ? axisPoints : isMajor ? majorPoints : minorPoints
      points.push(new THREE.Vector3(x, -halfHeight, -0.1))
      points.push(new THREE.Vector3(x, halfHeight, -0.1))
    }

    // Horizontal lines
    for (let y = -halfHeight; y <= halfHeight; y += minorSpacing) {
      const isMajor = Math.abs(y % majorSpacing) < 0.01
      const isAxis = Math.abs(y) < 0.01
      const points = isAxis ? axisPoints : isMajor ? majorPoints : minorPoints
      points.push(new THREE.Vector3(-halfWidth, y, -0.1))
      points.push(new THREE.Vector3(halfWidth + width, y, -0.1))
    }

    return {
      minorLines: new THREE.BufferGeometry().setFromPoints(minorPoints),
      majorLines: new THREE.BufferGeometry().setFromPoints(majorPoints),
      axes: new THREE.BufferGeometry().setFromPoints(axisPoints),
    }
  }, [width, height, majorSpacing, minorSpacing])

  return (
    <group>
      {/* Minor grid lines */}
      <lineSegments geometry={minorLines}>
        <lineBasicMaterial
          color="var(--lab-border)"
          transparent
          opacity={minorOpacity}
        />
      </lineSegments>

      {/* Major grid lines */}
      <lineSegments geometry={majorLines}>
        <lineBasicMaterial
          color="var(--lab-border)"
          transparent
          opacity={majorOpacity}
        />
      </lineSegments>

      {/* Axes */}
      <lineSegments geometry={axes}>
        <lineBasicMaterial
          color="var(--lab-border)"
          transparent
          opacity={axisOpacity}
        />
      </lineSegments>
    </group>
  )
}
```

**Step 2: Update Scene.tsx to include GridLines**

Modify `src/components/modules/sinewaves/Scene.tsx`. Add import and render GridLines behind the wave:

```typescript
// At top of file, add import:
import { GridLines } from './GridLines'

// In Visualization component, add GridLines before the sine waves group:
// (around line 80, before the {/* Sine waves */} comment)

      {/* Grid lines behind wave area */}
      <group position={[wave.x, wave.y, 0]}>
        <GridLines width={4.5} height={2.5} />
      </group>

      {/* Sine waves */}
      <group position={[wave.x, wave.y, 0]} scale={isPortrait ? scale : 1}>
```

**Step 3: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 4: Test visually**

Run: `pnpm dev`
Navigate to sinewaves module and verify grid appears behind wave.

**Step 5: Commit**

```bash
git add src/components/modules/sinewaves/GridLines.tsx src/components/modules/sinewaves/Scene.tsx
git commit -m "feat(sinewaves): add grid lines behind wave visualization

Subtle coordinate grid reinforces scientific instrument aesthetic.
- Major lines every 1 unit (0.15 opacity)
- Minor lines every 0.5 unit (0.08 opacity)
- Axes slightly brighter (0.25 opacity)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update Scene for Mobile/Desktop Differentiation

**Files:**
- Modify: `src/components/modules/sinewaves/Scene.tsx`
- Modify: `src/components/modules/sinewaves/scene-layout.ts`

Mobile hides the unit circle. Desktop shows full circle-wave instrument.

**Step 1: Update scene-layout.ts to expose isMobile**

Add a hook or export that components can use to determine mobile vs desktop:

```typescript
// Add to scene-layout.ts, after the existing useSceneLayout hook:

/**
 * Hook to detect if we're in mobile viewport (portrait or narrow)
 * Used to conditionally hide unit circle on mobile
 */
export function useIsMobileViewport(): boolean {
  const { viewport } = useThree()
  // Consider mobile if portrait OR width is narrow
  return viewport.width <= viewport.height || viewport.width < 6
}
```

**Step 2: Update Scene.tsx to hide circle on mobile**

```typescript
// In Scene.tsx, update the Visualization component:

// Add import for useIsMobileViewport:
import { useSceneLayout, useIsMobileViewport, SCENE_LAYOUT } from "./scene-layout"

// In Visualization function, add:
const isMobile = useIsMobileViewport()

// Wrap the unit circle group with mobile check:
      {/* Unit circle — hidden on mobile */}
      {!isMobile && (
        <group position={[circle.x, circle.y, 0]} scale={scale}>
          <UnitCircle
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            isPaused={isPaused}
            onPauseChange={onPauseChange}
          />
          {/* Target point on circle (ghost) */}
          {showGhost && (
            <UnitCircle
              amplitude={ghostParams.a}
              frequency={ghostParams.f}
              phase={ghostParams.p}
              color={colors.ghost}
              opacity={SCENE_LAYOUT.ghostOpacity}
            />
          )}
        </group>
      )}

      {/* Connector line — only in landscape during watch/free states, and only on desktop */}
      {!isMobile && connector && (
        <Connector
          // ... existing props
        />
      )}
```

**Step 3: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 4: Test visually**

Run: `pnpm dev`
- Desktop: should see unit circle + connector + wave
- Mobile (resize browser): should see wave only

**Step 5: Commit**

```bash
git add src/components/modules/sinewaves/Scene.tsx src/components/modules/sinewaves/scene-layout.ts
git commit -m "feat(sinewaves): hide unit circle on mobile

Mobile shows wave-only focused experience.
Desktop shows full circle-wave instrument with connector.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create InstrumentModule (Main Orchestrator)

**Files:**
- Create: `src/components/modules/sinewaves/InstrumentModule.tsx`

The new simplified module that replaces ObservatoryModule.

**Step 1: Create InstrumentModule**

```typescript
// src/components/modules/sinewaves/InstrumentModule.tsx
/**
 * Sinewaves Instrument Module
 *
 * Scientific instrument approach: everything always visible and interactive.
 * Guide states only change prompts and highlights, not the instrument itself.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { InstrumentLayout } from './Layout'
import {
  StatusStrip,
  PromptReadout,
  FormulaReadout,
  ControlStrip,
  ParameterSlider,
  ContinueButton,
  InstrumentControls,
} from './components'
import { Scene } from './Scene'
import {
  type GuideState,
  type SpeedMultiplier,
  GUIDE_STATE_TO_INDEX,
  INDEX_TO_GUIDE_STATE,
  TOTAL_GUIDE_STATES,
  getGuideStateConfig,
  cycleSpeed,
} from './guide-state'
import { consoleBootSequence } from './animations'
import { STAGE_TARGETS, MATCH_THRESHOLDS } from './sinewaves-constants'
import { generateChallengeTarget, type ChallengeParam } from './challenge-utils'

interface InstrumentModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  onBack?: () => void
}

export function InstrumentModule({ onComplete, onBack }: InstrumentModuleProps) {
  // ─────────────────────────────────────────────────────────────
  // Boot sequence
  // ─────────────────────────────────────────────────────────────
  const statusStripRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    consoleBootSequence(
      {
        statusStrip: statusStripRef.current,
        progressBar: null,
        prompt: promptRef.current,
      },
      () => setBooted(true)
    )
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Guide state
  // ─────────────────────────────────────────────────────────────
  const [guideState, setGuideState] = useState<GuideState>('watch')

  // ─────────────────────────────────────────────────────────────
  // Wave parameters
  // ─────────────────────────────────────────────────────────────
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, setFrequency] = useState(1)

  // ─────────────────────────────────────────────────────────────
  // Instrument controls
  // ─────────────────────────────────────────────────────────────
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState<SpeedMultiplier>(1)
  const clockRef = useRef(0) // For reset functionality

  // ─────────────────────────────────────────────────────────────
  // Challenge state
  // ─────────────────────────────────────────────────────────────
  const [challengeParam, setChallengeParam] = useState<ChallengeParam>('amplitude')
  const [challengeTargetValue, setChallengeTargetValue] = useState(1.5)

  // ─────────────────────────────────────────────────────────────
  // Match state
  // ─────────────────────────────────────────────────────────────
  const [matchGlow, setMatchGlow] = useState(false)

  // Get config for current guide state
  const config = getGuideStateConfig(guideState, challengeParam)

  // ─────────────────────────────────────────────────────────────
  // Match detection
  // ─────────────────────────────────────────────────────────────
  const checkMatch = useCallback((param: 'amplitude' | 'frequency', value: number) => {
    if (matchGlow) return // Already matched, waiting for transition

    let target: number
    let threshold: number

    if (guideState === 'match-amplitude' && param === 'amplitude') {
      target = STAGE_TARGETS.amplitude
      threshold = MATCH_THRESHOLDS.amplitude
    } else if (guideState === 'match-frequency' && param === 'frequency') {
      target = STAGE_TARGETS.frequency
      threshold = MATCH_THRESHOLDS.frequency
    } else if (guideState === 'challenge' && param === challengeParam) {
      target = challengeTargetValue
      threshold = MATCH_THRESHOLDS[param]
    } else {
      return
    }

    if (Math.abs(value - target) <= threshold) {
      // Match found!
      setMatchGlow(true)
      setTimeout(() => {
        setMatchGlow(false)
        advanceGuideState()
      }, 800)
    }
  }, [guideState, challengeParam, challengeTargetValue, matchGlow])

  // ─────────────────────────────────────────────────────────────
  // State transitions
  // ─────────────────────────────────────────────────────────────
  const advanceGuideState = useCallback(() => {
    setSpeed(1) // Reset speed on advance

    switch (guideState) {
      case 'watch':
        setGuideState('match-amplitude')
        break
      case 'match-amplitude':
        setGuideState('match-frequency')
        break
      case 'match-frequency': {
        // Generate challenge target
        const target = generateChallengeTarget()
        setChallengeParam(target.param)
        setChallengeTargetValue(target.value)
        setGuideState('challenge')
        break
      }
      case 'challenge':
        setGuideState('free')
        break
      case 'free':
        // Already at end
        break
    }
  }, [guideState])

  // Auto-advance from watch if user interacts with sliders
  const handleSliderChange = useCallback((param: 'amplitude' | 'frequency', value: number) => {
    if (param === 'amplitude') {
      setAmplitude(value)
    } else {
      setFrequency(value)
    }

    // Auto-advance from watch state on any slider interaction
    if (guideState === 'watch') {
      setGuideState('match-amplitude')
      return
    }

    checkMatch(param, value)
  }, [guideState, checkMatch])

  // ─────────────────────────────────────────────────────────────
  // Instrument controls
  // ─────────────────────────────────────────────────────────────
  const handleTogglePause = useCallback(() => {
    setIsPaused(p => !p)
  }, [])

  const handleReset = useCallback(() => {
    setAmplitude(1)
    setFrequency(1)
    setIsPaused(false)
    // Clock reset handled by Scene via key change
    clockRef.current = Date.now()
  }, [])

  const handleCycleSpeed = useCallback(() => {
    setSpeed(s => cycleSpeed(s))
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Action buttons
  // ─────────────────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    advanceGuideState()
  }, [advanceGuideState])

  const handleTryAnother = useCallback(() => {
    const target = generateChallengeTarget()
    setChallengeParam(target.param)
    setChallengeTargetValue(target.value)
    setGuideState('challenge')
  }, [])

  const handleComplete = useCallback(() => {
    onComplete({ a: amplitude, f: frequency })
  }, [onComplete, amplitude, frequency])

  // ─────────────────────────────────────────────────────────────
  // Dot navigation
  // ─────────────────────────────────────────────────────────────
  const handleStageSelect = useCallback((index: number) => {
    const currentIndex = GUIDE_STATE_TO_INDEX[guideState]
    if (index >= currentIndex) return // Can only go back
    const newState = INDEX_TO_GUIDE_STATE[index]
    setGuideState(newState)
    setSpeed(1)
  }, [guideState])

  // ─────────────────────────────────────────────────────────────
  // Compute effective targets for Scene
  // ─────────────────────────────────────────────────────────────
  const effectiveAmplitudeTarget = guideState === 'challenge' && challengeParam === 'amplitude'
    ? challengeTargetValue
    : STAGE_TARGETS.amplitude
  const effectiveFrequencyTarget = guideState === 'challenge' && challengeParam === 'frequency'
    ? challengeTargetValue
    : STAGE_TARGETS.frequency

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <InstrumentLayout
      statusStrip={
        <StatusStrip
          ref={statusStripRef}
          currentStage={GUIDE_STATE_TO_INDEX[guideState] + 1}
          totalStages={TOTAL_GUIDE_STATES}
          onBack={onBack}
          onStageSelect={handleStageSelect}
          className={booted ? '' : 'opacity-0'}
        />
      }
      promptReadout={
        <PromptReadout
          ref={promptRef}
          title={config.prompt}
          className={booted ? '' : 'opacity-0'}
        />
      }
      formulaReadout={
        <FormulaReadout
          amplitude={amplitude}
          frequency={frequency}
          highlightAmplitude={config.highlightAmplitude}
          highlightFrequency={config.highlightFrequency}
        />
      }
      visualization={
        <Scene
          key={clockRef.current} // Reset animation on clock change
          amplitude={amplitude}
          frequency={frequency}
          phase={0}
          target={{ a: effectiveAmplitudeTarget, f: effectiveFrequencyTarget, p: 0 }}
          stage={guideState === 'watch' || guideState === 'free' ? 'observe' : 'amplitude'}
          isPaused={isPaused}
          onPauseChange={setIsPaused}
          stageTargets={{ amplitude: effectiveAmplitudeTarget, frequency: effectiveFrequencyTarget, phase: 0 }}
          isVisible={true}
          matchSuccess={matchGlow}
          showGhost={config.showGhost}
          showConnector={config.showConnector}
          speedMultiplier={speed}
        />
      }
      controlStrip={
        <ControlStrip
          amplitudeSlider={
            <ParameterSlider
              param="amplitude"
              value={amplitude}
              onChange={(v) => handleSliderChange('amplitude', v)}
            />
          }
          frequencySlider={
            <ParameterSlider
              param="frequency"
              value={frequency}
              onChange={(v) => handleSliderChange('frequency', v)}
            />
          }
          instrumentControls={
            <InstrumentControls
              isPaused={isPaused}
              speed={speed}
              onTogglePause={handleTogglePause}
              onReset={handleReset}
              onCycleSpeed={handleCycleSpeed}
            />
          }
          actionButtons={
            <>
              {guideState === 'watch' && (
                <ContinueButton onClick={handleContinue}>
                  Continue
                </ContinueButton>
              )}
              {guideState === 'free' && (
                <>
                  <ContinueButton onClick={handleTryAnother}>
                    Try Another
                  </ContinueButton>
                  <ContinueButton onClick={handleComplete}>
                    Complete
                  </ContinueButton>
                </>
              )}
            </>
          }
        />
      }
    />
  )
}

export default InstrumentModule
```

**Step 2: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: Some errors about Scene props that don't exist yet (showGhost, showConnector, speedMultiplier) - we'll fix those in the next task.

**Step 3: Commit (with known issues noted)**

```bash
git add src/components/modules/sinewaves/InstrumentModule.tsx
git commit -m "feat(sinewaves): create InstrumentModule orchestrator

Simplified module replacing ObservatoryModule:
- 5 guide states instead of complex stage machine
- All controls always visible
- Auto-advance from watch on slider interaction
- Speed resets to 1x on state advance

WIP: Scene props need updating in next task

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Update Scene Props for New Features

**Files:**
- Modify: `src/components/modules/sinewaves/Scene.tsx`

Add showGhost, showConnector, speedMultiplier props.

**Step 1: Update Scene interface and implementation**

```typescript
// Update SceneProps interface in Scene.tsx:

interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
  target: { a: number; f: number; p: number }
  stage: Stage
  isPaused: boolean
  onPauseChange: (paused: boolean) => void
  stageTargets?: { amplitude: number; frequency: number; phase: number }
  isVisible?: boolean
  matchSuccess?: boolean
  showGhost?: boolean      // NEW: explicitly control ghost visibility
  showConnector?: boolean  // NEW: explicitly control connector visibility
  speedMultiplier?: number // NEW: animation speed multiplier
}

// Update Visualization to use new props:

function Visualization({
  amplitude, frequency, phase, target, stage, isPaused, onPauseChange,
  stageTargets, matchSuccess,
  showGhost: showGhostProp,
  showConnector: showConnectorProp,
  speedMultiplier = 1,
}: SceneProps) {
  const { isPortrait, circle, wave, scale, connector } = useSceneLayout(stage)
  const isMobile = useIsMobileViewport()

  // Use explicit prop if provided, otherwise fall back to stage-based logic
  const showGhost = showGhostProp ?? (stage !== 'observe')
  const showConnector = showConnectorProp ?? (connector !== null)

  // ... rest of component

  // Update useFrame in SineWave to respect speedMultiplier
  // This requires passing speedMultiplier to SineWave component
```

**Step 2: Update SineWave to accept speedMultiplier**

Add `speedMultiplier` prop to SineWave and use it in useFrame:

```typescript
// In SineWave.tsx, add to interface:
speedMultiplier?: number

// In useFrame:
const t = state.clock.elapsedTime * (speedMultiplier ?? 1)
```

**Step 3: Update UnitCircle similarly**

Add `speedMultiplier` prop to UnitCircle.

**Step 4: Wire speedMultiplier through Scene to child components**

Pass `speedMultiplier` to UnitCircle and SineWave components.

**Step 5: Verify no type errors**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/components/modules/sinewaves/Scene.tsx src/components/modules/sinewaves/SineWave.tsx src/components/modules/sinewaves/UnitCircle.tsx
git commit -m "feat(sinewaves): add showGhost, showConnector, speedMultiplier to Scene

- showGhost: explicit control over ghost wave visibility
- showConnector: explicit control over connector visibility
- speedMultiplier: 0.5x/1x/2x animation speed control

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Update Module Export and Clean Up

**Files:**
- Modify: `src/components/modules/sinewaves/index.ts` (or equivalent entry point)
- Delete: `src/components/modules/sinewaves/components/DiagnosisChoices.tsx`
- Delete: `src/components/modules/sinewaves/components/RevealPanel.tsx`
- Delete: `src/components/modules/sinewaves/components/MatchFeedback.tsx`
- Modify: `src/components/modules/sinewaves/components/index.ts`

**Step 1: Update module entry point to export InstrumentModule**

Check what the current entry point is and update it to export InstrumentModule as the default.

**Step 2: Remove deleted components from index.ts**

```typescript
// Update src/components/modules/sinewaves/components/index.ts
// Remove these lines:
// export * from './DiagnosisChoices'
// export * from './RevealPanel'
// export * from './MatchFeedback'
```

**Step 3: Delete the removed component files**

```bash
rm src/components/modules/sinewaves/components/DiagnosisChoices.tsx
rm src/components/modules/sinewaves/components/RevealPanel.tsx
rm src/components/modules/sinewaves/components/MatchFeedback.tsx
```

**Step 4: Update any imports in the codebase that reference old module**

Search for imports of ObservatoryModule and update to InstrumentModule.

**Step 5: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor(sinewaves): clean up removed components

- Deleted DiagnosisChoices, RevealPanel, MatchFeedback
- Updated exports to use InstrumentModule
- Removed ~40% of module complexity

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Simplify animations.ts

**Files:**
- Modify: `src/components/modules/sinewaves/animations.ts`

Remove stageTransition, keep boot sequence and match glow.

**Step 1: Remove stageTransition function and related types**

Delete `StageTransitionRefs`, `StageTransitionCallbacks`, and `stageTransition` function.

**Step 2: Verify no remaining imports of removed functions**

Search codebase for `stageTransition` imports and remove them.

**Step 3: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/modules/sinewaves/animations.ts
git commit -m "refactor(sinewaves): simplify animations.ts

Removed stageTransition - no longer needed with always-visible controls.
Kept: consoleBootSequence, matchSuccessSequence

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Simplify sinewaves-copy.ts

**Files:**
- Modify: `src/components/modules/sinewaves/sinewaves-copy.ts`

Cut down to just the 5 prompt strings and match celebration copy.

**Step 1: Simplify the copy file**

Keep only what's needed:
- 5 guide state prompts (now in guide-state.ts, so may just need match celebrations)
- Match celebration strings
- "So what" text for free state
- behindThis content (for celebration modal)

Remove:
- Stage subtext (prompts are self-contained now)
- controlStripHints (controls always visible)
- stageTransitions (no longer used)
- Complex challenge copy structure

**Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/modules/sinewaves/sinewaves-copy.ts
git commit -m "refactor(sinewaves): simplify copy file

Removed unused stage subtext, hints, and transition copy.
Kept: match celebrations, 'so what' text, behindThis content.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Integration Testing

**Files:** None (testing only)

**Step 1: Start dev server**

Run: `pnpm dev`

**Step 2: Test desktop flow**

1. Navigate to sinewaves module
2. Verify boot sequence plays
3. Verify all elements visible: HUD strip, prompt, formula, viz (circle + wave), sliders, controls
4. Verify `watch` state shows connector
5. Drag amplitude slider → should auto-advance to `match-amplitude`
6. Match amplitude target → glow → advance to `match-frequency`
7. Match frequency target → glow → advance to `challenge`
8. Match challenge target → glow → advance to `free`
9. Test "Try Another" → back to challenge
10. Test "Complete" → calls onComplete
11. Test dot navigation (click earlier dots)
12. Test TRACE/RESET/SPEED controls
13. Test ESC button

**Step 3: Test mobile flow**

1. Resize browser to mobile width (<768px)
2. Verify unit circle is hidden
3. Verify all other elements visible
4. Verify layout stacks properly
5. Run through same flow as desktop

**Step 4: Test tablet flow**

1. Resize to tablet width (768-1023px)
2. Verify layout adapts appropriately

**Step 5: Test edge cases**

1. Reset during matching → should reset sliders to 1.0
2. Speed changes → animation speed should change
3. Pause/play → animation should stop/start
4. Navigate back during matching → should work

**Step 6: Fix any issues found**

Address any bugs discovered during testing.

**Step 7: Final commit**

```bash
git add -A
git commit -m "test(sinewaves): integration testing complete

Verified:
- Desktop/mobile/tablet layouts
- All guide state transitions
- Instrument controls (TRACE/RESET/SPEED)
- Dot navigation
- Match detection and glow feedback

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Delete ObservatoryModule (Final Cleanup)

**Files:**
- Delete: `src/components/modules/sinewaves/ObservatoryModule.tsx`

Only do this after confirming InstrumentModule works correctly.

**Step 1: Verify InstrumentModule is working**

Run full test suite and manual testing.

**Step 2: Delete old module**

```bash
rm src/components/modules/sinewaves/ObservatoryModule.tsx
```

**Step 3: Remove any remaining references**

Search for `ObservatoryModule` and remove/update.

**Step 4: Final build verification**

Run: `pnpm build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(sinewaves): remove ObservatoryModule

InstrumentModule fully replaces it with:
- Simpler 5-state guide model
- Always-visible controls
- ~40% less complexity

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Guide state types and constants | 10 min |
| 2 | Update Layout for always-visible | 15 min |
| 3 | StatusStrip with HUD chrome | 15 min |
| 4 | InstrumentControls component | 10 min |
| 5 | ControlStrip for always-visible sliders | 10 min |
| 6 | Grid lines in Scene | 20 min |
| 7 | Scene mobile/desktop differentiation | 15 min |
| 8 | InstrumentModule orchestrator | 30 min |
| 9 | Scene props for new features | 20 min |
| 10 | Module export and cleanup | 15 min |
| 11 | Simplify animations.ts | 10 min |
| 12 | Simplify sinewaves-copy.ts | 10 min |
| 13 | Integration testing | 30 min |
| 14 | Delete ObservatoryModule | 5 min |

**Total estimated time:** ~3.5 hours of focused work

---

*Plan created: 2026-02-05*
*Design spec: docs/design/SINEWAVES-REFACTOR-SPEC.md*
