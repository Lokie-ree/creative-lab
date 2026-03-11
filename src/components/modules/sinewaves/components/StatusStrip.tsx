// src/components/modules/sinewaves/components/StatusStrip.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface StatusStripProps {
  currentStage: number
  totalStages: number
  onStageSelect?: (index: number) => void
  className?: string
}

const STAGE_LABELS = ['Watch', 'Amplitude', 'Frequency', 'Challenge', 'Free']

/**
 * Eurorack status strip — progress LEDs centered, title desktop-only.
 *
 * Desktop: SINEWAVES  ●●●○○  [spacer]
 * Mobile:             ●●●○○
 */
export const StatusStrip = forwardRef<HTMLDivElement, StatusStripProps>(
  function StatusStrip({ currentStage, totalStages, onStageSelect, className = '' }, ref) {
    const canNavigateToStage = (index: number) => {
      if (!onStageSelect) return false
      return index + 1 <= currentStage
    }

    return (
      <div ref={ref} className={cn('flex w-full items-center', className)}>
        {/* Left: title (desktop only) */}
        <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
          Sinewaves
        </span>

        {/* Center: progress LEDs */}
        <nav
          className="flex flex-1 items-center justify-center"
          aria-label={`Module progress: stage ${currentStage} of ${totalStages}`}
        >
          <ol className="flex items-center" role="list">
            {Array.from({ length: totalStages }, (_, i) => {
              const oneBased = i + 1
              const isCompleted = oneBased < currentStage
              const isCurrent = oneBased === currentStage
              const clickable = canNavigateToStage(i)
              const stageLabel = STAGE_LABELS[i] ?? 'Stage'
              const stageStatus = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && onStageSelect?.(i)}
                    className={cn(
                      'flex h-11 w-4 items-center justify-center transition-colors duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--lab-bg)',
                      clickable ? 'cursor-pointer' : 'cursor-default',
                    )}
                    aria-label={`${stageLabel}, ${stageStatus}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span
                      className={cn(
                        'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                        isCompleted && 'bg-(--lab-success) border-(--lab-led-completed-border)',
                        isCurrent && 'bg-(--lab-accent) border-(--lab-accent-muted)',
                        !isCompleted && !isCurrent && 'bg-(--lab-border) border-(--lab-led-upcoming-border)'
                      )}
                    />
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Right: invisible spacer matching title width (desktop only) */}
        <span
          className="hidden shrink-0 lab-silk lab-display-font font-bold md:block invisible"
          aria-hidden
        >
          Sinewaves
        </span>
      </div>
    )
  }
)
