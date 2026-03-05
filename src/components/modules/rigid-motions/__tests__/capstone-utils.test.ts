import { describe, it, expect } from 'vitest'
import { CAPSTONE_ROUNDS, validateCapstoneSequence } from '../capstone-utils'
import type { TransformationParams } from '@/lib/types/transforms'

describe('CAPSTONE_ROUNDS', () => {
  it('has 3 rounds', () => {
    expect(CAPSTONE_ROUNDS).toHaveLength(3)
  })

  it('capstone-1: 1-step, target A(2,1) B(6,2) C(3,4)', () => {
    const r = CAPSTONE_ROUNDS.find(r => r.id === 'capstone-1')!
    expect(r.targetVertices).toEqual([[2, 1], [6, 2], [3, 4]])
    expect(r.isTwoStep).toBe(false)
  })

  it('capstone-2: 2-step, target A(5,1) B(1,2) C(4,4)', () => {
    const r = CAPSTONE_ROUNDS.find(r => r.id === 'capstone-2')!
    expect(r.targetVertices).toEqual([[5, 1], [1, 2], [4, 4]])
    expect(r.isTwoStep).toBe(true)
  })

  it('capstone-3: 2-step, target A(-1,5) B(0,1) C(2,4)', () => {
    const r = CAPSTONE_ROUNDS.find(r => r.id === 'capstone-3')!
    expect(r.targetVertices).toEqual([[-1, 5], [0, 1], [2, 4]])
    expect(r.isTwoStep).toBe(true)
  })
})

describe('validateCapstoneSequence', () => {
  const round1 = () => CAPSTONE_ROUNDS.find(r => r.id === 'capstone-1')!
  const round2 = () => CAPSTONE_ROUNDS.find(r => r.id === 'capstone-2')!
  const round3 = () => CAPSTONE_ROUNDS.find(r => r.id === 'capstone-3')!

  it('empty sequence returns miss', () => {
    expect(validateCapstoneSequence([], round1().targetVertices)).toBe('miss')
  })

  it('capstone-1: correct solution returns match', () => {
    const solution: TransformationParams[] = [{ type: 'translate', dx: 5, dy: 3 }]
    expect(validateCapstoneSequence(solution, round1().targetVertices)).toBe('match')
  })

  it('capstone-1: wrong solution returns miss', () => {
    const wrong: TransformationParams[] = [{ type: 'translate', dx: 1, dy: 1 }]
    expect(validateCapstoneSequence(wrong, round1().targetVertices)).toBe('miss')
  })

  it('capstone-2: correct sequence (reflect-y then translate +2,+3) returns match', () => {
    const solution: TransformationParams[] = [
      { type: 'reflect', axis: 'y' },
      { type: 'translate', dx: 2, dy: 3 },
    ]
    expect(validateCapstoneSequence(solution, round2().targetVertices)).toBe('match')
  })

  it('capstone-2: reversed order returns miss (non-commutative)', () => {
    const reversed: TransformationParams[] = [
      { type: 'translate', dx: 2, dy: 3 },
      { type: 'reflect', axis: 'y' },
    ]
    expect(validateCapstoneSequence(reversed, round2().targetVertices)).toBe('miss')
  })

  it('capstone-3: correct sequence (translate -2,+1 then rotate 90° CW) returns match', () => {
    const solution: TransformationParams[] = [
      { type: 'translate', dx: -2, dy: 1 },
      { type: 'rotate', degrees: 90, direction: 'cw' },
    ]
    expect(validateCapstoneSequence(solution, round3().targetVertices)).toBe('match')
  })

  it('capstone-3: reversed order (rotate then translate) returns miss — non-commutativity', () => {
    const reversed: TransformationParams[] = [
      { type: 'rotate', degrees: 90, direction: 'cw' },
      { type: 'translate', dx: -2, dy: 1 },
    ]
    expect(validateCapstoneSequence(reversed, round3().targetVertices)).toBe('miss')
  })

  it('result-only scoring: alternative correct sequence for capstone-1 returns match', () => {
    // Any sequence landing at the same target is valid
    // capstone-1 target can also be reached via 2 translates that sum to the same
    const alt: TransformationParams[] = [
      { type: 'translate', dx: 3, dy: 1 },
      { type: 'translate', dx: 2, dy: 2 },
    ]
    expect(validateCapstoneSequence(alt, round1().targetVertices)).toBe('match')
  })
})
