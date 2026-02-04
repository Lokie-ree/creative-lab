// src/components/modules/sinewaves/components/FormulaReadout.tsx
import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'
import { cn } from '@/lib/utils'

interface FormulaReadoutProps {
  amplitude: number
  frequency: number
  highlightAmplitude?: boolean
  highlightFrequency?: boolean
  className?: string
}

/**
 * Formula readout panel with corner bracket accents
 * Shows the formula being built: y = A sin(f t)
 * Animates in on highlight changes (stage transitions)
 */
export const FormulaReadout = forwardRef<HTMLDivElement, FormulaReadoutProps>(
  function FormulaReadout(
    {
      amplitude,
      frequency,
      highlightAmplitude = false,
      highlightFrequency = false,
      className = '',
    },
    ref
  ) {
    const localRef = useRef<HTMLDivElement>(null)
    const prevHighlight = useRef({ amplitude: highlightAmplitude, frequency: highlightFrequency })

    // Expose the local ref to parent
    useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

    // Animate entrance on mount and when highlight changes (stage transition)
    useEffect(() => {
      const highlightChanged =
        prevHighlight.current.amplitude !== highlightAmplitude ||
        prevHighlight.current.frequency !== highlightFrequency

      if (localRef.current && highlightChanged) {
        fadeInReadout(localRef.current)
      }

      prevHighlight.current = { amplitude: highlightAmplitude, frequency: highlightFrequency }
    }, [highlightAmplitude, highlightFrequency])

    // Initial mount animation
    useEffect(() => {
      if (localRef.current) {
        fadeInReadout(localRef.current)
      }
    }, [])

    return (
      <div
        ref={localRef}
        className={cn('relative rounded bg-(--lab-surface) p-3 sm:p-4', className)}
        data-stage-overlay
      >
        {/* Corner brackets */}
        <div className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-(--lab-accent) opacity-60" />
        <div className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-(--lab-accent) opacity-60" />
        <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-(--lab-accent) opacity-60" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-(--lab-accent) opacity-60" />

        {/* Formula */}
        <div className="text-center text-base font-[family-name:var(--font-data)] text-(--lab-text) sm:text-lg md:text-xl">
          <span>y = </span>
          <span className={cn('font-medium', highlightAmplitude ? 'text-(--lab-accent)' : 'text-(--lab-text)')}>
            {amplitude.toFixed(1)}
          </span>
          <span> sin(</span>
          <span className={cn('font-medium', highlightFrequency ? 'text-(--lab-accent)' : 'text-(--lab-text)')}>
            {frequency.toFixed(1)}
          </span>
          <span> t)</span>
        </div>

        {/* Label */}
        <p className="mt-2 text-center text-[10px] uppercase tracking-wider font-[family-name:var(--font-body)] text-(--lab-text-muted) sm:text-xs">
          You're Building
        </p>
      </div>
    )
  }
)
