// src/components/modules/sinewaves/components/ControlStrip.tsx
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ControlStripProps {
  children: ReactNode
  /** Contextual hint shown above controls (e.g. "Drag to match the ghost wave's height"). Mobile: description moves here. */
  hint?: string
  /** Ref for hint element (Phase 4: animate on stage change) */
  hintRef?: React.RefObject<HTMLParagraphElement | null>
  className?: string
}

/**
 * Control strip container for sliders, buttons, and feedback
 * Centers content with max-width constraint on desktop.
 * Optional hint line above children (muted, single line).
 */
export const ControlStrip = forwardRef<HTMLDivElement, ControlStripProps>(
  function ControlStrip({ children, hint, hintRef, className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto flex w-full max-w-md flex-col items-center',
          'gap-2 sm:gap-3',
          className
        )}
      >
        {hint && (
          <p
            ref={hintRef}
            className="w-full text-center text-xs leading-relaxed sm:text-sm font-[family-name:var(--font-body)] text-(--lab-text-muted)"
          >
            {hint}
          </p>
        )}
        {children}
      </div>
    )
  }
)
