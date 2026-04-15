// src/components/modules/pythagorean-theorem/scene/PythagoreanScene.tsx
//
// R3F Canvas shell for the Pythagorean Theorem module.
// See scene-layout.ts for the full visual specs block.

import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { CameraSetup } from './CameraSetup'
import { computeRoundLayout } from './scene-layout'
import { RightTriangle } from './RightTriangle'
import { AreaSquare } from './AreaSquare'
import { AreaEquation } from './AreaEquation'
import { CoordinateGrid } from './CoordinateGrid'
import { CoordinatePoints } from './CoordinatePoints'
import { ConstructionLines } from './ConstructionLines'
import { DistanceLabel } from './DistanceLabel'
import type { AreaSquareState } from './AreaSquare'
import type { PhaseId, RoundConfig, RoundState, FeedbackState } from '../types'

// ---------------------------------------------------------------------------
// ContextRecovery — handles WebGL context loss/restore + orientation change
// ---------------------------------------------------------------------------

function ContextRecovery({
  onContextLost,
  onContextRestored,
}: {
  onContextLost?: () => void
  onContextRestored?: () => void
}) {
  const { gl } = useThree()
  useEffect(() => {
    const canvas = gl.domElement
    const onLost = (e: Event) => {
      ;(e as WebGLContextEvent).preventDefault()
      onContextLost?.()
    }
    const onRestored = () => {
      gl.setSize(canvas.clientWidth, canvas.clientHeight)
      onContextRestored?.()
    }
    const onOrientationChange = () => {
      requestAnimationFrame(() => {
        gl.setSize(canvas.clientWidth, canvas.clientHeight, false)
      })
    }
    canvas.addEventListener('webglcontextlost',    onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    window.addEventListener('orientationchange',    onOrientationChange)
    return () => {
      canvas.removeEventListener('webglcontextlost',    onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      window.removeEventListener('orientationchange',    onOrientationChange)
    }
  }, [gl, onContextLost, onContextRestored])
  return null
}

// ---------------------------------------------------------------------------
// Scene props — all state-derived values passed from the module orchestrator
// ---------------------------------------------------------------------------

export interface PythagoreanSceneProps {
  // Phase / round identity
  phase: PhaseId
  roundConfig: RoundConfig
  roundState: RoundState
  feedbackState: FeedbackState

  // Visibility flags (one-way)
  formulaVisible: boolean
  converseVisible: boolean
  coordinatesVisible: boolean

  // Phase 4 construction state
  constructionConfirmed: boolean

  // Context recovery callbacks (optional)
  onContextLost?: () => void
  onContextRestored?: () => void
}

// ---------------------------------------------------------------------------
// PythagoreanScene
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SceneContent — rendered inside the Canvas, uses R3F hooks
// ---------------------------------------------------------------------------

interface SceneContentProps {
  phase: PhaseId
  roundConfig: RoundConfig
  roundState: RoundState
  feedbackState: FeedbackState
  formulaVisible: boolean
  converseVisible: boolean
  coordinatesVisible: boolean
  constructionConfirmed: boolean
}

function SceneContent({
  phase,
  roundConfig,
  roundState,
  feedbackState:      _feedbackState,
  formulaVisible:     _formulaVisible,
  converseVisible:    _converseVisible,
  coordinatesVisible: _coordinatesVisible,
  constructionConfirmed,
}: SceneContentProps) {
  const { triangle, unknownSide, type } = roundConfig
  const [vA, vB, vC] = triangle.vertices
  const [sideA, sideB, sideC] = triangle.sides
  const [areaA, areaB, areaC] = triangle.areas

  // Determine square states based on round type and state
  const squareStates = useMemo((): [AreaSquareState, AreaSquareState, AreaSquareState] => {
    if (type === 'properties-pause') {
      // Round 3 of Phase 1: formula reveal pause — all squares visible as backdrop
      return ['visible', 'visible', 'visible']
    }
    if (type === 'predict-area') {
      // Phase 1: leg squares visible, hyp square ghosted until reveal
      const hypState: AreaSquareState =
        roundState === 'reveal' || roundState === 'completion' ? 'visible' : 'ghosted'
      return ['visible', 'visible', hypState]
    }
    if (type === 'converse-predict') {
      // Phase 2: all squares visible for comparison
      return ['visible', 'visible', 'visible']
    }
    if (type === 'solve-side') {
      // Phase 3: unknown square ghosted until reveal
      const revealed = roundState === 'reveal' || roundState === 'completion'
      const a: AreaSquareState = unknownSide === 'a' ? (revealed ? 'visible' : 'ghosted') : 'visible'
      const b: AreaSquareState = unknownSide === 'b' ? (revealed ? 'visible' : 'ghosted') : 'visible'
      const c: AreaSquareState = unknownSide === 'c' ? (revealed ? 'visible' : 'ghosted') : 'visible'
      return [a, b, c]
    }
    // Phase 4: no area squares (coordinate distance uses different visuals)
    if (type === 'coord-distance') return ['hidden', 'hidden', 'hidden']
    return ['visible', 'visible', 'visible']
  }, [type, unknownSide, roundState])

  // Show the area equation once the reveal starts (and keep it through completion)
  const showEquation =
    (roundState === 'reveal' || roundState === 'completion') &&
    phase !== 'coord-distance'

  // Phase 2 flash — fires when roundState enters 'reveal' for converse rounds
  const flashTrigger = phase === 'converse' && roundState === 'reveal'
  const flashColor   = triangle.isRight ? '#7cc87c' : '#f5a623'

  // Phase 3 — which square fades in and when the side label updates
  const sideRevealed = type === 'solve-side' && (roundState === 'reveal' || roundState === 'completion')
  const fadeInA = type === 'solve-side' && unknownSide === 'a'
  const fadeInB = type === 'solve-side' && unknownSide === 'b'
  const fadeInC = type === 'solve-side' && unknownSide === 'c'

  // Equation y-position: below the AB square (which extends -sideA from the baseline)
  const equationY = -sideA - 1.0

  // Hyp square color: ghost tint before reveal, accent after
  const hypColor = squareStates[2] === 'ghosted' ? '#7a746a' : '#7cc87c'

  if (phase === 'coord-distance') {
    const [p1, p2] = roundConfig.coordPoints!
    const showDistance = roundState === 'reveal' || roundState === 'completion'
    return (
      <>
        <CoordinateGrid />
        <CoordinatePoints p1={p1} p2={p2} />
        <ConstructionLines
          p1={p1}
          p2={p2}
          constructionConfirmed={constructionConfirmed}
        />
        {showDistance && (
          <DistanceLabel p1={p1} p2={p2} distance={roundConfig.answer} />
        )}
      </>
    )
  }

  return (
    <>
      <RightTriangle
        triangle={triangle}
        unknownSide={unknownSide}
        showLabels
        isRight={triangle.isRight}
        sideRevealed={sideRevealed}
      />

      {/* Square on side AB (leg a) — extends below, outward='right' */}
      <AreaSquare
        vertexA={vA}
        vertexB={vB}
        outward="right"
        area={areaA}
        side={sideA}
        squareState={squareStates[0]}
        color="#7cc87c"
        flashTrigger={flashTrigger}
        flashColor={flashColor}
        fadeInOnReveal={fadeInA}
      />

      {/* Square on side AC (leg b) — extends left, outward='left' */}
      <AreaSquare
        vertexA={vA}
        vertexB={vC}
        outward="left"
        area={areaB}
        side={sideB}
        squareState={squareStates[1]}
        color="#7cc87c"
        flashTrigger={flashTrigger}
        flashColor={flashColor}
        fadeInOnReveal={fadeInB}
      />

      {/* Square on side BC (hypotenuse) — extends away from origin, outward='right' */}
      <AreaSquare
        vertexA={vB}
        vertexB={vC}
        outward="right"
        area={areaC}
        side={sideC}
        squareState={squareStates[2]}
        color={hypColor}
        flashTrigger={flashTrigger}
        flashColor={flashColor}
        fadeInOnReveal={fadeInC}
      />

      <AreaEquation
        triangle={triangle}
        areasMatch={triangle.isRight}
        yPosition={equationY}
        visible={showEquation}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// PythagoreanScene — Canvas shell
// ---------------------------------------------------------------------------

export function PythagoreanScene({
  phase,
  roundConfig,
  roundState,
  feedbackState,
  formulaVisible,
  converseVisible,
  coordinatesVisible,
  constructionConfirmed,
  onContextLost,
  onContextRestored,
}: PythagoreanSceneProps) {
  const { worldSize, center } = computeRoundLayout(roundConfig)

  return (
    <Canvas
      orthographic
      camera={{ position: [center.x, center.y, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <ContextRecovery
        onContextLost={onContextLost}
        onContextRestored={onContextRestored}
      />
      <CameraSetup
        worldSize={worldSize}
        centerX={center.x}
        centerY={center.y}
      />
      <SceneContent
        phase={phase}
        roundConfig={roundConfig}
        roundState={roundState}
        feedbackState={feedbackState}
        formulaVisible={formulaVisible}
        converseVisible={converseVisible}
        coordinatesVisible={coordinatesVisible}
        constructionConfirmed={constructionConfirmed}
      />
    </Canvas>
  )
}
