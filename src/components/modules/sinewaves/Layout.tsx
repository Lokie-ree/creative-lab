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
