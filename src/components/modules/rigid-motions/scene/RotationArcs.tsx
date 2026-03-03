// src/components/modules/rigid-motions/scene/RotationArcs.tsx
//
// Visible during predict-rotate stage. One arc per pre-image vertex, all centered
// on the GLOBAL ORIGIN (0,0) — not the ghost centroid.
//
// The arcs are origin-fixed. The student's ghost rotation is centroid-local.
// The arcs only align with the ghost vertices when the ghost is at the correct
// target position. This visual reconciliation is the Level 5 pedagogical moment.
//
// Arcs are rendered as polyline approximations (64 segments).
// z: 0.04

import { useMemo } from 'react'
import * as THREE from 'three'

export interface RotationArcsProps {
  preImageVertices: [number, number][]
  degrees: 90 | 180 | 270
  direction: 'cw' | 'ccw'
  visible: boolean
}

const ARC_SEGMENTS = 64

function buildArc(
  vertex: [number, number],
  totalDegrees: number,
  direction: 'cw' | 'ccw',
): THREE.Vector3[] {
  const [x, y] = vertex
  const r = Math.sqrt(x * x + y * y)
  if (r < 0.001) return []

  const startAngle = Math.atan2(y, x)
  const sign = direction === 'cw' ? -1 : 1
  const totalAngle = sign * (totalDegrees * Math.PI / 180)

  const points: THREE.Vector3[] = []
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS
    const angle = startAngle + totalAngle * t
    points.push(new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle), 0.04))
  }
  return points
}

export function RotationArcs({ preImageVertices, degrees, direction, visible }: RotationArcsProps) {
  const arcGeometries = useMemo(() => {
    return preImageVertices.map(v => {
      const pts = buildArc(v, degrees, direction)
      return new THREE.BufferGeometry().setFromPoints(pts)
    })
  }, [preImageVertices, degrees, direction])

  if (!visible) return null

  return (
    <group>
      {arcGeometries.map((geo, i) => (
        // @ts-expect-error — R3F lowercase JSX line
        <line key={i} geometry={geo}>
          <lineDashedMaterial color="#7a746a" transparent opacity={0.6} dashSize={0.2} gapSize={0.12} />
        </line>
      ))}
    </group>
  )
}
