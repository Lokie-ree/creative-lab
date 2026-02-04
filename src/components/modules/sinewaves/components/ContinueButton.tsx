// src/components/modules/sinewaves/components/ContinueButton.tsx
import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
        className={cn(
          'min-h-[44px] min-w-[120px] sm:min-h-[40px]',
          'border-(--lab-accent) bg-transparent text-(--lab-accent)',
          'font-[family-name:var(--font-display)]',
          'transition-all duration-150 ease-out',
          'hover:bg-[rgba(34,211,238,0.1)]',
          className
        )}
      >
        {children}
      </Button>
    )
  }
)
