// src/components/modules/rigid-motions/scene/TranslationVector.tsx
//
// Visible during predict-translate stage. Dashed line from pre-image centroid
// to ghost centroid with arrowhead at ghost end. Updates live as ghost moves.
// Pedagogical purpose: makes the "every point moves by the same vector" invariant visible.
// z: 0.04

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface TranslationVectorProps {
  preImageCentroid: [number, number]
  ghostCentroid: [number, number]
  visible: boolean
}

export function TranslationVector({ preImageCentroid, ghostCentroid, visible }: TranslationVectorProps) {
  const lineRef = useRef<THREE.Line>(null)

  const geometry = useMemo(() => {
    const [x0, y0] = preImageCentroid
    const [x1, y1] = ghostCentroid
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x0, y0, 0.04),
      new THREE.Vector3(x1, y1, 0.04),
    ])
  }, [preImageCentroid, ghostCentroid])

  // LineDashedMaterial requires distances recomputed when geometry changes
  useFrame(() => {
    if (lineRef.current) lineRef.current.computeLineDistances()
  })

  if (!visible) return null

  const [x0, y0] = preImageCentroid
  const [x1, y1] = ghostCentroid
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.sqrt(dx * dx + dy * dy)
  const hasLength = len > 0.1
  // Cone points up by default — rotate so it points along the vector direction
  const angle = Math.atan2(dy, dx) - Math.PI / 2

  return (
    <group>
      {/* @ts-expect-error — R3F lowercase JSX line is valid but TS types lag */}
      <line ref={lineRef} geometry={geometry}>
        <lineDashedMaterial color="#7a746a" transparent opacity={0.6} dashSize={0.25} gapSize={0.15} />
      </line>

      {hasLength && (
        <mesh position={[x1, y1, 0.04]} rotation={[0, 0, angle]}>
          <coneGeometry args={[0.12, 0.3, 8]} />
          <meshBasicMaterial color="#7a746a" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
