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
  const showGhost = roundState !== 'completion' && roundState !== 'entry'
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

  // Auto-complete: active → completion after annotations animate in (~1.4s total)
  // Student initiates active state by pressing CONTINUE (no auto-advance from entry)
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

// ─── DilationSummaryScene (dilate-summary) ────────────────────────────────────

const SUMMARY_SCALE_FACTORS = [2, 3, 0.5] as const

function DilationSummaryScene({
  roundState,
  dispatch,
}: {
  roundState: string
  dispatch: Dispatch<StageAction>
}) {
  const images = useMemo(
    () => SUMMARY_SCALE_FACTORS.map(k => dilateTriangle(CANONICAL_TRIANGLE, k)),
    [],
  )

  // auto-complete: active → completion after images finish appearing (~600ms)
  useEffect(() => {
    if (roundState !== 'active') return
    const timer = setTimeout(() => {
      dispatch({ type: 'COMPLETE_ROUND' })
    }, 600)
    return () => clearTimeout(timer)
  }, [roundState, dispatch])

  const showImages = roundState === 'active' || roundState === 'completion'

  return (
    <>
      <PreImageTriangle vertices={CANONICAL_TRIANGLE} />
      {showImages && images.map((img, i) => (
        <ImageTriangle
          key={i}
          vertices={img}
          visible={true}
          opacity={0.25}
        />
      ))}
    </>
  )
}

// ─── ScaleFactorScene ─────────────────────────────────────────────────────────

export function ScaleFactorScene({
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

  if (currentRound === 'dilate-k2-properties') {
    return <PropertiesRoundScene roundState={roundState} dispatch={dispatch} />
  }

  if (currentRound === 'dilate-summary') {
    return <DilationSummaryScene roundState={roundState} dispatch={dispatch} />
  }

  // Prediction rounds: dilate-k2, dilate-k3, dilate-k-half
  // All use the same PredictionRoundScene parameterized by scale
  const scale = config.scaleFactor ?? 2
  return (
    <PredictionRoundScene
      scale={scale}
      roundState={roundState}
      dispatch={dispatch}
      ghostExternalPosition={ghostExternalPosition}
      onGhostPositionChange={onGhostPositionChange}
    />
  )
}
