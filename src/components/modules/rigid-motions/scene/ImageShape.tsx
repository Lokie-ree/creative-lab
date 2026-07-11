// src/components/modules/rigid-motions/scene/ImageShape.tsx
//
// The confirmed image after a successful CHECK. Animates from pre-image vertices
// to target via interpolateReveal (GSAP-driven, t 0→1). Ghost remains visible
// during animation so the student sees prediction vs reveal simultaneously.
//
// Rendered in #7cc87c (lab-accent) at full opacity, solid outline. z: 0.02

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { interpolateReveal } from '../animations'
import type { TransformationType, TransformationParams } from '../types'
import { SpriteLabel } from './scene-primitives'
import { vertexLabelOffset, formatVertexCoord } from './scene-math'
import { centroidOf } from '../transform-math'

export interface ImageShapeProps {
  vertices: [number, number][]
  animateFrom: [number, number][]
  type: TransformationType
  params: TransformationParams
  onAnimationComplete: () => void
  coordinatesActive: boolean
}

// Build a BufferGeometry triangle (3 verts, indexed)
function makeTriGeo(verts: [number, number][], z: number): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array([
    verts[0][0], verts[0][1], z,
    verts[1][0], verts[1][1], z,
    verts[2][0], verts[2][1], z,
  ])
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setIndex([0, 1, 2])
  return geo
}

function updateTriGeo(geo: THREE.BufferGeometry, verts: [number, number][], z: number) {
  const attr = geo.attributes.position as THREE.BufferAttribute
  attr.setXYZ(0, verts[0][0], verts[0][1], z)
  attr.setXYZ(1, verts[1][0], verts[1][1], z)
  attr.setXYZ(2, verts[2][0], verts[2][1], z)
  attr.needsUpdate = true
}

// Build a BufferGeometry polyline for lineLoop (4 points: v0 v1 v2 v0-close)
function makePolylineGeo(verts: [number, number][], z: number): THREE.BufferGeometry {
  const pts = [...verts, verts[0]]
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(pts.length * 3)
  pts.forEach(([x, y], i) => { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z })
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return geo
}

function updatePolylineGeo(geo: THREE.BufferGeometry, verts: [number, number][], z: number) {
  const attr = geo.attributes.position as THREE.BufferAttribute
  const pts = [...verts, verts[0]]
  pts.forEach(([x, y], i) => attr.setXYZ(i, x, y, z))
  attr.needsUpdate = true
}

export function ImageShape({
  vertices,
  animateFrom,
  type,
  params,
  onAnimationComplete,
  coordinatesActive,
}: ImageShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const outlineRef = useRef<THREE.LineLoop>(null)
  const vertsRef = useRef<[number, number][]>([...animateFrom])
  const tRef = useRef({ t: 0 })
  const [labelsDone, setLabelsDone] = useState(false)

  // Geometry objects live outside React rendering — updated imperatively in useFrame
  const fillGeo = useRef(makeTriGeo(animateFrom, 0.01))
  const outlineGeo = useRef(makePolylineGeo(animateFrom, 0.02))

  // Attach geometry to mesh refs immediately after mount
  useEffect(() => {
    if (meshRef.current) meshRef.current.geometry = fillGeo.current
    if (outlineRef.current) outlineRef.current.geometry = outlineGeo.current
    return () => {
      fillGeo.current.dispose()
      outlineGeo.current.dispose()
    }
  }, [])

  // GSAP animation — runs once on mount
  useEffect(() => {
    vertsRef.current = [...animateFrom]
    tRef.current.t = 0
    const tl = gsap.timeline({
      onComplete: () => {
        onAnimationComplete()
        setLabelsDone(true)
      },
    })
    tl.to(tRef.current, {
      t: 1,
      duration: 0.6,
      ease: 'power2.inOut',
      onUpdate() {
        vertsRef.current = interpolateReveal(animateFrom, vertices, tRef.current.t, type, params)
      },
    })
    return () => { tl.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- animateFrom and vertices are stable on mount; animation fires once per ImageShape instance
  }, [])

  // Sync buffer attributes every frame during animation
  useFrame(() => {
    updateTriGeo(fillGeo.current, vertsRef.current, 0.01)
    updatePolylineGeo(outlineGeo.current, vertsRef.current, 0.02)
  })

  const IMAGE_VERTEX_LABELS = ['A′', 'B′', 'C′'] as const

  return (
    <group>
      {/* Fill — geometry managed imperatively via fillGeo ref */}
      <mesh ref={meshRef}>
        <meshBasicMaterial color="#7cc87c" transparent opacity={0.18} />
      </mesh>

      {/* Outline — geometry managed imperatively via outlineGeo ref */}
      <lineLoop ref={outlineRef}>
        <lineBasicMaterial color="#7cc87c" />
      </lineLoop>

      {labelsDone && (() => {
        const centroid = centroidOf(vertices)
        return vertices.map((v, idx) => {
          const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
          return (
            <SpriteLabel
              key={IMAGE_VERTEX_LABELS[idx]}
              text={IMAGE_VERTEX_LABELS[idx]}
              position={[lx, ly, 0.03]}
              color="#7cc87c"
              anchorX="center"
              anchorY="middle"
              planeWidth={0.55}
            />
          )
        })
      })()}
      {labelsDone && coordinatesActive && (() => {
        const centroid = centroidOf(vertices)
        return vertices.map((v, idx) => {
          const [lx, ly] = vertexLabelOffset(v, centroid, 0.95)
          return (
            <SpriteLabel
              key={`${IMAGE_VERTEX_LABELS[idx]}-coord`}
              text={formatVertexCoord(v)}
              position={[lx, ly, 0.03]}
              color="#96e496"
              anchorX="center"
              anchorY="middle"
              planeWidth={0.85}
            />
          )
        })
      })()}
    </group>
  )
}
