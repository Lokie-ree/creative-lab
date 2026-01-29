// src/components/modules/sinewaves/components/ContinueButton.tsx
import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'

interface ContinueButtonProps {
  onClick: () => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * User-initiated progression button
 * Replaces countdown timers - user clicks when ready
 */
export const ContinueButton = forwardRef<HTMLButtonElement, ContinueButtonProps>(
  function ContinueButton(
    { onClick, disabled = false, children = 'Continue', className = '' },
    ref
  ) {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        className={`min-w-[120px] ${className}`}
        style={{
          fontFamily: 'var(--font-display)',
          borderColor: 'var(--lab-accent)',
          color: 'var(--lab-accent)',
          backgroundColor: 'transparent',
          transition: 'all var(--duration-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {children}
      </Button>
    )
  }
)
