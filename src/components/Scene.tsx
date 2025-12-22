import { Canvas, useThree } from "@react-three/fiber"
import { UnitCircle } from "./UnitCircle"
import { SineWave } from "./SineWave"

interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
}

function Visualization({ amplitude, frequency, phase }: SceneProps) {
  const { viewport } = useThree()

  const isPortrait = viewport.width < viewport.height && viewport.width < 5

  if (isPortrait) {
    return (
      <>
        {/* Circle on top */}
        <group position={[0, 1.2, 0]} scale={0.9}>
          <UnitCircle amplitude={amplitude} frequency={frequency} phase={phase} />
        </group>

        {/* Wave below */}
        <group position={[-1.5, -1.0, 0]} scale={0.8}>
          <SineWave amplitude={amplitude} frequency={frequency} phase={phase} />
        </group>
      </>
    )
  }

  return (
    <>
      {/* Unit circle on the left */}
      <group position={[-2.5, 0, 0]}>
        <UnitCircle amplitude={amplitude} frequency={frequency} phase={phase} />
      </group>

      {/* Sine wave on the right */}
      <group position={[0, 0, 0]}>
        <SineWave amplitude={amplitude} frequency={frequency} phase={phase} />
      </group>
    </>
  )
}

export function Scene({ amplitude, frequency, phase }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ background: "#0a0a0f" }}
    >
      <Visualization amplitude={amplitude} frequency={frequency} phase={phase} />
    </Canvas>
  )
}
