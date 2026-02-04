// src/components/modules/sinewaves/components/ControlStrip.tsx
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ControlStripProps {
  children: ReactNode
  /** Contextual hint shown above controls (e.g. "Drag to match the ghost wave's height"). Mobile: description moves here. */
  hint?: string
  /** Ref for hint element (Phase 4: animate on stage change) */
  hintRef?: React.RefObject<HTMLParagraphElement | null>
  /** Formula readout for mobile inline display (hidden on desktop where it shows in readouts row) */
  formula?: ReactNode
  className?: string
}

/**
 * Control strip container for sliders, buttons, and feedback
 * Centers content with max-width constraint on desktop.
 * Optional formula slot for mobile (hidden on md+).
 * Optional hint line above children (muted, single line).
 */
export const ControlStrip = forwardRef<HTMLDivElement, ControlStripProps>(
  function ControlStrip({ children, hint, hintRef, formula, className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto flex w-full max-w-md flex-col items-center',
          'gap-2 sm:gap-3',
          className
        )}
      >
        {/* Formula readout - mobile only (desktop shows in readouts row) */}
        {formula && <div className="w-full md:hidden">{formula}</div>}
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
