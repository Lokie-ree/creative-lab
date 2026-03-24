// src/components/modules/dilations/components/RevealAnimation.tsx
//
// GSAP-driven reveal animation for the image triangle in the Dilations module.
// Follows the M1 ImageShape.tsx imperative pattern:
//   - Geometry lives in useRef (not JSX)
//   - Attached to scene objects in useEffect via mesh.geometry = geo.current
//   - useFrame reads refs and updates material opacity / buffer attributes imperatively
//   - GSAP timeline with { onComplete }, tl.kill() in cleanup
//
// NOTE: Ray lines use <primitive object={...}> to avoid the JSX <line> ambiguity
// between SVG and Three.js in React's DOM types.

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import type { Triangle, Vec2 } from '../utils/types'

const RAY_COLOR = '#8a847a'  // lab text-muted
const IMAGE_COLOR = '#7cc87c'

export interface RevealAnimationProps {
  targetTriangle: Triangle
  onComplete: () => void
  showRays?: boolean
  rayOrigin?: Vec2
}

export function RevealAnimation({
  targetTriangle,
  onComplete,
  showRays = false,
  rayOrigin = { x: 0, y: 0 },
}: RevealAnimationProps) {
  const { a, b, c } = targetTriangle
  const vertices = [a, b, c] as const

  // Imperative refs — geometry lives here, not in JSX (M1 ImageShape pattern)
  const meshRef = useRef<THREE.Mesh>(null)
  const outlineRef = useRef<THREE.LineLoop>(null)
  const fillGeoRef = useRef<THREE.ShapeGeometry | null>(null)
  const outlineGeo = useRef(new THREE.BufferGeometry())
  const rayGeos = useRef([
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
  ])
  const opacityRef = useRef({ v: 0 })
  const rayT = useRef({ t: 0 })

  // Pre-build THREE.Line objects for rays — avoids JSX <line> / SVG name collision
  const rayLines = useMemo(() => {
    if (!showRays) return []
    return [0, 1, 2].map(() => {
      const mat = new THREE.LineDashedMaterial({
        color: RAY_COLOR,
        dashSize: 0.15,
        gapSize: 0.1,
        transparent: true,
      })
      const line = new THREE.Line(new THREE.BufferGeometry(), mat)
      line.position.z = 0.03
      return line
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRays])

  // Build geometries and attach to scene objects on mount
  useEffect(() => {
    // Triangle fill — create ShapeGeometry and store for cleanup
    const shape = new THREE.Shape()
    shape.moveTo(a.x, a.y)
    shape.lineTo(b.x, b.y)
    shape.lineTo(c.x, c.y)
    shape.closePath()
    const fillGeo = new THREE.ShapeGeometry(shape)
    fillGeoRef.current = fillGeo
    if (meshRef.current) meshRef.current.geometry = fillGeo

    // Outline (3 pts — lineLoop closes automatically; ref needed for useFrame opacity mutation)
    const outlinePts = [
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(c.x, c.y, 0),
    ]
    outlineGeo.current.setFromPoints(outlinePts)
    if (outlineRef.current) outlineRef.current.geometry = outlineGeo.current

    // Ray geometries — 2 pts each (origin → endpoint, endpoint starts at origin)
    vertices.forEach((_v, i) => {
      const pts = [
        new THREE.Vector3(rayOrigin.x, rayOrigin.y, 0),
        new THREE.Vector3(rayOrigin.x, rayOrigin.y, 0),
      ]
      rayGeos.current[i].setFromPoints(pts)
      if (rayLines[i]) rayLines[i].geometry = rayGeos.current[i]
    })

    // Cleanup: dispose all geometries on unmount
    return () => {
      if (fillGeoRef.current) fillGeoRef.current.dispose()
      outlineGeo.current.dispose()
      rayGeos.current.forEach(g => g.dispose())
      // Dispose ray line materials
      rayLines.forEach(line => {
        if (line.material) {
          if (Array.isArray(line.material)) {
            line.material.forEach(m => m.dispose())
          } else {
            line.material.dispose()
          }
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useFrame: write opacity + ray endpoints to GPU each frame
  useFrame(() => {
    if (meshRef.current) {
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacityRef.current.v
    }
    if (outlineRef.current) {
      ;(outlineRef.current.material as THREE.LineBasicMaterial).opacity = opacityRef.current.v
    }
    if (showRays) {
      const t = rayT.current.t
      vertices.forEach((v, i) => {
        const geo = rayGeos.current[i]
        const attr = geo.attributes.position as THREE.BufferAttribute
        if (!attr) return
        attr.setXYZ(1,
          rayOrigin.x + (v.x - rayOrigin.x) * t,
          rayOrigin.y + (v.y - rayOrigin.y) * t,
          0,
        )
        attr.needsUpdate = true
      })
    }
  })

  // GSAP — runs once on mount
  useEffect(() => {
    opacityRef.current.v = 0
    rayT.current.t = 0

    const tl = gsap.timeline({ onComplete })
    tl.to(opacityRef.current, { v: 0.18, duration: 0.3, ease: 'power2.out' })
    if (showRays) {
      tl.to(rayT.current, { t: 1, duration: 0.5, ease: 'power2.out' })
    }

    return () => { tl.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group>
      {/* Bare refs — geometry/material mutated imperatively by useFrame (M1 ImageShape pattern) */}
      <mesh ref={meshRef} position={[0, 0, 0.04]}>
        <meshBasicMaterial color={IMAGE_COLOR} transparent opacity={0} />
      </mesh>
      <lineLoop ref={outlineRef} position={[0, 0, 0.05]}>
        <lineBasicMaterial color={IMAGE_COLOR} transparent opacity={0} />
      </lineLoop>
      {showRays && rayLines.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  )
}
