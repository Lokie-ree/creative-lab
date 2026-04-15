// src/components/modules/pythagorean-theorem/scene/CoordinatePoints.tsx
//
// Two plotted points for Phase 4, with:
//   - Accent-colored dot at each point
//   - "(x, y)" coordinate label next to each dot
//   - Dashed ghost connector line (the hypotenuse-to-be)

import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { SpriteLabel } from './scene-primitives'
import { Z } from './scene-layout'
import type { Vec2 } from '../types'

interface CoordinatePointsProps {
  p1: Vec2
  p2: Vec2
}

/** Build dashed LineSegments geometry between two points in 2D. */
function buildDashedConnector(
  x1: number, y1: number,
  x2: number, y2: number,
  dashSize = 0.25,
  gapSize  = 0.12,
): Float32Array {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len, uy = dy / len
  const pts: number[] = []
  let t = 0
  while (t < len) {
    const t2 = Math.min(t + dashSize, len)
    pts.push(x1 + ux * t,  y1 + uy * t,  0)
    pts.push(x1 + ux * t2, y1 + uy * t2, 0)
    t = t2 + gapSize
  }
  return new Float32Array(pts)
}

export function CoordinatePoints({ p1, p2 }: CoordinatePointsProps) {
  const dotGeo   = useMemo(() => new THREE.CircleGeometry(0.15, 16), [])
  const lineGeo  = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(buildDashedConnector(p1.x, p1.y, p2.x, p2.y), 3),
    )
    return geo
  }, [p1.x, p1.y, p2.x, p2.y])

  useEffect(() => () => {
    dotGeo.dispose()
    lineGeo.dispose()
  }, [dotGeo, lineGeo])

  // Offset labels so they don't overlap the dots
  const p1LabelPos = { x: p1.x - 0.7, y: p1.y - 0.2 }
  const p2LabelPos = { x: p2.x + 0.1, y: p2.y + 0.4 }

  return (
    <group>
      {/* Dashed connector */}
      <lineSegments geometry={lineGeo} position={[0, 0, Z.COORD_DOT - 0.001]}>
        <lineBasicMaterial color="#7a746a" transparent opacity={0.5} />
      </lineSegments>

      {/* Point dots */}
      <mesh geometry={dotGeo} position={[p1.x, p1.y, Z.COORD_DOT]}>
        <meshBasicMaterial color="#7cc87c" />
      </mesh>
      <mesh geometry={dotGeo} position={[p2.x, p2.y, Z.COORD_DOT]}>
        <meshBasicMaterial color="#7cc87c" />
      </mesh>

      {/* Coordinate labels */}
      <SpriteLabel
        text={`(${p1.x}, ${p1.y})`}
        position={p1LabelPos}
        zLayer={Z.COORD_DOT}
        color="#b8b0a4"
        planeWidth={1.2}
      />
      <SpriteLabel
        text={`(${p2.x}, ${p2.y})`}
        position={p2LabelPos}
        zLayer={Z.COORD_DOT}
        color="#b8b0a4"
        planeWidth={1.2}
      />
    </group>
  )
}
