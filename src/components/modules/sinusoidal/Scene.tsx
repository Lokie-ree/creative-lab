import { useMemo } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { UnitCircle } from "./UnitCircle"
import { SineWave } from "./SineWave"
import { Connector } from "./Connector"
import { calculateMatchScores, scoreToGlowIntensity } from "@/hooks/useMatchScore"
import { colors } from "@/lib/colors"

type Stage = 'observe' | 'amplitude' | 'frequency' | 'phase' | 'challenge' | 'reveal'

interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
  target: { a: number; f: number; p: number }
  stage: Stage
  isPaused: boolean
  onPauseChange: (paused: boolean) => void
  stageTargets?: { amplitude: number; frequency: number; phase: number }
}

// Layout constants
const CIRCLE_X = -2.5
const WAVE_X = -0.3

function Visualization({ amplitude, frequency, phase, target, stage, isPaused, onPauseChange, stageTargets }: SceneProps) {
  const { viewport } = useThree()
  const isPortrait = viewport.width < viewport.height && viewport.width < 5

  // In observe stage, don't show ghost/target waves
  const showGhost = stage !== 'observe'

  // Get ghost wave parameters based on stage
  // Stages 2a-c use stageTargets with defaults for locked params
  // Challenge stage uses the full target
  const ghostParams = useMemo(() => {
    if (stage === 'amplitude' && stageTargets) {
      return { a: stageTargets.amplitude, f: 1, p: 0 }
    }
    if (stage === 'frequency' && stageTargets) {
      return { a: 1, f: stageTargets.frequency, p: 0 }
    }
    if (stage === 'phase' && stageTargets) {
      return { a: 1, f: 1, p: stageTargets.phase }
    }
    return target
  }, [stage, stageTargets, target])

  // Calculate match scores for glow effects
  const matchScores = useMemo(() => {
    return calculateMatchScores(
      { a: amplitude, f: frequency, p: phase },
      ghostParams
    )
  }, [amplitude, frequency, phase, ghostParams])

  // Get the relevant glow intensity based on current stage
  const glowIntensity = useMemo(() => {
    // In observe stage, no glow
    if (stage === 'observe') return 0

    // In parameter stages, use the specific parameter's score
    if (stage === 'amplitude') {
      return scoreToGlowIntensity(matchScores.amplitude)
    }
    if (stage === 'frequency') {
      return scoreToGlowIntensity(matchScores.frequency)
    }
    if (stage === 'phase') {
      return scoreToGlowIntensity(matchScores.phase)
    }

    // In challenge stage, use overall score
    return scoreToGlowIntensity(matchScores.overall)
  }, [stage, matchScores])

  // Ghost wave opacity increases as user gets closer (subtle merge effect)
  const ghostOpacity = useMemo(() => {
    const baseOpacity = 0.4
    // Increase opacity slightly as user approaches (max +0.2)
    return baseOpacity + glowIntensity * 0.2
  }, [glowIntensity])

  if (isPortrait) {
    const circleX = 0
    const waveX = -1.5

    return (
      <>
        {/* Circle on top */}
        <group position={[circleX, 1.2, 0]} scale={0.9}>
          <UnitCircle
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            isPaused={isPaused}
            onPauseChange={onPauseChange}
            draggable={stage === 'observe'}
            glowIntensity={glowIntensity}
          />
          {/* Target point on circle (ghost) */}
          {showGhost && (
            <UnitCircle
              amplitude={ghostParams.a}
              frequency={ghostParams.f}
              phase={ghostParams.p}
              color={colors.ghost}
              opacity={ghostOpacity}
            />
          )}
        </group>

        {/* Waves below */}
        <group position={[waveX, -1.0, 0]} scale={0.8}>
          {/* Target wave (ghost) */}
          {showGhost && (
            <SineWave
              amplitude={ghostParams.a}
              frequency={ghostParams.f}
              phase={ghostParams.p}
              color={colors.ghost}
              opacity={ghostOpacity}
            />
          )}
          {/* User wave */}
          <SineWave
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            isPaused={isPaused}
            glowIntensity={glowIntensity}
          />
        </group>
      </>
    )
  }

  return (
    <>
      {/* Unit circle on the left */}
      <group position={[CIRCLE_X, 0, 0]}>
        <UnitCircle
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          isPaused={isPaused}
          onPauseChange={onPauseChange}
          draggable={stage === 'observe'}
          glowIntensity={glowIntensity}
        />
        {/* Target point on circle (ghost) - shows where target is rotating */}
        {showGhost && (
          <UnitCircle
            amplitude={ghostParams.a}
            frequency={ghostParams.f}
            phase={ghostParams.p}
            color={colors.ghost}
            opacity={ghostOpacity}
          />
        )}
      </group>

      {/* Connector line - shows the y-value relationship */}
      <Connector
        circleX={CIRCLE_X}
        waveX={WAVE_X}
        frequency={frequency}
        phase={phase}
        amplitude={amplitude}
        isPaused={isPaused}
      />

      {/* Sine waves on the right */}
      <group position={[WAVE_X, 0, 0]}>
        {/* Target wave (ghost) - what user is trying to match */}
        {showGhost && (
          <SineWave
            amplitude={ghostParams.a}
            frequency={ghostParams.f}
            phase={ghostParams.p}
            color={colors.ghost}
            opacity={ghostOpacity}
          />
        )}
        {/* User's wave */}
        <SineWave
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          isPaused={isPaused}
          glowIntensity={glowIntensity}
        />
      </group>
    </>
  )
}

export function Scene({ amplitude, frequency, phase, target, stage, isPaused, onPauseChange, stageTargets }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ background: colors.background.primary }}
    >
      <Visualization
        amplitude={amplitude}
        frequency={frequency}
        phase={phase}
        target={target}
        stage={stage}
        isPaused={isPaused}
        onPauseChange={onPauseChange}
        stageTargets={stageTargets}
      />
    </Canvas>
  )
}
