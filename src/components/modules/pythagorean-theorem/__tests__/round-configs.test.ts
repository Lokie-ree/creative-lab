import { describe, it, expect } from 'vitest'
import { ROUND_SEQUENCE } from '../constants'
import { ROUND_CONFIGS } from '../round-configs'
import type { RoundId } from '../types'

describe('ROUND_SEQUENCE', () => {
  it('contains exactly 13 rounds', () => {
    expect(ROUND_SEQUENCE).toHaveLength(13)
  })

  it('every entry has a matching ROUND_CONFIGS entry', () => {
    for (const roundId of ROUND_SEQUENCE) {
      expect(ROUND_CONFIGS[roundId], `Missing config for round: ${roundId}`).toBeDefined()
    }
  })

  it('contains all expected round IDs', () => {
    const expected: RoundId[] = [
      'proof-345', 'proof-51213', 'proof-properties',
      'converse-6810', 'converse-569', 'converse-81517',
      'solve-hyp-345', 'solve-hyp-6810', 'solve-leg-51213', 'solve-leg-6810',
      'coord-345', 'coord-51213', 'coord-6810',
    ]
    expect(ROUND_SEQUENCE).toEqual(expected)
  })
})

describe('ROUND_CONFIGS — Phase 1 area calculations', () => {
  it('proof-345: sides 3,4,5 → areas 9,16,25', () => {
    const { triangle } = ROUND_CONFIGS['proof-345']
    const [a, b, c] = triangle.sides
    const [aArea, bArea, cArea] = triangle.areas
    expect(aArea).toBe(a * a)
    expect(bArea).toBe(b * b)
    expect(cArea).toBe(c * c)
    expect(aArea + bArea).toBe(cArea)
  })

  it('proof-51213: sides 5,12,13 → areas 25,144,169', () => {
    const { triangle } = ROUND_CONFIGS['proof-51213']
    const [a, b, c] = triangle.sides
    const [aArea, bArea, cArea] = triangle.areas
    expect(aArea).toBe(a * a)
    expect(bArea).toBe(b * b)
    expect(cArea).toBe(c * c)
    expect(aArea + bArea).toBe(cArea)
  })
})

describe('ROUND_CONFIGS — Phase 2 area calculations', () => {
  it('converse-6810: sides 6,8,10 → areas 36,64,100 (right)', () => {
    const { triangle } = ROUND_CONFIGS['converse-6810']
    const [a, b, c] = triangle.sides
    const [aArea, bArea, cArea] = triangle.areas
    expect(aArea).toBe(a * a)
    expect(bArea).toBe(b * b)
    expect(cArea).toBe(c * c)
    expect(aArea + bArea).toBe(cArea)
    expect(triangle.isRight).toBe(true)
  })

  it('converse-569: sides 5,6,9 → areas 25,36,81 (non-right)', () => {
    const { triangle } = ROUND_CONFIGS['converse-569']
    const [a, b, c] = triangle.sides
    const [aArea, bArea, cArea] = triangle.areas
    expect(aArea).toBe(a * a)
    expect(bArea).toBe(b * b)
    expect(cArea).toBe(c * c)
    expect(aArea + bArea).not.toBe(cArea) // non-right: areas do NOT add up
    expect(triangle.isRight).toBe(false)
  })

  it('converse-81517: sides 8,15,17 → areas 64,225,289 (right)', () => {
    const { triangle } = ROUND_CONFIGS['converse-81517']
    const [a, b, c] = triangle.sides
    const [aArea, bArea, cArea] = triangle.areas
    expect(aArea).toBe(a * a)
    expect(bArea).toBe(b * b)
    expect(cArea).toBe(c * c)
    expect(aArea + bArea).toBe(cArea)
    expect(triangle.isRight).toBe(true)
  })
})

describe('ROUND_CONFIGS — converseAnswer flags', () => {
  it('converse-6810 has converseAnswer: true', () => {
    expect(ROUND_CONFIGS['converse-6810'].converseAnswer).toBe(true)
  })

  it('converse-569 has converseAnswer: false', () => {
    expect(ROUND_CONFIGS['converse-569'].converseAnswer).toBe(false)
  })

  it('converse-81517 has converseAnswer: true', () => {
    expect(ROUND_CONFIGS['converse-81517'].converseAnswer).toBe(true)
  })
})

describe('ROUND_CONFIGS — answer values', () => {
  it('proof-345: answer is 25 (c²)', () => {
    expect(ROUND_CONFIGS['proof-345'].answer).toBe(25)
  })

  it('proof-51213: answer is 169 (c²)', () => {
    expect(ROUND_CONFIGS['proof-51213'].answer).toBe(169)
  })

  it('solve-hyp-345: answer is 5 (hypotenuse)', () => {
    expect(ROUND_CONFIGS['solve-hyp-345'].answer).toBe(5)
  })

  it('solve-hyp-6810: answer is 10', () => {
    expect(ROUND_CONFIGS['solve-hyp-6810'].answer).toBe(10)
  })

  it('solve-leg-51213: answer is 12 (leg b)', () => {
    expect(ROUND_CONFIGS['solve-leg-51213'].answer).toBe(12)
    expect(ROUND_CONFIGS['solve-leg-51213'].unknownSide).toBe('b')
  })

  it('solve-leg-6810: answer is 6 (leg a)', () => {
    expect(ROUND_CONFIGS['solve-leg-6810'].answer).toBe(6)
    expect(ROUND_CONFIGS['solve-leg-6810'].unknownSide).toBe('a')
  })

  it('coord-345: answer is 5 (distance)', () => {
    expect(ROUND_CONFIGS['coord-345'].answer).toBe(5)
  })

  it('coord-51213: answer is 13', () => {
    expect(ROUND_CONFIGS['coord-51213'].answer).toBe(13)
  })

  it('coord-6810: answer is 10', () => {
    expect(ROUND_CONFIGS['coord-6810'].answer).toBe(10)
  })
})

describe('ROUND_CONFIGS — coord-distance points', () => {
  it('coord-345 has correct coord points', () => {
    const { coordPoints } = ROUND_CONFIGS['coord-345']
    expect(coordPoints).toEqual([{ x: 1, y: 1 }, { x: 4, y: 5 }])
  })

  it('coord-345 leg lengths match triangle sides', () => {
    const { coordPoints, triangle } = ROUND_CONFIGS['coord-345']
    if (!coordPoints) throw new Error('coordPoints missing')
    const dx = Math.abs(coordPoints[1].x - coordPoints[0].x)
    const dy = Math.abs(coordPoints[1].y - coordPoints[0].y)
    expect(dx).toBe(triangle.sides[0]) // horizontal leg = side a
    expect(dy).toBe(triangle.sides[1]) // vertical leg = side b
  })
})

describe('ROUND_CONFIGS — phase assignments', () => {
  it('proof-* rounds are in visual-proof phase', () => {
    expect(ROUND_CONFIGS['proof-345'].phase).toBe('visual-proof')
    expect(ROUND_CONFIGS['proof-51213'].phase).toBe('visual-proof')
    expect(ROUND_CONFIGS['proof-properties'].phase).toBe('visual-proof')
  })

  it('converse-* rounds are in converse phase', () => {
    expect(ROUND_CONFIGS['converse-6810'].phase).toBe('converse')
    expect(ROUND_CONFIGS['converse-569'].phase).toBe('converse')
    expect(ROUND_CONFIGS['converse-81517'].phase).toBe('converse')
  })

  it('solve-* rounds are in unknown-sides phase', () => {
    expect(ROUND_CONFIGS['solve-hyp-345'].phase).toBe('unknown-sides')
    expect(ROUND_CONFIGS['solve-hyp-6810'].phase).toBe('unknown-sides')
    expect(ROUND_CONFIGS['solve-leg-51213'].phase).toBe('unknown-sides')
    expect(ROUND_CONFIGS['solve-leg-6810'].phase).toBe('unknown-sides')
  })

  it('coord-* rounds are in coord-distance phase', () => {
    expect(ROUND_CONFIGS['coord-345'].phase).toBe('coord-distance')
    expect(ROUND_CONFIGS['coord-51213'].phase).toBe('coord-distance')
    expect(ROUND_CONFIGS['coord-6810'].phase).toBe('coord-distance')
  })
})
