import type { RoundState } from '../utils/types'
import { formatCoord } from '../utils/math'
import { ScaleFactorDisplay } from './ScaleFactorDisplay'
import { CANONICAL_TRIANGLE } from '../utils/constants'

export interface CoordinateReadoutProps {
  scaleFactor: number
  roundState: RoundState
  isGeneralized: boolean
}

const VERTEX_NAMES = ['A', 'B', 'C'] as const

/** Format k for the rule display: 2 → "2", 0.5 → "½", 0.333 → "⅓" */
function ruleK(k: number): string {
  if (k === 0.5) return '½'
  if (k === 0.333) return '⅓'
  return String(k)
}

/** Build the coordinate rule string: (x, y) → (2x, 2y) or generalized (x, y) → (kx, ky) */
function coordinateRule(k: number, generalized: boolean): string {
  if (generalized) return '(x, y) → (kx, ky)'
  const kStr = ruleK(k)
  return `(x, y) → (${kStr}x, ${kStr}y)`
}

export function CoordinateReadout({
  scaleFactor,
  roundState,
  isGeneralized,
}: CoordinateReadoutProps) {
  const isAfterReveal = roundState === 'reveal' || roundState === 'completion'

  // Before reveal: just show k = N
  if (!isAfterReveal) {
    return (
      <div className="px-5 py-2 md:px-4">
        <ScaleFactorDisplay k={scaleFactor} />
      </div>
    )
  }

  // After reveal: coordinate table + rule
  const pre = CANONICAL_TRIANGLE
  const verts = [pre.a, pre.b, pre.c] as const

  return (
    <div className="px-5 py-2 md:px-4 flex flex-col gap-1.5">
      {/* Coordinate table */}
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 lab-data-font text-xs">
        {verts.map((v, i) => (
          <span key={VERTEX_NAMES[i]}>
            <span className="text-(--lab-text-muted)">
              {VERTEX_NAMES[i]}({v.x}, {v.y})
            </span>
            <span className="text-(--lab-text-muted) mx-0.5">→</span>
            <span className="text-(--lab-accent)">
              {VERTEX_NAMES[i]}&prime;({formatCoord(scaleFactor, v.x)}, {formatCoord(scaleFactor, v.y)})
            </span>
          </span>
        ))}
      </div>

      {/* Coordinate rule */}
      <div
        className={[
          'lab-data-font text-sm font-semibold border-t border-(--lab-border) pt-1.5',
          isGeneralized ? 'text-(--lab-earned)' : 'text-(--lab-accent)',
        ].join(' ')}
      >
        {coordinateRule(scaleFactor, isGeneralized)}
      </div>
    </div>
  )
}
