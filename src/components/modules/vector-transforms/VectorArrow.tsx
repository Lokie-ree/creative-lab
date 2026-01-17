/**
 * Vector Transformations Module - Vector Arrow Component
 *
 * Renders a 2D vector as an arrow with shaft and arrowhead.
 * Supports smooth GSAP animation for position changes.
 */

import { useEffect, useRef, useMemo } from 'react'
import { Line, Cone, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { colors } from '@/lib/colors'
import type { Vector2 } from './utils'

interface VectorArrowProps {
  /** Start point of the vector (usually origin) */
  start?: Vector2
  /** End point of the vector */
  end: Vector2
  /** Color of the vector */
  color?: string
  /** Line width for the shaft */
  strokeWidth?: number
  /** Opacity (0-1) */
  opacity?: number
  /** Whether to animate position changes with GSAP */
  animated?: boolean
  /** Whether to render as dashed line (for target vectors) */
  dashed?: boolean
  /** Optional label to display near the vector tip */
  label?: string
  /** Z-position for layering */
  zPosition?: number
}

/**
 * Arrowhead configuration
 */
const ARROWHEAD_RADIUS = 0.08
const ARROWHEAD_HEIGHT = 0.15
const ARROWHEAD_SEGMENTS = 8

/**
 * Animation configuration
 */
const ANIMATION_DURATION = 0.4
const ANIMATION_EASE = 'power2.out'

/**
 * Calculate the angle of a vector in radians
 */
function getVectorAngle(start: Vector2, end: Vector2): number {
  return Math.atan2(end.y - start.y, end.x - start.x)
}

/**
 * Calculate the length of a vector
 */
function getVectorLength(start: Vector2, end: Vector2): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Vector Arrow Component
 *
 * Renders a vector as a line with an arrowhead.
 * When animated=true, smoothly interpolates to new positions using GSAP.
 */
export function VectorArrow({
  start = { x: 0, y: 0 },
  end,
  color = colors.accent.primary,
  strokeWidth = 3,
  opacity = 1,
  animated = false,
  dashed = false,
  label,
  zPosition = 0,
}: VectorArrowProps) {
  // Animated position refs
  const currentEndRef = useRef({ x: end.x, y: end.y })
  const animatedEndRef = useRef({ x: end.x, y: end.y })

  // Force re-render on animation updates
  const renderKeyRef = useRef(0)

  // Handle animated position changes
  useEffect(() => {
    if (!animated) {
      // Direct update without animation
      currentEndRef.current = { x: end.x, y: end.y }
      animatedEndRef.current = { x: end.x, y: end.y }
      return
    }

    // Kill any existing animation
    gsap.killTweensOf(animatedEndRef.current)

    // Animate to new position
    gsap.to(animatedEndRef.current, {
      x: end.x,
      y: end.y,
      duration: ANIMATION_DURATION,
      ease: ANIMATION_EASE,
      onUpdate: () => {
        currentEndRef.current = { ...animatedEndRef.current }
        renderKeyRef.current++
      },
    })
  }, [end.x, end.y, animated])

  // Use useFrame to sync animation with render loop
  useFrame(() => {
    if (animated) {
      currentEndRef.current = { ...animatedEndRef.current }
    }
  })

  // Get current end position (animated or direct)
  // Reading ref during render is intentional for R3F animation sync
  // eslint-disable-next-line react-hooks/refs
  const currentEnd = animated ? currentEndRef.current : end

  // Calculate angle and length for arrowhead positioning
  const angle = getVectorAngle(start, currentEnd)
  const length = getVectorLength(start, currentEnd)

  // Calculate arrowhead position (slightly before the endpoint)
  const arrowheadOffset = ARROWHEAD_HEIGHT * 0.5
  const arrowheadX =
    currentEnd.x - Math.cos(angle) * arrowheadOffset
  const arrowheadY =
    currentEnd.y - Math.sin(angle) * arrowheadOffset

  // Line points (shaft) - always compute to maintain hooks order
  const linePoints: [number, number, number][] = useMemo(
    () => [
      [start.x, start.y, zPosition],
      [currentEnd.x, currentEnd.y, zPosition],
    ],
    [start.x, start.y, currentEnd.x, currentEnd.y, zPosition]
  )

  // Don't render if vector has no length
  if (length < 0.01) {
    return null
  }

  return (
    <group>
      {/* Vector shaft (line) */}
      <Line
        points={linePoints}
        color={color}
        lineWidth={strokeWidth}
        opacity={opacity}
        transparent
        dashed={dashed}
        dashScale={dashed ? 50 : undefined}
        dashSize={dashed ? 0.1 : undefined}
        gapSize={dashed ? 0.05 : undefined}
      />

      {/* Arrowhead (cone) */}
      <Cone
        args={[ARROWHEAD_RADIUS, ARROWHEAD_HEIGHT, ARROWHEAD_SEGMENTS]}
        position={[arrowheadX, arrowheadY, zPosition]}
        rotation={[0, 0, angle - Math.PI / 2]}
      >
        <meshBasicMaterial
          color={color}
          opacity={opacity}
          transparent
        />
      </Cone>

      {/* Optional label */}
      {label && (
        <Html
          position={[currentEnd.x + 0.25, currentEnd.y + 0.25, zPosition]}
          center
        >
          <span
            className="text-sm font-mono whitespace-nowrap"
            style={{ color, opacity }}
          >
            {label}
          </span>
        </Html>
      )}
    </group>
  )
}

/**
 * Original Vector Component
 *
 * Static gray vector representing the basis vector being transformed.
 * Always displays at (1, 0) to show the original state.
 */
export function OriginalVector() {
  return (
    <VectorArrow
      end={{ x: 1, y: 0 }}
      color={colors.ghost}
      strokeWidth={2}
      opacity={0.6}
      animated={false}
      label="v"
    />
  )
}

/**
 * Transformed Vector Component
 *
 * Animated cyan vector showing the result of the transformation.
 * Smoothly interpolates to new positions as matrix changes.
 */
interface TransformedVectorProps {
  end: Vector2
}

export function TransformedVector({ end }: TransformedVectorProps) {
  return (
    <VectorArrow
      end={end}
      color={colors.accent.primary}
      strokeWidth={3}
      opacity={1}
      animated={true}
      label="T(v)"
    />
  )
}

/**
 * Target Vector Component
 *
 * Dashed ghost vector showing the challenge target.
 * Does not animate - stays fixed at target position.
 */
interface TargetVectorProps {
  end: Vector2
  visible?: boolean
}

export function TargetVector({ end, visible = true }: TargetVectorProps) {
  if (!visible) return null

  return (
    <VectorArrow
      end={end}
      color={colors.accent.primary}
      strokeWidth={2}
      opacity={0.5}
      animated={false}
      dashed={true}
      zPosition={-0.05}
    />
  )
}

export default VectorArrow
