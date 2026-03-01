import { describe, it, expect } from 'vitest'
import { ghostVertices, clampOffset, vertexLabelOffset } from '../scene-math'
import { PRE_IMAGE_VERTICES, CONTENT_RANGE } from '../../constants'

describe('ghostVertices', () => {
  it('offsets each vertex by the given [dx, dy]', () => {
    const result = ghostVertices([2, 3])
    // PRE_IMAGE_VERTICES: [1,1], [4,2], [2,4]
    expect(result[0]).toEqual([3, 4])
    expect(result[1]).toEqual([6, 5])
    expect(result[2]).toEqual([4, 7])
  })

  it('works with zero offset', () => {
    const result = ghostVertices([0, 0])
    expect(result).toEqual([[1, 1], [4, 2], [2, 4]])
  })

  it('works with negative offset', () => {
    const result = ghostVertices([-1, -1])
    expect(result[0]).toEqual([0, 0])
  })
})

describe('clampOffset', () => {
  // Pre-image centroid is (2.333..., 2.333...)
  // Max positive offset: CONTENT_RANGE - centroid ≈ 3.666
  // Max negative offset: -CONTENT_RANGE - centroid ≈ -8.333

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
