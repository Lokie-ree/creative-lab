import { cn } from '@/lib/utils'
import type { ModuleStatus } from '@/types/portfolio'

interface NodeRingsProps {
  status: ModuleStatus
  progress: number // 0-1
  isRecommended: boolean
  className?: string
}

export function NodeRings({ status, progress, isRecommended, className }: NodeRingsProps) {
  // Calculate stroke-dasharray for progress arc
  // Circumference of middle ring (r=16): 2 * PI * 16 ≈ 100.53
  const circumference = 2 * Math.PI * 16
  const dashArray = `${progress * circumference} ${circumference}`

  const isActive = status !== 'not-started'
  const isCompleted = status === 'completed'

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('w-12 h-12', className)}
      aria-hidden="true"
    >
      {/* Outer ring - always visible */}
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        strokeWidth="2"
        className={cn(
          'transition-colors duration-150',
          isActive || isRecommended ? 'stroke-cyan-400' : 'stroke-gray-600'
        )}
      />

      {/* Middle ring - progress arc */}
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeDasharray={dashArray}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        className={cn(
          'transition-opacity duration-150',
          progress > 0 ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Inner circle - core state */}
      <circle
        cx="24"
        cy="24"
        r="8"
        strokeWidth="1.5"
        className={cn(
          'transition-all duration-150',
          isCompleted
            ? 'fill-cyan-400 stroke-cyan-400'
            : isActive
              ? 'fill-cyan-400/20 stroke-cyan-400'
              : 'fill-transparent stroke-gray-600'
        )}
      />
    </svg>
  )
}
