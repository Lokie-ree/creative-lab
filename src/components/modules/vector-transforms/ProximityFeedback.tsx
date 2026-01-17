/**
 * Vector Transformations Module - Proximity Feedback Component
 *
 * Displays real-time feedback on how close the user's transformed vector
 * is to the challenge target.
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ProximityLevel } from './utils'
import { getProximityFeedbackText } from './utils'

interface ProximityFeedbackProps {
  /** Current proximity level */
  level: ProximityLevel
  /** Whether feedback is visible */
  visible?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Color mapping for proximity levels
 */
const LEVEL_COLORS: Record<ProximityLevel, string> = {
  far: 'text-[var(--lab-text-muted)]',
  medium: 'text-[var(--lab-text)]',
  close: 'text-[var(--lab-accent)]',
  matched: 'text-[var(--lab-accent)]',
}

/**
 * Icon mapping for proximity levels
 */
const LEVEL_ICONS: Record<ProximityLevel, string> = {
  far: '○',
  medium: '◐',
  close: '◑',
  matched: '✓',
}

/**
 * Proximity Feedback Component
 *
 * Shows qualitative feedback text that changes color
 * as the user gets closer to the target.
 */
export function ProximityFeedback({
  level,
  visible = true,
  className,
}: ProximityFeedbackProps) {
  const feedbackText = useMemo(() => getProximityFeedbackText(level), [level])
  const colorClass = LEVEL_COLORS[level]
  const icon = LEVEL_ICONS[level]

  if (!visible) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium transition-colors duration-300',
        colorClass,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-lg" aria-hidden>
        {icon}
      </span>
      <span>{feedbackText}</span>
    </div>
  )
}

/**
 * Challenge Header Component
 *
 * Shows the challenge name and instructions.
 */
interface ChallengeHeaderProps {
  challengeName: string
  className?: string
}

export function ChallengeHeader({ challengeName, className }: ChallengeHeaderProps) {
  return (
    <div className={cn('text-center', className)}>
      <p className="text-xs text-[var(--lab-text-dim)] uppercase tracking-wide mb-1">
        Challenge
      </p>
      <h3 className="text-sm font-medium text-[var(--lab-text)]">
        {challengeName}
      </h3>
      <p className="text-xs text-[var(--lab-text-muted)] mt-1">
        Match the dashed target vector
      </p>
    </div>
  )
}

export default ProximityFeedback
