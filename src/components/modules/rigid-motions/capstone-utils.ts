// src/components/modules/rigid-motions/capstone-utils.ts
//
// Capstone round definitions and sequence validation.
// Target vertices verified by running applySequence against each solution (2026-03-05).

import { applySequence } from './transform-math'
import { PRE_IMAGE_VERTICES } from './constants'
import type { TransformationParams } from '@/lib/types/transforms'
import type { FeedbackState } from './types'

export interface CapstoneRound {
  id: string
  targetVertices: [number, number][]
  solutionSequence: TransformationParams[]  // For test validation — never shown to student
  isTwoStep: boolean
}

// Match threshold: same 0.5-unit vertex distance used in Phase 2 match scoring
const MATCH_THRESHOLD = 0.5

export const CAPSTONE_ROUNDS: CapstoneRound[] = [
  {
    id: 'capstone-1',
    // translate +5, +3: A(-3,-2)→A(2,1), B(1,-1)→B(6,2), C(-2,1)→C(3,4)
    targetVertices: [[2, 1], [6, 2], [3, 4]],
    solutionSequence: [{ type: 'translate', dx: 5, dy: 3 }],
    isTwoStep: false,
  },
  {
    id: 'capstone-2',
    // reflect-y then translate +2,+3: A(-3,-2)→(3,-2)→A(5,1), B→(-1,-1)→B(1,2), C→(2,1)→C(4,4)
    targetVertices: [[5, 1], [1, 2], [4, 4]],
    solutionSequence: [
      { type: 'reflect', axis: 'y' },
      { type: 'translate', dx: 2, dy: 3 },
    ],
    isTwoStep: true,
  },
  {
    id: 'capstone-3',
    // translate -2,+1 then rotate 90° CW:
    // A(-3,-2)→(-5,-1)→A(-1,5), B(1,-1)→(-1,0)→B(0,1), C(-2,1)→(-4,2)→C(2,4)
    // NOTE: [rotate, translate] gives A(-4,4) B(-3,0) C(-1,3) — different — surfaces non-commutativity
    targetVertices: [[-1, 5], [0, 1], [2, 4]],
    solutionSequence: [
      { type: 'translate', dx: -2, dy: 1 },
      { type: 'rotate', degrees: 90, direction: 'cw' },
    ],
    isTwoStep: true,
  },
]

/**
 * Result-only scoring: compare applySequence output against targetVertices.
 * Any sequence that produces the target (within threshold) is valid.
 * Binary: 'match' or 'miss'. No 'close' state — PreviewGhost gives continuous feedback.
 */
export function validateCapstoneSequence(
  sequence: TransformationParams[],
  targetVertices: [number, number][],
): FeedbackState {
  if (sequence.length === 0) return 'miss'
  const result = applySequence(PRE_IMAGE_VERTICES as [number, number][], sequence)
  const allClose = result.every(([rx, ry], i) => {
    const [tx, ty] = targetVertices[i]
    return Math.sqrt((rx - tx) ** 2 + (ry - ty) ** 2) <= MATCH_THRESHOLD
  })
  return allClose ? 'match' : 'miss'
}
