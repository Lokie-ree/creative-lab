// src/components/modules/sinewaves/components/FormulaReadout.tsx
import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'

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

    const amplitudeColor = highlightAmplitude
      ? 'var(--lab-accent)'
      : 'var(--lab-text)'
    const frequencyColor = highlightFrequency
      ? 'var(--lab-accent)'
      : 'var(--lab-text)'

    return (
      <div
        ref={localRef}
        className={`relative ${className}`}
        style={{
          backgroundColor: 'var(--lab-surface)',
          borderRadius: '4px',
          padding: 'var(--space-4)',
        }}
        data-stage-overlay
      >
        {/* Corner brackets */}
        <div
          className="pointer-events-none absolute left-2 top-2 h-3 w-3"
          style={{
            borderLeft: '1px solid var(--lab-accent)',
            borderTop: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />
        <div
          className="pointer-events-none absolute right-2 top-2 h-3 w-3"
          style={{
            borderRight: '1px solid var(--lab-accent)',
            borderTop: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-2 left-2 h-3 w-3"
          style={{
            borderLeft: '1px solid var(--lab-accent)',
            borderBottom: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-2 right-2 h-3 w-3"
          style={{
            borderRight: '1px solid var(--lab-accent)',
            borderBottom: '1px solid var(--lab-accent)',
            opacity: 0.6,
          }}
        />

        {/* Formula */}
        <div
          className="text-center text-lg sm:text-xl"
          style={{
            fontFamily: 'var(--font-data)',
            color: 'var(--lab-text)',
          }}
        >
          <span>y = </span>
          <span style={{ color: amplitudeColor, fontWeight: 500 }}>
            {amplitude.toFixed(1)}
          </span>
          <span> sin(</span>
          <span style={{ color: frequencyColor, fontWeight: 500 }}>
            {frequency.toFixed(1)}
          </span>
          <span> t)</span>
        </div>

        {/* Label */}
        <p
          className="mt-2 text-center text-xs uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--lab-text-muted)',
          }}
        >
          You're Building
        </p>
      </div>
    )
  }
)
