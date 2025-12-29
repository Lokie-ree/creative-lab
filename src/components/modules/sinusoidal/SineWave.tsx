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
  glowIntensity?: number  // 0-1, controls glow brightness
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
    glowIntensity = 0,
  }, ref) {
    const positionsRef = useRef<Float32Array>(new Float32Array(MAX_POINTS * 3))
    const pointCountRef = useRef(0)
    const currentYRef = useRef(0)

    // Expose current Y value for connector
    useImperativeHandle(ref, () => ({
      getCurrentY: () => currentYRef.current,
    }))

    // Calculate dynamic color based on glow intensity
    const dynamicColor = useMemo(() => {
      if (glowIntensity <= 0) return color
      // Lerp from base color toward a brighter version
      const baseColor = new THREE.Color(color)
      // Make it brighter by increasing lightness
      const hsl = { h: 0, s: 0, l: 0 }
      baseColor.getHSL(hsl)
      // Increase lightness based on intensity (max +30%)
      hsl.l = Math.min(1, hsl.l + glowIntensity * 0.3)
      baseColor.setHSL(hsl.h, hsl.s, hsl.l)
      return `#${baseColor.getHexString()}`
    }, [color, glowIntensity])

    // Main line
    const line = useMemo(() => {
      const geometry = new THREE.BufferGeometry()
      const material = new THREE.LineBasicMaterial({
        color: dynamicColor,
        transparent: true,
        opacity,
      })
      return new THREE.Line(geometry, material)
    }, [dynamicColor, opacity])

    // Glow halo line (thicker, more transparent, behind main line)
    const glowLine = useMemo(() => {
      const geometry = new THREE.BufferGeometry()
      const material = new THREE.LineBasicMaterial({
        color: dynamicColor,
        transparent: true,
        opacity: glowIntensity * 0.4 * opacity,  // Fade in with intensity
      })
      return new THREE.Line(geometry, material)
    }, [dynamicColor, glowIntensity, opacity])

    useFrame((state) => {
      // Don't update when paused
      if (isPaused) return

      const t = state.clock.elapsedTime
      const y = amplitude * Math.sin(frequency * t + phase)
      currentYRef.current = y

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

        // Update glow line with same geometry (slightly offset back)
        if (glowIntensity > 0) {
          glowLine.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positionData.slice(), 3)
          )
          glowLine.geometry.attributes.position.needsUpdate = true
          glowLine.geometry.computeBoundingSphere()
        }
      }
    })

    return (
      <group>
        {/* Glow halo behind main line */}
        {glowIntensity > 0 && (
          <primitive object={glowLine} position={[0, 0, -0.01]} />
        )}
        {/* Main wave line */}
        <primitive object={line} />
      </group>
    )
  }
)
