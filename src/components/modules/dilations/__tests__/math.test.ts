import { describe, it, expect } from 'vitest'
import {
  dilatePoint,
  dilateTriangle,
  sideLength,
  triangleSideLengths,
  sideRatio,
} from '../utils/math'
import type { Vec2, Triangle } from '../utils/types'
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
