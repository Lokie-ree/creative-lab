/**
 * Tests for match-scoring.ts
 *
 * Scoring rules per design spec v3.1:
 *
 * translate:  match (all verts ≤0.5), close (centroid ≤0.5, some vert >0.5), miss
 * reflect:    match (all verts ≤0.5 AND flipped), miss (everything else — no close)
 *             Guard: if (!flipped) return 'miss' immediately
 * rotate:     match (all verts ≤0.5 AND rotation params match expected),
 *             close (centroid ≤0.5 but rotation wrong), miss
 */

import { describe, it, expect } from 'vitest'
import { scoreGuess } from '../../match-scoring'

// ---------------------------------------------------------------------------
// Shared fixtures derived from round definitions
// ---------------------------------------------------------------------------

// Round 1 target — translate +4,+2: A′(5,3) B′(8,4) C′(6,6)
const T1_TARGET: [number, number][] = [[5, 3], [8, 4], [6, 6]]
// Perfect ghost: exactly at target
const T1_MATCH_GHOST: [number, number][] = [[5, 3], [8, 4], [6, 6]]
// Close ghost: centroid at target centroid but two verts shifted ±0.6 in x
// centroid of [[5.6,3],[7.4,4],[6,6]] = (6.33,4.33) — same as target centroid
const T1_CLOSE_GHOST: [number, number][] = [[5.6, 3], [7.4, 4], [6, 6]]
// Miss ghost: pre-image position — far from target
const T1_MISS_GHOST: [number, number][] = [[1, 1], [4, 2], [2, 4]]

// Round 3 target — reflect over y-axis: A′(-1,1) B′(-4,2) C′(-2,4)
const R3_TARGET: [number, number][] = [[-1, 1], [-4, 2], [-2, 4]]
const R3_MATCH_GHOST: [number, number][] = [[-1, 1], [-4, 2], [-2, 4]]
const R3_WRONG_POS_GHOST: [number, number][] = [[1, 1], [4, 2], [2, 4]]

// Round 5 target — rotate 90° CW: A′(1,-1) B′(2,-4) C′(4,-2)
const R5_TARGET: [number, number][] = [[1, -1], [2, -4], [4, -2]]
const R5_MATCH_GHOST: [number, number][] = [[1, -1], [2, -4], [4, -2]]
// Close ghost for rotate: centroid matches target centroid but we'll use the
// exact target vertices so centroid distance = 0, triggering close with wrong rotation
const R5_CW_PARAMS = { type: 'rotate' as const, degrees: 90 as const, direction: 'cw' as const }
const R5_CCW_PARAMS = { type: 'rotate' as const, degrees: 90 as const, direction: 'ccw' as const }

// ---------------------------------------------------------------------------
// translate stage
// ---------------------------------------------------------------------------

describe('scoreGuess — translate stage', () => {
  const stage = 'translate' as const
  const anyParams = { type: 'translate' as const, dx: 4, dy: 2 }

  it('returns match when all ghost vertices are within 0.5 units of target', () => {
    expect(scoreGuess(T1_MATCH_GHOST, T1_TARGET, stage, false, 90, 'cw', anyParams)).toBe('match')
  })

  it('returns match when all ghost vertices are slightly inside 0.5 threshold', () => {
    // Shift each vertex by 0.4 in x — still within 0.5
    const nearGhost: [number, number][] = [[5.4, 3], [8.4, 4], [6.4, 6]]
    expect(scoreGuess(nearGhost, T1_TARGET, stage, false, 90, 'cw', anyParams)).toBe('match')
  })

  it('returns close when centroid is within 0.5 but at least one vertex exceeds threshold', () => {
    // T1_CLOSE_GHOST: centroid at (6.33,4.33) = target centroid; vertex distances 0.6 > 0.5
    expect(scoreGuess(T1_CLOSE_GHOST, T1_TARGET, stage, false, 90, 'cw', anyParams)).toBe('close')
  })

  it('returns miss when centroid is outside 0.5 units of target centroid', () => {
    expect(scoreGuess(T1_MISS_GHOST, T1_TARGET, stage, false, 90, 'cw', anyParams)).toBe('miss')
  })

  it('boundary: vertex exactly at 0.5 distance counts as match', () => {
    const boundaryGhost: [number, number][] = [[5.5, 3], [8, 4], [6, 6]]
    expect(scoreGuess(boundaryGhost, T1_TARGET, stage, false, 90, 'cw', anyParams)).toBe('match')
  })
})

// ---------------------------------------------------------------------------
// reflect stage
// ---------------------------------------------------------------------------

describe('scoreGuess — reflect stage', () => {
  const stage = 'reflect' as const
  const yAxisParams = { type: 'reflect' as const, axis: 'y' as const }

  it('returns match when all vertices within 0.5 AND flipped is true', () => {
    expect(scoreGuess(R3_MATCH_GHOST, R3_TARGET, stage, true, 90, 'cw', yAxisParams)).toBe('match')
  })

  it('returns miss when flipped is false — even if ghost is at perfect position', () => {
    // Guard: if (!flipped) return 'miss' immediately
    expect(scoreGuess(R3_MATCH_GHOST, R3_TARGET, stage, false, 90, 'cw', yAxisParams)).toBe('miss')
  })

  it('returns miss when flipped is true but vertices are not at target', () => {
    expect(scoreGuess(R3_WRONG_POS_GHOST, R3_TARGET, stage, true, 90, 'cw', yAxisParams)).toBe('miss')
  })

  it('returns miss when flipped is false and ghost is nowhere near target', () => {
    expect(scoreGuess(R3_WRONG_POS_GHOST, R3_TARGET, stage, false, 90, 'cw', yAxisParams)).toBe('miss')
  })

  it('has no close state — centroid-match with wrong orientation is still miss', () => {
    // Ghost centroid matches target centroid, flipped=false → miss (not close)
    // R3 target centroid: (-7/3, 7/3). Construct ghost near that centroid but unflipped:
    const centroidGhost: [number, number][] = [[-1.6, 1], [-3.4, 2], [-2, 4]]
    expect(scoreGuess(centroidGhost, R3_TARGET, stage, false, 90, 'cw', yAxisParams)).toBe('miss')
  })
})

// ---------------------------------------------------------------------------
// rotate stage
// ---------------------------------------------------------------------------

describe('scoreGuess — rotate stage', () => {
  const stage = 'rotate' as const

  it('returns match when all vertices within 0.5 AND rotation params match expected', () => {
    expect(scoreGuess(R5_MATCH_GHOST, R5_TARGET, stage, false, 90, 'cw', R5_CW_PARAMS)).toBe('match')
  })

  it('returns close when ghost is at correct position but rotation direction is wrong', () => {
    // Ghost at exact target position, centroid distance = 0 — but 'ccw' instead of 'cw'
    expect(scoreGuess(R5_MATCH_GHOST, R5_TARGET, stage, false, 90, 'ccw', R5_CW_PARAMS)).toBe('close')
  })

  it('returns close when ghost centroid is within 0.5 but rotation degrees are wrong', () => {
    // Ghost at exact target (centroid distance = 0), but degrees 180 instead of 90
    expect(scoreGuess(R5_MATCH_GHOST, R5_TARGET, stage, false, 180, 'cw', R5_CW_PARAMS)).toBe('close')
  })

  it('returns miss when ghost centroid is outside 0.5 regardless of rotation settings', () => {
    const farGhost: [number, number][] = [[1, 1], [4, 2], [2, 4]]
    expect(scoreGuess(farGhost, R5_TARGET, stage, false, 90, 'cw', R5_CW_PARAMS)).toBe('miss')
  })

  it('returns miss when centroid outside 0.5 even with correct rotation', () => {
    const farGhost: [number, number][] = [[1, 1], [4, 2], [2, 4]]
    expect(scoreGuess(farGhost, R5_TARGET, stage, false, 90, 'cw', R5_CW_PARAMS)).toBe('miss')
  })

  it('returns close when centroid matches but both degree and direction are wrong', () => {
    expect(scoreGuess(R5_MATCH_GHOST, R5_TARGET, stage, false, 180, 'ccw', R5_CW_PARAMS)).toBe('close')
  })
})
