/**
 * Vector Transformations Module - Scene Component
 *
 * Main R3F Canvas container with orthographic camera for 2D vector visualization.
 * Renders coordinate grid and vector components.
 */

import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { colors } from '@/lib/colors'
import { CoordinateGrid, CoordinateLabels } from './CoordinateGrid'
import type { Vector2, Matrix2x2, Stage, ChallengeTarget } from './utils'

/**
 * Scene configuration constants
 */
const GRID_RANGE = 3 // -3 to +3 on both axes
const CAMERA_ZOOM = 90 // Zoom level for orthographic camera
const CAMERA_POSITION: [number, number, number] = [0, 0, 10]

interface SceneProps {
  /** Current transformation matrix */
  matrix: Matrix2x2
  /** Original vector (basis vector) */
  originalVector: Vector2
  /** Transformed vector (result of matrix × original) */
  transformedVector: Vector2
  /** Current learning stage */
  stage: Stage
  /** Active challenge target (if in challenge mode) */
  challengeTarget?: ChallengeTarget | null
  /** Whether the module is visible (for conditional rendering) */
  isVisible?: boolean
  /** Children components (vectors, overlays) */
  children?: React.ReactNode
}

/**
 * Viewport-aware visualization wrapper
 * Adjusts layout based on screen aspect ratio
 */
function Visualization({
  children,
}: {
  children?: React.ReactNode
}) {
  const { viewport } = useThree()
  const isPortrait = viewport.width < viewport.height && viewport.width < 5

  // Scale factor for mobile/portrait layouts
  const scale = isPortrait ? 0.85 : 1

  return (
    <group scale={scale}>
      {/* Coordinate grid - always visible as spatial reference */}
      <CoordinateGrid range={GRID_RANGE} />

      {/* Vector components and other children */}
      {children}
    </group>
  )
}

/**
 * Scene Component
 *
 * Sets up the R3F Canvas with:
 * - Orthographic camera (no perspective distortion)
 * - Coordinate grid
 * - Vector visualization components
 *
 * Uses conditional rendering based on isVisible to prevent WebGL context conflicts.
 */
export function Scene({
  isVisible = true,
  children,
}: SceneProps) {
  // Don't render Canvas if not visible (prevents WebGL conflicts)
  if (!isVisible) {
    return null
  }

  return (
    <div className="relative w-full aspect-square max-w-[600px]">
      <Canvas
        dpr={[1, 2]}
        style={{ background: colors.background.primary }}
        gl={{ antialias: true }}
      >
        {/* Orthographic camera for 2D visualization */}
        <OrthographicCamera
          makeDefault
          position={CAMERA_POSITION}
          zoom={CAMERA_ZOOM}
          near={0.1}
          far={1000}
        />

        {/* Visualization content */}
        <Visualization>
          {children}
        </Visualization>
      </Canvas>

      {/* HTML overlay for crisp coordinate labels */}
      <CoordinateLabels range={GRID_RANGE} />
    </div>
  )
}

export default Scene
