// src/components/modules/rigid-motions/round-generator.ts
//
// Deterministic round definitions — no random generation.
// Five named rounds with exact parameters and target vertices.
//
// Pre-image: A(-3,-2), B(1,-1), C(-2,1), centroid ≈ (-1.33, -0.67)
// Ghost starts at offset (3,-3) → Q4. Round targets span Q1 and Q3 to
// force students to drag diagonally across the grid.

import type { Round } from './types'

export const ROUNDS: Round[] = [
  {
    id: 'translate-5-3',
    stage: 'translate',
    params: { type: 'translate', dx: 5, dy: 3 },
    targetVertices: [[2, 1], [6, 2], [3, 4]],
  },
  {
    id: 'translate-n3-n4',
    stage: 'translate',
    params: { type: 'translate', dx: -3, dy: -4 },
    targetVertices: [[-6, -6], [-2, -5], [-5, -3]],
  },
  {
    id: 'reflect-y',
    stage: 'reflect',
    params: { type: 'reflect', axis: 'y' },
    targetVertices: [[3, -2], [-1, -1], [2, 1]],
  },
  {
    id: 'reflect-x',
    stage: 'reflect',
    params: { type: 'reflect', axis: 'x' },
    targetVertices: [[-3, 2], [1, 1], [-2, -1]],
  },
  {
    id: 'rotate-90-cw',
    stage: 'rotate',
    params: { type: 'rotate', degrees: 90, direction: 'cw' },
    targetVertices: [[-2, 3], [-1, -1], [1, 2]],
  },
  {
    // 180°: (x,y) → (−x,−y). Direction is irrelevant; 'cw' is the canonical choice.
    id: 'rotate-180',
    stage: 'rotate',
    params: { type: 'rotate', degrees: 180, direction: 'cw' },
    targetVertices: [[3, 2], [-1, 1], [2, -1]],
  },
  {
    // 90° CCW: (x,y) → (−y, x)
    id: 'rotate-90-ccw',
    stage: 'rotate',
    params: { type: 'rotate', degrees: 90, direction: 'ccw' },
    targetVertices: [[2, -3], [1, 1], [-1, -2]],
  },
]

export function getRoundsForStage(stage: 'translate' | 'reflect' | 'rotate'): Round[] {
  return ROUNDS.filter(r => r.stage === stage)
}

export function getRoundById(id: string): Round | undefined {
  return ROUNDS.find(r => r.id === id)
}
