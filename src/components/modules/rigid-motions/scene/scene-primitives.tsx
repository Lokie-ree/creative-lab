// src/components/modules/rigid-motions/scene/scene-primitives.tsx
// Shared Three.js/R3F primitives used across scene components.
import { useMemo } from 'react'
import * as THREE from 'three'

// ─── SpriteLabel ──────────────────────────────────────────────────────────────
//
// Renders text as a CanvasTexture on a PlaneGeometry mesh.
// Avoids @react-three/drei Text (troika-three-text creates its own offscreen WebGL
// context — multiple instances + StrictMode exhausts the browser limit ~8 in Chromium).

export interface SpriteLabelProps {
  text: string
  position: [number, number, number]
  color?: string
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
  planeWidth?: number
}

export function SpriteLabel({
  text,
  position,
  color = '#ffffff',
  anchorX = 'center',
  anchorY = 'middle',
  planeWidth = 1.5,
}: SpriteLabelProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const scale = 4
    const pxFontSize = 32 * scale
    const font = `${pxFontSize}px ui-monospace, "Cascadia Code", "Fira Mono", monospace`
    const ctx = canvas.getContext('2d')!
    ctx.font = font
    const textWidth = ctx.measureText(text).width
    canvas.width = textWidth + 16 * scale
    canvas.height = pxFontSize + 12 * scale
    ctx.font = font
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [text, color])

  const aspect = texture.image
    ? (texture.image as HTMLCanvasElement).width / (texture.image as HTMLCanvasElement).height
    : 1
  const planeHeight = planeWidth / aspect

  const offsetX =
    anchorX === 'left' ? planeWidth / 2 : anchorX === 'right' ? -planeWidth / 2 : 0
  const offsetY =
    anchorY === 'top' ? -planeHeight / 2 : anchorY === 'bottom' ? planeHeight / 2 : 0

  return (
    <mesh position={[position[0] + offsetX, position[1] + offsetY, position[2]]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.01} depthWrite={false} />
    </mesh>
  )
}

// ─── makeTriangleShape ────────────────────────────────────────────────────────

export function makeTriangleShape(verts: readonly [number, number][]): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(verts[0][0], verts[0][1])
  for (let i = 1; i < verts.length; i++) shape.lineTo(verts[i][0], verts[i][1])
  shape.closePath()
  return shape
}
