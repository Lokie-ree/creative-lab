// src/components/modules/dilations/__tests__/useDilationsStage.test.ts
import { describe, it, expect } from 'vitest'
import { stageReducer } from '../hooks/useDilationsStage'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import type { TransformStep } from '../utils/types'
import { ROUND_SEQUENCE } from '../utils/constants'

const initialState: StageState = {
  currentRound: 'dilate-k2',
  roundState: 'entry',
  phase: 'scale-factor',
  coordinatesVisible: false,
  angleLabelsVisible: false,
  ghostPosition: null,
  sequenceSteps: [],
}

function dispatch(state: StageState, action: StageAction): StageState {
  return stageReducer(state, action)
}

describe('stageReducer', () => {
  describe('ADVANCE_ROUND', () => {
    it('moves to the next round in ROUND_SEQUENCE', () => {
      const next = dispatch(initialState, { type: 'ADVANCE_ROUND' })
      expect(next.currentRound).toBe(ROUND_SEQUENCE[1])
    })

    it('resets roundState to entry on advance', () => {
      const withCompletion = { ...initialState, roundState: 'completion' as const }
      const next = dispatch(withCompletion, { type: 'ADVANCE_ROUND' })
      expect(next.roundState).toBe('entry')
    })

    it('stays on last round when already at end', () => {
      const lastRound = ROUND_SEQUENCE[ROUND_SEQUENCE.length - 1]
      const atEnd = { ...initialState, currentRound: lastRound }
      const next = dispatch(atEnd, { type: 'ADVANCE_ROUND' })
      expect(next.currentRound).toBe(lastRound)
    })

    it('resets ghostPosition and sequenceSteps on advance', () => {
      const withData: StageState = {
        ...initialState,
        ghostPosition: { x: 3, y: 4 },
        sequenceSteps: [{ type: 'dilate', params: { k: 2 } }],
      }
      const next = dispatch(withData, { type: 'ADVANCE_ROUND' })
      expect(next.ghostPosition).toBeNull()
      expect(next.sequenceSteps).toHaveLength(0)
    })
  })

  describe('coordinatesVisible — one-way flip', () => {
    it('flips to true when entering coord-k2', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'coord-k2' })
      expect(s.coordinatesVisible).toBe(true)
    })

    it('stays true when advancing one round past coord-k2', () => {
      const atCoord = dispatch(initialState, { type: 'START_ROUND', round: 'coord-k2' })
      const next = dispatch(atCoord, { type: 'ADVANCE_ROUND' })
      expect(next.coordinatesVisible).toBe(true)
    })

    it('stays true across multiple advances through similarity phase', () => {
      // Start at coord-k2, advance through coord-k-half, coord-k-third, similarity-guided
      let s = dispatch(initialState, { type: 'START_ROUND', round: 'coord-k2' })
      s = dispatch(s, { type: 'ADVANCE_ROUND' }) // coord-k-half
      s = dispatch(s, { type: 'ADVANCE_ROUND' }) // coord-k-third
      s = dispatch(s, { type: 'ADVANCE_ROUND' }) // similarity-guided
      expect(s.coordinatesVisible).toBe(true)
      expect(s.currentRound).toBe('similarity-guided')
    })

    it('is false during scale-factor phase', () => {
      expect(initialState.coordinatesVisible).toBe(false)
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'dilate-k3' })
      expect(s.coordinatesVisible).toBe(false)
    })
  })

  describe('angleLabelsVisible — one-way flip', () => {
    it('flips to true when entering aa-discover', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'aa-discover' })
      expect(s.angleLabelsVisible).toBe(true)
    })

    it('is false before aa phase', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'similarity-guided' })
      expect(s.angleLabelsVisible).toBe(false)
    })
  })

  describe('TRIGGER_REVEAL', () => {
    it('transitions to reveal when in prediction state', () => {
      const inPrediction = { ...initialState, roundState: 'prediction' as const }
      const next = dispatch(inPrediction, { type: 'TRIGGER_REVEAL' })
      expect(next.roundState).toBe('reveal')
    })

    it('is a no-op when not in prediction state', () => {
      const inActive = { ...initialState, roundState: 'active' as const }
      const next = dispatch(inActive, { type: 'TRIGGER_REVEAL' })
      expect(next.roundState).toBe('active')
    })

    it('is a no-op in entry state', () => {
      const next = dispatch(initialState, { type: 'TRIGGER_REVEAL' })
      expect(next.roundState).toBe('entry')
    })
  })

  describe('COMPLETE_ROUND', () => {
    it('sets roundState to completion', () => {
      const next = dispatch(initialState, { type: 'COMPLETE_ROUND' })
      expect(next.roundState).toBe('completion')
    })
  })

  describe('COMMIT_PREDICTION', () => {
    it('sets roundState to prediction', () => {
      const next = dispatch(initialState, { type: 'COMMIT_PREDICTION' })
      expect(next.roundState).toBe('prediction')
    })
  })

  describe('SET_GHOST_POSITION', () => {
    it('sets ghostPosition', () => {
      const next = dispatch(initialState, { type: 'SET_GHOST_POSITION', position: { x: 2, y: 3 } })
      expect(next.ghostPosition).toEqual({ x: 2, y: 3 })
    })

    it('transitions entry → active', () => {
      const next = dispatch(initialState, { type: 'SET_GHOST_POSITION', position: { x: 2, y: 3 } })
      expect(next.roundState).toBe('active')
    })

    it('does not reset roundState if already past active', () => {
      const inPrediction = { ...initialState, roundState: 'prediction' as const }
      const next = dispatch(inPrediction, { type: 'SET_GHOST_POSITION', position: { x: 1, y: 1 } })
      expect(next.roundState).toBe('prediction')
    })
  })

  describe('sequence steps', () => {
    it('ADD_SEQUENCE_STEP appends a step', () => {
      const step = { type: 'dilate' as const, params: { k: 2 } }
      const next = dispatch(initialState, { type: 'ADD_SEQUENCE_STEP', step })
      expect(next.sequenceSteps).toHaveLength(1)
      expect(next.sequenceSteps[0]).toEqual(step)
    })

    it('REMOVE_SEQUENCE_STEP removes at index', () => {
      const step1 = { type: 'dilate' as const, params: { k: 2 } }
      const step2 = { type: 'translate' as const, params: { dx: 1, dy: 0 } }
      const s = { ...initialState, sequenceSteps: [step1, step2] }
      const next = dispatch(s, { type: 'REMOVE_SEQUENCE_STEP', index: 0 })
      expect(next.sequenceSteps).toHaveLength(1)
      expect(next.sequenceSteps[0]).toEqual(step2)
    })

    it('REORDER_SEQUENCE_STEP moves step from index to index', () => {
      const step1 = { type: 'dilate' as const, params: { k: 2 } }
      const step2 = { type: 'translate' as const, params: { dx: 1, dy: 0 } }
      const s = { ...initialState, sequenceSteps: [step1, step2] }
      const next = dispatch(s, { type: 'REORDER_SEQUENCE_STEP', from: 0, to: 1 })
      expect(next.sequenceSteps[0]).toEqual(step2)
      expect(next.sequenceSteps[1]).toEqual(step1)
    })

    it('RESET_SEQUENCE empties sequenceSteps', () => {
      const step = { type: 'dilate' as const, params: { k: 2 } }
      const s = { ...initialState, sequenceSteps: [step] }
      const next = dispatch(s, { type: 'RESET_SEQUENCE' })
      expect(next.sequenceSteps).toHaveLength(0)
    })

    it('UPDATE_SEQUENCE_STEP replaces step at index', () => {
      const step1: TransformStep = { type: 'translate', params: { dx: 1, dy: 1 } }
      const step2: TransformStep = { type: 'dilate', params: { k: 2 } }
      const updated: TransformStep = { type: 'translate', params: { dx: 3, dy: 0 } }

      let state = stageReducer(initialState, { type: 'ADD_SEQUENCE_STEP', step: step1 })
      state = stageReducer(state, { type: 'ADD_SEQUENCE_STEP', step: step2 })
      state = stageReducer(state, { type: 'UPDATE_SEQUENCE_STEP', index: 0, step: updated })

      expect(state.sequenceSteps).toEqual([updated, step2])
    })

    it('UPDATE_SEQUENCE_STEP resets prediction to active', () => {
      const step: TransformStep = { type: 'translate', params: { dx: 1, dy: 1 } }
      const updated: TransformStep = { type: 'translate', params: { dx: 2, dy: 2 } }

      let state = stageReducer(initialState, { type: 'ADD_SEQUENCE_STEP', step })
      state = stageReducer(state, { type: 'SET_ROUND_STATE', state: 'prediction' })
      state = stageReducer(state, { type: 'UPDATE_SEQUENCE_STEP', index: 0, step: updated })

      expect(state.roundState).toBe('active')
    })

    it('UPDATE_SEQUENCE_STEP preserves non-prediction roundState', () => {
      const step: TransformStep = { type: 'translate', params: { dx: 1, dy: 1 } }
      const updated: TransformStep = { type: 'translate', params: { dx: 2, dy: 2 } }

      let state = stageReducer(initialState, { type: 'ADD_SEQUENCE_STEP', step })
      // roundState defaults to 'entry' from initialState
      state = stageReducer(state, { type: 'UPDATE_SEQUENCE_STEP', index: 0, step: updated })

      expect(state.roundState).toBe('entry')
    })
  })

  describe('phase tracking', () => {
    it('phase updates on START_ROUND', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'similarity-guided' })
      expect(s.phase).toBe('similarity')
    })
  })
})
