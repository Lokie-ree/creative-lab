import { describe, it, expect } from 'vitest'
import { computeMatchColors } from '../components/AngleLabels'

const GHOST = '#7a746a'

describe('computeMatchColors', () => {
  it('all 3 match → 3 colors on both triangles', () => {
    const preAngles: [number, number, number] = [90, 45, 45]
    const tgtAngles: [number, number, number] = [90, 45, 45]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 3)
    expect(pre.filter(c => c !== GHOST)).toHaveLength(3)
    expect(tgt.filter(c => c !== GHOST)).toHaveLength(3)
  })

  it('showMatchCount: 2 → only 2 pairs colored, 1 ghost on each', () => {
    const preAngles: [number, number, number] = [90, 53, 37]
    const tgtAngles: [number, number, number] = [90, 53, 37]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 2)
    expect(pre.filter(c => c !== GHOST)).toHaveLength(2)
    expect(tgt.filter(c => c !== GHOST)).toHaveLength(2)
  })

  it('no matches → all ghost', () => {
    const preAngles: [number, number, number] = [90, 37, 53]
    const tgtAngles: [number, number, number] = [63, 63, 54]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 3)
    expect(pre).toEqual([GHOST, GHOST, GHOST])
    expect(tgt).toEqual([GHOST, GHOST, GHOST])
  })

  it('matched colors are the same across both triangles for each pair', () => {
    const preAngles: [number, number, number] = [90, 45, 45]
    const tgtAngles: [number, number, number] = [45, 90, 45]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 3)
    const preColors = pre.filter(c => c !== GHOST)
    const tgtColors = tgt.filter(c => c !== GHOST)
    for (const c of preColors) {
      expect(tgtColors).toContain(c)
    }
  })
})
