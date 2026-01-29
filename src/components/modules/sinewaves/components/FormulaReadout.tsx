// src/components/modules/sinewaves/components/FormulaReadout.tsx
import { forwardRef } from 'react'

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
    const amplitudeColor = highlightAmplitude
      ? 'var(--lab-accent)'
      : 'var(--lab-text)'
    const frequencyColor = highlightFrequency
      ? 'var(--lab-accent)'
      : 'var(--lab-text)'

    return (
      <div
        ref={ref}
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
