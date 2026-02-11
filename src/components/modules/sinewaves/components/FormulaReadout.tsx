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
 * Formula readout panel — Eurorack silk-screen style
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
        className={cn('relative bg-(--lab-surface) p-3 sm:p-4 border-l-2 border-l-(--lab-accent)/20', className)}
        data-stage-overlay
      >
        {/* Label */}
        <p className="mb-1.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
          Formula
        </p>

        {/* Formula */}
        <div className="text-base lab-data-font text-(--lab-text) sm:text-lg md:text-xl">
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
      </div>
    )
  }
)
