// src/components/modules/sinewaves/components/PromptReadout.tsx
import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'
import { cn } from '@/lib/utils'

interface PromptReadoutProps {
  title: string
  description?: string
  className?: string
}

/**
 * Prompt readout panel with left-edge cyan glow
 * Observatory HUD instrument panel aesthetic
 * Animates in when title changes
 */
export const PromptReadout = forwardRef<HTMLDivElement, PromptReadoutProps>(
  function PromptReadout({ title, description, className = '' }, ref) {
    const localRef = useRef<HTMLDivElement>(null)

    // Expose the local ref to parent
    useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

    // Animate entrance when title changes
    useEffect(() => {
      if (localRef.current) {
        fadeInReadout(localRef.current)
      }
    }, [title])

    return (
      <div
        ref={localRef}
        className={cn(
          'relative rounded bg-(--lab-surface) p-3 sm:p-4',
          'border-l-2 border-l-(--lab-accent)',
          'shadow-[inset_4px_0_8px_-4px_rgba(34,211,238,0.3)]',
          className
        )}
        data-stage-overlay
        role="status"
        aria-live="polite"
      >
        <h2
          className={cn(
            'text-sm font-medium sm:text-base lg:text-lg',
            'font-[family-name:var(--font-display)] text-(--lab-text)',
            description && 'mb-2'
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-xs leading-relaxed sm:text-sm font-[family-name:var(--font-body)] text-(--lab-text-muted)">
            {description}
          </p>
        )}
      </div>
    )
  }
)
