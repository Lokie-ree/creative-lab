import { describe, it, expect } from 'vitest'
import { pythagoreanReducer } from '../hooks/usePythagoreanState'
import type { PythagoreanState, PythagoreanAction } from '../types'
import { ROUND_SEQUENCE } from '../constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(overrides: Partial<PythagoreanState> = {}): PythagoreanState {
  return {
    currentRound: 'proof-345',
    roundIndex: 0,
    roundState: 'entry',
    formulaVisible: false,
    converseVisible: false,
    coordinatesVisible: false,
    numericInput: '',
    converseToggle: null,
    constructionConfirmed: false,
    feedbackState: 'idle',
    feedbackMessage: null,
    shownReveals: new Set(),
    showCelebration: false,
    ...overrides,
  }
}

function dispatch(state: PythagoreanState, action: PythagoreanAction): PythagoreanState {
  return pythagoreanReducer(state, action)
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('initial state', () => {
  it('matches expected defaults', () => {
    const s = makeState()
    expect(s.currentRound).toBe('proof-345')
    expect(s.roundIndex).toBe(0)
    expect(s.roundState).toBe('entry')
    expect(s.formulaVisible).toBe(false)
    expect(s.converseVisible).toBe(false)
    expect(s.coordinatesVisible).toBe(false)
    expect(s.numericInput).toBe('')
    expect(s.converseToggle).toBeNull()
    expect(s.constructionConfirmed).toBe(false)
    expect(s.feedbackState).toBe('idle')
    expect(s.feedbackMessage).toBeNull()
    expect(s.shownReveals.size).toBe(0)
    expect(s.showCelebration).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ADVANCE_ROUND
// ---------------------------------------------------------------------------

describe('ADVANCE_ROUND', () => {
  it('increments roundIndex and resets per-round state', () => {
    const s = makeState({
      roundIndex: 0,
      currentRound: 'proof-345',
      numericInput: '25',
      feedbackState: 'correct',
      feedbackMessage: 'That\'s it.',
      constructionConfirmed: true,
      converseToggle: true,
    })
    const next = dispatch(s, { type: 'ADVANCE_ROUND' })
    expect(next.roundIndex).toBe(1)
    expect(next.currentRound).toBe(ROUND_SEQUENCE[1])
    expect(next.numericInput).toBe('')
    expect(next.feedbackState).toBe('idle')
    expect(next.feedbackMessage).toBeNull()
    expect(next.constructionConfirmed).toBe(false)
    expect(next.converseToggle).toBeNull()
    expect(next.roundState).toBe('entry')
  })

  it('sets showCelebration when advancing past the final round', () => {
    const s = makeState({
      roundIndex: ROUND_SEQUENCE.length - 1,
      currentRound: ROUND_SEQUENCE[ROUND_SEQUENCE.length - 1],
    })
    const next = dispatch(s, { type: 'ADVANCE_ROUND' })
    expect(next.showCelebration).toBe(true)
    // roundIndex is NOT incremented — showCelebration fires instead
    expect(next.roundIndex).toBe(ROUND_SEQUENCE.length - 1)
  })

  it('does not advance roundIndex past length when already celebrating', () => {
    const s = makeState({
      roundIndex: ROUND_SEQUENCE.length - 1,
      currentRound: ROUND_SEQUENCE[ROUND_SEQUENCE.length - 1],
    })
    const s2 = dispatch(s, { type: 'ADVANCE_ROUND' })
    expect(s2.showCelebration).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// CHECK_ANSWER
// ---------------------------------------------------------------------------

describe('CHECK_ANSWER — predict-area round', () => {
  it('correct answer → feedbackState=correct, roundState=reveal', () => {
    const s = makeState({
      currentRound: 'proof-345',
      roundState: 'active',
      numericInput: '25',
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next.feedbackState).toBe('correct')
    expect(next.roundState).toBe('reveal')
  })

  it('incorrect answer → feedbackState=incorrect, numericInput cleared, roundState stays active', () => {
    const s = makeState({
      currentRound: 'proof-345',
      roundState: 'active',
      numericInput: '99',
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next.feedbackState).toBe('incorrect')
    expect(next.feedbackMessage).toBe('Not quite — try again.')
    expect(next.numericInput).toBe('')
    expect(next.roundState).toBe('active')
  })

  it('non-numeric input → no state change', () => {
    const s = makeState({
      currentRound: 'proof-345',
      roundState: 'active',
      numericInput: 'abc',
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next).toEqual(s)
  })
})

describe('CHECK_ANSWER — Phase 2 converse-predict round', () => {
  it('correct toggle AND correct area → correct', () => {
    const s = makeState({
      currentRound: 'converse-6810',
      roundState: 'active',
      numericInput: '100',
      converseToggle: true, // converseAnswer is true
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next.feedbackState).toBe('correct')
    expect(next.roundState).toBe('reveal')
  })

  it('wrong toggle (YES for non-right) → incorrect', () => {
    const s = makeState({
      currentRound: 'converse-569',
      roundState: 'active',
      numericInput: '81',
      converseToggle: true, // should be false (non-right)
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next.feedbackState).toBe('incorrect')
    expect(next.numericInput).toBe('')
  })

  it('correct toggle but wrong area → incorrect', () => {
    const s = makeState({
      currentRound: 'converse-569',
      roundState: 'active',
      numericInput: '25', // wrong — largest area is 81
      converseToggle: false, // correct toggle
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next.feedbackState).toBe('incorrect')
  })

  it('correct toggle AND correct area for non-right triangle → correct', () => {
    const s = makeState({
      currentRound: 'converse-569',
      roundState: 'active',
      numericInput: '81',
      converseToggle: false, // correct — non-right
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next.feedbackState).toBe('correct')
    expect(next.roundState).toBe('reveal')
  })
})

describe('CHECK_ANSWER — solve-side round', () => {
  it('correct hypotenuse → correct', () => {
    const s = makeState({
      currentRound: 'solve-hyp-345',
      roundState: 'active',
      numericInput: '5',
    })
    expect(dispatch(s, { type: 'CHECK_ANSWER' }).feedbackState).toBe('correct')
  })

  it('incorrect hypotenuse → incorrect, retryable', () => {
    const s = makeState({
      currentRound: 'solve-hyp-345',
      roundState: 'active',
      numericInput: '7',
    })
    const next = dispatch(s, { type: 'CHECK_ANSWER' })
    expect(next.feedbackState).toBe('incorrect')
    expect(next.numericInput).toBe('')
  })

  it('correct leg (solve-leg-51213, answer=12) → correct', () => {
    const s = makeState({
      currentRound: 'solve-leg-51213',
      roundState: 'active',
      numericInput: '12',
    })
    expect(dispatch(s, { type: 'CHECK_ANSWER' }).feedbackState).toBe('correct')
  })
})

// ---------------------------------------------------------------------------
// CONFIRM_CONSTRUCTION
// ---------------------------------------------------------------------------

describe('CONFIRM_CONSTRUCTION', () => {
  it('sets constructionConfirmed = true, does not change roundState', () => {
    const s = makeState({
      currentRound: 'coord-345',
      roundState: 'active',
      constructionConfirmed: false,
    })
    const next = dispatch(s, { type: 'CONFIRM_CONSTRUCTION' })
    expect(next.constructionConfirmed).toBe(true)
    expect(next.roundState).toBe('active')
  })

  it('is idempotent — no change if already confirmed', () => {
    const s = makeState({
      currentRound: 'coord-345',
      roundState: 'active',
      constructionConfirmed: true,
    })
    const next = dispatch(s, { type: 'CONFIRM_CONSTRUCTION' })
    expect(next).toEqual(s)
  })
})

// ---------------------------------------------------------------------------
// COMPLETE_ROUND
// ---------------------------------------------------------------------------

describe('COMPLETE_ROUND', () => {
  it('sets roundState to completion and resets feedbackState', () => {
    const s = makeState({ roundState: 'reveal', feedbackState: 'correct' })
    const next = dispatch(s, { type: 'COMPLETE_ROUND' })
    expect(next.roundState).toBe('completion')
    expect(next.feedbackState).toBe('idle')
  })

  it('flips formulaVisible when completing proof-properties', () => {
    const s = makeState({ currentRound: 'proof-properties', formulaVisible: false })
    const next = dispatch(s, { type: 'COMPLETE_ROUND' })
    expect(next.formulaVisible).toBe(true)
  })

  it('flips converseVisible when completing converse-81517', () => {
    const s = makeState({ currentRound: 'converse-81517', converseVisible: false })
    const next = dispatch(s, { type: 'COMPLETE_ROUND' })
    expect(next.converseVisible).toBe(true)
  })

  it('does NOT flip formulaVisible on other rounds', () => {
    const s = makeState({ currentRound: 'proof-345', formulaVisible: false })
    const next = dispatch(s, { type: 'COMPLETE_ROUND' })
    expect(next.formulaVisible).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Visibility flags — one-way, never revert
// ---------------------------------------------------------------------------

describe('visibility flags — one-way OR gate', () => {
  it('formulaVisible flips at proof-properties COMPLETE_ROUND (not startRound)', () => {
    // startRound must NOT pre-flip — formula should only appear after COMPLETE_ROUND
    const s = makeState({ roundIndex: 1, currentRound: 'proof-51213' })
    const atStart = dispatch(s, { type: 'START_ROUND', round: 'proof-properties' })
    expect(atStart.formulaVisible).toBe(false)
    const atComplete = dispatch({ ...atStart, currentRound: 'proof-properties' }, { type: 'COMPLETE_ROUND' })
    expect(atComplete.formulaVisible).toBe(true)
  })

  it('formulaVisible stays true once set — never reverts on ADVANCE_ROUND', () => {
    const s = makeState({
      roundIndex: 2,
      currentRound: 'proof-properties',
      formulaVisible: true,
    })
    const next = dispatch(s, { type: 'ADVANCE_ROUND' })
    expect(next.formulaVisible).toBe(true)
  })

  it('converseVisible flips at converse-81517 COMPLETE_ROUND', () => {
    const s = makeState({ currentRound: 'converse-81517', converseVisible: false })
    const next = dispatch(s, { type: 'COMPLETE_ROUND' })
    expect(next.converseVisible).toBe(true)
  })

  it('coordinatesVisible flips when advancing to first coord-distance round', () => {
    const s = makeState({
      roundIndex: 9,
      currentRound: 'solve-leg-6810',
      coordinatesVisible: false,
    })
    const next = dispatch(s, { type: 'ADVANCE_ROUND' })
    expect(next.currentRound).toBe('coord-345')
    expect(next.coordinatesVisible).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// RECORD_REVEAL
// ---------------------------------------------------------------------------

describe('RECORD_REVEAL', () => {
  it('adds key to shownReveals', () => {
    const s = makeState()
    const next = dispatch(s, { type: 'RECORD_REVEAL', key: 'proof-345' })
    expect(next.shownReveals.has('proof-345')).toBe(true)
  })

  it('shownReveals persists across rounds (not reset in startRound)', () => {
    const s = makeState({
      shownReveals: new Set(['proof-345'] as const),
    })
    const next = dispatch(s, { type: 'ADVANCE_ROUND' })
    expect(next.shownReveals.has('proof-345')).toBe(true)
  })

  it('shownReveals accumulates across multiple reveals', () => {
    const s = makeState()
    const s1 = dispatch(s,  { type: 'RECORD_REVEAL', key: 'proof-345' })
    const s2 = dispatch(s1, { type: 'RECORD_REVEAL', key: 'proof-51213' })
    expect(s2.shownReveals.size).toBe(2)
    expect(s2.shownReveals.has('proof-345')).toBe(true)
    expect(s2.shownReveals.has('proof-51213')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// startRound resets per-round fields
// ---------------------------------------------------------------------------

describe('START_ROUND resets per-round fields', () => {
  it('clears numericInput, converseToggle, constructionConfirmed, feedback', () => {
    const s = makeState({
      numericInput: '42',
      converseToggle: true,
      constructionConfirmed: true,
      feedbackState: 'correct',
      feedbackMessage: 'Yes!',
    })
    const next = dispatch(s, { type: 'START_ROUND', round: 'proof-51213' })
    expect(next.numericInput).toBe('')
    expect(next.converseToggle).toBeNull()
    expect(next.constructionConfirmed).toBe(false)
    expect(next.feedbackState).toBe('idle')
    expect(next.feedbackMessage).toBeNull()
    expect(next.roundState).toBe('entry')
  })
})
