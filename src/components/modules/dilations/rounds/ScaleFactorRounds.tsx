// src/components/modules/dilations/rounds/ScaleFactorRounds.tsx
import { useCallback, useEffect, useMemo } from 'react'
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { usePredictReveal } from '../hooks/usePredictReveal'
import { PreImageTriangle } from '../components/PreImageTriangle'
import { ImageTriangle } from '../components/ImageTriangle'
import { GhostTriangle } from '../components/GhostTriangle'
import { RevealAnimation } from '../components/RevealAnimation'
import { RayLines } from '../components/RayLines'
import { RatioAnnotations } from '../components/RatioAnnotations'
import { AngleMarks } from '../components/AngleMarks'
import { CANONICAL_TRIANGLE, ROUND_CONFIGS, PREDICTION_TOLERANCE } from '../utils/constants'
import { dilateTriangle } from '../utils/math'
import type { Vec2 } from '../utils/types'

// ─── PredictionRoundScene (dilate-k2, dilate-k3) ─────────────────────────────

function PredictionRoundScene({
  scale,
  roundState,
  dispatch,
}: {
  scale: number
  roundState: string
  dispatch: Dispatch<StageAction>
}) {
  const targetTriangle = useMemo(
    () => dilateTriangle(CANONICAL_TRIANGLE, scale),
    [scale]
  )

  // accuracy from usePredictReveal is intentionally unused here —
  // accuracy feedback (exact/close/miss) is deferred to a future prompt.
  const { placeGhost, commitPrediction } = usePredictReveal(targetTriangle, PREDICTION_TOLERANCE)

  const handleGhostDrop = useCallback((pos: Vec2) => {
    placeGhost(pos)
    commitPrediction()
    dispatch({ type: 'COMMIT_PREDICTION' })
  }, [placeGhost, commitPrediction, dispatch])

  const handleRevealComplete = useCallback(() => {
    dispatch({ type: 'COMPLETE_ROUND' })
  }, [dispatch])

  // Ghost: visible in all states except completion; disabled only during reveal
  const showGhost = roundState !== 'completion'
  const ghostDisabled = roundState === 'reveal'
  const showReveal = roundState === 'reveal'
  const showImage = roundState === 'completion'
  const showRays = roundState === 'completion'

  return (
    <>
      <PreImageTriangle vertices={CANONICAL_TRIANGLE} />
      {showGhost && (
        <GhostTriangle
          vertices={CANONICAL_TRIANGLE}
          scale={scale}
          onDrop={handleGhostDrop}
          disabled={ghostDisabled}
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
        <ImageTriangle vertices={targetTriangle} visible={true} />
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

// ─── PropertiesRoundScene (dilate-k2-properties) ──────────────────────────────

function PropertiesRoundScene({
  roundState,
  dispatch,
}: {
  roundState: string
  dispatch: Dispatch<StageAction>
}) {
  const imageTriangle = useMemo(
    () => dilateTriangle(CANONICAL_TRIANGLE, 2),
    []
  )
  // Memoize to prevent new array reference per render (would invalidate AngleMarks useMemo)
  const triangles = useMemo(
    () => [CANONICAL_TRIANGLE, imageTriangle],
    [imageTriangle]
  )

  // Auto-progress: entry → active after short delay
  useEffect(() => {
    if (roundState !== 'entry') return
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_ROUND_STATE', state: 'active' })
    }, 300)
    return () => clearTimeout(timer)
  }, [roundState, dispatch])

  // Auto-complete: active → completion after annotations animate in (~1.4s total)
  useEffect(() => {
    if (roundState !== 'active') return
    const timer = setTimeout(() => {
      dispatch({ type: 'COMPLETE_ROUND' })
    }, 1400)
    return () => clearTimeout(timer)
  }, [roundState, dispatch])

  const showAnnotations = roundState === 'active' || roundState === 'completion'
  const animating = roundState === 'active'

  return (
    <>
      <PreImageTriangle vertices={CANONICAL_TRIANGLE} />
      <ImageTriangle vertices={imageTriangle} visible={true} />
      {showAnnotations && (
        <>
          <RayLines
            preImage={CANONICAL_TRIANGLE}
            image={imageTriangle}
            visible={true}
            animating={false}
          />
          <RatioAnnotations
            preImage={CANONICAL_TRIANGLE}
            ratio={2}
            visible={true}
            animating={animating}
          />
          <AngleMarks
            triangles={triangles}
            visible={true}
            animating={animating}
          />
        </>
      )}
    </>
  )
}

// ─── ScaleFactorScene ─────────────────────────────────────────────────────────

export function ScaleFactorScene({
  state,
  dispatch,
}: {
  state: StageState
  dispatch: Dispatch<StageAction>
}) {
  const { currentRound, roundState } = state
  const config = ROUND_CONFIGS[currentRound]

  if (currentRound === 'dilate-k2-properties') {
    return <PropertiesRoundScene roundState={roundState} dispatch={dispatch} />
  }

  // Prediction rounds: dilate-k2, dilate-k3
  const scale = config.scaleFactor ?? 2
  return (
    <PredictionRoundScene
      scale={scale}
      roundState={roundState}
      dispatch={dispatch}
    />
  )
}
