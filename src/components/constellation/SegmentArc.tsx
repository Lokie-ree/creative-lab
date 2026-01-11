import { cn } from '@/lib/utils'

interface SegmentArcProps {
  total: number
  completed: number
  size: number
  strokeWidth?: number
  color: string
  className?: string
}

export function SegmentArc({
  total,
  completed,
  size,
  strokeWidth = 3,
  color,
  className,
}: SegmentArcProps) {
  if (total === 0) return null

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const segmentLength = circumference / total
  const gapLength = 4 // Gap between segments in pixels
  const arcLength = segmentLength - gapLength

  return (
    <svg
      width={size}
      height={size}
      className={cn('absolute inset-0', className)}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < completed
        const rotation = (index / total) * 360 - 90 // Start from top

        return (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isCompleted ? color : '#4b5563'}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            className={cn(
              'transition-all duration-300',
              isCompleted && 'drop-shadow-[0_0_6px_currentColor]'
            )}
            style={{ color: isCompleted ? color : undefined }}
          />
        )
      })}
    </svg>
  )
}
