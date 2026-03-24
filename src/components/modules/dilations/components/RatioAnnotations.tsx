// src/components/modules/dilations/components/RatioAnnotations.tsx
import { useState, useEffect, useMemo } from 'react'
import type { Triangle } from '../utils/types'
import { SpriteLabel } from './SpriteLabel'

const SIDE_COLORS = ['#f5a623', '#7cc87c', '#8a847a'] as const

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export interface RatioAnnotationsProps {
  preImage: Triangle
  ratio: number       // e.g. 2 for "2:1", 0.5 for "1:2"
  visible: boolean
  animating: boolean  // if true, delay reveal 500ms; if false, show immediately
}

export function RatioAnnotations({ preImage, ratio, visible, animating }: RatioAnnotationsProps) {
  // SpriteLabel has no opacity prop — gate visibility with state + setTimeout
  const [show, setShow] = useState(!animating)

  useEffect(() => {
    if (!visible) { setShow(false); return }
    if (!animating) { setShow(true); return }
    setShow(false)
    const timer = setTimeout(() => setShow(true), 500)  // 0.5s delay after rays settle
    return () => clearTimeout(timer)
  }, [visible, animating])

  const { a, b, c } = preImage
  const sides = useMemo(() => [
    { from: a, to: b, color: SIDE_COLORS[0] },
    { from: b, to: c, color: SIDE_COLORS[1] },
    { from: c, to: a, color: SIDE_COLORS[2] },
  ], [a, b, c])

  // Format ratio label: "2:1" for k=2, "1:2" for k=0.5, "3:1" for k=3
  const ratioLabel =
    ratio >= 1
      ? `${Math.round(ratio)}:1`
      : `1:${Math.round(1 / ratio)}`

  const cx = (a.x + b.x + c.x) / 3
  const cy = (a.y + b.y + c.y) / 3

  if (!visible) return null

  return (
    <>
      {sides.map((side, i) => {
        const mid = midpoint(side.from, side.to)
        // Offset label slightly outward from centroid to avoid overlapping triangle
        const dx = mid.x - cx
        const dy = mid.y - cy
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const labelPos = { x: mid.x + (dx / len) * 0.7, y: mid.y + (dy / len) * 0.7 }

        return (
          <SpriteLabel
            key={i}
            text={ratioLabel}
            position={labelPos}
            zLayer={0.12}
            color={side.color}
            visible={show}
            planeWidth={0.9}
          />
        )
      })}
    </>
  )
}
