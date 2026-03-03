/**
 * Tests for round-generator.ts
 *
 * Verifies the five deterministic rounds defined in design spec v3.1.
 * All target vertices and parameters are directly from the spec.
 */

import { describe, it, expect } from 'vitest'
import { ROUNDS, getRoundsForStage, getRoundById } from '../../round-generator'

describe('ROUNDS', () => {
  it('contains exactly 5 rounds', () => {
    expect(ROUNDS).toHaveLength(5)
  })

  it('has unique IDs', () => {
    const ids = ROUNDS.map(r => r.id)
    expect(new Set(ids).size).toBe(5)
  })
})

describe('getRoundsForStage', () => {
  it('returns 2 translate rounds', () => {
    const rounds = getRoundsForStage('translate')
    expect(rounds).toHaveLength(2)
    rounds.forEach(r => expect(r.stage).toBe('translate'))
  })

  it('returns 2 reflect rounds', () => {
    const rounds = getRoundsForStage('reflect')
    expect(rounds).toHaveLength(2)
    rounds.forEach(r => expect(r.stage).toBe('reflect'))
  })

  it('returns 1 rotate round', () => {
    const rounds = getRoundsForStage('rotate')
    expect(rounds).toHaveLength(1)
    expect(rounds[0].stage).toBe('rotate')
  })
})

describe('getRoundById', () => {
  it('finds a round by id', () => {
    const round = getRoundById('translate-4-2')
    expect(round).toBeDefined()
    expect(round!.id).toBe('translate-4-2')
  })

  it('returns undefined for unknown id', () => {
    expect(getRoundById('not-a-real-id')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Round 1 — translate +4 right, +2 up
// ---------------------------------------------------------------------------

describe('Round 1 — translate-4-2', () => {
  const round = ROUNDS.find(r => r.id === 'translate-4-2')!

  it('has correct stage', () => {
    expect(round.stage).toBe('translate')
  })

  it('has correct params', () => {
    expect(round.params).toEqual({ type: 'translate', dx: 4, dy: 2 })
  })

  it('has correct target vertices: A′(5,3) B′(8,4) C′(6,6)', () => {
    expect(round.targetVertices[0]).toEqual([5, 3])
    expect(round.targetVertices[1]).toEqual([8, 4])
    expect(round.targetVertices[2]).toEqual([6, 6])
  })
})

// ---------------------------------------------------------------------------
// Round 2 — translate −3 left, −5 down
// ---------------------------------------------------------------------------

describe('Round 2 — translate-n3-n5', () => {
  const round = ROUNDS.find(r => r.id === 'translate-n3-n5')!

  it('has correct params', () => {
    expect(round.params).toEqual({ type: 'translate', dx: -3, dy: -5 })
  })

  it('has correct target vertices: A′(−2,−4) B′(1,−3) C′(−1,−1)', () => {
    expect(round.targetVertices[0]).toEqual([-2, -4])
    expect(round.targetVertices[1]).toEqual([1, -3])
    expect(round.targetVertices[2]).toEqual([-1, -1])
  })
})

// ---------------------------------------------------------------------------
// Round 3 — reflect over y-axis
// ---------------------------------------------------------------------------

describe('Round 3 — reflect-y', () => {
  const round = ROUNDS.find(r => r.id === 'reflect-y')!

  it('has correct stage and params', () => {
    expect(round.stage).toBe('reflect')
    expect(round.params).toEqual({ type: 'reflect', axis: 'y' })
  })

  it('has correct target vertices: A′(−1,1) B′(−4,2) C′(−2,4)', () => {
    expect(round.targetVertices[0]).toEqual([-1, 1])
    expect(round.targetVertices[1]).toEqual([-4, 2])
    expect(round.targetVertices[2]).toEqual([-2, 4])
  })
})

// ---------------------------------------------------------------------------
// Round 4 — reflect over x-axis
// ---------------------------------------------------------------------------

describe('Round 4 — reflect-x', () => {
  const round = ROUNDS.find(r => r.id === 'reflect-x')!

  it('has correct stage and params', () => {
    expect(round.stage).toBe('reflect')
    expect(round.params).toEqual({ type: 'reflect', axis: 'x' })
  })

  it('has correct target vertices: A′(1,−1) B′(4,−2) C′(2,−4)', () => {
    expect(round.targetVertices[0]).toEqual([1, -1])
    expect(round.targetVertices[1]).toEqual([4, -2])
    expect(round.targetVertices[2]).toEqual([2, -4])
  })
})

// ---------------------------------------------------------------------------
// Round 5 — rotate 90° CW around origin
// ---------------------------------------------------------------------------

describe('Round 5 — rotate-90-cw', () => {
  const round = ROUNDS.find(r => r.id === 'rotate-90-cw')!

  it('has correct stage and params', () => {
    expect(round.stage).toBe('rotate')
    expect(round.params).toEqual({ type: 'rotate', degrees: 90, direction: 'cw' })
  })

  it('has correct target vertices: A′(1,−1) B′(2,−4) C′(4,−2)', () => {
    expect(round.targetVertices[0]).toEqual([1, -1])
    expect(round.targetVertices[1]).toEqual([2, -4])
    expect(round.targetVertices[2]).toEqual([4, -2])
  })

  it('Round 4 and Round 5 share centroid ≈ (2.33, -2.33) but have different vertices', () => {
    const r4 = ROUNDS.find(r => r.id === 'reflect-x')!
    const r5 = round
    // Centroids match
    const c4x = r4.targetVertices.reduce((s, [x]) => s + x, 0) / 3
    const c4y = r4.targetVertices.reduce((s, [, y]) => s + y, 0) / 3
    const c5x = r5.targetVertices.reduce((s, [x]) => s + x, 0) / 3
    const c5y = r5.targetVertices.reduce((s, [, y]) => s + y, 0) / 3
    expect(c4x).toBeCloseTo(c5x)
    expect(c4y).toBeCloseTo(c5y)
    // B′ and C′ are swapped
    expect(r4.targetVertices[1]).not.toEqual(r5.targetVertices[1])
    expect(r4.targetVertices[2]).not.toEqual(r5.targetVertices[2])
  })
})
