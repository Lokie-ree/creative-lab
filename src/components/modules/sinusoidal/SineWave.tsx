import { useRef, useMemo, useImperativeHandle, forwardRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { colors } from "@/lib/colors"

interface SineWaveProps {
  amplitude: number
  frequency: number
  phase: number
  color?: string
  opacity?: number
  isPaused?: boolean
  showLiveDot?: boolean  // Show dot at current wave position
}

export interface SineWaveRef {
  getCurrentY: () => number
}

const MAX_POINTS = 200
const WAVE_WIDTH = 4

export const SineWave = forwardRef<SineWaveRef, SineWaveProps>(
  function SineWave({
    amplitude,
    frequency,
    phase,
    color = colors.accent.primary,
    opacity = 1,
    isPaused = false,
    showLiveDot = false,
  }, ref) {
    const positionsRef = useRef<Float32Array>(new Float32Array(MAX_POINTS * 3))
    const pointCountRef = useRef(0)
    const currentYRef = useRef(0)
    const dotRef = useRef<THREE.Mesh>(null)

    // Expose current Y value for connector
    useImperativeHandle(ref, () => ({
      getCurrentY: () => currentYRef.current,
    }))

    // Main line
    const line = useMemo(() => {
      const geometry = new THREE.BufferGeometry()
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      })
      return new THREE.Line(geometry, material)
    }, [color, opacity])

    useFrame((state) => {
      // Don't update when paused
      if (isPaused) return

      const t = state.clock.elapsedTime
      const y = amplitude * Math.sin(frequency * t + phase)
      currentYRef.current = y

      // Update live dot position
      if (dotRef.current) {
        dotRef.current.position.y = y
      }

      const positions = positionsRef.current

      if (pointCountRef.current < MAX_POINTS) {
        // Still filling up - add new point at the beginning (index 0)
        // Shift existing points right
        for (let i = pointCountRef.current * 3; i >= 3; i -= 3) {
          positions[i] = positions[i - 3]
          positions[i + 1] = positions[i - 2]
          positions[i + 2] = positions[i - 1]
        }
        positions[0] = 0
        positions[1] = y
        positions[2] = 0
        pointCountRef.current++
      } else {
        // Full - shift all points right, new point at index 0
        for (let i = (MAX_POINTS - 1) * 3; i >= 3; i -= 3) {
          positions[i] = positions[i - 3]
          positions[i + 1] = positions[i - 2]
          positions[i + 2] = positions[i - 1]
        }
        positions[0] = 0
        positions[1] = y
        positions[2] = 0
      }

      // Distribute x positions: live point at x=0, trail extends right
      for (let i = 0; i < pointCountRef.current; i++) {
        const progress = i / (pointCountRef.current - 1)
        positions[i * 3] = progress * WAVE_WIDTH
      }

      if (pointCountRef.current >= 2) {
        const positionData = positions.slice(0, pointCountRef.current * 3)

        // Update main line
        line.geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positionData, 3)
        )
        line.geometry.attributes.position.needsUpdate = true
        line.geometry.computeBoundingSphere()
      }
    })

    return (
      <group>
        <primitive object={line} />
        {/* Live dot at current wave position */}
        {showLiveDot && (
          <mesh ref={dotRef} position={[0, 0, 0]}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )}
      </group>
    )
  }
)
