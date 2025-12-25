import { Canvas, useThree } from "@react-three/fiber"
import { UnitCircle } from "./UnitCircle"
import { SineWave } from "./SineWave"
import { Connector } from "./Connector"

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
  const getGhostParams = () => {
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
  }

  const ghostParams = getGhostParams()

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
          />
          {/* Target point on circle (ghost) */}
          {showGhost && (
            <UnitCircle
              amplitude={ghostParams.a}
              frequency={ghostParams.f}
              phase={ghostParams.p}
              color="#888888"
              opacity={0.4}
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
              color="#888888"
              opacity={0.4}
            />
          )}
          {/* User wave */}
          <SineWave
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            isPaused={isPaused}
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
        />
        {/* Target point on circle (ghost) - shows where target is rotating */}
        {showGhost && (
          <UnitCircle
            amplitude={ghostParams.a}
            frequency={ghostParams.f}
            phase={ghostParams.p}
            color="#888888"
            opacity={0.4}
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
            color="#888888"
            opacity={0.4}
          />
        )}
        {/* User's wave */}
        <SineWave
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          isPaused={isPaused}
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
      style={{ background: "#0a0a0f" }}
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
