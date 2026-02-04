// src/components/modules/sinewaves/components/StatusStrip.tsx
import { forwardRef } from 'react'
import { ChevronLeft } from 'lucide-react'

interface StatusStripProps {
  currentStage: number
  totalStages: number
  progress?: number // 0-100, kept for compatibility (display-only dots used instead)
  /** Stage title shown inline on mobile (replaces prompt readout title) */
  title?: string
  /** Back/exit to constellation; when set, shows back control */
  onBack?: () => void
  /** Optional: when user taps a dot (completed or current stage). Phase 4. */
  onStageSelect?: (index: number) => void
  /** Optional: flash message during stage transition (e.g. "AMPLITUDE CONTROL"). Phase 4. */
  statusText?: string
  className?: string
}

const STAGE_LABELS = ['Observe', 'Amplitude', 'Frequency', 'Challenge', 'Complete']

/**
 * Status strip: back/exit, progress dots (clickable for nav in Phase 4), stage title.
 * Mobile: single row [back] [dots] [title]. Desktop: same with optional avatar/name.
 */
export const StatusStrip = forwardRef<HTMLDivElement, StatusStripProps>(
  function StatusStrip(
    {
      currentStage,
      totalStages,
      title,
      onBack,
      onStageSelect,
      statusText,
      className = '',
    },
    ref
  ) {
    const canNavigateToStage = (index: number) => {
      if (!onStageSelect) return false
      const oneBased = index + 1
      return oneBased <= currentStage // completed or current only
    }

    return (
      <div
        ref={ref}
        className={`flex w-full items-center gap-(--space-3) md:gap-(--space-4) ${className}`}
      >
        {/* Back / exit — visible when onBack provided */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center justify-center rounded p-1 transition-colors hover:bg-[var(--lab-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--lab-accent)]"
            aria-label="Back to constellation"
          >
            <ChevronLeft
              className="h-5 w-5 md:h-6 md:w-6"
              style={{ color: 'var(--lab-text-muted)' }}
            />
          </button>
        )}

        {/* Progress dots — navigation with 44px touch targets */}
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
                    className={`relative h-2 w-2 rounded-full transition-colors before:absolute before:-inset-4 before:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--lab-bg) ${
                      clickable ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isCompleted
                        ? 'bg-(--lab-accent)'
                        : isCurrent
                          ? 'bg-(--lab-accent) ring-2 ring-(--lab-accent) ring-offset-2 ring-offset-(--lab-bg)'
                          : 'bg-(--lab-border) opacity-60'
                    }`}
                    aria-label={`${stageLabel}, ${stageStatus}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  />
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Stage title — shown on mobile instead of prompt readout title */}
        {title && (
          <span
            className="truncate text-sm font-medium md:text-base"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--lab-text)',
              maxWidth: '50%',
            }}
          >
            {title}
          </span>
        )}

        {/* Optional status flash (Phase 4) — e.g. "AMPLITUDE CONTROL" */}
        {statusText && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-data)',
              color: 'var(--lab-accent)',
            }}
          >
            {statusText}
          </span>
        )}
      </div>
    )
  }
)
