// src/components/modules/sinewaves/Layout.tsx
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
 * Mobile (<768px): 3-row grid — header | viz | controls
 * Desktop (≥768px): 4-row grid — status strip | readouts | display | controls
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
      className={cn(
        'relative grid min-h-screen w-screen overflow-hidden',
        'bg-(--lab-bg) font-[family-name:var(--font-body)]',
        // Mobile: 3-row layout
        'grid-rows-[2.5rem_1fr_auto] gap-2 p-2',
        // Desktop: 4-row layout with readouts
        'md:grid-rows-[3rem_auto_1fr_auto] md:gap-4 md:p-4'
      )}
    >
      {/* STATUS STRIP */}
      <header className="flex items-center">
        {statusStrip}
      </header>

      {/* READOUTS — hidden on mobile */}
      <div className="hidden flex-col gap-4 md:flex lg:flex-row lg:gap-6">
        <div className="flex-1">{promptReadout}</div>
        {formulaReadout && (
          <div className="lg:w-[280px] lg:shrink-0">{formulaReadout}</div>
        )}
      </div>

      {/* PRIMARY DISPLAY */}
      <main className="relative min-h-0 flex-1">
        {visualization}
      </main>

      {/* CONTROL STRIP — docked bottom on mobile */}
      <footer className="flex flex-col items-center gap-3 pb-4 md:pb-0">
        {controlStrip}
      </footer>

      {/* OVERLAYS (celebrations, transitions) */}
      {children}
    </div>
  )
}
