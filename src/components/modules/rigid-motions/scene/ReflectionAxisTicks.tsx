// src/components/modules/rigid-motions/scene/ReflectionAxisTicks.tsx
//
// Visible during predict-reflect stage. For each vertex pair, renders a dashed
// perpendicular line from the vertex to the reflection axis.
//
// Color state:
//   neutral (#7a746a) — pairs are not equidistant
//   green   (#7cc87c) — all three pairs are equidistant within 0.1 units
//
// This component is the feedback mechanism for the FLIP model — the student
// knows position + orientation are correct when all tick pairs turn green.
// z: 0.04

import { useMemo } from 'react'
import * as THREE from 'three'

export interface ReflectionAxisTicksProps {
  axis: 'x' | 'y'
  preImageVertices: [number, number][]
  ghostVertices: [number, number][]
  visible: boolean
}

const EQUIDISTANT_THRESHOLD = 0.1

function distToAxis(v: [number, number], axis: 'x' | 'y'): number {
  return axis === 'y' ? Math.abs(v[0]) : Math.abs(v[1])
}

function footOnAxis(v: [number, number], axis: 'x' | 'y'): [number, number] {
  return axis === 'y' ? [0, v[1]] : [v[0], 0]
}

export function ReflectionAxisTicks({ axis, preImageVertices, ghostVertices, visible }: ReflectionAxisTicksProps) {
  const allEquidistant = useMemo(() => {
    return preImageVertices.every((pv, i) => {
      const gv = ghostVertices[i]
      return Math.abs(distToAxis(pv, axis) - distToAxis(gv, axis)) < EQUIDISTANT_THRESHOLD
    })
  }, [axis, preImageVertices, ghostVertices])

  const color = allEquidistant ? '#7cc87c' : '#7a746a'

  const tickGeometries = useMemo(() => {
    return preImageVertices.map((pv, i) => {
      const gv = ghostVertices[i]
      const pvFoot = footOnAxis(pv, axis)
      const gvFoot = footOnAxis(gv, axis)

      const preImageGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pv[0], pv[1], 0.04),
        new THREE.Vector3(pvFoot[0], pvFoot[1], 0.04),
      ])
      const ghostGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(gv[0], gv[1], 0.04),
        new THREE.Vector3(gvFoot[0], gvFoot[1], 0.04),
      ])
      return { preImageGeo, ghostGeo }
    })
  }, [axis, preImageVertices, ghostVertices])

  if (!visible) return null

  return (
    <group>
      {tickGeometries.map(({ preImageGeo, ghostGeo }, i) => (
        <group key={i}>
          {/* @ts-expect-error — R3F lowercase JSX line */}
          <line geometry={preImageGeo}>
            <lineDashedMaterial color={color} dashSize={0.15} gapSize={0.1} transparent opacity={0.7} />
          </line>
          {/* @ts-expect-error — R3F lowercase JSX line */}
          <line geometry={ghostGeo}>
            <lineDashedMaterial color={color} dashSize={0.15} gapSize={0.1} transparent opacity={0.7} />
          </line>
        </group>
      ))}
    </group>
  )
}
