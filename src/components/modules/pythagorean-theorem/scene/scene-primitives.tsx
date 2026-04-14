// src/components/modules/pythagorean-theorem/scene/scene-primitives.tsx
//
// SpriteLabel — CanvasTexture-based text label for R3F scenes.
// Never use drei <Text> — it exhausts the WebGL context with StrictMode double-mount.
// Copied from M2 (dilations/SpriteLabel) with M3-local Vec2 import.

import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import type { Vec2 } from '../types'

export interface SpriteLabelProps {
  text: string
  position: Vec2
  zLayer?: number
  color?: string
  visible?: boolean
  planeWidth?: number
}

export function SpriteLabel({
  text,
  position,
  zLayer = 0.1,
  color = '#b8b0a4',
  visible = true,
  planeWidth = 1.0,
}: SpriteLabelProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const scale = 4
    const pxFontSize = 32 * scale
    const font = `${pxFontSize}px ui-monospace, "Cascadia Code", "Fira Mono", monospace`
    const ctx = canvas.getContext('2d')!
    ctx.font = font
    const textWidth = ctx.measureText(text).width
    canvas.width  = textWidth + 16 * scale
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

  useEffect(() => {
    return () => { texture.dispose() }
  }, [texture])

  const aspect = texture.image
    ? (texture.image as HTMLCanvasElement).width / (texture.image as HTMLCanvasElement).height
    : 1
  const planeHeight = planeWidth / aspect

  if (!visible) return null

  return (
    <mesh position={[position.x, position.y, zLayer]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.01} depthWrite={false} />
    </mesh>
  )
}
