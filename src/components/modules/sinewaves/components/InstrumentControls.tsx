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
          'flex min-h-[44px] items-center gap-1.5 rounded border px-3 py-1.5',
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
          <Play className="h-4 w-4 sm:h-3 sm:w-3" />
        ) : (
          <Pause className="h-4 w-4 sm:h-3 sm:w-3" />
        )}
        <span className="hidden sm:inline">{isPaused ? 'Play' : 'Pause'}</span>
      </button>

      {/* RESET */}
      <button
        type="button"
        onClick={onReset}
        className={cn(
          'flex min-h-[44px] items-center gap-1.5 rounded border border-(--lab-border) px-3 py-1.5',
          'text-xs font-medium uppercase tracking-wider text-(--lab-text-muted)',
          'transition-colors hover:border-(--lab-accent) hover:text-(--lab-accent)',
          'focus:outline-none focus:ring-2 focus:ring-(--lab-accent)',
          'font-[family-name:var(--font-data)]'
        )}
        aria-label="Reset wave and sliders"
      >
        <RotateCcw className="h-4 w-4 sm:h-3 sm:w-3" />
        <span className="hidden sm:inline">Reset</span>
      </button>

      {/* SPEED (cycling toggle) */}
      <button
        type="button"
        onClick={onCycleSpeed}
        className={cn(
          'flex min-h-[44px] items-center gap-1.5 rounded border border-(--lab-border) px-3 py-1.5',
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
