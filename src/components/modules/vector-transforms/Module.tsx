/**
 * Vector Transformations Module
 *
 * Interactive linear algebra learning module where users discover how 2×2 matrices
 * geometrically transform vectors through direct manipulation.
 *
 * Learning progression:
 * 1. Free exploration with diagonal sliders only
 * 2. Progressive unlock of off-diagonal entries
 * 3. Challenge mode with target matching
 * 4. Formula reveal with geometric explanations
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Scene } from './Scene'
import { OriginalVector, TransformedVector, TargetVector } from './VectorArrow'
import { MatrixControlPanel } from './MatrixControlPanel'
import { CelebrationPulse } from './CelebrationPulse'
import { DiscoveryBadge } from './DiscoveryBadge'
import { RevealPanel } from './RevealPanel'
import { ExplorePrompt, HintSystem, useIdleNudges } from './IdleNudges'
import { ChallengeMode, useChallengeMode } from './ChallengeMode'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { MatrixPreview } from './MatrixPreview'
import { VECTOR_TRANSFORMS_COPY } from '@/components/modules/vector-transforms/vector-transforms-copy'
import {
  type Matrix2x2,
  type Vector2,
  type TransformationType,
  type ChallengeTarget,
  IDENTITY_MATRIX,
  BASIS_VECTOR,
  transformVector,
  classifyTransformation,
} from './utils'

/**
 * Module props interface
 * Matches the shared ModuleProps interface from config/modules.ts
 */
interface ModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  isVisible?: boolean
}

/**
 * Main Module Component
 *
 * Orchestrates all state and UI for the vector transformations learning experience.
 */
export function Module({ isVisible = true, onComplete: _onComplete }: ModuleProps) {
  // Note: onComplete not used in this module - matches shared interface
  void _onComplete
  // ============= State Management =============

  // Matrix state
  const [matrix, setMatrix] = useState<Matrix2x2>(IDENTITY_MATRIX)

  // Progressive unlock state
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [adjustmentCount, setAdjustmentCount] = useState(0)

  // Discovery tracking
  const [discoveredTypes, setDiscoveredTypes] = useState<Set<TransformationType>>(
    new Set()
  )
  const [currentBadge, setCurrentBadge] = useState<TransformationType | null>(null)

  // Challenge mode
  const {
    isActive: isChallengeMode,
    currentTarget,
    targetVector,
    enterChallenge,
    exitChallenge,
    startNewChallenge,
  } = useChallengeMode()

  // Celebration & reveal state
  const [showCelebration, setShowCelebration] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const [matchedTarget, setMatchedTarget] = useState<ChallengeTarget | null>(null)
  const [matchedMatrix, setMatchedMatrix] = useState<Matrix2x2 | null>(null)

  // Exploration time tracking
  const [explorationTime, setExplorationTime] = useState(0)
  // eslint-disable-next-line react-hooks/purity
  const explorationStartRef = useRef<number>(Date.now())

  // Idle nudges
  const idleNudges = useIdleNudges({
    isChallengeMode,
    adjustmentCount,
    onAutoDemo: () => {
      // Auto-animate a slider to demonstrate cause-effect
      const newMatrix = { ...matrix, a11: matrix.a11 + 0.5 }
      setMatrix(newMatrix)
      setTimeout(() => setMatrix(matrix), 600) // Return to original
    },
  })

  // ============= Computed Values =============

  // Calculate transformed vector
  const transformedVector: Vector2 = transformVector(matrix, BASIS_VECTOR)

  // Get current transformation type
  const transformationType = classifyTransformation(matrix)

  // Compute current stage and progress
  type ModuleStage = 'explore' | 'unlocked' | 'challenge' | 'complete'
  const currentStage: ModuleStage = useMemo(() => {
    if (showReveal) return 'complete'
    if (isChallengeMode) return 'challenge'
    if (isUnlocked) return 'unlocked'
    return 'explore'
  }, [showReveal, isChallengeMode, isUnlocked])

  const stageProgress: Record<ModuleStage, number> = {
    explore: 0.1,
    unlocked: 0.3,
    challenge: 0.6,
    complete: 1.0,
  }
  const currentProgress = stageProgress[currentStage]

  // Note: Proximity level is calculated inside ChallengeMode component

  // ============= Effects =============

  // Track exploration time
  useEffect(() => {
    if (!isChallengeMode && isVisible) {
      const interval = setInterval(() => {
        setExplorationTime(Date.now() - explorationStartRef.current)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isChallengeMode, isVisible])

  // Check for transformation discoveries
  useEffect(() => {
    // Skip during challenge mode or if identity/shearing
    if (isChallengeMode) return
    if (transformationType === 'identity' || transformationType === 'shearing')
      return

    // Check if this is a new discovery
    if (!discoveredTypes.has(transformationType)) {
      setDiscoveredTypes((prev) => new Set([...prev, transformationType]))
      setCurrentBadge(transformationType)
    }
  }, [transformationType, isChallengeMode, discoveredTypes])

  // ============= Handlers =============

  // Handle matrix changes
  const handleMatrixChange = useCallback(
    (newMatrix: Matrix2x2) => {
      setMatrix(newMatrix)
      setAdjustmentCount((prev) => prev + 1)
      idleNudges.recordInteraction()

      if (isChallengeMode) {
        idleNudges.recordChallengeAdjustment()
      }
    },
    [isChallengeMode, idleNudges]
  )

  // Handle matrix reset
  const handleReset = useCallback(() => {
    setMatrix(IDENTITY_MATRIX)
    idleNudges.recordInteraction()
  }, [idleNudges])

  // Handle progressive unlock
  const handleUnlock = useCallback(() => {
    setIsUnlocked(true)
  }, [])

  // Handle challenge match success
  const handleMatchSuccess = useCallback(
    (target: ChallengeTarget, userMatrix: Matrix2x2) => {
      setMatchedTarget(target)
      setMatchedMatrix(userMatrix)
      setShowCelebration(true)

      // Show reveal panel after celebration
      setTimeout(() => {
        setShowCelebration(false)
        setShowReveal(true)
      }, 800)
    },
    []
  )

  // Handle entering challenge mode
  const handleEnterChallenge = useCallback(() => {
    enterChallenge()
    idleNudges.resetChallengeTracking()
  }, [enterChallenge, idleNudges])

  // Handle exiting challenge mode
  const handleExitChallenge = useCallback(() => {
    exitChallenge()
    idleNudges.resetChallengeTracking()
  }, [exitChallenge, idleNudges])

  // Handle "Try Another" from reveal panel
  const handleTryAnother = useCallback(() => {
    setShowReveal(false)
    setMatchedTarget(null)
    setMatchedMatrix(null)
    setMatrix(IDENTITY_MATRIX)
    startNewChallenge()
    idleNudges.resetChallengeTracking()
  }, [startNewChallenge, idleNudges])

  // Handle "Keep Exploring" from reveal panel
  const handleKeepExploring = useCallback(() => {
    setShowReveal(false)
    setMatchedTarget(null)
    setMatchedMatrix(null)
    exitChallenge()
    explorationStartRef.current = Date.now()
    setExplorationTime(0)
  }, [exitChallenge])

  // Dismiss discovery badge
  const handleDismissBadge = useCallback(() => {
    setCurrentBadge(null)
  }, [])

  // ============= Render =============

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row items-center lg:items-start justify-center',
        'gap-6 p-4 lg:p-8 min-h-screen',
        'bg-[var(--lab-bg)]'
      )}
    >
      {/* Main visualization area */}
      <div className="relative flex flex-col items-center gap-4 w-full max-w-[600px]">
        {/* Progress bar */}
        <ProgressBar
          current={currentProgress}
          total={1}
          className="w-full"
        />

        {/* Top prompt */}
        <ExplorePrompt
          text={VECTOR_TRANSFORMS_COPY.stages[currentStage === 'complete' ? 'challenge' : currentStage].prompt}
          subtext={
            currentStage === 'explore'
              ? VECTOR_TRANSFORMS_COPY.stages.explore.subtext
              : currentStage === 'unlocked'
              ? VECTOR_TRANSFORMS_COPY.stages.unlocked.subtext
              : undefined
          }
          visible={!showReveal}
          className="w-full"
        />

        {/* Discovery badge (top-right overlay) */}
        <div className="absolute top-16 right-4 z-20">
          <DiscoveryBadge type={currentBadge} onDismiss={handleDismissBadge} />
        </div>

        {/* Matrix preview (top-right, below discovery badge) */}
        <MatrixPreview
          matrix={matrix}
          discoveredTypes={discoveredTypes}
          currentType={transformationType}
          className="absolute top-28 right-4 z-20"
        />

        {/* Canvas with vectors */}
        <div className="relative w-full">
          <Scene
            matrix={matrix}
            originalVector={BASIS_VECTOR}
            transformedVector={transformedVector}
            stage={isChallengeMode ? 'challenge' : 'explore'}
            challengeTarget={currentTarget}
            isVisible={isVisible}
          >
            {/* Original vector (gray, static) */}
            <OriginalVector />

            {/* Transformed vector (animated) */}
            <TransformedVector end={transformedVector} />

            {/* Target vector (dashed, challenge mode only) */}
            {targetVector && (
              <TargetVector end={targetVector} visible={isChallengeMode} />
            )}

            {/* Celebration pulse */}
            <CelebrationPulse
              active={showCelebration}
              onComplete={() => setShowCelebration(false)}
            />
          </Scene>
        </div>

        {/* Challenge mode UI */}
        <ChallengeMode
          isActive={isChallengeMode}
          matrix={matrix}
          onMatchSuccess={handleMatchSuccess}
          onEnterChallenge={handleEnterChallenge}
          onExitChallenge={handleExitChallenge}
          explorationTime={explorationTime}
        />

        {/* Hint system (challenge mode only) */}
        {isChallengeMode && targetVector && (
          <HintSystem
            available={idleNudges.showChallengeHint}
            currentVector={transformedVector}
            targetVector={targetVector}
          />
        )}
      </div>

      {/* Control panel */}
      <MatrixControlPanel
        matrix={matrix}
        onChange={handleMatrixChange}
        onReset={handleReset}
        onInteraction={idleNudges.recordInteraction}
        isUnlocked={isUnlocked}
        onUnlock={handleUnlock}
        disabled={showReveal}
        className="lg:sticky lg:top-8"
      />

      {/* Reveal panel (modal) */}
      {matchedTarget && matchedMatrix && (
        <RevealPanel
          matrix={matchedMatrix}
          transformationType={matchedTarget.transformationType}
          challengeName={matchedTarget.name}
          isOpen={showReveal}
          onTryAnother={handleTryAnother}
          onKeepExploring={handleKeepExploring}
        />
      )}
    </div>
  )
}

export default Module
