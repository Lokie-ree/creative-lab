import { useRef, useMemo, useEffect, useImperativeHandle, forwardRef } from "react"
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
  glow?: boolean  // Enable glow effect for match success
  speedMultiplier?: number // Animation speed multiplier
}

export interface SineWaveRef {
  getCurrentY: () => number
}

const MAX_POINTS = 200
const WAVE_WIDTH = 4
const TIME_WINDOW = 4 // Seconds of wave visible in the trail

export const SineWave = forwardRef<SineWaveRef, SineWaveProps>(
  function SineWave({
    amplitude,
    frequency,
    phase,
    color = colors.accent.primary,
    opacity = 1,
    isPaused = false,
    showLiveDot = false,
    glow = false,
    speedMultiplier = 1,
  }, ref) {
    const currentYRef = useRef(0)
    const dotRef = useRef<THREE.Mesh>(null)

    // Expose current Y value for connector
    useImperativeHandle(ref, () => ({
      getCurrentY: () => currentYRef.current,
    }))

    // Create line once — geometry and material are stable
    const line = useMemo(() => {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(MAX_POINTS * 3)
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      })
      return new THREE.Line(geometry, material)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Update material color/opacity without rebuilding geometry
    useEffect(() => {
      const effectiveColor = glow ? colors.learning.primary : color
      const mat = line.material as THREE.LineBasicMaterial
      mat.color.set(effectiveColor)
      mat.opacity = opacity
      mat.needsUpdate = true
    }, [glow, color, opacity, line])

    useFrame((state) => {
      // Don't update when paused
      if (isPaused) return

      const t = state.clock.elapsedTime * speedMultiplier
      const y = amplitude * Math.sin(frequency * t + phase)
      currentYRef.current = y

      // Update live dot position
      if (dotRef.current) {
        dotRef.current.position.y = y
      }

      // Analytical wave: every point computed from current parameters
      const posAttr = line.geometry.attributes.position as THREE.BufferAttribute
      const positions = posAttr.array as Float32Array

      for (let i = 0; i < MAX_POINTS; i++) {
        const progress = i / (MAX_POINTS - 1)
        positions[i * 3] = progress * WAVE_WIDTH
        positions[i * 3 + 1] = amplitude * Math.sin(frequency * (t - progress * TIME_WINDOW) + phase)
        positions[i * 3 + 2] = 0
      }

      posAttr.needsUpdate = true
      line.geometry.computeBoundingSphere()
    })

    const effectiveColor = glow ? colors.learning.primary : color

    return (
      <group>
        <primitive object={line} />
        {/* Live dot at current wave position */}
        {showLiveDot && (
          <mesh ref={dotRef} position={[0, 0, 0]}>
            <circleGeometry args={[glow ? 0.09 : 0.06, 32]} />
            <meshBasicMaterial color={effectiveColor} />
          </mesh>
        )}
      </group>
    )
  }
)
