/**
 * Tests for round-generator.ts
 *
 * Verifies the five deterministic rounds defined in design spec v3.1.
 * All target vertices and parameters are directly from the spec.
 */

import { describe, it, expect } from 'vitest'
import { ROUNDS, getRoundsForStage, getRoundById } from '../../round-generator'

describe('ROUNDS', () => {
  it('contains exactly 7 rounds', () => {
    expect(ROUNDS).toHaveLength(7)
  })

  it('has unique IDs', () => {
    const ids = ROUNDS.map(r => r.id)
    expect(new Set(ids).size).toBe(7)
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

  it('returns 3 rotate rounds', () => {
    const rounds = getRoundsForStage('rotate')
    expect(rounds).toHaveLength(3)
    rounds.forEach(r => expect(r.stage).toBe('rotate'))
  })
})

describe('getRoundById', () => {
  it('finds a round by id', () => {
    const round = getRoundById('translate-5-3')
    expect(round).toBeDefined()
    expect(round!.id).toBe('translate-5-3')
  })

  it('returns undefined for unknown id', () => {
    expect(getRoundById('not-a-real-id')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Round 1 — translate +5 right, +3 up
// ---------------------------------------------------------------------------

describe('Round 1 — translate-5-3', () => {
  const round = ROUNDS.find(r => r.id === 'translate-5-3')!

  it('has correct stage', () => {
    expect(round.stage).toBe('translate')
  })

  it('has correct params', () => {
    expect(round.params).toEqual({ type: 'translate', dx: 5, dy: 3 })
  })

  it('has correct target vertices: A′(2,1) B′(6,2) C′(3,4)', () => {
    expect(round.targetVertices[0]).toEqual([2, 1])
    expect(round.targetVertices[1]).toEqual([6, 2])
    expect(round.targetVertices[2]).toEqual([3, 4])
  })
})

// ---------------------------------------------------------------------------
// Round 2 — translate −3 left, −4 down
// ---------------------------------------------------------------------------

describe('Round 2 — translate-n3-n4', () => {
  const round = ROUNDS.find(r => r.id === 'translate-n3-n4')!

  it('has correct params', () => {
    expect(round.params).toEqual({ type: 'translate', dx: -3, dy: -4 })
  })

  it('has correct target vertices: A′(−6,−6) B′(−2,−5) C′(−5,−3)', () => {
    expect(round.targetVertices[0]).toEqual([-6, -6])
    expect(round.targetVertices[1]).toEqual([-2, -5])
    expect(round.targetVertices[2]).toEqual([-5, -3])
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

  it('has correct target vertices: A′(3,−2) B′(−1,−1) C′(2,1)', () => {
    expect(round.targetVertices[0]).toEqual([3, -2])
    expect(round.targetVertices[1]).toEqual([-1, -1])
    expect(round.targetVertices[2]).toEqual([2, 1])
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

  it('has correct target vertices: A′(−3,2) B′(1,1) C′(−2,−1)', () => {
    expect(round.targetVertices[0]).toEqual([-3, 2])
    expect(round.targetVertices[1]).toEqual([1, 1])
    expect(round.targetVertices[2]).toEqual([-2, -1])
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

  it('has correct target vertices: A′(−2,3) B′(−1,−1) C′(1,2)', () => {
    expect(round.targetVertices[0]).toEqual([-2, 3])
    expect(round.targetVertices[1]).toEqual([-1, -1])
    expect(round.targetVertices[2]).toEqual([1, 2])
  })

  it('Round 4 and Round 5 have different vertices (vertex-level scoring distinguishes them)', () => {
    const r4 = ROUNDS.find(r => r.id === 'reflect-x')!
    const r5 = round
    expect(r4.targetVertices[0]).not.toEqual(r5.targetVertices[0]) // A′ differs
    expect(r4.targetVertices[2]).not.toEqual(r5.targetVertices[2]) // C′ differs
  })
})

// ---------------------------------------------------------------------------
// Round 6 — rotate 180° around origin
// ---------------------------------------------------------------------------

describe('Round 6 — rotate-180', () => {
  const round = ROUNDS.find(r => r.id === 'rotate-180')!

  it('has correct stage and params', () => {
    expect(round.stage).toBe('rotate')
    expect(round.params).toEqual({ type: 'rotate', degrees: 180, direction: 'cw' })
  })

  it('has correct target vertices: A′(3,2) B′(−1,1) C′(2,−1)', () => {
    // (x,y) → (−x,−y): A(−3,−2)→(3,2), B(1,−1)→(−1,1), C(−2,1)→(2,−1)
    expect(round.targetVertices[0]).toEqual([3, 2])
    expect(round.targetVertices[1]).toEqual([-1, 1])
    expect(round.targetVertices[2]).toEqual([2, -1])
  })
})

// ---------------------------------------------------------------------------
// Round 7 — rotate 90° CCW around origin
// ---------------------------------------------------------------------------

describe('Round 7 — rotate-90-ccw', () => {
  const round = ROUNDS.find(r => r.id === 'rotate-90-ccw')!

  it('has correct stage and params', () => {
    expect(round.stage).toBe('rotate')
    expect(round.params).toEqual({ type: 'rotate', degrees: 90, direction: 'ccw' })
  })

  it('has correct target vertices: A′(2,−3) B′(1,1) C′(−1,−2)', () => {
    // (x,y) → (−y,x): A(−3,−2)→(2,−3), B(1,−1)→(1,1), C(−2,1)→(−1,−2)
    expect(round.targetVertices[0]).toEqual([2, -3])
    expect(round.targetVertices[1]).toEqual([1, 1])
    expect(round.targetVertices[2]).toEqual([-1, -2])
  })
})
