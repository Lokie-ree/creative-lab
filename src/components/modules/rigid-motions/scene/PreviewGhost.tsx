// src/components/modules/rigid-motions/scene/PreviewGhost.tsx
//
// Non-draggable ghost triangle driven by applySequence for the Phase 4 capstone.
// Renders inside the R3F Canvas. Style matches GhostTriangle in RigidMotionsScene.tsx.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PRE_IMAGE_VERTICES, GHOST_VERTEX_LABELS } from '../constants'
import { applySequence, centroidOf } from '../transform-math'
import { vertexLabelOffset } from './scene-math'
import { SpriteLabel, makeTriangleShape } from './scene-primitives'
import type { TransformationParams } from '../types'

export interface PreviewGhostProps {
  sequence: TransformationParams[]
  coordinatesActive: boolean
}

export function PreviewGhost({ sequence, coordinatesActive }: PreviewGhostProps) {
  const verts = useMemo<[number, number][]>(
    () => applySequence(PRE_IMAGE_VERTICES as [number, number][], sequence),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(sequence)]
  )

  const centroid = centroidOf(verts)
  const lineLoopRef = useRef<THREE.LineLoop>(null)

  const { outlineGeometry, shape } = useMemo(() => {
    const pts = [...verts, verts[0]].map(([x, y]) => new THREE.Vector3(x, y, 0.02))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return { outlineGeometry: geo, shape: makeTriangleShape(verts) }
  }, [verts])

  useFrame(() => {
    if (lineLoopRef.current) lineLoopRef.current.computeLineDistances()
  })

  return (
    <group>
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#7cc87c" transparent opacity={0.12} />
      </mesh>
      <lineLoop ref={lineLoopRef} geometry={outlineGeometry}>
        <lineDashedMaterial color="#7cc87c" dashSize={0.3} gapSize={0.18} />
      </lineLoop>
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <SpriteLabel
            key={GHOST_VERTEX_LABELS[idx]}
            text={coordinatesActive ? `${GHOST_VERTEX_LABELS[idx]}(${v[0]},${v[1]})` : GHOST_VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            color="#7cc87c"
            anchorX="center"
            anchorY="middle"
            planeWidth={coordinatesActive ? 1.6 : 0.7}
          />
        )
      })}
    </group>
  )
}
