// src/components/modules/rigid-motions/match-scoring.ts
//
// Scoring rules differ per transformation type — see design spec v3.1 Match Scoring section.

import { centroidOf } from './transform-math'
import type { FeedbackState, TransformationParams, RotationParams } from './types'

const THRESHOLD = 0.5

function dist(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)
}

/**
 * Score a student's ghost placement against the target.
 *
 * - translate: match (all verts ≤0.5), close (centroid ≤0.5, some vert outside), miss
 * - reflect:   match (all verts ≤0.5 AND flipped), miss (everything else — no close state)
 *              Guard: if (!flipped) return 'miss' immediately
 * - rotate:    match (all verts ≤0.5 AND rotation params match expected),
 *              close (centroid ≤0.5 but rotation wrong), miss
 */
export function scoreGuess(
  ghostVertices: [number, number][],
  targetVertices: [number, number][],
  stage: 'translate' | 'reflect' | 'rotate',
  flipped: boolean,
  rotationDegrees: 90 | 180 | 270,
  rotationDirection: 'cw' | 'ccw',
  expectedParams: TransformationParams,
): FeedbackState {
  // Reflect guard: orientation must be correct to score better than miss
  if (stage === 'reflect' && !flipped) return 'miss'

  const allVertsMatch = ghostVertices.every(
    (gv, i) => dist(gv, targetVertices[i]) <= THRESHOLD,
  )
  const centroidMatch =
    dist(centroidOf(ghostVertices), centroidOf(targetVertices)) <= THRESHOLD

  if (stage === 'translate') {
    if (allVertsMatch) return 'match'
    if (centroidMatch) return 'close'
    return 'miss'
  }

  if (stage === 'reflect') {
    // flipped === true at this point (guard above)
    // No close state for reflections
    if (allVertsMatch) return 'match'
    return 'miss'
  }

  // stage === 'rotate'
  const rp = expectedParams as RotationParams
  const rotationCorrect =
    rotationDegrees === rp.degrees && rotationDirection === rp.direction
  if (allVertsMatch && rotationCorrect) return 'match'
  if (centroidMatch) return 'close'
  return 'miss'
}
