import { describe, it, expect } from 'vitest'
import { GUIDE_STATE_SEQUENCE, getGuideStateConfig, nextGuideState, guideStateToStage } from '../../guide-state'

describe('GUIDE_STATE_SEQUENCE', () => {
  it('has 9 states', () => {
    expect(GUIDE_STATE_SEQUENCE).toHaveLength(9)
  })

  it('indices are 0-8 in order', () => {
    GUIDE_STATE_SEQUENCE.forEach((c, i) => expect(c.index).toBe(i))
  })

  it('predict stages require 2 successes', () => {
    expect(GUIDE_STATE_SEQUENCE[0].successesRequired).toBe(2) // translate
    expect(GUIDE_STATE_SEQUENCE[1].successesRequired).toBe(2) // reflect
    expect(GUIDE_STATE_SEQUENCE[2].successesRequired).toBe(2) // rotate
  })

  it('coordinate-reveal requires 0 successes', () => {
    expect(GUIDE_STATE_SEQUENCE[3].successesRequired).toBe(0)
  })
})

describe('getGuideStateConfig', () => {
  it('returns correct config for predict-translate', () => {
    const config = getGuideStateConfig('predict-translate')
    expect(config.index).toBe(0)
    expect(config.transformationType).toBe('translate')
  })

  it('throws for unknown state', () => {
    // @ts-expect-error — intentional bad input
    expect(() => getGuideStateConfig('not-real')).toThrow()
  })
})

describe('nextGuideState', () => {
  it('predict-translate → predict-reflect', () => {
    expect(nextGuideState('predict-translate')).toBe('predict-reflect')
  })

  it('predict-reflect → predict-rotate', () => {
    expect(nextGuideState('predict-reflect')).toBe('predict-rotate')
  })

  it('predict-rotate → coordinate-reveal', () => {
    expect(nextGuideState('predict-rotate')).toBe('coordinate-reveal')
  })

  it('capstone (last) → null', () => {
    expect(nextGuideState('capstone')).toBeNull()
  })
})

describe('guideStateToStage', () => {
  it('maps predict states to their stage', () => {
    expect(guideStateToStage('predict-translate')).toBe('translate')
    expect(guideStateToStage('predict-reflect')).toBe('reflect')
    expect(guideStateToStage('predict-rotate')).toBe('rotate')
  })

  it('returns rotate for coordinate-reveal (preserves last round for FormulaReadout)', () => {
    expect(guideStateToStage('coordinate-reveal')).toBe('rotate')
  })

  it('returns null for capstone', () => {
    expect(guideStateToStage('capstone')).toBeNull()
  })
})
