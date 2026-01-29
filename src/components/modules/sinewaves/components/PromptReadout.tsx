// src/components/modules/sinewaves/components/PromptReadout.tsx
import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'

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
        className={`relative ${className}`}
        style={{
          backgroundColor: 'var(--lab-surface)',
          borderRadius: '4px',
          padding: 'var(--space-4)',
          // Left edge glow
          borderLeft: '2px solid var(--lab-accent)',
          boxShadow: 'inset 4px 0 8px -4px rgba(34, 211, 238, 0.3)',
        }}
        data-stage-overlay
      >
        <h2
          className="text-base font-medium sm:text-lg"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--lab-text)',
            marginBottom: description ? 'var(--space-2)' : 0,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-sm"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--lab-text-muted)',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
    )
  }
)
