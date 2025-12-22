import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Line } from "@react-three/drei"
import * as THREE from "three"
import { generateCirclePoints } from "@/lib/utils"

interface UnitCircleProps {
  amplitude: number
  frequency: number
  phase: number
}

export function UnitCircle({ frequency, phase }: UnitCircleProps) {
  const pointRef = useRef<THREE.Mesh>(null)

  const circlePoints = useMemo(() => generateCirclePoints(64), [])

  const radiusLine = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array([0, 0, 0, 1, 0, 0])
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const material = new THREE.LineBasicMaterial({ color: "#c8e44c" })
    return new THREE.Line(geometry, material)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const angle = frequency * t + phase

    const x = Math.cos(angle)
    const y = Math.sin(angle)

    if (pointRef.current) {
      pointRef.current.position.x = x
      pointRef.current.position.y = y
    }

    const positions = radiusLine.geometry.attributes.position as THREE.BufferAttribute
    positions.setXYZ(1, x, y, 0)
    positions.needsUpdate = true
  })

  return (
    <group>
      {/* Circle outline */}
      <Line points={circlePoints} color="#4a5568" lineWidth={1.5} />

      {/* Radius line from center to point */}
      <primitive object={radiusLine} />

      {/* Moving point on circle */}
      <mesh ref={pointRef} position={[1, 0, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#c8e44c" />
      </mesh>

      {/* Center dot */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color="#4a5568" />
      </mesh>
    </group>
  )
}
