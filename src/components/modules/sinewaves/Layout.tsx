// src/components/modules/sinewaves/Layout.tsx
import { type ReactNode } from 'react'

// =============================================================================
// NEW: Observatory HUD Layout (used by new Module.tsx in Task 11+)
// =============================================================================

interface ObservatoryLayoutProps {
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
export function ObservatoryLayout({
  statusStrip,
  promptReadout,
  formulaReadout,
  visualization,
  controlStrip,
  children,
}: ObservatoryLayoutProps) {
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

// =============================================================================
// LEGACY: Old layout interface (kept for backward compat until Module.tsx swap)
// TODO: Delete after Task 11 completes and old Module.tsx is replaced
// =============================================================================

export interface SinewavesLayoutProps {
  header?: ReactNode
  explorePrompt?: ReactNode
  formula?: ReactNode
  visualization: ReactNode
  controls?: ReactNode
  children?: ReactNode
}

/**
 * @deprecated Use ObservatoryLayout instead. This will be removed after Module.tsx is rewritten.
 */
export function SinewavesLayout({
  header,
  explorePrompt,
  formula,
  visualization,
  controls,
  children,
}: SinewavesLayoutProps) {
  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: "var(--lab-bg)" }}
    >
      {/* Header: progress bar in a reserved top band so content below doesn't bunch */}
      {header != null && (
        <div className="absolute top-0 left-0 right-0 z-(--z-base) min-h-10 flex flex-col justify-end">
          {header}
        </div>
      )}

      {/* Explore prompt: own row below header band, centered */}
      {explorePrompt != null && (
        <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-(--z-base) w-[calc(100vw-2rem)] sm:w-auto sm:max-w-md">
          {explorePrompt}
        </div>
      )}

      {/* Formula: separate row below prompt, top-right — avoids competing with prompt */}
      {formula != null && (
        <div className="absolute top-20 sm:top-24 right-2 sm:right-4 z-(--z-floating) max-w-[calc(100vw-2rem)]">
          {formula}
        </div>
      )}

      {/* Visualization: main 3D area — no wrapper; Module passes flex-1 block */}
      {visualization}

      {/* Controls: bottom UI fragment — no wrapper; Module owns each element's position */}
      {controls}

      {/* Full-screen overlays (e.g. CelebrationPulse) — rendered last for stacking */}
      {children}
    </div>
  )
}
