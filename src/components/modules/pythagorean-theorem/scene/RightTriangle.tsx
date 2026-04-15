// src/components/modules/pythagorean-theorem/scene/RightTriangle.tsx
//
// Renders a right triangle with:
//   - Filled mesh (semi-transparent)
//   - Outline (lineLoop)
//   - Right-angle marker at the 90° vertex (index 0 = vertex A)
//   - Vertex labels A, B, C via SpriteLabel
//   - Side-length labels; "?" substituted for the unknown side (Phase 3)

import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { SpriteLabel } from './scene-primitives'
import {
  computeSideLabelPosition,
  computeRightAngleMarker,
} from './scene-geometry'
import { Z } from './scene-layout'
import type { TriangleDef } from '../types'

const VERTEX_LABELS = ['A', 'B', 'C'] as const

// Offset multiplier for vertex labels (pushes label away from triangle interior)
const VERTEX_LABEL_OFFSET = 0.6

// Side-label offset distance from the midpoint (toward the square face)
const SIDE_LABEL_OFFSET = 0.7

interface RightTriangleProps {
  triangle: TriangleDef
  /** Which side is unknown (shows "?" label). undefined = all sides labeled. */
  unknownSide?: 'a' | 'b' | 'c'
  showLabels?: boolean
  /** Set false for non-right triangles (omits right-angle marker) */
  isRight?: boolean
  /**
   * Phase 3: when true, the unknown side label switches from "?" back to the
   * actual value (reveal has completed). Ignored when unknownSide is undefined.
   */
  sideRevealed?: boolean
}

export function RightTriangle({
  triangle,
  unknownSide,
  showLabels = true,
  isRight = true,
  sideRevealed = false,
}: RightTriangleProps) {
  const [vA, vB, vC] = triangle.vertices
  const [sideA, sideB, sideC] = triangle.sides

  // ---------------------------------------------------------------------------
  // Geometry — all created in useMemo, disposed in useEffect cleanup
  // ---------------------------------------------------------------------------

  const fillGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([vA.x, vA.y, 0, vB.x, vB.y, 0, vC.x, vC.y, 0]),
        3,
      ),
    )
    return geo
  }, [vA.x, vA.y, vB.x, vB.y, vC.x, vC.y])

  const outlineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([vA.x, vA.y, 0, vB.x, vB.y, 0, vC.x, vC.y, 0]),
        3,
      ),
    )
    return geo
  }, [vA.x, vA.y, vB.x, vB.y, vC.x, vC.y])

  useEffect(() => {
    return () => {
      fillGeometry.dispose()
      outlineGeometry.dispose()
    }
  }, [fillGeometry, outlineGeometry])

  // ---------------------------------------------------------------------------
  // Right-angle marker geometry
  // ---------------------------------------------------------------------------

  const markerTransform = useMemo(
    () => (isRight ? computeRightAngleMarker([vA, vB, vC], 0) : null),
    [isRight, vA, vB, vC],
  )

  const markerGeometry = useMemo(() => {
    if (!markerTransform) return null
    const s = markerTransform.size
    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        // Small square: 4 corners as a lineLoop
        new Float32Array([
           s / 2,  s / 2, 0,
          -s / 2,  s / 2, 0,
          -s / 2, -s / 2, 0,
           s / 2, -s / 2, 0,
        ]),
        3,
      ),
    )
    return geo
  }, [markerTransform])

  useEffect(() => {
    return () => { markerGeometry?.dispose() }
  }, [markerGeometry])

  // ---------------------------------------------------------------------------
  // Label positions
  // ---------------------------------------------------------------------------

  // Vertex label offsets — push each label away from the triangle centroid
  const centroid = useMemo(() => ({
    x: (vA.x + vB.x + vC.x) / 3,
    y: (vA.y + vB.y + vC.y) / 3,
  }), [vA, vB, vC])

  const vertexLabelPositions = useMemo(() => [vA, vB, vC].map(v => ({
    x: v.x + (v.x - centroid.x) * VERTEX_LABEL_OFFSET,
    y: v.y + (v.y - centroid.y) * VERTEX_LABEL_OFFSET,
  })), [vA, vB, vC, centroid])

  // Side labels — positioned outside the triangle (toward the squares)
  // AB (side a) → square is below → outward='right'
  // AC (side b) → square is left  → outward='left'
  // BC (side c) → square outward  → outward='right'
  const sideLabelPositions = useMemo(() => ({
    a: computeSideLabelPosition(vA, vB, 'right', SIDE_LABEL_OFFSET),
    b: computeSideLabelPosition(vA, vC, 'left',  SIDE_LABEL_OFFSET),
    c: computeSideLabelPosition(vB, vC, 'right', SIDE_LABEL_OFFSET),
  }), [vA, vB, vC])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <group>
      {/* Triangle fill */}
      <mesh geometry={fillGeometry} position={[0, 0, Z.TRIANGLE_FILL]}>
        <meshBasicMaterial
          color="#b8b0a4"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Triangle outline */}
      <lineLoop geometry={outlineGeometry} position={[0, 0, Z.TRIANGLE_OUTLINE]}>
        <lineBasicMaterial color="#b8b0a4" />
      </lineLoop>

      {/* Right-angle marker */}
      {markerTransform && markerGeometry && (
        <lineLoop
          geometry={markerGeometry}
          position={[markerTransform.position.x, markerTransform.position.y, Z.TRIANGLE_OUTLINE]}
          rotation={[0, 0, markerTransform.rotation]}
        >
          <lineBasicMaterial color="#b8b0a4" />
        </lineLoop>
      )}

      {/* Vertex labels */}
      {showLabels && VERTEX_LABELS.map((label, i) => (
        <SpriteLabel
          key={label}
          text={label}
          position={vertexLabelPositions[i]}
          zLayer={Z.AREA_LABEL}
          color="#7a746a"
          planeWidth={0.5}
        />
      ))}

      {/* Side-length labels */}
      {showLabels && (
        <>
          <SpriteLabel
            text={unknownSide === 'a' && !sideRevealed ? '?' : String(sideA)}
            position={sideLabelPositions.a}
            zLayer={Z.AREA_LABEL}
            color={unknownSide === 'a' && !sideRevealed ? '#f5a623' : '#b8b0a4'}
            planeWidth={0.6}
          />
          <SpriteLabel
            text={unknownSide === 'b' && !sideRevealed ? '?' : String(sideB)}
            position={sideLabelPositions.b}
            zLayer={Z.AREA_LABEL}
            color={unknownSide === 'b' && !sideRevealed ? '#f5a623' : '#b8b0a4'}
            planeWidth={0.6}
          />
          <SpriteLabel
            text={unknownSide === 'c' && !sideRevealed ? '?' : String(sideC)}
            position={sideLabelPositions.c}
            zLayer={Z.AREA_LABEL}
            color={unknownSide === 'c' && !sideRevealed ? '#f5a623' : '#b8b0a4'}
            planeWidth={0.6}
          />
        </>
      )}
    </group>
  )
}
