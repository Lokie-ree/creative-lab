// src/components/modules/pythagorean-theorem/scene/DistanceLabel.tsx
//
// Phase 4 reveal: shows the distance value on the connecting line.
// Fades in on mount via GSAP. Positioned at the line midpoint, offset
// perpendicular to the direction of travel (to the left of p1→p2).

import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { Z } from './scene-layout'
import type { Vec2 } from '../types'

interface DistanceLabelProps {
  p1: Vec2
  p2: Vec2
  distance: number
}

export function DistanceLabel({ p1, p2, distance }: DistanceLabelProps) {
  const meshRef = useRef<THREE.Mesh | null>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const scale   = 4
    const pxSize  = 36 * scale
    const font    = `bold ${pxSize}px ui-monospace, "Cascadia Code", "Fira Mono", monospace`
    const ctx     = canvas.getContext('2d')!
    const text    = String(distance)
    ctx.font = font
    const tw = ctx.measureText(text).width
    canvas.width  = tw + 20 * scale
    canvas.height = pxSize + 14 * scale
    ctx.font = font
    ctx.fillStyle = '#f5a623'  // amber — marks the earned reveal
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [distance])

  useEffect(() => () => { texture.dispose() }, [texture])

  // Fade in on mount
  useEffect(() => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0
    const tween = gsap.to(mat, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    return () => { tween.kill() }
  }, [])

  // Position: midpoint of p1→p2, offset perpendicular (to the left)
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const dx = p2.x - p1.x, dy = p2.y - p1.y
  const len = Math.sqrt(dx * dx + dy * dy)
  // Perpendicular left of the direction = (-dy, dx) / len
  const perpX = (-dy / len) * 0.65
  const perpY = ( dx / len) * 0.65

  const aspect = texture.image
    ? (texture.image as HTMLCanvasElement).width / (texture.image as HTMLCanvasElement).height
    : 1
  const planeWidth  = 0.8
  const planeHeight = planeWidth / aspect

  return (
    <mesh
      ref={meshRef}
      position={[mx + perpX, my + perpY, Z.DISTANCE_LABEL]}
    >
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0} depthWrite={false} />
    </mesh>
  )
}
