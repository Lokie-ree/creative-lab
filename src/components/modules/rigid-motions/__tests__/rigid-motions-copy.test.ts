import { describe, it, expect } from 'vitest'
import { formatCoordinateRule } from '../rigid-motions-copy'

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
