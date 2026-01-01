import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { colors } from "@/lib/colors"

interface ConnectorProps {
  circleX: number  // World X position of circle center
  waveX: number    // World X position of wave start
  frequency: number
  phase: number
  amplitude: number
  isPaused?: boolean
  color?: string   // Custom color for line and dot
  opacity?: number // Opacity for styling (default 0.6 for line)
}

export function Connector({ circleX, waveX, frequency, phase, amplitude, isPaused = false, color = colors.accent.primary, opacity = 0.6 }: ConnectorProps) {
  const lineRef = useRef<THREE.Line>(null)
  const dotRef = useRef<THREE.Mesh>(null)

  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array([0, 0, 0, 1, 0, 0])
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const material = new THREE.LineDashedMaterial({
      color,
      dashSize: 0.1,
      gapSize: 0.05,
      transparent: true,
      opacity,
    })
    const line = new THREE.Line(geometry, material)
    line.computeLineDistances()
    return line
  }, [color, opacity])

  useFrame((state) => {
    // Don't update when paused
    if (isPaused) return

    const t = state.clock.elapsedTime
    const angle = frequency * t + phase
    const y = amplitude * Math.sin(angle)

    // Circle point position (in world coords)
    const circlePointX = circleX + Math.cos(angle)
    const circlePointY = Math.sin(angle)

    // Wave live point position (in world coords)
    const wavePointX = waveX
    const wavePointY = y

    // Update the dashed line
    const positions = line.geometry.attributes.position as THREE.BufferAttribute
    positions.setXYZ(0, circlePointX, circlePointY, 0)
    positions.setXYZ(1, wavePointX, wavePointY, 0)
    positions.needsUpdate = true
    line.computeLineDistances()

    // Update the dot at the wave point (emphasizes the y-value)
    if (dotRef.current) {
      dotRef.current.position.set(wavePointX, wavePointY, 0)
    }
  })

  return (
    <group>
      <primitive object={line} ref={lineRef} />
      {/* Dot at the wave's live point */}
      <mesh ref={dotRef}>
        <circleGeometry args={[0.06, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity + 0.2} />
      </mesh>
    </group>
  )
}
