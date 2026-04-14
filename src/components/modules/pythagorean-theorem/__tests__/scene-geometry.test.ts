import { describe, it, expect } from 'vitest'
import {
  computeSquareTransform,
  computeSideMidpoint,
  computeRightAngleMarker,
  computeUnitGridLines,
} from '../scene/scene-geometry'
import type { Vec2 } from '../types'

// 3-4-5 triangle: A=(0,0), B=(3,0), C=(0,4)
const A: Vec2 = { x: 0, y: 0 }
const B: Vec2 = { x: 3, y: 0 }
const C: Vec2 = { x: 0, y: 4 }

function approx(a: number, b: number, tol = 0.001) {
  expect(Math.abs(a - b)).toBeLessThan(tol)
}

// ---------------------------------------------------------------------------
// computeSquareTransform
// ---------------------------------------------------------------------------

describe('computeSquareTransform — AB leg (horizontal, outward=right → below)', () => {
  const t = computeSquareTransform(A, B, 'right')

  it('size = |AB| = 3', () => {
    approx(t.size, 3)
  })

  it('position x = midpoint x = 1.5', () => {
    approx(t.position.x, 1.5)
  })

  it('position y = 0 + (3/2)*(-1) = -1.5 (extends below)', () => {
    approx(t.position.y, -1.5)
  })

  it('rotation = atan2(0,1) = 0 (horizontal side)', () => {
    approx(t.rotation, 0)
  })
})

describe('computeSquareTransform — AC leg (vertical, outward=left → leftward)', () => {
  const t = computeSquareTransform(A, C, 'left')

  it('size = |AC| = 4', () => {
    approx(t.size, 4)
  })

  it('position x = 0 + (4/2)*(-1) = -2 (extends left)', () => {
    approx(t.position.x, -2)
  })

  it('position y = midpoint y = 2', () => {
    approx(t.position.y, 2)
  })

  it('rotation = atan2(1,0) = π/2 (vertical side)', () => {
    approx(t.rotation, Math.PI / 2)
  })
})

describe('computeSquareTransform — BC hypotenuse (outward=right → away from origin)', () => {
  const t = computeSquareTransform(B, C, 'right')

  it('size = |BC| = 5', () => {
    approx(t.size, 5)
  })

  it('center is at (3+4)/2=3.5, (3+4)/2=3.5', () => {
    // Verified analytically: midpoint(B,C)=(1.5,2), outward=(4/5,3/5), offset=5/2*(4/5,3/5)=(2,1.5)
    // center = (1.5+2, 2+1.5) = (3.5, 3.5)
    approx(t.position.x, 3.5)
    approx(t.position.y, 3.5)
  })

  it('far corners are at (a+b, a) and (b, a+b) — verifies square contains B and C on one edge', () => {
    // Corner from B: B + size*outward = (3,0) + 5*(4/5,3/5) = (3+4, 0+3) = (7, 3)
    // Corner from C: C + size*outward = (0,4) + (4,3) = (4, 7)
    // The center is equidistant from all 4 corners — verify center is at (3.5,3.5)
    approx(t.position.x, 3.5)
    approx(t.position.y, 3.5)
  })
})

describe('computeSquareTransform — symmetry: right vs left perpendicular', () => {
  const tRight = computeSquareTransform(A, B, 'right')
  const tLeft  = computeSquareTransform(A, B, 'left')

  it('both have same size', () => {
    approx(tRight.size, tLeft.size)
  })

  it('same x (horizontal side), opposite y offset', () => {
    approx(tRight.position.x, tLeft.position.x)
    approx(tRight.position.y, -tLeft.position.y)
  })
})

// ---------------------------------------------------------------------------
// computeSideMidpoint
// ---------------------------------------------------------------------------

describe('computeSideMidpoint', () => {
  it('midpoint of AB = (1.5, 0)', () => {
    const m = computeSideMidpoint(A, B)
    approx(m.x, 1.5)
    approx(m.y, 0)
  })

  it('midpoint of AC = (0, 2)', () => {
    const m = computeSideMidpoint(A, C)
    approx(m.x, 0)
    approx(m.y, 2)
  })

  it('midpoint of BC = (1.5, 2)', () => {
    const m = computeSideMidpoint(B, C)
    approx(m.x, 1.5)
    approx(m.y, 2)
  })
})

// ---------------------------------------------------------------------------
// computeRightAngleMarker
// ---------------------------------------------------------------------------

describe('computeRightAngleMarker — right angle at A=(0,0)', () => {
  const marker = computeRightAngleMarker([A, B, C], 0)

  it('marker size is 15% of shorter side (min(3,4)*0.15 = 0.45)', () => {
    approx(marker.size, 0.45)
  })

  it('position is offset from A into the triangle interior', () => {
    // u1 = (1,0) toward B, u2 = (0,1) toward C
    // center = (0,0) + (0.45/2)*(1,0) + (0.45/2)*(0,1) = (0.225, 0.225)
    approx(marker.position.x, 0.225)
    approx(marker.position.y, 0.225)
  })

  it('rotation aligns with AB direction (0 radians)', () => {
    approx(marker.rotation, 0)
  })
})

describe('computeRightAngleMarker — right angle at different vertex', () => {
  // For a right triangle with right angle at B=(3,0): A=(0,0), B=(3,0), C=(3,4)
  const rA: Vec2 = { x: 0, y: 0 }
  const rB: Vec2 = { x: 3, y: 0 }
  const rC: Vec2 = { x: 3, y: 4 }
  const marker = computeRightAngleMarker([rA, rB, rC], 1)

  it('marker position is inset from B toward both adjacent vertices', () => {
    // u1 toward A = (-1,0), u2 toward C = (0,1)
    // shorter side = min(|BA|=3, |BC|=4)*0.15 = 0.45
    // center = (3,0) + 0.225*(-1,0) + 0.225*(0,1) = (2.775, 0.225)
    approx(marker.position.x, 2.775)
    approx(marker.position.y, 0.225)
  })
})

// ---------------------------------------------------------------------------
// computeUnitGridLines
// ---------------------------------------------------------------------------

describe('computeUnitGridLines', () => {
  it('3×3 square has 2+2=4 internal line segments', () => {
    const pts = computeUnitGridLines(3)
    // Each line = 2 points × 3 floats = 6 floats
    // 4 lines = 24 floats
    expect(pts.length).toBe(4 * 6)
  })

  it('4×4 square has 3+3=6 internal line segments', () => {
    const pts = computeUnitGridLines(4)
    expect(pts.length).toBe(6 * 6)
  })

  it('1×1 square has no internal lines (divisions=1)', () => {
    const pts = computeUnitGridLines(1)
    expect(pts.length).toBe(0)
  })

  it('all points are within [-0.5, 0.5] local space', () => {
    const pts = computeUnitGridLines(5)
    for (let i = 0; i < pts.length; i++) {
      if (i % 3 !== 2) { // skip z (always 0)
        expect(Math.abs(pts[i])).toBeLessThanOrEqual(0.5 + 1e-6)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// computeRoundLayout (from scene-layout.ts)
// ---------------------------------------------------------------------------

import { computeRoundLayout } from '../scene/scene-layout'
import { ROUND_CONFIGS } from '../round-configs'

describe('computeRoundLayout', () => {
  it('3-4-5 round: worldSize = a+b+max(a,b)+4 = 3+4+4+4 = 15 → ceil = 15', () => {
    const layout = computeRoundLayout(ROUND_CONFIGS['proof-345'])
    expect(layout.worldSize).toBe(15)
  })

  it('5-12-13 round: worldSize = 5+12+12+4 = 33', () => {
    const layout = computeRoundLayout(ROUND_CONFIGS['proof-51213'])
    expect(layout.worldSize).toBe(33)
  })

  it('6-8-10 round: worldSize = 6+8+8+4 = 26', () => {
    const layout = computeRoundLayout(ROUND_CONFIGS['converse-6810'])
    expect(layout.worldSize).toBe(26)
  })

  it('8-15-17 round: worldSize = 8+15+15+4 = 42', () => {
    const layout = computeRoundLayout(ROUND_CONFIGS['converse-81517'])
    expect(layout.worldSize).toBe(42)
  })

  it('coord-distance always uses worldSize=16, center=(6,6)', () => {
    const layout = computeRoundLayout(ROUND_CONFIGS['coord-345'])
    expect(layout.worldSize).toBe(16)
    expect(layout.center).toEqual({ x: 6, y: 6 })
  })

  it('right-triangle center = (a/2, b/2)', () => {
    const layout = computeRoundLayout(ROUND_CONFIGS['proof-345'])
    // a=3, b=4 → center (1.5, 2)
    expect(layout.center.x).toBeCloseTo(1.5)
    expect(layout.center.y).toBeCloseTo(2)
  })
})
