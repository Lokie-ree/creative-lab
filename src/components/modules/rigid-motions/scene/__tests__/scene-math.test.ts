import { describe, it, expect } from 'vitest'
import { ghostVertices, clampOffset, vertexLabelOffset, ghostVerticesWithFlip, ghostVerticesWithRotation, computeGhostVertices } from '../scene-math'
import { PRE_IMAGE_VERTICES, CONTENT_RANGE } from '../../constants'

describe('ghostVertices', () => {
  it('offsets each vertex by the given [dx, dy]', () => {
    const result = ghostVertices([2, 3])
    // PRE_IMAGE_VERTICES: [-3,-2], [1,-1], [-2,1]
    expect(result[0]).toEqual([-1, 1])
    expect(result[1]).toEqual([3, 2])
    expect(result[2]).toEqual([0, 4])
  })

  it('works with zero offset', () => {
    const result = ghostVertices([0, 0])
    expect(result).toEqual([[-3, -2], [1, -1], [-2, 1]])
  })

  it('works with negative offset', () => {
    const result = ghostVertices([-1, -1])
    expect(result[0]).toEqual([-4, -3])
  })
})

describe('clampOffset', () => {
  // Pre-image centroid is (-1.333..., -0.667...)
  // Max positive offset: CONTENT_RANGE - centroid ≈ 7.333 (x), 6.667 (y)
  // Max negative offset: -CONTENT_RANGE - centroid ≈ -4.667 (x), -5.333 (y)

  it('passes through an offset that keeps the ghost centroid in range', () => {
    const result = clampOffset([1, 1])
    expect(result).toEqual([1, 1])
  })

  it('clamps when ghost centroid would exceed +CONTENT_RANGE', () => {
    const result = clampOffset([10, 0])
    const ghostCentroidX = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / 3 + result[0]
    expect(ghostCentroidX).toBeLessThanOrEqual(CONTENT_RANGE)
  })

  it('clamps when ghost centroid would go below -CONTENT_RANGE', () => {
    const result = clampOffset([-10, 0])
    const ghostCentroidX = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / 3 + result[0]
    expect(ghostCentroidX).toBeGreaterThanOrEqual(-CONTENT_RANGE)
  })

  it('clamps both axes independently', () => {
    const result = clampOffset([100, 100])
    const cx = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / 3 + result[0]
    const cy = PRE_IMAGE_VERTICES.reduce((s, [, y]) => s + y, 0) / 3 + result[1]
    expect(cx).toBeLessThanOrEqual(CONTENT_RANGE)
    expect(cy).toBeLessThanOrEqual(CONTENT_RANGE)
  })
})

// ---------------------------------------------------------------------------
// ghostVerticesWithFlip
// Pre-image (offset [0,0]): A(-3,-2) B(1,-1) C(-2,1), centroid = (-4/3, -2/3) ≈ (-1.33, -0.67)
// ---------------------------------------------------------------------------

describe('ghostVerticesWithFlip', () => {
  it('returns un-flipped vertices when flipped=false', () => {
    const result = ghostVerticesWithFlip([0, 0], 'y', false)
    expect(result).toEqual([[-3, -2], [1, -1], [-2, 1]])
  })

  it('flips horizontally around ghost centroid when axis=y, flipped=true', () => {
    // centroid = (-4/3, -2/3). Mirror each x: new_x = 2*(-4/3) - x
    const result = ghostVerticesWithFlip([0, 0], 'y', true)
    expect(result[0][0]).toBeCloseTo(2 * (-4 / 3) - (-3)) // A: -8/3+3 = 1/3 ≈ 0.33
    expect(result[0][1]).toBeCloseTo(-2)                    // y unchanged
    expect(result[1][0]).toBeCloseTo(2 * (-4 / 3) - 1)   // B: -8/3-1 = -11/3 ≈ -3.67
    expect(result[2][0]).toBeCloseTo(2 * (-4 / 3) - (-2)) // C: -8/3+2 = -2/3 ≈ -0.67
  })

  it('flips vertically around ghost centroid when axis=x, flipped=true', () => {
    // centroid = (-4/3, -2/3). Mirror each y: new_y = 2*(-2/3) - y
    const result = ghostVerticesWithFlip([0, 0], 'x', true)
    expect(result[0][1]).toBeCloseTo(2 * (-2 / 3) - (-2)) // A: -4/3+2 = 2/3 ≈ 0.67
    expect(result[0][0]).toBeCloseTo(-3)                    // x unchanged
    expect(result[1][1]).toBeCloseTo(2 * (-2 / 3) - (-1)) // B: -4/3+1 = -1/3 ≈ -0.33
    expect(result[2][1]).toBeCloseTo(2 * (-2 / 3) - 1)   // C: -4/3-1 = -7/3 ≈ -2.33
  })

  it('applying flip twice returns to original', () => {
    const once = ghostVerticesWithFlip([0, 0], 'y', true)
    // Manually apply flip again: centroid of once, mirror x
    const cx = once.reduce((s, [x]) => s + x, 0) / 3
    const twice = once.map(([x, y]): [number, number] => [2 * cx - x, y])
    const orig = ghostVerticesWithFlip([0, 0], 'y', false)
    twice.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(orig[i][0])
      expect(y).toBeCloseTo(orig[i][1])
    })
  })
})

// ---------------------------------------------------------------------------
// ghostVerticesWithRotation
// Pre-image (offset [0,0]): centroid = (-4/3, -2/3)
// ---------------------------------------------------------------------------

describe('ghostVerticesWithRotation', () => {
  it('radius from ghost centroid is preserved under rotation', () => {
    const cx = -4 / 3
    const cy = -2 / 3
    const result = ghostVerticesWithRotation([0, 0], 90, 'cw')
    result.forEach(([x, y], i) => {
      const [ox, oy] = PRE_IMAGE_VERTICES[i] as [number, number]
      const rOrig = Math.sqrt((ox - cx) ** 2 + (oy - cy) ** 2)
      const rRot  = Math.sqrt((x  - cx) ** 2 + (y  - cy) ** 2)
      expect(rRot).toBeCloseTo(rOrig)
    })
  })

  it('CW90 followed by CW270 around ghost centroid returns to original', () => {
    // CW90 rotated centroid = same centroid (rotation preserves it).
    // Applying CW270 after CW90 should return to original vertices.
    const rotated90 = ghostVerticesWithRotation([0, 0], 90, 'cw')
    // Manually apply CW270 around the same centroid
    const [cx, cy] = [-4 / 3, -2 / 3]
    const unrotated = rotated90.map(([x, y]): [number, number] => {
      // CW270 = (x,y) → (-y, x) in local coords
      const lx = x - cx, ly = y - cy
      return [(-ly) + cx, lx + cy]
    })
    const orig = ghostVertices([0, 0])
    unrotated.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(orig[i][0])
      expect(y).toBeCloseTo(orig[i][1])
    })
  })
})

// ---------------------------------------------------------------------------
// computeGhostVertices — composition order is load-bearing (translate first)
// ---------------------------------------------------------------------------

describe('computeGhostVertices', () => {
  it('predict-translate: returns plain translated vertices', () => {
    const result = computeGhostVertices([2, 1], 'predict-translate', false, 90, 'cw')
    expect(result).toEqual(ghostVertices([2, 1]))
  })

  it('predict-reflect, flipped=false: returns translated vertices (no flip)', () => {
    const result = computeGhostVertices([2, 1], 'predict-reflect', false, 90, 'cw', 'y')
    expect(result).toEqual(ghostVertices([2, 1]))
  })

  it('predict-reflect, flipped=true: applies flip around translated centroid', () => {
    const flipped = computeGhostVertices([0, 0], 'predict-reflect', true, 90, 'cw', 'y')
    const manual  = ghostVerticesWithFlip([0, 0], 'y', true)
    flipped.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(manual[i][0])
      expect(y).toBeCloseTo(manual[i][1])
    })
  })

  it('predict-rotate: applies rotation around translated centroid', () => {
    const rotated = computeGhostVertices([0, 0], 'predict-rotate', false, 90, 'cw')
    const manual  = ghostVerticesWithRotation([0, 0], 90, 'cw')
    rotated.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(manual[i][0])
      expect(y).toBeCloseTo(manual[i][1])
    })
  })

  it('non-predict guide states return plain translated vertices', () => {
    const result = computeGhostVertices([1, 0], 'coordinate-reveal', false, 90, 'cw')
    expect(result).toEqual(ghostVertices([1, 0]))
  })
})

describe('computeGhostVertices — Phase 3 states', () => {
  const OFFSET: [number, number] = [1, 2]

  it('predict-with-coordinates-reflect behaves identically to predict-reflect (flipped=true, axis=y)', () => {
    const phase2 = computeGhostVertices(OFFSET, 'predict-reflect', true, 90, 'cw', 'y')
    const phase3 = computeGhostVertices(OFFSET, 'predict-with-coordinates-reflect', true, 90, 'cw', 'y')
    expect(phase3).toEqual(phase2)
  })

  it('predict-with-coordinates-reflect with flipped=false gives plain translation', () => {
    const plain = computeGhostVertices(OFFSET, 'predict-translate', false, 90, 'cw')
    const phase3 = computeGhostVertices(OFFSET, 'predict-with-coordinates-reflect', false, 90, 'cw', 'y')
    expect(phase3).toEqual(plain)
  })

  it('predict-with-coordinates-rotate behaves identically to predict-rotate', () => {
    const phase2 = computeGhostVertices(OFFSET, 'predict-rotate', false, 90, 'cw')
    const phase3 = computeGhostVertices(OFFSET, 'predict-with-coordinates-rotate', false, 90, 'cw')
    expect(phase3).toEqual(phase2)
  })

  it('predict-with-coordinates-translate gives plain translation (same as predict-translate)', () => {
    const plain = computeGhostVertices(OFFSET, 'predict-translate', false, 90, 'cw')
    const phase3 = computeGhostVertices(OFFSET, 'predict-with-coordinates-translate', false, 90, 'cw')
    expect(phase3).toEqual(plain)
  })
})

describe('vertexLabelOffset', () => {
  it('returns a point offset outward from the centroid', () => {
    const vertex: [number, number] = [4, 2]
    const centroid: [number, number] = [2, 2]
    const dist = 0.5
    const result = vertexLabelOffset(vertex, centroid, dist)
    // Direction is [1, 0], so offset should be [4 + 0.5, 2]
    expect(result[0]).toBeCloseTo(4.5)
    expect(result[1]).toBeCloseTo(2)
  })

  it('returns the vertex position when vertex equals centroid', () => {
    const vertex: [number, number] = [2, 2]
    const centroid: [number, number] = [2, 2]
    const result = vertexLabelOffset(vertex, centroid, 0.5)
    expect(result[0]).toBe(2)
    expect(result[1]).toBe(2)
  })
})
