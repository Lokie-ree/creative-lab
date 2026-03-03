/**
 * Tests for interpolateReveal in animations.ts
 *
 * The function is pure math driven by a GSAP t value (0 → 1).
 * Tests verify boundary conditions and midpoint behavior per spec v3.1.
 *
 * Pre-image: A(1,1) B(4,2) C(2,4)
 */

import { describe, it, expect } from 'vitest'
import { interpolateReveal } from '../../animations'

const PRE_IMAGE: [number, number][] = [[1, 1], [4, 2], [2, 4]]

// ---------------------------------------------------------------------------
// translate — linear lerp of each vertex
// ---------------------------------------------------------------------------

describe('interpolateReveal — translate', () => {
  const params = { type: 'translate' as const, dx: 4, dy: 2 }
  const target: [number, number][] = [[5, 3], [8, 4], [6, 6]]

  it('t=0 returns the from vertices', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0, 'translate', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(PRE_IMAGE[i][0])
      expect(y).toBeCloseTo(PRE_IMAGE[i][1])
    })
  })

  it('t=1 returns the target vertices', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 1, 'translate', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(target[i][0])
      expect(y).toBeCloseTo(target[i][1])
    })
  })

  it('t=0.5 is exactly halfway between from and target', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0.5, 'translate', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo((PRE_IMAGE[i][0] + target[i][0]) / 2)
      expect(y).toBeCloseTo((PRE_IMAGE[i][1] + target[i][1]) / 2)
    })
  })
})

// ---------------------------------------------------------------------------
// reflect over y-axis — x passes through 0 at t=0.5; y constant
// ---------------------------------------------------------------------------

describe('interpolateReveal — reflect over y-axis', () => {
  const params = { type: 'reflect' as const, axis: 'y' as const }
  const target: [number, number][] = [[-1, 1], [-4, 2], [-2, 4]]

  it('t=0 returns from vertices', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0, 'reflect', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(PRE_IMAGE[i][0])
      expect(y).toBeCloseTo(PRE_IMAGE[i][1])
    })
  })

  it('t=1 returns target vertices', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 1, 'reflect', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(target[i][0])
      expect(y).toBeCloseTo(target[i][1])
    })
  })

  it('t=0.5 — x coordinate passes through 0 (on the y-axis), y is constant', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0.5, 'reflect', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(0)           // passes through y-axis at midpoint
      expect(y).toBeCloseTo(PRE_IMAGE[i][1]) // y is constant throughout
    })
  })
})

// ---------------------------------------------------------------------------
// reflect over x-axis — y passes through 0 at t=0.5; x constant
// ---------------------------------------------------------------------------

describe('interpolateReveal — reflect over x-axis', () => {
  const params = { type: 'reflect' as const, axis: 'x' as const }
  const target: [number, number][] = [[1, -1], [4, -2], [2, -4]]

  it('t=0.5 — y coordinate passes through 0 (on the x-axis), x is constant', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0.5, 'reflect', params)
    result.forEach(([x, y], i) => {
      expect(y).toBeCloseTo(0)           // passes through x-axis at midpoint
      expect(x).toBeCloseTo(PRE_IMAGE[i][0]) // x is constant throughout
    })
  })
})

// ---------------------------------------------------------------------------
// rotate 90° CW — each vertex sweeps circular arc around origin
// ---------------------------------------------------------------------------

describe('interpolateReveal — rotate 90° CW', () => {
  const params = { type: 'rotate' as const, degrees: 90 as const, direction: 'cw' as const }
  const target: [number, number][] = [[1, -1], [2, -4], [4, -2]]

  it('t=0 returns from vertices', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0, 'rotate', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(PRE_IMAGE[i][0])
      expect(y).toBeCloseTo(PRE_IMAGE[i][1])
    })
  })

  it('t=1 returns target vertices', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 1, 'rotate', params)
    result.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(target[i][0])
      expect(y).toBeCloseTo(target[i][1])
    })
  })

  it('radius from origin is constant throughout animation (t=0.5)', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0.5, 'rotate', params)
    result.forEach(([x, y], i) => {
      const rFrom = Math.sqrt(PRE_IMAGE[i][0] ** 2 + PRE_IMAGE[i][1] ** 2)
      const rMid  = Math.sqrt(x ** 2 + y ** 2)
      expect(rMid).toBeCloseTo(rFrom)
    })
  })

  it('arc sweeps 45° at t=0.5 (half of 90°)', () => {
    const result = interpolateReveal(PRE_IMAGE, target, 0.5, 'rotate', params)
    // Vertex A(1,1): starts at angle 45°, sweeps -90° CW to -45°. At t=0.5: -90°*(−1)*0.5 = −45° → angle 0°
    // Actually: startAngle = atan2(1,1) = π/4. totalAngle = -π/2 (CW). At t=0.5: angle = π/4 - π/4 = 0
    const [ax, ay] = result[0] // vertex A
    const angle = Math.atan2(ay, ax)
    expect(angle).toBeCloseTo(0) // on the positive x-axis at midpoint
  })
})
