// src/components/modules/rigid-motions/round-generator.ts
//
// Deterministic round definitions — no random generation.
// Five named rounds with exact parameters and target vertices per design spec v3.1.
//
// NOTE: Round 4 (reflect-x) and Round 5 (rotate-90-cw) share the same target centroid
// ≈ (2.33, −2.33). This is intentional — B′ and C′ are swapped between rounds.
// Scoring correctly differentiates them at the vertex level.

import type { Round } from './types'

export const ROUNDS: Round[] = [
  {
    id: 'translate-4-2',
    stage: 'translate',
    params: { type: 'translate', dx: 4, dy: 2 },
    targetVertices: [[5, 3], [8, 4], [6, 6]],
  },
  {
    id: 'translate-n3-n5',
    stage: 'translate',
    params: { type: 'translate', dx: -3, dy: -5 },
    targetVertices: [[-2, -4], [1, -3], [-1, -1]],
  },
  {
    id: 'reflect-y',
    stage: 'reflect',
    params: { type: 'reflect', axis: 'y' },
    targetVertices: [[-1, 1], [-4, 2], [-2, 4]],
  },
  {
    id: 'reflect-x',
    stage: 'reflect',
    params: { type: 'reflect', axis: 'x' },
    targetVertices: [[1, -1], [4, -2], [2, -4]],
  },
  {
    id: 'rotate-90-cw',
    stage: 'rotate',
    params: { type: 'rotate', degrees: 90, direction: 'cw' },
    targetVertices: [[1, -1], [2, -4], [4, -2]],
    // Note: target centroid (2.33, -2.33) matches reflect-x. Vertices differ — B′ and C′ swapped.
  },
]

export function getRoundsForStage(stage: 'translate' | 'reflect' | 'rotate'): Round[] {
  return ROUNDS.filter(r => r.stage === stage)
}

export function getRoundById(id: string): Round | undefined {
  return ROUNDS.find(r => r.id === id)
}
