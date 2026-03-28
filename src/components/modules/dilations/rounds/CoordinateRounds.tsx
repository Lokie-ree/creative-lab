// src/components/modules/dilations/rounds/CoordinateRounds.tsx
//
// Phase 2: Coordinate rounds — coord-k2, coord-k-half, coord-k-third
// Duplicates PredictionRoundScene from ScaleFactorRounds.tsx.
// Inline coordinate labels suppressed — values live in CoordinateReadout (formula strip).

import { useCallback, useMemo } from 'react'
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { usePredictReveal } from '../hooks/usePredictReveal'
import { PreImageTriangle } from '../components/PreImageTriangle'
import { ImageTriangle } from '../components/ImageTriangle'
import { GhostTriangle } from '../components/GhostTriangle'
import { RevealAnimation } from '../components/RevealAnimation'
import { RayLines } from '../components/RayLines'
import { CANONICAL_TRIANGLE, ROUND_CONFIGS, PREDICTION_TOLERANCE } from '../utils/constants'
import { dilateTriangle } from '../utils/math'
import type { Vec2 } from '../utils/types'

function CoordinatePredictionScene({
  scale,
  roundState,
  dispatch,
  ghostExternalPosition,
  onGhostPositionChange,
}: {
  scale: number
  roundState: string
  dispatch: Dispatch<StageAction>
  ghostExternalPosition?: { x: number; y: number } | null
  onGhostPositionChange?: (pos: { x: number; y: number }) => void
}) {
  const targetTriangle = useMemo(
    () => dilateTriangle(CANONICAL_TRIANGLE, scale),
    [scale]
  )

  // Same callback pattern as ScaleFactorRounds.tsx PredictionRoundScene:
  // placeGhost + commitPrediction update usePredictReveal internal state,
  // dispatch COMMIT_PREDICTION transitions module-level roundState active → prediction.
  const { placeGhost, commitPrediction } = usePredictReveal(targetTriangle, PREDICTION_TOLERANCE)

  const handleGhostDrop = useCallback((pos: Vec2) => {
    placeGhost(pos)
    commitPrediction()
    dispatch({ type: 'COMMIT_PREDICTION' })
  }, [placeGhost, commitPrediction, dispatch])

  const handleRevealComplete = useCallback(() => {
    dispatch({ type: 'COMPLETE_ROUND' })
  }, [dispatch])

  const showGhost = roundState !== 'completion'
  const ghostDisabled = roundState === 'reveal'
  const showReveal = roundState === 'reveal'
  const showImage = roundState === 'completion'
  const showRays = roundState === 'completion'

  return (
    <>
      <PreImageTriangle vertices={CANONICAL_TRIANGLE} suppressInlineCoords />
      {showGhost && (
        <GhostTriangle
          vertices={CANONICAL_TRIANGLE}
          scale={scale}
          onDrop={handleGhostDrop}
          disabled={ghostDisabled}
          externalPosition={ghostExternalPosition}
          onPositionChange={onGhostPositionChange}
        />
      )}
      {showReveal && (
        <RevealAnimation
          targetTriangle={targetTriangle}
          onComplete={handleRevealComplete}
          showRays={true}
          rayOrigin={{ x: 0, y: 0 }}
        />
      )}
      {showImage && (
        <ImageTriangle vertices={targetTriangle} visible={true} suppressInlineCoords />
      )}
      {showRays && (
        <RayLines
          preImage={CANONICAL_TRIANGLE}
          image={targetTriangle}
          visible={true}
          animating={false}
        />
      )}
    </>
  )
}

export function CoordinateScene({
  state,
  dispatch,
  ghostExternalPosition,
  onGhostPositionChange,
}: {
  state: StageState
  dispatch: Dispatch<StageAction>
  ghostExternalPosition?: { x: number; y: number } | null
  onGhostPositionChange?: (pos: { x: number; y: number }) => void
}) {
  const { currentRound, roundState } = state
  const config = ROUND_CONFIGS[currentRound]
  const scale = config.scaleFactor ?? 2

  return (
    <CoordinatePredictionScene
      scale={scale}
      roundState={roundState}
      dispatch={dispatch}
      ghostExternalPosition={ghostExternalPosition}
      onGhostPositionChange={onGhostPositionChange}
    />
  )
}
