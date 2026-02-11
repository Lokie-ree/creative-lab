import { useRef, useMemo, type MutableRefObject } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { colors } from "@/lib/colors"

interface ConnectorProps {
  circleX: number  // World X position of circle center
  waveX: number    // World X position of wave start
  frequency: number
  phase: number
  amplitude: number
  scale?: number   // Scale factor for circle radius (default 1)
  isPaused?: boolean
  color?: string   // Custom color for line and dot
  opacity?: number // Opacity for styling (default 0.6 for line)
  speedMultiplier?: number
  timeRef?: MutableRefObject<number> // Shared animation time
}

export function Connector({ circleX, waveX, frequency, phase, amplitude, scale = 1, isPaused = false, color = colors.accent.primary, opacity = 0.6, speedMultiplier = 1, timeRef }: ConnectorProps) {
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
    // Use shared time if available, otherwise fall back to local calculation
    const t = timeRef ? timeRef.current : (isPaused ? 0 : state.clock.elapsedTime * speedMultiplier)
    if (!timeRef && isPaused) return

    const angle = frequency * t + phase
    const y = amplitude * Math.sin(angle)

    // Circle point position (in world coords, accounting for amplitude and scale)
    // UnitCircle draws at radius=amplitude inside a group with scale=scale
    const circlePointX = circleX + Math.cos(angle) * amplitude * scale
    const circlePointY = Math.sin(angle) * amplitude * scale

    // Wave live point position (in world coords)
    const wavePointX = waveX
    const wavePointY = y

    // Update the dashed line
    const positions = line.geometry.attributes.position as THREE.BufferAttribute
    positions.setXYZ(0, circlePointX, circlePointY, 0)
    positions.setXYZ(1, wavePointX, wavePointY, 0)
    // eslint-disable-next-line react-hooks/immutability -- R3F pattern: updating geometry buffer in animation loop
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
