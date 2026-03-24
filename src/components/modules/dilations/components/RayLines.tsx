// src/components/modules/dilations/components/RayLines.tsx
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import type { Triangle } from '../utils/types'

const RAY_COLOR = '#3e3a34'  // subtle, darker than ghost
const ORIGIN = { x: 0, y: 0 }

export interface RayLinesProps {
  preImage: Triangle
  image: Triangle
  visible: boolean
  animating: boolean   // true during reveal, false during completion (full length, static)
}

export function RayLines({ preImage: _preImage, image, visible, animating }: RayLinesProps) {
  // ALL hooks first — Rules of Hooks: no early returns before hook calls
  const { a: ia, b: ib, c: ic } = image
  const endpoints = [ia, ib, ic] as const

  // rayGeos holds the THREE.BufferGeometry refs (empty initially, filled in useEffect)
  const rayGeos = useRef([
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
  ])
  const tRef = useRef({ t: animating ? 0 : 1 })

  // Create THREE.Line objects pointing to the rayGeos refs — no orphaned geometry
  // (rayGeos are the same objects used in useEffect, so geometry assignment is automatic)
  const rayLines = useMemo(() =>
    rayGeos.current.map(geo =>
      new THREE.Line(
        geo,
        new THREE.LineDashedMaterial({ color: RAY_COLOR, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.6 })
      )
    ),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  // Build ray geometries on mount — 2 pts each (origin → endpoint)
  useEffect(() => {
    endpoints.forEach((ep, i) => {
      const pts = [
        new THREE.Vector3(ORIGIN.x, ORIGIN.y, 0),
        new THREE.Vector3(
          ORIGIN.x + (ep.x - ORIGIN.x) * tRef.current.t,
          ORIGIN.y + (ep.y - ORIGIN.y) * tRef.current.t,
          0,
        ),
      ]
      rayGeos.current[i].setFromPoints(pts)
      // computeLineDistances required for LineDashedMaterial to render dashes
      rayLines[i].computeLineDistances()
    })

    return () => {
      rayLines.forEach(l => {
        l.geometry.dispose()
        ;(l.material as THREE.LineDashedMaterial).dispose()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // GSAP animation — runs when animating changes
  useEffect(() => {
    if (!animating) {
      tRef.current.t = 1
      return
    }
    tRef.current.t = 0
    const tween = gsap.to(tRef.current, { t: 1, duration: 0.5, ease: 'power2.out' })
    return () => { tween.kill() }
  }, [animating])

  // useFrame — update ray endpoints from tRef + recompute line distances for dashes
  useFrame(() => {
    const t = tRef.current.t
    endpoints.forEach((ep, i) => {
      const geo = rayGeos.current[i]
      const attr = geo.attributes.position as THREE.BufferAttribute
      if (!attr) return
      attr.setXYZ(1,
        ORIGIN.x + (ep.x - ORIGIN.x) * t,
        ORIGIN.y + (ep.y - ORIGIN.y) * t,
        0,
      )
      attr.needsUpdate = true
      rayLines[i].computeLineDistances()  // required every frame for dashed lines
    })
  })

  // Early return AFTER all hooks
  if (!visible) return null

  return (
    <group>
      {rayLines.map((lineObj, i) => (
        <primitive
          key={i}
          object={lineObj}
          position={[0, 0, 0.015]}
        />
      ))}
    </group>
  )
}
