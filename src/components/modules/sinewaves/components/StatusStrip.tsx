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
 * Eurorack status strip with navigation and chrome
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
          'flex w-full items-center gap-2 md:gap-4',
          className
        )}
      >
        {/* Back chevron */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center justify-center p-1 transition-colors duration-150 hover:bg-(--lab-surface) focus:outline-none focus:ring-2 focus:ring-(--lab-accent)"
            aria-label="Back to course"
          >
            <ChevronLeft className="h-5 w-5 text-(--lab-text-muted) md:h-6 md:w-6" />
          </button>
        )}

        {/* SINEWAVES title — desktop only */}
        <span
          className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block"
        >
          Sinewaves
        </span>

        {/* Progress LEDs */}
        <nav
          className="flex flex-1 items-center justify-center"
          aria-label={`Module progress: stage ${currentStage} of ${totalStages}`}
        >
          <ol className="flex items-center gap-2" role="list">
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
                      'relative h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                      "before:absolute before:-inset-5 before:content-['']",
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--lab-bg)',
                      clickable ? 'cursor-pointer' : 'cursor-default',
                      isCompleted && 'bg-(--lab-success) border-(--lab-led-completed-border)',
                      isCurrent && 'bg-(--lab-accent) border-(--lab-accent-muted)',
                      !isCompleted && !isCurrent && 'bg-(--lab-border) border-(--lab-led-upcoming-border)'
                    )}
                    aria-label={`${stageLabel}, ${stageStatus}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  />
                </li>
              )
            })}
          </ol>
        </nav>

        {/* SYS:NOM status */}
        <span
          className="shrink-0 lab-silk text-(--lab-success) lab-data-font"
        >
          SYS:NOM
        </span>

        {/* ESC button — desktop only */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="hidden shrink-0 border border-(--lab-border) px-2 py-1 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text-muted) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus:ring-2 focus:ring-(--lab-accent) md:block"
            aria-label="Exit module"
          >
            ESC
          </button>
        )}
      </div>
    )
  }
)
