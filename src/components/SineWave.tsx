import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface SineWaveProps {
  amplitude: number
  frequency: number
  phase: number
}

const MAX_POINTS = 200
const WAVE_WIDTH = 4

export function SineWave({ amplitude, frequency, phase }: SineWaveProps) {
  const positionsRef = useRef<Float32Array>(new Float32Array(MAX_POINTS * 3))
  const pointCountRef = useRef(0)

  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.LineBasicMaterial({ color: "#c8e44c" })
    return new THREE.Line(geometry, material)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const y = amplitude * Math.sin(frequency * t + phase)

    const positions = positionsRef.current

    if (pointCountRef.current < MAX_POINTS) {
      const i = pointCountRef.current * 3
      positions[i] = 0
      positions[i + 1] = y
      positions[i + 2] = 0
      pointCountRef.current++
    } else {
      for (let i = 0; i < (MAX_POINTS - 1) * 3; i++) {
        positions[i] = positions[i + 3]
      }
      const lastIdx = (MAX_POINTS - 1) * 3
      positions[lastIdx] = 0
      positions[lastIdx + 1] = y
      positions[lastIdx + 2] = 0
    }

    for (let i = 0; i < pointCountRef.current; i++) {
      const progress = i / (pointCountRef.current - 1)
      positions[i * 3] = progress * WAVE_WIDTH
    }

    if (pointCountRef.current >= 2) {
      line.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions.slice(0, pointCountRef.current * 3), 3)
      )
      line.geometry.attributes.position.needsUpdate = true
      line.geometry.computeBoundingSphere()
    }
  })

  return <primitive object={line} />
}
