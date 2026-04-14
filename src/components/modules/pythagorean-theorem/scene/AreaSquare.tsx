// src/components/modules/pythagorean-theorem/scene/AreaSquare.tsx
//
// A square drawn on one side of the right triangle.
//
// States:
//   'visible'  — fill + unit grid + area label shown
//   'ghosted'  — outline only, no fill, no grid, no label
//   'hidden'   — not rendered
//
// GSAP animation target: `meshRef` (fill mesh) and `labelGroupRef` (area label).
// Parent components trigger reveals by animating opacity via these refs.

import { useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import type { MutableRefObject } from 'react'
import { SpriteLabel } from './scene-primitives'
import { computeSquareTransform, computeUnitGridLines } from './scene-geometry'
import { Z } from './scene-layout'
import type { Vec2 } from '../types'

export type AreaSquareState = 'visible' | 'ghosted' | 'hidden'

export interface AreaSquareRef {
  fillMesh:   MutableRefObject<THREE.Mesh | null>
  gridLines:  MutableRefObject<THREE.LineSegments | null>
}

interface AreaSquareProps {
  vertexA: Vec2
  vertexB: Vec2
  /** 'left' | 'right' — which side of the edge the square extends toward */
  outward: 'left' | 'right'
  /** True mathematical area value (shown as label) */
  area: number
  /** True mathematical side length (used for grid-line count) */
  side: number
  squareState: AreaSquareState
  /** Fill color tint — defaults to --lab-accent (#7cc87c) */
  color?: string
  /**
   * Phase 2 reveal flash: when this flips true, fire a brief GSAP color+opacity
   * pulse on the fill mesh. flashColor determines the peak color (green for
   * right triangle, amber for non-right).
   */
  flashTrigger?: boolean
  flashColor?: string
  /**
   * Phase 3 reveal: when squareState transitions ghosted→visible AND this is
   * true, fade the fill and grid lines in instead of popping instantly.
   */
  fadeInOnReveal?: boolean
}

export const AreaSquare = forwardRef<AreaSquareRef, AreaSquareProps>(
  function AreaSquare(
    { vertexA, vertexB, outward, area, side, squareState, color = '#7cc87c', flashTrigger, flashColor, fadeInOnReveal },
    ref,
  ) {
    const fillMeshRef  = useRef<THREE.Mesh | null>(null)
    const gridLinesRef = useRef<THREE.LineSegments | null>(null)
    // Tracks previous squareState for transition detection
    const prevSquareStateRef = useRef<AreaSquareState>(squareState)

    useImperativeHandle(ref, () => ({
      fillMesh:  fillMeshRef,
      gridLines: gridLinesRef,
    }))

    // ---------------------------------------------------------------------------
    // Phase 2 flash animation — fires when flashTrigger becomes true
    // ---------------------------------------------------------------------------

    useEffect(() => {
      if (!flashTrigger || !fillMeshRef.current) return
      const mat = fillMeshRef.current.material as THREE.MeshBasicMaterial
      const origOpacity = mat.opacity
      const origR = mat.color.r, origG = mat.color.g, origB = mat.color.b
      const fc = new THREE.Color(flashColor ?? '#7cc87c')

      const tl = gsap.timeline()
      // Spike to flash color + higher opacity
      tl.to(mat,       { opacity: 0.45, duration: 0.15, ease: 'power2.out' })
      tl.to(mat.color, { r: fc.r, g: fc.g, b: fc.b, duration: 0.15, ease: 'power2.out' }, '<')
      // Return to original
      tl.to(mat,       { opacity: origOpacity, duration: 0.4, ease: 'power2.in' })
      tl.to(mat.color, { r: origR, g: origG, b: origB, duration: 0.4, ease: 'power2.in' }, '<')

      return () => { tl.kill() }
    }, [flashTrigger, flashColor])

    // ---------------------------------------------------------------------------
    // Phase 3 fade-in — fires when squareState transitions ghosted→visible
    // ---------------------------------------------------------------------------

    useEffect(() => {
      const prev = prevSquareStateRef.current
      prevSquareStateRef.current = squareState

      if (!fadeInOnReveal || squareState !== 'visible' || prev === 'visible') return
      if (!fillMeshRef.current) return

      // Animate fill mesh from transparent to its target opacity
      const mat = fillMeshRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0
      const tween = gsap.to(mat, { opacity: 0.12, duration: 0.7, ease: 'power2.out' })
      return () => { tween.kill() }
    }, [squareState, fadeInOnReveal])

    // ---------------------------------------------------------------------------
    // Square transform (position, rotation, size in world units)
    // ---------------------------------------------------------------------------

    const transform = useMemo(
      () => computeSquareTransform(vertexA, vertexB, outward),
      [vertexA.x, vertexA.y, vertexB.x, vertexB.y, outward],
    )

    // ---------------------------------------------------------------------------
    // Fill geometry — 1×1 plane, scaled by size via mesh.scale
    // ---------------------------------------------------------------------------

    const fillGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

    // ---------------------------------------------------------------------------
    // Outline geometry — lineLoop of 4 corners of a 1×1 square, scaled by size
    // ---------------------------------------------------------------------------

    const outlineGeometry = useMemo(() => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute(
        'position',
        new THREE.BufferAttribute(
          new Float32Array([
             0.5,  0.5, 0,
            -0.5,  0.5, 0,
            -0.5, -0.5, 0,
             0.5, -0.5, 0,
          ]),
          3,
        ),
      )
      return geo
    }, [])

    // ---------------------------------------------------------------------------
    // Unit grid geometry — internal lines in local square space
    // ---------------------------------------------------------------------------

    const gridGeometry = useMemo(() => {
      const pts = computeUnitGridLines(side)
      if (pts.length === 0) return null
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pts, 3))
      return geo
    }, [side])

    useEffect(() => {
      return () => {
        fillGeometry.dispose()
        outlineGeometry.dispose()
        gridGeometry?.dispose()
      }
    }, [fillGeometry, outlineGeometry, gridGeometry])

    if (squareState === 'hidden') return null

    const { position, rotation, size } = transform
    const isVisible = squareState === 'visible'

    return (
      <group
        position={[position.x, position.y, 0]}
        rotation={[0, 0, rotation]}
        scale={[size, size, 1]}
      >
        {/* Fill — semi-transparent, only in 'visible' state */}
        <mesh
          ref={fillMeshRef}
          geometry={fillGeometry}
          position={[0, 0, Z.SQUARE_FILL]}
          visible={isVisible}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outline — always shown (visible or ghosted) */}
        <lineLoop
          geometry={outlineGeometry}
          position={[0, 0, Z.SQUARE_OUTLINE]}
        >
          <lineBasicMaterial
            color={isVisible ? color : '#7a746a'}
            transparent
            opacity={isVisible ? 0.8 : 0.4}
          />
        </lineLoop>

        {/* Unit grid — visible state only */}
        {isVisible && gridGeometry && (
          <lineSegments
            ref={(node: THREE.LineSegments | null) => {
              gridLinesRef.current = node
              // Phase 3 fade-in: animate opacity when grid lines first mount
              if (node && fadeInOnReveal) {
                const mat = node.material as THREE.LineBasicMaterial
                mat.opacity = 0
                gsap.to(mat, { opacity: 0.25, duration: 0.7, ease: 'power2.out', delay: 0.15 })
              }
            }}
            geometry={gridGeometry}
            position={[0, 0, Z.SQUARE_OUTLINE]}
          >
            <lineBasicMaterial color={color} transparent opacity={0.25} />
          </lineSegments>
        )}

        {/* Area label — visible state only; rendered in world space (unscale) */}
        {isVisible && (
          <group scale={[1 / size, 1 / size, 1]}>
            <SpriteLabel
              text={String(area)}
              position={{ x: 0, y: 0 }}
              zLayer={Z.AREA_LABEL}
              color="#b8b0a4"
              planeWidth={Math.max(0.5, size * 0.3)}
            />
          </group>
        )}
      </group>
    )
  },
)
