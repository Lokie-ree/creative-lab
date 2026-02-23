// src/components/modules/sinewaves/Layout.tsx
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InstrumentLayoutProps {
  statusStrip: ReactNode
  promptReadout: ReactNode
  formulaReadout: ReactNode
  visualization: ReactNode
  controlStrip: ReactNode
  booted?: boolean
  children?: ReactNode // For overlays (celebrations, etc.)
}

/**
 * Eurorack faceplate layout for sinewaves module
 *
 * All elements always visible at every breakpoint.
 * Mobile (<768px): Vertical stack — status | prompt | formula | viz | sliders | buttons
 * Desktop (≥768px): 4-row grid — status strip | readouts side-by-side | viz | controls
 *
 * Sections separated by scored borders.
 */
export function InstrumentLayout({
  statusStrip,
  promptReadout,
  formulaReadout,
  visualization,
  controlStrip,
  booted = false,
  children,
}: InstrumentLayoutProps) {
  return (
    <div
      className={cn(
        'relative grid h-dvh w-screen overflow-hidden',
        'bg-(--lab-bg) font-[family-name:var(--font-body)]',
        // Mobile: 6-row layout (all elements visible), scored dividers via gap-0 + borders
        'grid-rows-[auto_auto_auto_1fr_auto_auto] gap-0',
        // Desktop: 4-row layout with side-by-side readouts
        'md:grid-rows-[3rem_auto_1fr_auto] md:gap-0'
      )}
    >
      {/* ROW 1: STATUS STRIP */}
      <header className="flex items-center border-b border-(--lab-border) px-5 py-2 md:px-6 md:py-0">
        {statusStrip}
      </header>

      {/* ROW 2: PROMPT READOUT (mobile: own row, desktop: combined with formula) */}
      <div className="min-h-[3.5rem] border-b border-(--lab-border) md:hidden">
        {promptReadout}
      </div>

      {/* ROW 3: FORMULA READOUT (mobile: own row, desktop: combined with prompt) */}
      <div className="border-b border-(--lab-border) md:hidden">
        {formulaReadout}
      </div>

      {/* DESKTOP ONLY: Combined readouts row */}
      <div className="hidden min-h-[5rem] border-b border-(--lab-border) md:flex md:flex-row">
        <div className="flex-1 p-3">{promptReadout}</div>
        <div className="w-px bg-(--lab-border)" />
        <div className="w-[280px] shrink-0 p-3">{formulaReadout}</div>
      </div>

      {/* ROW 4: PRIMARY VISUALIZATION */}
      <main className={cn(
        'relative min-h-[200px] flex-1 sm:min-h-[280px]',
        'transition-opacity duration-500',
        booted ? 'opacity-100' : 'opacity-0'
      )}>
        {visualization}
      </main>

      {/* ROW 5-6: CONTROL STRIP (sliders + buttons) */}
      <footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2 md:px-6 md:py-4">
        {controlStrip}
      </footer>

      {/* OVERLAYS (celebrations, transitions) */}
      {children}
    </div>
  )
}

