// src/components/modules/sinewaves/components/ControlStrip.tsx
import { type ReactNode } from 'react'

interface ControlStripProps {
  children: ReactNode
  className?: string
}

/**
 * Control strip container for sliders, buttons, and feedback
 * Centers content with max-width constraint on desktop
 */
export function ControlStrip({ children, className = '' }: ControlStripProps) {
  return (
    <div
      className={`w-full max-w-md mx-auto ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      {children}
    </div>
  )
}
