import { describe, it, expect } from 'vitest'
import { formatCoordinateRule, CAPSTONE_PROMPT_TEXT, CAPSTONE_POST_MISS_HINT } from '../rigid-motions-copy'

describe('formatCoordinateRule', () => {
  it('formats translation with positive offsets', () => {
    expect(formatCoordinateRule({ type: 'translate', dx: 5, dy: 3 })).toBe('(x, y) → (x + 5, y + 3)')
  })

  it('formats translation with negative offsets using minus sign', () => {
    expect(formatCoordinateRule({ type: 'translate', dx: -3, dy: -4 })).toBe('(x, y) → (x − 3, y − 4)')
  })

  it('formats y-axis reflection', () => {
    expect(formatCoordinateRule({ type: 'reflect', axis: 'y' })).toBe('(x, y) → (−x, y)')
  })

  it('formats x-axis reflection', () => {
    expect(formatCoordinateRule({ type: 'reflect', axis: 'x' })).toBe('(x, y) → (x, −y)')
  })

  it('formats 90° clockwise rotation', () => {
    expect(formatCoordinateRule({ type: 'rotate', degrees: 90, direction: 'cw' })).toBe('(x, y) → (y, −x)')
  })

  it('formats 180° rotation', () => {
    expect(formatCoordinateRule({ type: 'rotate', degrees: 180, direction: 'cw' })).toBe('(x, y) → (−x, −y)')
  })

  it('formats 90° counter-clockwise rotation', () => {
    expect(formatCoordinateRule({ type: 'rotate', degrees: 90, direction: 'ccw' })).toBe('(x, y) → (−y, x)')
  })
})

describe('PED-01: capstone-3 non-commutativity hint gating', () => {
  it('entry copy for capstone-3 does not mention reversing the order', () => {
    expect(CAPSTONE_PROMPT_TEXT['capstone-3']).not.toMatch(/revers/i)
  })

  it('post-miss hint for capstone-3 mentions reversing the order', () => {
    expect(CAPSTONE_POST_MISS_HINT['capstone-3']).toMatch(/revers/i)
  })

  it('capstone-1 and capstone-2 have no post-miss hint (single-step / order-agnostic-by-design rounds)', () => {
    expect(CAPSTONE_POST_MISS_HINT['capstone-1']).toBeUndefined()
    expect(CAPSTONE_POST_MISS_HINT['capstone-2']).toBeUndefined()
  })
})
