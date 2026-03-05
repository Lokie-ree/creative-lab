// src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts
import { useState, useCallback } from 'react'
import { GHOST_INITIAL_OFFSET } from '../constants'
import { computeGhostVertices } from '../scene/scene-math'
import { scoreGuess } from '../match-scoring'
import { getRoundsForStage } from '../round-generator'
import { nextGuideState, guideStateToStage, getGuideStateConfig, isCoordinateStage } from '../guide-state'
import type { GuideState, FeedbackState, Round, ReflectionParams } from '../types'

export interface RigidMotionsState {
  // Phase 1 (unchanged)
  ghostOffset: [number, number]
  handleGhostMove: (rawOffset: [number, number]) => void

  // Phase 2
  guideState: GuideState
  feedbackState: FeedbackState
  currentRound: Round
  successCount: number
  flipped: boolean
  rotationDegrees: 90 | 180 | 270
  rotationDirection: 'cw' | 'ccw'
  speedMultiplier: 0.5 | 1 | 2
  coordinatesActive: boolean

  // Actions
  handleCheck: () => void
  handleNext: () => void
  handleReset: () => void
  handleFlip: (flipped: boolean) => void
  handleRotation: (degrees: 90 | 180 | 270, direction: 'cw' | 'ccw') => void
  handleSpeedChange: (speed: 0.5 | 1 | 2) => void
  handleAnimationComplete: () => void
}

function getInitialRound(guideState: GuideState, roundIndex: number): Round {
  const stage = guideStateToStage(guideState) ?? 'translate'
  const rounds = getRoundsForStage(stage)
  return rounds[roundIndex % rounds.length]
}

export function useRigidMotionsState(): RigidMotionsState {
  // Phase 1
  const [ghostOffset, setGhostOffset] = useState<[number, number]>(GHOST_INITIAL_OFFSET)

  // Phase 2 guide progression
  const [guideState, setGuideState] = useState<GuideState>('predict-translate')
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle')
  const [stageSuccessCount, setStageSuccessCount] = useState(0)
  const [stageRoundIndex, setStageRoundIndex] = useState(0)
  const [coordinatesActive, setCoordinatesActive] = useState(false)

  // Phase 2 controls
  const [flipped, setFlipped] = useState(false)
  const [rotationDegrees, setRotationDegrees] = useState<90 | 180 | 270>(90)
  const [rotationDirection, setRotationDirection] = useState<'cw' | 'ccw'>('cw')
  const [speedMultiplier, setSpeedMultiplier] = useState<0.5 | 1 | 2>(1)

  const currentRound = getInitialRound(guideState, stageRoundIndex)

  // -------------------------------------------------------------------------
  // Phase 1 action
  // -------------------------------------------------------------------------

  const handleGhostMove = useCallback((rawOffset: [number, number]) => {
    setGhostOffset(rawOffset)
  }, [])

  // -------------------------------------------------------------------------
  // Phase 2 actions
  // -------------------------------------------------------------------------

  const handleCheck = useCallback(() => {
    const stage = guideStateToStage(guideState)
    if (!stage) return

    const reflectionAxis =
      stage === 'reflect' ? (currentRound.params as ReflectionParams).axis : 'x'

    const ghostVerts = computeGhostVertices(
      ghostOffset,
      guideState,
      flipped,
      rotationDegrees,
      rotationDirection,
      reflectionAxis,
    )

    const result = scoreGuess(
      ghostVerts,
      currentRound.targetVertices,
      stage,
      flipped,
      rotationDegrees,
      rotationDirection,
      currentRound.params,
    )

    setFeedbackState(result)
  }, [guideState, ghostOffset, flipped, rotationDegrees, rotationDirection, currentRound])

  const handleNext = useCallback(() => {
    const newSuccessCount = stageSuccessCount + 1
    const stage = guideStateToStage(guideState) ?? 'translate'
    const roundsInStage = getRoundsForStage(stage).length
    // Read successesRequired from the state machine config — never hardcode
    const stageComplete = newSuccessCount >= getGuideStateConfig(guideState).successesRequired

    if (stageComplete) {
      const next = nextGuideState(guideState)
      if (next) {
        setGuideState(next)
        // Flip coordinatesActive on entering coordinate-reveal or any Phase 3 predict state (never reverts)
        if (next === 'coordinate-reveal' || isCoordinateStage(next)) {
          setCoordinatesActive(true)
        }
        // Phase 3 predict states use round index 1 (harder round per type, seen Phase 2 at index 0)
        // coordinate-reveal resets to 0 (shows rotate-90-cw via guideStateToStage returning 'rotate')
        setStageRoundIndex(isCoordinateStage(next) ? 1 : 0)
      }
      setStageSuccessCount(0)
    } else {
      setStageRoundIndex(prev => (prev + 1) % roundsInStage)
      setStageSuccessCount(newSuccessCount)
    }

    // Reset per-round state
    setGhostOffset(GHOST_INITIAL_OFFSET)
    setFeedbackState('idle')
    setFlipped(false)
    setRotationDegrees(90)
    setRotationDirection('cw')
  }, [guideState, stageSuccessCount])

  const handleReset = useCallback(() => {
    setGhostOffset(GHOST_INITIAL_OFFSET)
    setFeedbackState('idle')
    setFlipped(false)
    setRotationDegrees(90)
    setRotationDirection('cw')
  }, [])

  const handleFlip = useCallback((value: boolean) => {
    setFlipped(value)
  }, [])

  const handleRotation = useCallback((degrees: 90 | 180 | 270, direction: 'cw' | 'ccw') => {
    setRotationDegrees(degrees)
    setRotationDirection(direction)
  }, [])

  const handleSpeedChange = useCallback((speed: 0.5 | 1 | 2) => {
    setSpeedMultiplier(speed)
  }, [])

  const handleAnimationComplete = useCallback(() => {
    // Called by ImageShape when reveal animation ends — feedbackState is already 'match'
    // No additional state change needed; the UI responds to feedbackState
  }, [])

  return {
    ghostOffset,
    handleGhostMove,
    guideState,
    feedbackState,
    currentRound,
    successCount: stageSuccessCount,
    flipped,
    rotationDegrees,
    rotationDirection,
    speedMultiplier,
    coordinatesActive,
    handleCheck,
    handleNext,
    handleReset,
    handleFlip,
    handleRotation,
    handleSpeedChange,
    handleAnimationComplete,
  }
}
