// src/components/modules/rigid-motions/scene/GapLines.tsx
//
// Visible on 'miss' feedback. Dashed lines from each ghost vertex to the correct
// target vertex. Staggered fade-in (50ms between vertices).
//
// For reflections with correct position but wrong orientation, gap lines cross
// the reflection axis — making the equidistance property visible without text.
// z: 0.05

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export interface GapLinesProps {
  ghostVertices: [number, number][]
  targetVertices: [number, number][]
}

interface GapLineProps {
  ghost: [number, number]
  target: [number, number]
  delay: number
}

function GapLine({ ghost, target, delay }: GapLineProps) {
  const lineRef = useRef<THREE.Line>(null)
  const opacityRef = useRef(0)

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(ghost[0], ghost[1], 0.05),
    new THREE.Vector3(target[0], target[1], 0.05),
  ])

  useEffect(() => {
    const tween = gsap.to(opacityRef, {
      current: 0.7,
      delay: delay / 1000,
      duration: 0.2,
      ease: 'power1.out',
    })
    return () => { tween.kill() }
  }, [delay])

  useFrame(() => {
    if (!lineRef.current) return
    lineRef.current.computeLineDistances()
    const mat = lineRef.current.material as THREE.LineDashedMaterial
    mat.opacity = opacityRef.current
  })

  return (
    // @ts-expect-error — R3F lowercase JSX line
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial color="#7a746a" transparent opacity={0} dashSize={0.2} gapSize={0.12} />
    </line>
  )
}

export function GapLines({ ghostVertices, targetVertices }: GapLinesProps) {
  return (
    <group>
      {ghostVertices.map((ghost, i) => (
        <GapLine
          key={i}
          ghost={ghost}
          target={targetVertices[i]}
          delay={i * 50}
        />
      ))}
    </group>
  )
}
