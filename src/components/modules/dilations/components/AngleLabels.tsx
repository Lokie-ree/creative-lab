// src/components/modules/dilations/components/AngleLabels.tsx
//
// Renders computed angle degree values at each vertex of a triangle.
// Labels start dim (revealed=false) and snap to colors (revealed=true).
// Uses CanvasTexture — same pattern as SpriteLabel.tsx.
// Never use drei <Text> or <Html>.

import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { triangleAngles } from '../utils/math'
import type { Triangle } from '../utils/types'

const GHOST = '#7a746a'
const ANGLE_COLORS = ['#7cc87c', '#f5a623', '#8ab4f8'] as const
const DIM_OPACITY = 0.4

// ---------------------------------------------------------------------------
// Color computation (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Returns per-vertex colors for both triangles.
 * Sorts both angle arrays, finds matching pairs within ±2°, assigns shared
 * colors up to showMatchCount. Unmatched vertices get GHOST.
 */
export function computeMatchColors(
  preAngles: [number, number, number],
  tgtAngles: [number, number, number],
  showMatchCount: number,
): [[string, string, string], [string, string, string]] {
  const sortPre = ([...preAngles] as number[])
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)
  const sortTgt = ([...tgtAngles] as number[])
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)

  const preColors: [string, string, string] = [GHOST, GHOST, GHOST]
  const tgtColors: [string, string, string] = [GHOST, GHOST, GHOST]

  let colorIdx = 0
  for (let k = 0; k < 3 && colorIdx < showMatchCount; k++) {
    if (Math.abs(sortPre[k].v - sortTgt[k].v) <= 2) {
      const color = ANGLE_COLORS[colorIdx++]
      preColors[sortPre[k].i] = color
      tgtColors[sortTgt[k].i] = color
    }
  }

  return [preColors, tgtColors]
}

// ---------------------------------------------------------------------------
// Sprite builder
// ---------------------------------------------------------------------------

function makeAngleLabelTexture(text: string, color: string, opacity: number): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, size, size)
  ctx.globalAlpha = opacity
  ctx.font = 'bold 52px "JetBrains Mono", monospace'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, size / 2, size / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// ---------------------------------------------------------------------------
// SingleAngleLabel — one sprite for one vertex
// ---------------------------------------------------------------------------

function SingleAngleLabel({
  angleDeg,
  color,
  revealed,
  position,
}: {
  angleDeg: number
  color: string
  revealed: boolean
  position: [number, number, number]
}) {
  const texture = useMemo(
    () => makeAngleLabelTexture(`${angleDeg}°`, color, revealed ? 1 : DIM_OPACITY),
    [angleDeg, color, revealed],
  )

  useEffect(() => () => texture.dispose(), [texture])

  const spriteMaterial = useMemo(
    () => new THREE.SpriteMaterial({ map: texture, transparent: true }),
    [texture],
  )

  useEffect(() => () => spriteMaterial.dispose(), [spriteMaterial])

  return (
    <sprite position={position} scale={[1.2, 1.2, 1]} material={spriteMaterial} />
  )
}

// ---------------------------------------------------------------------------
// AngleLabels — renders all 3 labels for one triangle
// ---------------------------------------------------------------------------

/** Offset multiplier: pushes label slightly outside the triangle at each vertex. */
function labelOffset(vertex: { x: number; y: number }, centroid: { x: number; y: number }, d = 0.8) {
  const dx = vertex.x - centroid.x
  const dy = vertex.y - centroid.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return [vertex.x + (dx / len) * d, vertex.y + (dy / len) * d, 0.1] as [number, number, number]
}

interface AngleLabelsProps {
  triangle: Triangle
  visible: boolean
  /** false = dim ghost; true = full color per matchColors */
  revealed: boolean
  /** Per-vertex colors. null = all ghost (not yet revealed state) */
  matchColors: [string, string, string] | null
}

export function AngleLabels({ triangle, visible, revealed, matchColors }: AngleLabelsProps) {
  const angles = useMemo(() => triangleAngles(triangle), [triangle])
  const verts = [triangle.a, triangle.b, triangle.c] as const

  const centroid = useMemo(() => ({
    x: (triangle.a.x + triangle.b.x + triangle.c.x) / 3,
    y: (triangle.a.y + triangle.b.y + triangle.c.y) / 3,
  }), [triangle])

  if (!visible) return null

  const colors: [string, string, string] = matchColors ?? [GHOST, GHOST, GHOST]

  return (
    <>
      {verts.map((v, i) => (
        <SingleAngleLabel
          key={i}
          angleDeg={angles[i]}
          color={colors[i]}
          revealed={revealed}
          position={labelOffset(v, centroid)}
        />
      ))}
    </>
  )
}
