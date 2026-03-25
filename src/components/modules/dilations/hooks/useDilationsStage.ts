// src/components/modules/dilations/hooks/useDilationsStage.ts
import { useReducer } from 'react'
import type { RoundId, PhaseId, RoundState, TransformStep, Vec2 } from '../utils/types'
import { ROUND_SEQUENCE, ROUND_CONFIGS } from '../utils/constants'

export type StageState = {
  currentRound: RoundId
  roundState: RoundState
  phase: PhaseId
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
  ghostPosition: Vec2 | null
  sequenceSteps: TransformStep[]
}

export type StageAction =
  | { type: 'START_ROUND'; round: RoundId }
  | { type: 'SET_ROUND_STATE'; state: RoundState }
  | { type: 'SET_GHOST_POSITION'; position: Vec2 }
  | { type: 'COMMIT_PREDICTION' }
  | { type: 'TRIGGER_REVEAL' }
  | { type: 'COMPLETE_ROUND' }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'ADD_SEQUENCE_STEP'; step: TransformStep }
  | { type: 'REMOVE_SEQUENCE_STEP'; index: number }
  | { type: 'REORDER_SEQUENCE_STEP'; from: number; to: number }
  | { type: 'CHECK_SEQUENCE' }
  | { type: 'RESET_SEQUENCE' }

const initialState: StageState = {
  currentRound: 'dilate-k2',
  roundState: 'entry',
  phase: 'scale-factor',
  coordinatesVisible: false,
  angleLabelsVisible: false,
  ghostPosition: null,
  sequenceSteps: [],
}

function startRound(state: StageState, round: RoundId): StageState {
  const config = ROUND_CONFIGS[round]
  return {
    ...state,
    currentRound: round,
    roundState: 'entry',
    phase: config.phase,
    coordinatesVisible: state.coordinatesVisible || config.coordinatesVisible,
    angleLabelsVisible: state.angleLabelsVisible || config.angleLabelsVisible,
    ghostPosition: null,
    sequenceSteps: [],
  }
}

export function stageReducer(state: StageState, action: StageAction): StageState {
  switch (action.type) {
    case 'START_ROUND':
      return startRound(state, action.round)

    case 'ADVANCE_ROUND': {
      const idx = ROUND_SEQUENCE.indexOf(state.currentRound)
      if (idx < 0 || idx >= ROUND_SEQUENCE.length - 1) return state
      return startRound(state, ROUND_SEQUENCE[idx + 1])
    }

    case 'SET_ROUND_STATE':
      return { ...state, roundState: action.state }

    case 'COMMIT_PREDICTION':
      return { ...state, roundState: 'prediction' }

    case 'CHECK_SEQUENCE':
      return { ...state, roundState: 'prediction' }

    case 'TRIGGER_REVEAL':
      if (state.roundState !== 'prediction') return state
      return { ...state, roundState: 'reveal' }

    case 'COMPLETE_ROUND':
      return { ...state, roundState: 'completion' }

    case 'SET_GHOST_POSITION':
      return {
        ...state,
        ghostPosition: action.position,
        roundState: state.roundState === 'entry' ? 'active' : state.roundState,
      }

    case 'ADD_SEQUENCE_STEP':
      return { ...state, sequenceSteps: [...state.sequenceSteps, action.step] }

    case 'REMOVE_SEQUENCE_STEP':
      return {
        ...state,
        sequenceSteps: state.sequenceSteps.filter((_, i) => i !== action.index),
      }

    case 'REORDER_SEQUENCE_STEP': {
      const steps = [...state.sequenceSteps]
      const [moved] = steps.splice(action.from, 1)
      steps.splice(action.to, 0, moved)
      return { ...state, sequenceSteps: steps }
    }

    case 'RESET_SEQUENCE':
      return { ...state, sequenceSteps: [] }

    default:
      return state
  }
}

export function useDilationsStage() {
  const [state, dispatch] = useReducer(stageReducer, initialState)
  return { state, dispatch }
}
