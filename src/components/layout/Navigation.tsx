import { cn } from '@/lib/utils'

interface NavigationProps {
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

export function Navigation({ showBackButton, onBack, className }: NavigationProps) {
  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 p-4',
      'bg-linear-to-b from-black/50 to-transparent',
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {showBackButton && onBack ? (
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to modules</span>
          </button>
        ) : (
          <div /> // Spacer
        )}
      </div>
    </nav>
  )
}
