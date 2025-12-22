import { Canvas } from "@react-three/fiber"
import { UnitCircle } from "./UnitCircle"
import { SineWave } from "./SineWave"

interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
}

function Visualization({ amplitude, frequency, phase }: SceneProps) {
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
