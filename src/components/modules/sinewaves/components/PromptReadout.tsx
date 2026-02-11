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
 * Prompt readout panel — Eurorack silk-screen style
 * OBSERVATION micro-label above prompt text
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
          'relative bg-(--lab-surface) p-3 sm:p-4',
          className
        )}
        data-stage-overlay
        role="status"
        aria-live="polite"
      >
        <div className="mb-1.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
          Observation
        </div>
        <h2
          className={cn(
            'text-sm font-medium sm:text-base',
            'lab-display-font text-(--lab-text)',
            description && 'mb-2'
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            'text-xs leading-relaxed sm:text-sm lab-display-font text-(--lab-text-muted)',
            'transition-opacity duration-200',
            description ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
          )}
          aria-hidden={!description}
        >
          {description || '\u00A0'}
        </p>
      </div>
    )
  }
)
