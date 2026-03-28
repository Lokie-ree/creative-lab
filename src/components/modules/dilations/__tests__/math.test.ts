import { describe, it, expect } from 'vitest'
import {
  dilatePoint,
  dilateTriangle,
  sideLength,
  triangleSideLengths,
  sideRatio,
  angleDeg,
  triangleAngles,
  pointsMatch,
  trianglesMatch,
  translatePoint,
  reflectPoint,
  rotatePoint,
  composeTransformations,
  composeTriangle,
  formatCoord,
} from '../utils/math'
import type { Vec2, Triangle, TransformStep } from '../utils/types'
import { CANONICAL_TRIANGLE } from '../utils/constants'

const A: Vec2 = { x: 1, y: 1 }
const B: Vec2 = { x: 4, y: 2 }
const C: Vec2 = { x: 2, y: 4 }

describe('dilatePoint', () => {
  it('scales a point by k=2 from origin', () => {
    expect(dilatePoint(A, 2)).toEqual({ x: 2, y: 2 })
  })

  it('scales a point by k=3 from origin', () => {
    expect(dilatePoint(B, 3)).toEqual({ x: 12, y: 6 })
  })

  it('scales a point by k=0.5 from origin', () => {
    expect(dilatePoint(C, 0.5)).toEqual({ x: 1, y: 2 })
  })

  it('handles the origin (fixed point)', () => {
    expect(dilatePoint({ x: 0, y: 0 }, 5)).toEqual({ x: 0, y: 0 })
  })
})

describe('dilateTriangle', () => {
  it('dilates canonical triangle by k=2', () => {
    const result = dilateTriangle(CANONICAL_TRIANGLE, 2)
    expect(result.a).toEqual({ x: 2, y: 2 })
    expect(result.b).toEqual({ x: 8, y: 4 })
    expect(result.c).toEqual({ x: 4, y: 8 })
  })

  it('dilates canonical triangle by k=0.5', () => {
    const result = dilateTriangle(CANONICAL_TRIANGLE, 0.5)
    expect(result.a).toEqual({ x: 0.5, y: 0.5 })
    expect(result.b).toEqual({ x: 2, y: 1 })
    expect(result.c).toEqual({ x: 1, y: 2 })
  })
})

describe('sideLength', () => {
  it('computes distance between A(1,1) and B(4,2)', () => {
    expect(sideLength(A, B)).toBeCloseTo(Math.sqrt(10))
  })

  it('computes distance between same point', () => {
    expect(sideLength(A, A)).toBe(0)
  })
})

describe('triangleSideLengths', () => {
  it('returns [AB, BC, CA] for canonical triangle', () => {
    const [ab, bc, ca] = triangleSideLengths(CANONICAL_TRIANGLE)
    expect(ab).toBeCloseTo(Math.sqrt(10))  // A(1,1)→B(4,2)
    expect(bc).toBeCloseTo(Math.sqrt(8))   // B(4,2)→C(2,4)
    expect(ca).toBeCloseTo(Math.sqrt(10))  // C(2,4)→A(1,1)
  })
})

describe('sideRatio', () => {
  it('returns 2 for doubled side', () => {
    expect(sideRatio(3, 6)).toBe(2)
  })

  it('returns 0.5 for halved side', () => {
    expect(sideRatio(4, 2)).toBe(0.5)
  })
})

describe('angleDeg', () => {
  it('computes 90° for a right angle', () => {
    const vertex: Vec2 = { x: 0, y: 0 }
    const a: Vec2 = { x: 1, y: 0 }
    const b: Vec2 = { x: 0, y: 1 }
    expect(angleDeg(a, vertex, b)).toBe(90)
  })

  it('computes 180° for a straight line', () => {
    const vertex: Vec2 = { x: 0, y: 0 }
    const a: Vec2 = { x: 1, y: 0 }
    const b: Vec2 = { x: -1, y: 0 }
    expect(angleDeg(a, vertex, b)).toBe(180)
  })

  it('computes 60° for equilateral triangle vertex', () => {
    const vertex: Vec2 = { x: 0, y: 0 }
    const a: Vec2 = { x: 1, y: 0 }
    const b: Vec2 = { x: 0.5, y: Math.sqrt(3) / 2 }
    expect(angleDeg(a, vertex, b)).toBe(60)
  })
})

describe('triangleAngles', () => {
  it('angles sum to approximately 180 for canonical triangle', () => {
    const [a, b, c] = triangleAngles(CANONICAL_TRIANGLE)
    // Angles are rounded integers; sum may be off by ±1 due to rounding
    expect(Math.abs(a + b + c - 180)).toBeLessThanOrEqual(1)
  })

  it('angles are preserved under dilation', () => {
    const dilated = dilateTriangle(CANONICAL_TRIANGLE, 3)
    const [a1, b1, c1] = triangleAngles(CANONICAL_TRIANGLE)
    const [a2, b2, c2] = triangleAngles(dilated)
    expect(a2).toBe(a1)
    expect(b2).toBe(b1)
    expect(c2).toBe(c1)
  })
})

describe('pointsMatch', () => {
  it('returns true for exact match', () => {
    expect(pointsMatch({ x: 1, y: 2 }, { x: 1, y: 2 }, 0.5)).toBe(true)
  })

  it('returns true within tolerance', () => {
    expect(pointsMatch({ x: 1, y: 2 }, { x: 1.3, y: 2.3 }, 0.75)).toBe(true)
  })

  it('returns false beyond tolerance', () => {
    expect(pointsMatch({ x: 1, y: 2 }, { x: 3, y: 4 }, 0.75)).toBe(false)
  })
})

describe('trianglesMatch', () => {
  it('returns true for identical triangles', () => {
    expect(trianglesMatch(CANONICAL_TRIANGLE, CANONICAL_TRIANGLE, 0.1)).toBe(true)
  })

  it('returns false when one vertex is off', () => {
    const shifted: Triangle = { ...CANONICAL_TRIANGLE, a: { x: 5, y: 5 } }
    expect(trianglesMatch(CANONICAL_TRIANGLE, shifted, 0.5)).toBe(false)
  })
})

describe('translatePoint', () => {
  it('translates a point by (dx, dy)', () => {
    expect(translatePoint({ x: 1, y: 2 }, 3, -1)).toEqual({ x: 4, y: 1 })
  })
})

describe('reflectPoint', () => {
  it('reflects over x-axis', () => {
    expect(reflectPoint({ x: 2, y: 3 }, 'x')).toEqual({ x: 2, y: -3 })
  })

  it('reflects over y-axis', () => {
    expect(reflectPoint({ x: 2, y: 3 }, 'y')).toEqual({ x: -2, y: 3 })
  })
})

describe('rotatePoint', () => {
  it('rotates 90° CCW', () => {
    const result = rotatePoint({ x: 1, y: 0 }, 90)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(1)
  })

  it('rotates 180°', () => {
    const result = rotatePoint({ x: 3, y: 4 }, 180)
    expect(result.x).toBeCloseTo(-3)
    expect(result.y).toBeCloseTo(-4)
  })
})

describe('composeTransformations', () => {
  it('applies translate then dilate', () => {
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 1, dy: 1 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    // (1,1) → translate(1,1) → (2,2) → dilate(2) → (4,4)
    const result = composeTransformations(steps, { x: 1, y: 1 })
    expect(result).toEqual({ x: 4, y: 4 })
  })

  it('applies dilate then translate', () => {
    const steps: TransformStep[] = [
      { type: 'dilate', params: { k: 2 } },
      { type: 'translate', params: { dx: 1, dy: 1 } },
    ]
    // (1,1) → dilate(2) → (2,2) → translate(1,1) → (3,3)
    const result = composeTransformations(steps, { x: 1, y: 1 })
    expect(result).toEqual({ x: 3, y: 3 })
  })

  it('applies reflect-y then dilate', () => {
    const steps: TransformStep[] = [
      { type: 'reflect', params: { axis: 'y' } },
      { type: 'dilate', params: { k: 3 } },
    ]
    // (2,4) → reflect-y → (-2,4) → dilate(3) → (-6,12)
    const result = composeTransformations(steps, { x: 2, y: 4 })
    expect(result).toEqual({ x: -6, y: 12 })
  })

  it('applies rotate 90° then dilate', () => {
    const steps: TransformStep[] = [
      { type: 'rotate', params: { angleDeg: 90 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    // (1,0) → rotate 90° CCW → (0,1) → dilate(2) → (0,2)
    const result = composeTransformations(steps, { x: 1, y: 0 })
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(2)
  })

  it('handles empty sequence (identity)', () => {
    const result = composeTransformations([], { x: 3, y: 5 })
    expect(result).toEqual({ x: 3, y: 5 })
  })
})

describe('composeTriangle', () => {
  it('applies a sequence to all three vertices', () => {
    const steps: TransformStep[] = [
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, CANONICAL_TRIANGLE)
    expect(result.a).toEqual({ x: 2, y: 2 })
    expect(result.b).toEqual({ x: 8, y: 4 })
    expect(result.c).toEqual({ x: 4, y: 8 })
  })
})

describe('formatCoord', () => {
  it('strips trailing zeros from integers', () => {
    expect(formatCoord(2, 1)).toBe('2')
    expect(formatCoord(2, 4)).toBe('8')
  })
  it('strips trailing zero from halves', () => {
    expect(formatCoord(0.5, 1)).toBe('0.5')
    expect(formatCoord(0.5, 4)).toBe('2')
  })
  it('rounds thirds to 2 decimal places', () => {
    expect(formatCoord(0.333, 1)).toBe('0.33')
    expect(formatCoord(0.333, 4)).toBe('1.33')
    expect(formatCoord(0.333, 2)).toBe('0.67')
  })
})
