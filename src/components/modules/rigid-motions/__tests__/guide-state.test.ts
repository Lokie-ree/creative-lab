import { describe, it, expect } from 'vitest'
import {
  GUIDE_STATE_SEQUENCE,
  getGuideStateConfig,
  nextGuideState,
  guideStateToStage,
  COORDINATE_STAGES,
  isCoordinateStage,
} from '../guide-state'

describe('GUIDE_STATE_SEQUENCE', () => {
  it('has 8 states', () => {
    expect(GUIDE_STATE_SEQUENCE).toHaveLength(8)
  })

  it('has correct indices', () => {
    GUIDE_STATE_SEQUENCE.forEach((c, i) => {
      expect(c.index).toBe(i)
    })
  })

  it('Phase 2 states require 2 successes', () => {
    const phase2 = ['predict-translate', 'predict-reflect', 'predict-rotate'] as const
    phase2.forEach(state => {
      expect(getGuideStateConfig(state).successesRequired).toBe(2)
    })
  })

  it('coordinate-reveal requires 0 successes', () => {
    expect(getGuideStateConfig('coordinate-reveal').successesRequired).toBe(0)
  })

  it('Phase 3 predict states require 1 success each', () => {
    const phase3 = [
      'predict-with-coordinates-translate',
      'predict-with-coordinates-reflect',
      'predict-with-coordinates-rotate',
    ] as const
    phase3.forEach(state => {
      expect(getGuideStateConfig(state).successesRequired).toBe(1)
    })
  })

  it('capstone requires 3 successes', () => {
    expect(getGuideStateConfig('capstone').successesRequired).toBe(3)
  })
})

describe('nextGuideState', () => {
  it('transitions all states in sequence', () => {
    expect(nextGuideState('predict-translate')).toBe('predict-reflect')
    expect(nextGuideState('predict-reflect')).toBe('predict-rotate')
    expect(nextGuideState('predict-rotate')).toBe('coordinate-reveal')
    expect(nextGuideState('coordinate-reveal')).toBe('predict-with-coordinates-translate')
    expect(nextGuideState('predict-with-coordinates-translate')).toBe('predict-with-coordinates-reflect')
    expect(nextGuideState('predict-with-coordinates-reflect')).toBe('predict-with-coordinates-rotate')
    expect(nextGuideState('predict-with-coordinates-rotate')).toBe('capstone')
    expect(nextGuideState('capstone')).toBeNull()
  })
})

describe('guideStateToStage', () => {
  it('returns correct stage for Phase 2 predict states', () => {
    expect(guideStateToStage('predict-translate')).toBe('translate')
    expect(guideStateToStage('predict-reflect')).toBe('reflect')
    expect(guideStateToStage('predict-rotate')).toBe('rotate')
  })

  it('returns rotate for coordinate-reveal (preserves last round for FormulaReadout)', () => {
    expect(guideStateToStage('coordinate-reveal')).toBe('rotate')
  })

  it('returns correct stage for Phase 3 typed states', () => {
    expect(guideStateToStage('predict-with-coordinates-translate')).toBe('translate')
    expect(guideStateToStage('predict-with-coordinates-reflect')).toBe('reflect')
    expect(guideStateToStage('predict-with-coordinates-rotate')).toBe('rotate')
  })

  it('returns null for capstone', () => {
    expect(guideStateToStage('capstone')).toBeNull()
  })
})

describe('COORDINATE_STAGES + isCoordinateStage', () => {
  it('COORDINATE_STAGES has exactly 3 members', () => {
    expect(COORDINATE_STAGES.size).toBe(3)
  })

  it('isCoordinateStage returns true for Phase 3 predict states', () => {
    expect(isCoordinateStage('predict-with-coordinates-translate')).toBe(true)
    expect(isCoordinateStage('predict-with-coordinates-reflect')).toBe(true)
    expect(isCoordinateStage('predict-with-coordinates-rotate')).toBe(true)
  })

  it('isCoordinateStage returns false for all other states', () => {
    expect(isCoordinateStage('predict-translate')).toBe(false)
    expect(isCoordinateStage('predict-reflect')).toBe(false)
    expect(isCoordinateStage('predict-rotate')).toBe(false)
    expect(isCoordinateStage('coordinate-reveal')).toBe(false)
    expect(isCoordinateStage('capstone')).toBe(false)
  })
})
