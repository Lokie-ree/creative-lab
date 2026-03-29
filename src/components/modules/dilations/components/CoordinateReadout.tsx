import type { RoundState, Triangle } from '../utils/types'
import { formatCoord } from '../utils/math'
import { ScaleFactorDisplay } from './ScaleFactorDisplay'
import { CANONICAL_TRIANGLE } from '../utils/constants'

export interface CoordinateReadoutProps {
  scaleFactor: number
  roundState: RoundState
  isGeneralized: boolean
  /** Ghost world-space vertices after student drops prediction. Shows predicted coords in ghost color. */
  predictedVertices?: Triangle
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
  predictedVertices,
}: CoordinateReadoutProps) {
  const isAfterReveal = roundState === 'reveal' || roundState === 'completion'

  // Before reveal: show k = N, plus predicted coords if student has dropped ghost
  if (!isAfterReveal) {
    const predVerts = predictedVertices
      ? [predictedVertices.a, predictedVertices.b, predictedVertices.c] as const
      : null
    const pre = CANONICAL_TRIANGLE
    const preVerts = [pre.a, pre.b, pre.c] as const
    return (
      <div className="px-5 py-2 md:px-4 flex flex-col gap-1.5">
        <ScaleFactorDisplay k={scaleFactor} />
        {predVerts && (
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 lab-data-font text-xs border-t border-(--lab-border) pt-1.5">
            {preVerts.map((v, i) => (
              <span key={VERTEX_NAMES[i]}>
                <span className="text-(--lab-text-muted)">
                  {VERTEX_NAMES[i]}({v.x}, {v.y})
                </span>
                <span className="text-(--lab-text-muted) mx-0.5">→</span>
                <span className="text-(--lab-ghost)">
                  {VERTEX_NAMES[i]}&prime;(
                  {Number(predVerts[i].x.toFixed(1))},{' '}
                  {Number(predVerts[i].y.toFixed(1))})
                </span>
              </span>
            ))}
          </div>
        )}
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
