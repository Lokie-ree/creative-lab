// src/components/modules/sinewaves/components/RevealPanel.tsx
import { Button } from '@/components/ui/button'

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
      className={`relative ${className}`}
      style={{
        backgroundColor: 'var(--lab-surface)',
        borderRadius: '8px',
        padding: 'var(--space-6)',
        border: '1px solid var(--lab-border)',
      }}
      data-stage-overlay
    >
      {/* Success accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{
          backgroundColor: 'var(--lab-earned)',
          borderRadius: '8px 0 0 8px',
        }}
      />

      {/* Title */}
      <h2
        className="mb-2 text-xl font-semibold"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--lab-earned)',
        }}
      >
        {title}
      </h2>

      {/* Description */}
      <p
        className="mb-4 text-sm"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--lab-text)',
        }}
      >
        {description}
      </p>

      {/* So What explanation */}
      <div
        className="mb-6 whitespace-pre-line text-sm leading-relaxed"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--lab-text-muted)',
        }}
      >
        {soWhat}
      </div>

      {/* Completion options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {onTryAnother && (
          <Button
            onClick={onTryAnother}
            variant="outline"
            className="w-full justify-center"
            style={{
              fontFamily: 'var(--font-display)',
              borderColor: 'var(--lab-accent)',
              color: 'var(--lab-accent)',
              backgroundColor: 'transparent',
            }}
          >
            Try Another Challenge
          </Button>
        )}

        {onExplore && (
          <Button
            onClick={onExplore}
            variant="outline"
            className="w-full justify-center"
            style={{
              fontFamily: 'var(--font-display)',
              borderColor: 'var(--lab-border)',
              color: 'var(--lab-text-muted)',
              backgroundColor: 'transparent',
            }}
          >
            Free Explore
          </Button>
        )}

        {onFinish && (
          <Button
            onClick={onFinish}
            variant="default"
            className="w-full justify-center"
            style={{
              fontFamily: 'var(--font-display)',
              backgroundColor: 'var(--lab-earned)',
              color: 'var(--lab-bg)',
            }}
          >
            Complete Module
          </Button>
        )}
      </div>
    </div>
  )
}
