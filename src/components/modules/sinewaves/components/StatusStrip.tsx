// src/components/modules/sinewaves/components/StatusStrip.tsx
import { forwardRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

interface StatusStripProps {
  userName?: string
  avatarUrl?: string
  currentStage: number
  totalStages: number
  progress: number // 0-100
  className?: string
}

/**
 * Status strip showing user avatar, progress bar, and stage indicator
 */
export const StatusStrip = forwardRef<HTMLDivElement, StatusStripProps>(
  function StatusStrip(
    {
      userName = 'Learner',
      avatarUrl,
      currentStage,
      totalStages,
      progress,
      className = '',
    },
    ref
  ) {
    const initials = userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div ref={ref} className={`flex w-full items-center gap-[var(--space-4)] ${className}`}>
        {/* Avatar + Name */}
        <div className="flex items-center gap-[var(--space-3)]">
          <Avatar className="h-8 w-8 border border-[var(--lab-border)]">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
            <AvatarFallback
              className="text-xs"
              style={{
                backgroundColor: 'var(--lab-surface)',
                color: 'var(--lab-text-muted)',
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className="hidden text-sm font-medium sm:inline"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--lab-text)',
            }}
          >
            {userName}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <Progress
            value={progress}
            className="h-1"
            style={{
              backgroundColor: 'var(--lab-surface)',
            }}
          />
        </div>

        {/* Stage indicator */}
        <span
          className="text-sm font-medium tabular-nums"
          style={{
            fontFamily: 'var(--font-data)',
            color: 'var(--lab-accent)',
          }}
        >
          {currentStage}/{totalStages}
        </span>
      </div>
    )
  }
)
