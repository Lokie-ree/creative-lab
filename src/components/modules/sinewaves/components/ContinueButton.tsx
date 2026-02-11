// src/components/modules/sinewaves/components/ContinueButton.tsx
import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContinueButtonProps {
  onClick: () => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'ghost'
}

/**
 * User-initiated progression button
 * Replaces countdown timers - user clicks when ready
 */
export const ContinueButton = forwardRef<HTMLButtonElement, ContinueButtonProps>(
  function ContinueButton(
    { onClick, disabled = false, children = 'Continue', className = '', variant = 'default' },
    ref
  ) {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        className={cn(
          'min-h-[44px] min-w-[120px] sm:min-h-[40px]',
          'bg-transparent',
          'lab-silk lab-display-font text-[10px] tracking-[0.1em]',
          'transition-all duration-150 ease-out',
          variant === 'ghost'
            ? 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-text-muted) hover:text-(--lab-text)'
            : 'border-(--lab-accent) text-(--lab-accent) hover:bg-(--lab-accent)/10',
          className
        )}
      >
        {children}
      </Button>
    )
  }
)
