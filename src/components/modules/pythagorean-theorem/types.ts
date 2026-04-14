// src/components/modules/pythagorean-theorem/types.ts
//
// Type definitions for the Pythagorean Theorem module.

export type PhaseId = 'visual-proof' | 'converse' | 'unknown-sides' | 'coord-distance'

export type RoundId =
  | 'proof-345'
  | 'proof-51213'
  | 'proof-properties'
  | 'converse-6810'
  | 'converse-569'
  | 'converse-81517'
  | 'solve-hyp-345'
  | 'solve-hyp-6810'
  | 'solve-leg-51213'
  | 'solve-leg-6810'
  | 'coord-345'
  | 'coord-51213'
  | 'coord-6810'

export type RoundType =
  | 'predict-area'
  | 'converse-predict'
  | 'solve-side'
  | 'coord-distance'
  | 'properties-pause'

export type RoundState = 'entry' | 'active' | 'checking' | 'reveal' | 'completion'

export type FeedbackState = 'idle' | 'correct' | 'incorrect'

export interface Vec2 {
  x: number
  y: number
}

export interface TriangleDef {
  vertices: [Vec2, Vec2, Vec2]    // A, B, C positions in world space
  sides: [number, number, number] // a (BC), b (AC), c (AB hypotenuse) side lengths
  areas: [number, number, number] // a², b², c² areas
  isRight: boolean
}

export interface RoundConfig {
  id: RoundId
  phase: PhaseId
  type: RoundType
  triangle: TriangleDef
  unknownSide?: 'a' | 'b' | 'c'
  coordPoints?: [Vec2, Vec2]
  answer: number
  converseAnswer?: boolean
}

export interface EarnedReveal {
  text: string
  notation?: string
  notationStyle?: 'rule' | 'equation'
}

// Full module state — driven by usePythagoreanState reducer
export interface PythagoreanState {
  currentRound: RoundId
  roundIndex: number
  roundState: RoundState
  formulaVisible: boolean
  converseVisible: boolean
  coordinatesVisible: boolean
  numericInput: string
  converseToggle: boolean | null
  constructionConfirmed: boolean
  feedbackState: FeedbackState
  feedbackMessage: string | null
  shownReveals: Set<RoundId>
  showCelebration: boolean
}

export type PythagoreanAction =
  // Round lifecycle
  | { type: 'ADVANCE_ROUND' }
  | { type: 'START_ROUND'; round: RoundId }
  | { type: 'SET_ROUND_STATE'; state: RoundState }
  // Student input
  | { type: 'SET_NUMERIC_INPUT'; value: string }
  | { type: 'SET_CONVERSE_TOGGLE'; value: boolean }
  // Phase 4 construction
  | { type: 'CONFIRM_CONSTRUCTION' }
  // Evaluation
  | { type: 'CHECK_ANSWER' }
  | { type: 'COMPLETE_ROUND' }
  // Earned reveals
  | { type: 'RECORD_REVEAL'; key: RoundId }
