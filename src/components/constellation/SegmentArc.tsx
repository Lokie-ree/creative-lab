import { cn } from '@/lib/utils'

interface SegmentArcProps {
  total: number
  completed: number
  size: number
  strokeWidth?: number
  className?: string
}

export function SegmentArc({
  total,
  completed,
  size,
  strokeWidth = 2,
  className,
}: SegmentArcProps) {
  if (total === 0) return null

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const segmentLength = circumference / total
  const gapLength = 4
  const arcLength = segmentLength - gapLength

  return (
    <svg
      width={size}
      height={size}
      className={cn('absolute inset-0', className)}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < completed
        const rotation = (index / total) * 360 - 90

        return (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isCompleted ? 'var(--lab-accent)' : 'var(--lab-border)'}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            className="transition-all duration-300"
          />
        )
      })}
    </svg>
  )
}
