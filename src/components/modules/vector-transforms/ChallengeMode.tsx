/* eslint-disable react-refresh/only-export-components */
/**
 * Vector Transformations Module - Challenge Mode Component
 *
 * Manages the challenge mode state, target selection, and match detection.
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProximityFeedback, ChallengeHeader } from './ProximityFeedback'
import type {
  Matrix2x2,
  ChallengeTarget,
  ProximityLevel,
} from './utils'
import {
  calculateProximity,
  isMatch,
  getProximityLevel,
  getRandomChallenge,
  getChallengeTargetVector,
  transformVector,
  BASIS_VECTOR,
  DEFAULT_MATCH_THRESHOLD,
} from './utils'

/**
 * Time before challenge button appears (ms)
 */
const CHALLENGE_BUTTON_DELAY = 20000 // 20 seconds

interface ChallengeModeProps {
  /** Whether challenge mode is active */
  isActive: boolean
  /** Current transformation matrix */
  matrix: Matrix2x2
  /** Callback when match is successful */
  onMatchSuccess: (target: ChallengeTarget, userMatrix: Matrix2x2) => void
  /** Callback to enter challenge mode */
  onEnterChallenge: () => void
  /** Callback to exit challenge mode */
  onExitChallenge: () => void
  /** Time in exploration mode (for button appearance) */
  explorationTime: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Challenge Mode Manager Component
 *
 * Controls:
 * - "Try a Challenge" button appearance (after 20s exploration)
 * - Target selection and display
 * - Proximity feedback
 * - Match detection
 */
export function ChallengeMode({
  isActive,
  matrix,
  onMatchSuccess,
  onEnterChallenge,
  onExitChallenge,
  explorationTime,
  className,
}: ChallengeModeProps) {
  // Current challenge target
  const [target, setTarget] = useState<ChallengeTarget | null>(null)
  // Completed challenge names (to avoid repeats)
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  // Current proximity level
  const [proximityLevel, setProximityLevel] = useState<ProximityLevel>('far')

  // Calculate target vector position
  const targetVector = target ? getChallengeTargetVector(target) : null

  // Get current transformed vector
  const transformedVector = transformVector(matrix, BASIS_VECTOR)

  // Pick a new challenge target
  const pickNewTarget = useCallback(() => {
    const newTarget = getRandomChallenge(completedChallenges)
    setTarget(newTarget)
    setProximityLevel('far')
  }, [completedChallenges])

  // Initialize challenge when entering challenge mode
  useEffect(() => {
    if (isActive && !target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      pickNewTarget()
    }
  }, [isActive, target, pickNewTarget])

  // Check proximity and detect matches
  useEffect(() => {
    if (!isActive || !target || !targetVector) return

    const proximity = calculateProximity(transformedVector, targetVector)
    const level = getProximityLevel(proximity, DEFAULT_MATCH_THRESHOLD)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProximityLevel(level)

    // Check for match
    if (isMatch(transformedVector, targetVector, DEFAULT_MATCH_THRESHOLD)) {
      // Add to completed challenges
       
      setCompletedChallenges((prev) => [...prev, target.name])
      // Trigger success callback
      onMatchSuccess(target, matrix)
    }
  }, [transformedVector, targetVector, isActive, target, matrix, onMatchSuccess])

  // Should show "Try a Challenge" button?
  const showChallengeButton =
    !isActive && explorationTime >= CHALLENGE_BUTTON_DELAY

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Challenge button (exploration mode) */}
      {showChallengeButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEnterChallenge}
          className="animate-fade-in border-[var(--lab-accent)] text-[var(--lab-accent)] hover:bg-[var(--lab-accent)]/10"
        >
          Try a Challenge
        </Button>
      )}

      {/* Challenge mode UI */}
      {isActive && target && (
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Challenge header */}
          <ChallengeHeader challengeName={target.name} />

          {/* Proximity feedback */}
          <ProximityFeedback level={proximityLevel} visible={true} />

          {/* Exit button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitChallenge}
            className="text-[var(--lab-text-muted)] hover:text-[var(--lab-text)]"
          >
            Exit Challenge
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Hook for managing challenge mode state
 */
export function useChallengeMode() {
  const [isActive, setIsActive] = useState(false)
  const [currentTarget, setCurrentTarget] = useState<ChallengeTarget | null>(
    null
  )
  const [completedTargets, setCompletedTargets] = useState<string[]>([])

  const enterChallenge = useCallback(() => {
    const target = getRandomChallenge(completedTargets)
    setCurrentTarget(target)
    setIsActive(true)
  }, [completedTargets])

  const exitChallenge = useCallback(() => {
    setIsActive(false)
    setCurrentTarget(null)
  }, [])

  const completeChallenge = useCallback(() => {
    if (currentTarget) {
      setCompletedTargets((prev) => [...prev, currentTarget.name])
    }
    exitChallenge()
  }, [currentTarget, exitChallenge])

  const startNewChallenge = useCallback(() => {
    const target = getRandomChallenge(completedTargets)
    setCurrentTarget(target)
    setIsActive(true)
  }, [completedTargets])

  return {
    isActive,
    currentTarget,
    targetVector: currentTarget
      ? getChallengeTargetVector(currentTarget)
      : null,
    enterChallenge,
    exitChallenge,
    completeChallenge,
    startNewChallenge,
  }
}

export default ChallengeMode
