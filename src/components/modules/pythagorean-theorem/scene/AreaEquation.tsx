// src/components/modules/pythagorean-theorem/scene/AreaEquation.tsx
//
// Renders a concrete area equation below the triangle figure.
// Phase 1: "9 + 16 = 25"
// Phase 2 (right):     "36 + 64 = 100"
// Phase 2 (non-right): "25 + 36 ≠ 81"

import { SpriteLabel } from './scene-primitives'
import { Z } from './scene-layout'
import type { TriangleDef } from '../types'

interface AreaEquationProps {
  triangle: TriangleDef
  /** Whether to show "=" or "≠" */
  areasMatch: boolean
  /** y position for the equation (world units, below the triangle figure) */
  yPosition: number
  visible: boolean
}

export function AreaEquation({ triangle, areasMatch, yPosition, visible }: AreaEquationProps) {
  if (!visible) return null

  const [aArea, bArea, cArea] = triangle.areas
  const op = areasMatch ? '+' : '+'
  const eq = areasMatch ? '=' : '≠'

  const equationText = `${aArea} ${op} ${bArea} ${eq} ${cArea}`

  return (
    <SpriteLabel
      text={equationText}
      position={{ x: 0, y: yPosition }}
      zLayer={Z.AREA_LABEL}
      color="#b8b0a4"
      planeWidth={Math.max(2.5, equationText.length * 0.22)}
    />
  )
}
