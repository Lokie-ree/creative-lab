// src/components/modules/sinewaves/components/RevealPanel.tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RevealPanelProps {
  title: string
  description: string
  soWhat: string
  onTryAnother?: () => void
  onExplore?: () => void
  onFinish?: () => void
  className?: string
}

/**
 * Reveal panel showing completion celebration and "so what" explanation
 * Includes completion options for user choice
 */
export function RevealPanel({
  title,
  description,
  soWhat,
  onTryAnother,
  onExplore,
  onFinish,
  className = '',
}: RevealPanelProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-(--lab-border) bg-(--lab-surface)',
        'p-4 sm:p-6',
        className
      )}
      data-stage-overlay
    >
      {/* Success accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-(--lab-earned)" />

      {/* Title */}
      <h2 className="mb-2 text-lg font-semibold font-[family-name:var(--font-display)] text-(--lab-earned) sm:text-xl">
        {title}
      </h2>

      {/* Description */}
      <p className="mb-3 text-xs font-[family-name:var(--font-body)] text-(--lab-text) sm:mb-4 sm:text-sm">
        {description}
      </p>

      {/* So What explanation */}
      <div className="mb-4 whitespace-pre-line text-xs leading-relaxed font-[family-name:var(--font-body)] text-(--lab-text-muted) sm:mb-6 sm:text-sm">
        {soWhat}
      </div>

      {/* Completion options */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {onTryAnother && (
          <Button
            onClick={onTryAnother}
            variant="outline"
            className="min-h-[44px] w-full justify-center border-(--lab-accent) bg-transparent font-[family-name:var(--font-display)] text-(--lab-accent) sm:min-h-[40px]"
          >
            Try Another Challenge
          </Button>
        )}

        {onExplore && (
          <Button
            onClick={onExplore}
            variant="outline"
            className="min-h-[44px] w-full justify-center border-(--lab-border) bg-transparent font-[family-name:var(--font-display)] text-(--lab-text-muted) sm:min-h-[40px]"
          >
            Free Explore
          </Button>
        )}

        {onFinish && (
          <Button
            onClick={onFinish}
            variant="default"
            className="min-h-[44px] w-full justify-center bg-(--lab-earned) font-[family-name:var(--font-display)] text-(--lab-bg) sm:min-h-[40px]"
          >
            Complete Module
          </Button>
        )}
      </div>
    </div>
  )
}
