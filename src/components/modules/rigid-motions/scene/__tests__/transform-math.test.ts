/**
 * Tests for transform-math.ts
 *
 * All inputs/expected outputs are derived from the round definitions.
 * Pre-image vertices: A(-3,-2), B(1,-1), C(-2,1), centroid ≈ (-1.33, -0.67)
 */

import { describe, it, expect } from 'vitest'
import {
  centroidOf,
  translate,
  reflectOverX,
  reflectOverY,
  rotateCW90,
  rotateCW180,
  rotateCW270,
  applyTransform,
} from '../../transform-math'

// Pre-image vertices used across all tests
const A: [number, number] = [-3, -2]
const B: [number, number] = [ 1, -1]
const C: [number, number] = [-2,  1]
const PRE_IMAGE: [number, number][] = [A, B, C]

// ---------------------------------------------------------------------------
// centroidOf
// ---------------------------------------------------------------------------

describe('centroidOf', () => {
  it('computes centroid of pre-image triangle', () => {
    const [cx, cy] = centroidOf(PRE_IMAGE)
    expect(cx).toBeCloseTo(-4 / 3)
    expect(cy).toBeCloseTo(-2 / 3)
  })

  it('computes centroid of a unit square', () => {
    const verts: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]]
    const [cx, cy] = centroidOf(verts)
    expect(cx).toBeCloseTo(0.5)
    expect(cy).toBeCloseTo(0.5)
  })

  it('centroid of a single point is that point', () => {
    const [cx, cy] = centroidOf([[3, 7]])
    expect(cx).toBe(3)
    expect(cy).toBe(7)
  })
})

// ---------------------------------------------------------------------------
// translate
// ---------------------------------------------------------------------------

describe('translate', () => {
  it('translates a single vertex by (dx, dy)', () => {
    expect(translate([-3, -2], 5, 3)).toEqual([2, 1])
  })

  it('Round 1 — +5 right, +3 up: A(−3,−2) → A′(2,1)', () => {
    expect(translate(A, 5, 3)).toEqual([2, 1])
  })

  it('Round 1 — +5 right, +3 up: B(1,−1) → B′(6,2)', () => {
    expect(translate(B, 5, 3)).toEqual([6, 2])
  })

  it('Round 1 — +5 right, +3 up: C(−2,1) → C′(3,4)', () => {
    expect(translate(C, 5, 3)).toEqual([3, 4])
  })

  it('Round 2 — −3 left, −4 down: A(−3,−2) → A′(−6,−6)', () => {
    expect(translate(A, -3, -4)).toEqual([-6, -6])
  })

  it('Round 2 — −3 left, −4 down: B(1,−1) → B′(−2,−5)', () => {
    expect(translate(B, -3, -4)).toEqual([-2, -5])
  })

  it('Round 2 — −3 left, −4 down: C(−2,1) → C′(−5,−3)', () => {
    expect(translate(C, -3, -4)).toEqual([-5, -3])
  })

  it('identity translation leaves vertex unchanged', () => {
    expect(translate([3, -2], 0, 0)).toEqual([3, -2])
  })
})

// ---------------------------------------------------------------------------
// reflectOverX
// ---------------------------------------------------------------------------

describe('reflectOverX', () => {
  it('(x, y) → (x, -y)', () => {
    expect(reflectOverX([3, 4])).toEqual([3, -4])
  })

  it('Round 4 — reflect over x-axis: A(−3,−2) → A′(−3,2)', () => {
    expect(reflectOverX(A)).toEqual([-3, 2])
  })

  it('Round 4 — reflect over x-axis: B(1,−1) → B′(1,1)', () => {
    expect(reflectOverX(B)).toEqual([1, 1])
  })

  it('Round 4 — reflect over x-axis: C(−2,1) → C′(−2,−1)', () => {
    expect(reflectOverX(C)).toEqual([-2, -1])
  })

  it('point on x-axis is its own reflection', () => {
    const result = reflectOverX([5, 0])
    expect(result[0]).toBe(5)
    expect(result[1]).toBeCloseTo(0) // -0 === 0 mathematically
  })

  it('double reflection over x is identity', () => {
    const v: [number, number] = [3, 7]
    expect(reflectOverX(reflectOverX(v))).toEqual(v)
  })
})

// ---------------------------------------------------------------------------
// reflectOverY
// ---------------------------------------------------------------------------

describe('reflectOverY', () => {
  it('(x, y) → (-x, y)', () => {
    expect(reflectOverY([3, 4])).toEqual([-3, 4])
  })

  it('Round 3 — reflect over y-axis: A(−3,−2) → A′(3,−2)', () => {
    expect(reflectOverY(A)).toEqual([3, -2])
  })

  it('Round 3 — reflect over y-axis: B(1,−1) → B′(−1,−1)', () => {
    expect(reflectOverY(B)).toEqual([-1, -1])
  })

  it('Round 3 — reflect over y-axis: C(−2,1) → C′(2,1)', () => {
    expect(reflectOverY(C)).toEqual([2, 1])
  })

  it('point on y-axis is its own reflection', () => {
    const result = reflectOverY([0, 5])
    expect(result[0]).toBeCloseTo(0) // -0 === 0 mathematically
    expect(result[1]).toBe(5)
  })

  it('double reflection over y is identity', () => {
    const v: [number, number] = [3, 7]
    expect(reflectOverY(reflectOverY(v))).toEqual(v)
  })
})

// ---------------------------------------------------------------------------
// rotateCW90
// ---------------------------------------------------------------------------

describe('rotateCW90', () => {
  it('(x, y) → (y, -x)', () => {
    expect(rotateCW90([1, 0])).toEqual([0, -1])
  })

  it('Round 5 — rotate 90° CW around origin: A(−3,−2) → A′(−2,3)', () => {
    // (x,y) → (y,-x): (-3,-2) → (-2,3)
    expect(rotateCW90(A)).toEqual([-2, 3])
  })

  it('Round 5 — rotate 90° CW around origin: B(1,−1) → B′(−1,−1)', () => {
    // (1,-1) → (-1,-1)
    expect(rotateCW90(B)).toEqual([-1, -1])
  })

  it('Round 5 — rotate 90° CW around origin: C(−2,1) → C′(1,2)', () => {
    // (-2,1) → (1,2)
    expect(rotateCW90(C)).toEqual([1, 2])
  })

  it('4× CW90 is identity', () => {
    const v: [number, number] = [3, 7]
    expect(rotateCW90(rotateCW90(rotateCW90(rotateCW90(v))))).toEqual(v)
  })
})

// ---------------------------------------------------------------------------
// rotateCW180
// ---------------------------------------------------------------------------

describe('rotateCW180', () => {
  it('(x, y) → (-x, -y)', () => {
    expect(rotateCW180([3, 4])).toEqual([-3, -4])
  })

  it('point at origin stays at origin', () => {
    const result = rotateCW180([0, 0])
    expect(result[0]).toBeCloseTo(0) // -0 === 0 mathematically
    expect(result[1]).toBeCloseTo(0)
  })

  it('2× CW180 is identity', () => {
    const v: [number, number] = [3, 7]
    expect(rotateCW180(rotateCW180(v))).toEqual(v)
  })

  it('CW180 equals reflect-over-x then reflect-over-y', () => {
    const v: [number, number] = [3, 7]
    const via180 = rotateCW180(v)
    const viaReflect = reflectOverY(reflectOverX(v))
    expect(via180).toEqual(viaReflect)
  })
})

// ---------------------------------------------------------------------------
// rotateCW270
// ---------------------------------------------------------------------------

describe('rotateCW270', () => {
  it('(x, y) → (-y, x)', () => {
    const result = rotateCW270([1, 0])
    expect(result[0]).toBeCloseTo(0) // -0 === 0 mathematically
    expect(result[1]).toBe(1)
  })

  it('CW270 is the inverse of CW90', () => {
    const v: [number, number] = [3, 7]
    expect(rotateCW270(rotateCW90(v))).toEqual(v)
  })

  it('CW90 is the inverse of CW270', () => {
    const v: [number, number] = [3, 7]
    expect(rotateCW90(rotateCW270(v))).toEqual(v)
  })

  it('3× CW90 equals CW270', () => {
    const v: [number, number] = [3, 7]
    const triple = rotateCW90(rotateCW90(rotateCW90(v)))
    expect(rotateCW270(v)).toEqual(triple)
  })
})

// ---------------------------------------------------------------------------
// applyTransform — uses round definitions as integration tests
// ---------------------------------------------------------------------------

describe('applyTransform', () => {
  it('Round 1 — translate {dx:5, dy:3} maps pre-image to correct target vertices', () => {
    const result = applyTransform(PRE_IMAGE, { type: 'translate', dx: 5, dy: 3 })
    expect(result[0]).toEqual([2, 1])   // A′
    expect(result[1]).toEqual([6, 2])   // B′
    expect(result[2]).toEqual([3, 4])   // C′
  })

  it('Round 2 — translate {dx:-3, dy:-4} maps pre-image to correct target vertices', () => {
    const result = applyTransform(PRE_IMAGE, { type: 'translate', dx: -3, dy: -4 })
    expect(result[0]).toEqual([-6, -6]) // A′
    expect(result[1]).toEqual([-2, -5]) // B′
    expect(result[2]).toEqual([-5, -3]) // C′
  })

  it('Round 3 — reflect {axis:"y"} maps pre-image to correct target vertices', () => {
    const result = applyTransform(PRE_IMAGE, { type: 'reflect', axis: 'y' })
    expect(result[0]).toEqual([3, -2])  // A′
    expect(result[1]).toEqual([-1, -1]) // B′
    expect(result[2]).toEqual([2, 1])   // C′
  })

  it('Round 4 — reflect {axis:"x"} maps pre-image to correct target vertices', () => {
    const result = applyTransform(PRE_IMAGE, { type: 'reflect', axis: 'x' })
    expect(result[0]).toEqual([-3, 2])  // A′
    expect(result[1]).toEqual([1, 1])   // B′
    expect(result[2]).toEqual([-2, -1]) // C′
  })

  it('Round 5 — rotate {degrees:90, direction:"cw"} maps pre-image to correct target vertices', () => {
    const result = applyTransform(PRE_IMAGE, { type: 'rotate', degrees: 90, direction: 'cw' })
    expect(result[0]).toEqual([-2, 3])  // A′
    expect(result[1]).toEqual([-1, -1]) // B′
    expect(result[2]).toEqual([1, 2])   // C′
  })

  it('Round 4 and Round 5 produce different centroids and different vertices', () => {
    const r4 = applyTransform(PRE_IMAGE, { type: 'reflect', axis: 'x' })
    const r5 = applyTransform(PRE_IMAGE, { type: 'rotate', degrees: 90, direction: 'cw' })
    // Vertices differ — scoring distinguishes them at vertex level
    expect(r4[0]).not.toEqual(r5[0]) // A′ differs
    expect(r4[2]).not.toEqual(r5[2]) // C′ differs
  })

  it('rotate 180° CW maps pre-image correctly', () => {
    const result = applyTransform(PRE_IMAGE, { type: 'rotate', degrees: 180, direction: 'cw' })
    expect(result[0]).toEqual([3, 2])   // A(-3,-2) → (3,2)
    expect(result[1]).toEqual([-1, 1])  // B(1,-1) → (-1,1)
    expect(result[2]).toEqual([2, -1])  // C(-2,1) → (2,-1)
  })

  it('rotate 270° CW maps pre-image correctly', () => {
    // CW270 = CCW90: (x,y) → (-y, x)
    const result = applyTransform(PRE_IMAGE, { type: 'rotate', degrees: 270, direction: 'cw' })
    expect(result[0]).toEqual([2, -3])  // A(-3,-2) → (2,-3)
    expect(result[1]).toEqual([1, 1])   // B(1,-1) → (1,1)
    expect(result[2]).toEqual([-1, -2]) // C(-2,1) → (-1,-2)
  })

  it('rotate CCW 90° equals CW 270°', () => {
    const ccw90 = applyTransform(PRE_IMAGE, { type: 'rotate', degrees: 90, direction: 'ccw' })
    const cw270 = applyTransform(PRE_IMAGE, { type: 'rotate', degrees: 270, direction: 'cw' })
    expect(ccw90).toEqual(cw270)
  })
})
