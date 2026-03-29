// src/components/modules/dilations/__tests__/usePredictReveal.test.ts
import { describe, it, expect } from 'vitest'
import { predictRevealReducer, computeAccuracy } from '../hooks/usePredictReveal'
import type { PRState, PRAction } from '../hooks/usePredictReveal'

const INITIAL: PRState = {
  ghostPosition: null,
  isPredicted: false,
  isRevealed: false,
  accuracy: null,
}

function dispatch(state: PRState, action: PRAction): PRState {
  return predictRevealReducer(state, action)
}

// Target centroid at (2, 2) — for test triangles
const TARGET_CENTROID = { x: 2, y: 2 }
const TOLERANCE = 1.0

describe('predictRevealReducer', () => {
  describe('PLACE_GHOST', () => {
    it('sets ghostPosition', () => {
      const s = dispatch(INITIAL, { type: 'PLACE_GHOST', pos: { x: 3, y: 4 } })
      expect(s.ghostPosition).toEqual({ x: 3, y: 4 })
    })

    it('does not change isPredicted or accuracy', () => {
      const s = dispatch(INITIAL, { type: 'PLACE_GHOST', pos: { x: 3, y: 4 } })
      expect(s.isPredicted).toBe(false)
      expect(s.accuracy).toBeNull()
    })
  })

  describe('COMMIT', () => {
    it('sets isPredicted to true', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 2, y: 2 } }
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.isPredicted).toBe(true)
    })

    it('accuracy is exact when ghost centroid is within tolerance*0.5', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 2.3, y: 2.0 } }  // dist ≈ 0.3 < 0.5
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('exact')
    })

    it('accuracy is close when ghost centroid is within tolerance but not tolerance*0.5', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 2.7, y: 2.0 } }  // dist ≈ 0.7, in (0.5, 1.0]
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('close')
    })

    it('accuracy is miss when ghost centroid is beyond tolerance', () => {
      const withGhost = { ...INITIAL, ghostPosition: { x: 5, y: 2 } }  // dist = 3 > 1.0
      const s = dispatch(withGhost, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('miss')
    })

    it('accuracy is miss when ghostPosition is null', () => {
      const s = dispatch(INITIAL, { type: 'COMMIT', targetCentroid: TARGET_CENTROID, tolerance: TOLERANCE })
      expect(s.accuracy).toBe('miss')
      expect(s.isPredicted).toBe(true)
    })
  })

  describe('REVEAL', () => {
    it('sets isRevealed to true', () => {
      const predicted = { ...INITIAL, isPredicted: true }
      const s = dispatch(predicted, { type: 'REVEAL' })
      expect(s.isRevealed).toBe(true)
    })

    it('is a no-op when not yet predicted', () => {
      const s = dispatch(INITIAL, { type: 'REVEAL' })
      expect(s.isRevealed).toBe(false)
    })
  })

  describe('RESET', () => {
    it('clears all state back to initial', () => {
      const full: PRState = {
        ghostPosition: { x: 3, y: 4 },
        isPredicted: true,
        isRevealed: true,
        accuracy: 'close',
      }
      const s = dispatch(full, { type: 'RESET' })
      expect(s).toEqual(INITIAL)
    })
  })
})

describe('computeAccuracy', () => {
  const target = { x: 4, y: 4 }
  const tolerance = 0.75  // PREDICTION_TOLERANCE from constants

  it('returns exact when distance <= tolerance * 0.5', () => {
    expect(computeAccuracy({ x: 4.3, y: 4 }, target, tolerance)).toBe('exact')
  })

  it('returns close when distance > tolerance * 0.5 and <= tolerance', () => {
    expect(computeAccuracy({ x: 4.6, y: 4 }, target, tolerance)).toBe('close')
  })

  it('returns miss when distance > tolerance', () => {
    expect(computeAccuracy({ x: 6, y: 4 }, target, tolerance)).toBe('miss')
  })

  it('returns exact at distance 0', () => {
    expect(computeAccuracy(target, target, tolerance)).toBe('exact')
  })
})
