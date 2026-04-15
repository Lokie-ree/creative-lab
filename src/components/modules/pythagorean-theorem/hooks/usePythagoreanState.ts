// src/components/modules/pythagorean-theorem/hooks/usePythagoreanState.ts
//
// State machine for the Pythagorean Theorem module.
// Follows M2's useReducer + startRound() pattern.

import { useReducer, useCallback } from 'react'
import type {
  PythagoreanState,
  PythagoreanAction,
  PhaseId,
  RoundId,
  RoundConfig,
  EarnedReveal,
} from '../types'
import { ROUND_SEQUENCE } from '../constants'
import { ROUND_CONFIGS } from '../round-configs'
import { EARNED_REVEALS, FEEDBACK } from '../pythagorean-copy'

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: PythagoreanState = {
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
}

// ---------------------------------------------------------------------------
// startRound helper — resets per-round state + applies one-way visibility flags
// ---------------------------------------------------------------------------

function startRound(state: PythagoreanState, roundId: RoundId): PythagoreanState {
  const config = ROUND_CONFIGS[roundId]
  const phase = config.phase
  return {
    ...state,
    currentRound: roundId,
    roundState: 'entry',
    feedbackState: 'idle',
    feedbackMessage: null,
    numericInput: '',
    converseToggle: null,
    constructionConfirmed: false,
    // One-way OR gates — preserve flags earned in previous rounds; never revert.
    // Visibility flips for the CURRENT round happen in COMPLETE_ROUND, not here.
    formulaVisible: state.formulaVisible,
    converseVisible: state.converseVisible,
    coordinatesVisible: state.coordinatesVisible || phase === 'coord-distance',
  }
}

// ---------------------------------------------------------------------------
// Progressive feedback — cycles through correct strings
// ---------------------------------------------------------------------------

function pickCorrectMessage(shownCount: number): string {
  return FEEDBACK.correct[shownCount % FEEDBACK.correct.length]
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function pythagoreanReducer(
  state: PythagoreanState,
  action: PythagoreanAction,
): PythagoreanState {
  switch (action.type) {
    case 'START_ROUND':
      return startRound(state, action.round)

    case 'ADVANCE_ROUND': {
      const nextIndex = state.roundIndex + 1
      if (nextIndex >= ROUND_SEQUENCE.length) {
        return { ...state, showCelebration: true }
      }
      const nextRound = ROUND_SEQUENCE[nextIndex]
      return { ...startRound(state, nextRound), roundIndex: nextIndex }
    }

    case 'SET_ROUND_STATE':
      return { ...state, roundState: action.state }

    case 'SET_NUMERIC_INPUT':
      return { ...state, numericInput: action.value }

    case 'SET_CONVERSE_TOGGLE':
      return { ...state, converseToggle: action.value }

    case 'CONFIRM_CONSTRUCTION': {
      if (state.roundState !== 'active' || state.constructionConfirmed) return state
      return { ...state, constructionConfirmed: true }
    }

    case 'CHECK_ANSWER': {
      const config = ROUND_CONFIGS[state.currentRound]
      const parsed = parseInt(state.numericInput, 10)
      if (isNaN(parsed)) return state

      let correct = false
      if (config.type === 'converse-predict') {
        correct =
          state.converseToggle === config.converseAnswer &&
          parsed === config.answer
      } else {
        correct = parsed === config.answer
      }

      if (correct) {
        return {
          ...state,
          feedbackState: 'correct',
          feedbackMessage: pickCorrectMessage(state.shownReveals.size),
          roundState: 'reveal',
        }
      } else {
        return {
          ...state,
          feedbackState: 'incorrect',
          feedbackMessage: FEEDBACK.incorrect,
          numericInput: '', // force re-engagement
          roundState: 'active',
        }
      }
    }

    case 'COMPLETE_ROUND': {
      const updates: Partial<PythagoreanState> = {
        roundState: 'completion',
        feedbackState: 'idle',
      }
      // One-way flag flips on specific round completions
      if (state.currentRound === 'proof-properties') {
        updates.formulaVisible = true
      }
      if (state.currentRound === 'converse-81517') {
        updates.converseVisible = true
      }
      return { ...state, ...updates }
    }

    case 'RECORD_REVEAL': {
      const next = new Set(state.shownReveals)
      next.add(action.key)
      return { ...state, shownReveals: next }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePythagoreanState() {
  const [state, dispatch] = useReducer(pythagoreanReducer, initialState)

  // Derived state (computed, not stored)
  const roundConfig: RoundConfig = ROUND_CONFIGS[state.currentRound]
  const phase: PhaseId = roundConfig.phase

  const earnedReveal: EarnedReveal | undefined = EARNED_REVEALS[state.currentRound]

  const isFirstReveal =
    state.roundState === 'completion' &&
    !!earnedReveal &&
    !state.shownReveals.has(state.currentRound)

  const isConstructStep =
    phase === 'coord-distance' &&
    state.roundState === 'active' &&
    !state.constructionConfirmed

  const isSolveStep =
    phase === 'coord-distance' &&
    state.roundState === 'active' &&
    state.constructionConfirmed

  const checkEnabled =
    phase === 'converse'
      ? state.numericInput !== '' && state.converseToggle !== null
      : state.numericInput !== ''

  const isPropertiesPause =
    state.currentRound === 'proof-properties' && state.roundState === 'entry'

  const isFinalRound = state.roundIndex === ROUND_SEQUENCE.length - 1

  // Convenience handlers
  const handleCheck = useCallback(() => {
    dispatch({ type: 'CHECK_ANSWER' })
  }, [])

  // Records reveal key, then advances — revealing must happen before advancing
  // to prevent React batching from hiding the reveal. (M1 lesson #10, M2 carries forward)
  const handleNext = useCallback(() => {
    dispatch({ type: 'RECORD_REVEAL', key: state.currentRound })
    dispatch({ type: 'ADVANCE_ROUND' })
  }, [state.currentRound])

  const handleContinue = useCallback(() => {
    // proof-properties: pressing CONTINUE completes the round → shows earned reveal
    // (formula strip + a²+b²=c²) before the student presses NEXT to advance.
    // All other entry states transition to 'active' so the input appears.
    if (state.currentRound === 'proof-properties') {
      dispatch({ type: 'COMPLETE_ROUND' })
    } else {
      dispatch({ type: 'SET_ROUND_STATE', state: 'active' })
    }
  }, [state.currentRound])

  const handleConfirmConstruction = useCallback(() => {
    dispatch({ type: 'CONFIRM_CONSTRUCTION' })
  }, [])

  const handleInputChange = useCallback((value: string) => {
    dispatch({ type: 'SET_NUMERIC_INPUT', value })
  }, [])

  const handleToggleChange = useCallback((value: boolean) => {
    dispatch({ type: 'SET_CONVERSE_TOGGLE', value })
  }, [])

  return {
    state,
    dispatch,
    // Derived state
    phase,
    roundConfig,
    isFirstReveal,
    earnedReveal,
    isConstructStep,
    isSolveStep,
    checkEnabled,
    isPropertiesPause,
    isFinalRound,
    // Convenience handlers
    handleCheck,
    handleNext,
    handleContinue,
    handleConfirmConstruction,
    handleInputChange,
    handleToggleChange,
  }
}
