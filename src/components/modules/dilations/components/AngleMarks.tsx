// src/components/modules/dilations/components/AngleMarks.tsx
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import type { Triangle } from '../utils/types'

const ARC_RADIUS = 0.28
const ARC_SEGMENTS = 16
const MARK_COLOR = '#7a746a'  // lab ghost color

function buildArcGeo(vertex: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): THREE.BufferGeometry {
  const angle1 = Math.atan2(a.y - vertex.y, a.x - vertex.x)
  const angle2 = Math.atan2(b.y - vertex.y, b.x - vertex.x)
  // Normalize to [0, 2π] and take the shorter arc
  let start = angle1
  let end = angle2
  let diff = end - start
  // Normalize diff to (-π, π]
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  end = start + diff

  const pts: THREE.Vector3[] = []
  for (let j = 0; j <= ARC_SEGMENTS; j++) {
    const t = j / ARC_SEGMENTS
    const angle = start + diff * t
    pts.push(new THREE.Vector3(
      vertex.x + Math.cos(angle) * ARC_RADIUS,
      vertex.y + Math.sin(angle) * ARC_RADIUS,
      0,
    ))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

export interface AngleMarksProps {
  triangles: readonly Triangle[]
  visible: boolean
  animating: boolean
}

export function AngleMarks({ triangles, visible, animating }: AngleMarksProps) {
  const opacityRef = useRef({ v: animating ? 0 : 1 })

  // Build all arc line objects in useMemo — not recreated per render
  const markLines = useMemo(() => {
    const lines: THREE.Line[] = []
    for (const tri of triangles) {
      const { a, b, c } = tri
      const vertices = [
        { v: a, adj1: b, adj2: c },
        { v: b, adj1: a, adj2: c },
        { v: c, adj1: a, adj2: b },
      ]
      for (const { v, adj1, adj2 } of vertices) {
        const geo = buildArcGeo(v, adj1, adj2)
        const mat = new THREE.LineBasicMaterial({
          color: MARK_COLOR,
          transparent: true,
          opacity: opacityRef.current.v,
        })
        lines.push(new THREE.Line(geo, mat))
      }
    }
    return lines
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triangles])

  // GSAP fade-in
  useEffect(() => {
    if (!visible) return
    if (!animating) {
      opacityRef.current.v = 1
      return
    }
    opacityRef.current.v = 0
    const tween = gsap.to(opacityRef.current, {
      v: 1,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.3,
    })
    return () => { tween.kill() }
  }, [visible, animating])

  // useFrame — write opacity to materials
  useFrame(() => {
    const v = opacityRef.current.v
    markLines.forEach(line => {
      (line.material as THREE.LineBasicMaterial).opacity = v
    })
  })

  // Dispose previous set when markLines rebuilds (triangles changed) or on unmount
  useEffect(() => {
    return () => {
      markLines.forEach(line => {
        line.geometry.dispose()
        ;(line.material as THREE.LineBasicMaterial).dispose()
      })
    }
  }, [markLines])

  if (!visible) return null

  return (
    <group>
      {markLines.map((lineObj, i) => (
        <primitive
          key={i}
          object={lineObj}
          position={[0, 0, 0.07]}
        />
      ))}
    </group>
  )
}
