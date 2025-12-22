import { Canvas, useThree } from "@react-three/fiber"
import { UnitCircle } from "./UnitCircle"
import { SineWave } from "./SineWave"
import { Connector } from "./Connector"

interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
  target: { a: number; f: number; p: number }
}

// Layout constants
const CIRCLE_X = -2.5
const WAVE_X = -0.3

function Visualization({ amplitude, frequency, phase, target }: SceneProps) {
  const { viewport } = useThree()

  const isPortrait = viewport.width < viewport.height && viewport.width < 5

  if (isPortrait) {
    const circleX = 0
    const waveX = -1.5

    return (
      <>
        {/* Circle on top */}
        <group position={[circleX, 1.2, 0]} scale={0.9}>
          <UnitCircle amplitude={amplitude} frequency={frequency} phase={phase} />
          {/* Target point on circle (ghost) */}
          <UnitCircle
            amplitude={target.a}
            frequency={target.f}
            phase={target.p}
            color="#888888"
            opacity={0.4}
          />
        </group>

        {/* Waves below */}
        <group position={[waveX, -1.0, 0]} scale={0.8}>
          {/* Target wave (ghost) */}
          <SineWave
            amplitude={target.a}
            frequency={target.f}
            phase={target.p}
            color="#888888"
            opacity={0.4}
          />
          {/* User wave */}
          <SineWave amplitude={amplitude} frequency={frequency} phase={phase} />
        </group>
      </>
    )
  }

  return (
    <>
      {/* Unit circle on the left */}
      <group position={[CIRCLE_X, 0, 0]}>
        <UnitCircle amplitude={amplitude} frequency={frequency} phase={phase} />
        {/* Target point on circle (ghost) - shows where target is rotating */}
        <UnitCircle
          amplitude={target.a}
          frequency={target.f}
          phase={target.p}
          color="#888888"
          opacity={0.4}
        />
      </group>

      {/* Connector line - shows the y-value relationship */}
      <Connector
        circleX={CIRCLE_X}
        waveX={WAVE_X}
        frequency={frequency}
        phase={phase}
        amplitude={amplitude}
      />

      {/* Sine waves on the right */}
      <group position={[WAVE_X, 0, 0]}>
        {/* Target wave (ghost) - what user is trying to match */}
        <SineWave
          amplitude={target.a}
          frequency={target.f}
          phase={target.p}
          color="#888888"
          opacity={0.4}
        />
        {/* User's wave */}
        <SineWave amplitude={amplitude} frequency={frequency} phase={phase} />
      </group>
    </>
  )
}

export function Scene({ amplitude, frequency, phase, target }: SceneProps) {
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
      />
    </Canvas>
  )
}
