import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import type { ModuleStatus } from '@/types/portfolio'

interface NodeRingsProps {
  status: ModuleStatus
  progress: number // 0-1
  isRecommended: boolean
  className?: string
}

export function NodeRings({ status, progress, isRecommended, className }: NodeRingsProps) {
  const progressRef = useRef<SVGCircleElement>(null)
  const circumference = 2 * Math.PI * 16

  // Animate progress arc when progress changes
  useEffect(() => {
    if (!progressRef.current) return

    gsap.to(progressRef.current, {
      strokeDasharray: `${progress * circumference} ${circumference}`,
      duration: 0.6,
      ease: 'power2.out',
    })
  }, [progress, circumference])

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
          isActive || isRecommended ? 'stroke-[var(--lab-accent)]' : 'stroke-gray-600'
        )}
      />

      {/* Middle ring - progress arc */}
      <circle
        ref={progressRef}
        cx="24"
        cy="24"
        r="16"
        fill="none"
        stroke="var(--lab-accent)"
        strokeWidth="2"
        strokeDasharray={`${progress * circumference} ${circumference}`}
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
            ? 'fill-[var(--lab-accent)] stroke-[var(--lab-accent)]'
            : isActive
              ? 'fill-[rgba(124,200,124,0.2)] stroke-[var(--lab-accent)]'
              : 'fill-transparent stroke-gray-600'
        )}
      />
    </svg>
  )
}
