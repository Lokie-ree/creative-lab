// src/components/modules/rigid-motions/scene/FormulaReadout.tsx
//
// DOM overlay (not R3F) — shows the coordinate rule for the current
// transformation type and substitutes actual vertex coordinates.
//
// Visible in:
//   - coordinate-reveal: shows the rotate-90-cw rule with confirmed vertices
//   - predict-with-coordinates-*: shows rule + live ghost or confirmed vertices

import type { Round, FeedbackState } from '../types'
import type { TranslationParams, ReflectionParams, RotationParams } from '../types'
import { PRE_IMAGE_VERTICES, VERTEX_LABELS } from '../constants'

interface FormulaReadoutProps {
  round: Round
  ghostVertices?: [number, number][]
  feedbackState: FeedbackState
}

/** Format a signed integer for display: +5 → "+5", -3 → "-3", 0 → "+0" */
function signedInt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

/** Format a coordinate value for display (no leading +) */
function coord(n: number): string {
  return `${n}`
}

/** Build the abstract rule string for the given transformation params */
function buildRuleString(round: Round): string {
  const { params } = round

  if (params.type === 'translate') {
    const p = params as TranslationParams
    return `(x, y) \u2192 (x${signedInt(p.dx)}, y${signedInt(p.dy)})`
  }

  if (params.type === 'reflect') {
    const p = params as ReflectionParams
    if (p.axis === 'y') {
      return '(x, y) \u2192 (\u2212x, y)'
    }
    // axis === 'x'
    return '(x, y) \u2192 (x, \u2212y)'
  }

  // rotate
  const p = params as RotationParams
  const effectiveDegrees =
    p.direction === 'ccw' && p.degrees === 90
      ? 270
      : p.direction === 'cw' && p.degrees === 270
        ? 270
        : p.degrees

  if (effectiveDegrees === 90 && p.direction === 'cw') {
    return '(x, y) \u2192 (y, \u2212x)'
  }
  if (effectiveDegrees === 90 && p.direction === 'ccw') {
    return '(x, y) \u2192 (\u2212y, x)'
  }
  if (effectiveDegrees === 180) {
    return '(x, y) \u2192 (\u2212x, \u2212y)'
  }
  if (effectiveDegrees === 270 || (p.degrees === 270 && p.direction === 'cw')) {
    return '(x, y) \u2192 (\u2212y, x)'
  }
  // fallback
  return '(x, y) \u2192 (\u2212y, x)'
}

export function FormulaReadout({ round, ghostVertices, feedbackState }: FormulaReadoutProps) {
  // Determine which image vertices to display
  const imageVertices: [number, number][] =
    ghostVertices === undefined || feedbackState === 'match'
      ? (round.targetVertices as [number, number][])
      : ghostVertices

  const ruleString = buildRuleString(round)

  return (
    <div
      className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-2.5 md:px-6"
      aria-label="Coordinate rule"
    >
      {/* Abstract rule */}
      <div className="mb-1.5 lab-data-font text-sm text-(--lab-text)">
        {ruleString}
      </div>

      {/* Vertex substitutions */}
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {PRE_IMAGE_VERTICES.map(([px, py], i) => {
          const [ix, iy] = imageVertices[i] ?? [0, 0]
          const label = VERTEX_LABELS[i]
          const primeLabel = `${label}\u2032`

          return (
            <span
              key={label}
              className="lab-data-font text-xs text-(--lab-text-muted) whitespace-nowrap"
            >
              {label}({coord(px)}, {coord(py)})
              <span className="text-(--lab-ghost) mx-1">\u2192</span>
              <span className="text-(--lab-accent)">{primeLabel}({coord(ix)}, {coord(iy)})</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
