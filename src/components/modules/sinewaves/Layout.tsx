// src/components/modules/sinewaves/Layout.tsx
import { type ReactNode } from 'react'

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
      className="relative min-h-screen w-screen overflow-hidden"
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
        className="flex flex-col gap-(--space-4) lg:flex-row lg:gap-(--space-6)"
      >
        <div className="flex-1">{promptReadout}</div>
        {formulaReadout && (
          <div className="lg:w-[280px] lg:shrink-0">{formulaReadout}</div>
        )}
      </div>

      {/* PRIMARY DISPLAY - sacred, protected space */}
      <main className="relative min-h-0 flex-1">
        {visualization}
      </main>

      {/* CONTROL STRIP */}
      <footer className="flex flex-col items-center gap-(--space-3)">
        {controlStrip}
      </footer>

      {/* OVERLAYS (celebrations, transitions) */}
      {children}
    </div>
  )
}
