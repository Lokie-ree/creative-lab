import { describe, it, expect } from 'vitest'
import {
  GUIDE_STATE_SEQUENCE,
  getGuideStateConfig,
  nextGuideState,
  guideStateToStage,
  COORDINATE_STAGES,
  isCoordinateStage,
  derivePhase,
} from '../guide-state'

describe('GUIDE_STATE_SEQUENCE', () => {
  it('has 9 states', () => {
    expect(GUIDE_STATE_SEQUENCE).toHaveLength(9)
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

  it('coordinate predict states require 2 successes each', () => {
    const coordPredict = [
      'predict-with-coordinates-translate',
      'predict-with-coordinates-reflect',
      'predict-with-coordinates-rotate',
    ] as const
    coordPredict.forEach(state => {
      expect(getGuideStateConfig(state).successesRequired).toBe(2)
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
    expect(nextGuideState('predict-with-coordinates-rotate')).toBe('synthesis-reveal')
    expect(nextGuideState('synthesis-reveal')).toBe('capstone')
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

describe('synthesis-reveal guide state', () => {
  it('exists at index 7', () => {
    expect(getGuideStateConfig('synthesis-reveal').index).toBe(7)
  })

  it('has successesRequired: 0', () => {
    expect(getGuideStateConfig('synthesis-reveal').successesRequired).toBe(0)
  })

  it('capstone shifts to index 8', () => {
    expect(getGuideStateConfig('capstone').index).toBe(8)
  })

  it('guideStateToStage returns null', () => {
    expect(guideStateToStage('synthesis-reveal')).toBeNull()
  })

  it('isCoordinateStage returns false', () => {
    expect(isCoordinateStage('synthesis-reveal')).toBe(false)
  })
})

describe('derivePhase', () => {
  it('returns 2 for spatial predict states', () => {
    expect(derivePhase('predict-translate')).toBe(2)
    expect(derivePhase('predict-reflect')).toBe(2)
    expect(derivePhase('predict-rotate')).toBe(2)
  })

  it('returns 3 for coordinate-reveal and coordinate predict states', () => {
    expect(derivePhase('coordinate-reveal')).toBe(3)
    expect(derivePhase('predict-with-coordinates-translate')).toBe(3)
    expect(derivePhase('predict-with-coordinates-reflect')).toBe(3)
    expect(derivePhase('predict-with-coordinates-rotate')).toBe(3)
  })

  it('returns 4 for synthesis-reveal and capstone', () => {
    expect(derivePhase('synthesis-reveal')).toBe(4)
    expect(derivePhase('capstone')).toBe(4)
  })
})
