import { describe, it, expect } from 'vitest'
import { triangleAngles } from '../utils/math'
import {
  AA_DISCOVER_SUB_PAIRS,
  AA_CONFIRM_PAIR,
  CAPSTONE_PAIRS,
} from '../utils/aaTasks'

function sortedAngles(t: Parameters<typeof triangleAngles>[0]) {
  return [...triangleAngles(t)].sort((a, b) => a - b)
}

function anglesMatch(a: number[], b: number[], tol = 2) {
  return a.every((v, i) => Math.abs(v - b[i]) <= tol)
}

describe('AA_DISCOVER_SUB_PAIRS', () => {
  it('sub-pair 1: all 3 sorted angles match', () => {
    const s = AA_DISCOVER_SUB_PAIRS[0]
    expect(anglesMatch(sortedAngles(s.preImage), sortedAngles(s.target))).toBe(true)
    expect(s.showMatchCount).toBe(3)
  })

  it('sub-pair 2: triangles are similar, showMatchCount is 2', () => {
    const s = AA_DISCOVER_SUB_PAIRS[1]
    expect(anglesMatch(sortedAngles(s.preImage), sortedAngles(s.target))).toBe(true)
    expect(s.showMatchCount).toBe(2)
  })
})

describe('AA_CONFIRM_PAIR', () => {
  it('no sorted angle pair matches within 2°', () => {
    const preAngles = sortedAngles(AA_CONFIRM_PAIR.preImage)
    const tgtAngles = sortedAngles(AA_CONFIRM_PAIR.target)
    const anyMatch = preAngles.some((v, i) => Math.abs(v - tgtAngles[i]) <= 2)
    expect(anyMatch).toBe(false)
  })
})

describe('CAPSTONE_PAIRS', () => {
  it('pair 1 is similar', () => {
    const p = CAPSTONE_PAIRS[0]
    expect(p.isSimilar).toBe(true)
    expect(anglesMatch(sortedAngles(p.preImage), sortedAngles(p.target))).toBe(true)
    expect(p.maxSteps).toBe(2)
  })

  it('pair 2 is not similar', () => {
    const p = CAPSTONE_PAIRS[1]
    expect(p.isSimilar).toBe(false)
    const preAngles = sortedAngles(p.preImage)
    const tgtAngles = sortedAngles(p.target)
    expect(preAngles.some((v, i) => Math.abs(v - tgtAngles[i]) <= 2)).toBe(false)
    expect(p.maxSteps).toBe(2)
  })

  it('pair 3 is similar', () => {
    const p = CAPSTONE_PAIRS[2]
    expect(p.isSimilar).toBe(true)
    expect(anglesMatch(sortedAngles(p.preImage), sortedAngles(p.target))).toBe(true)
    expect(p.maxSteps).toBe(3)
  })
})
