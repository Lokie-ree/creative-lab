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
 * Eurorack style: no rounded corners, semantic colors per button
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
    <div className={cn('flex items-center justify-center gap-0.5', className)}>
      {/* TRACE (play/pause) */}
      <button
        type="button"
        onClick={onTogglePause}
        className={cn(
          'flex min-h-[44px] flex-col items-center justify-center gap-1 border px-3 py-1.5',
          'lab-silk lab-display-font text-[7.5px] font-bold',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-(--lab-accent)',
          'bg-(--lab-surface) border-(--lab-border)',
          'hover:border-(--lab-accent)',
          isPaused
            ? 'text-(--lab-accent)'
            : 'text-(--lab-success)'
        )}
        aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
      >
        {isPaused ? (
          <Play className="h-3.5 w-3.5" />
        ) : (
          <Pause className="h-3.5 w-3.5" />
        )}
        <span>Trace</span>
      </button>

      {/* RESET */}
      <button
        type="button"
        onClick={onReset}
        className={cn(
          'flex min-h-[44px] flex-col items-center justify-center gap-1 border px-3 py-1.5',
          'lab-silk lab-display-font text-[7.5px] font-bold',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-(--lab-accent)',
          'bg-(--lab-surface) border-(--lab-border)',
          'text-(--lab-danger) hover:border-(--lab-danger)'
        )}
        aria-label="Reset wave and sliders"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset</span>
      </button>

      {/* SPEED (cycling toggle) */}
      <button
        type="button"
        onClick={onCycleSpeed}
        className={cn(
          'flex min-h-[44px] flex-col items-center justify-center gap-1 border px-3 py-1.5',
          'lab-silk lab-display-font text-[7.5px] font-bold',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-(--lab-accent)',
          'bg-(--lab-surface) border-(--lab-border)',
          'text-(--lab-text-muted)',
          'hover:border-(--lab-accent) hover:text-(--lab-accent)',
          'min-w-[3.5rem]'
        )}
        aria-label={`Speed: ${speed}x. Click to change.`}
      >
        <span className="lab-data-font text-sm font-semibold text-(--lab-text)">
          {speed}x
        </span>
        <span>Speed</span>
      </button>
    </div>
  )
}
