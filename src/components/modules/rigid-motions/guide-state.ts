// src/components/modules/rigid-motions/guide-state.ts

import type { GuideState, TransformationType } from './types'

export interface GuideStateConfig {
  state: GuideState
  index: number
  transformationType: TransformationType
  successesRequired: number
}

export const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',                  index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',                    index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',                     index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',                  index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates-translate', index: 4, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-with-coordinates-reflect',   index: 5, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-with-coordinates-rotate',    index: 6, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'synthesis-reveal',                   index: 7, transformationType: 'translate', successesRequired: 0 },
  { state: 'capstone',                           index: 8, transformationType: 'translate', successesRequired: 3 },
]

export function getGuideStateConfig(state: GuideState): GuideStateConfig {
  const config = GUIDE_STATE_SEQUENCE.find(c => c.state === state)
  if (!config) throw new Error(`Unknown guide state: ${state}`)
  return config
}

/** Returns the next guide state, or null if at the end of the sequence */
export function nextGuideState(current: GuideState): GuideState | null {
  const config = getGuideStateConfig(current)
  const next = GUIDE_STATE_SEQUENCE[config.index + 1]
  return next?.state ?? null
}

/**
 * Map a guide state to the round stage it drives.
 * coordinate-reveal returns 'rotate' so FormulaReadout shows the last
 * completed round (rotate-90-cw) during the pause state.
 */
export function guideStateToStage(state: GuideState): 'translate' | 'reflect' | 'rotate' | null {
  switch (state) {
    case 'predict-translate':
    case 'predict-with-coordinates-translate': return 'translate'
    case 'predict-reflect':
    case 'predict-with-coordinates-reflect':   return 'reflect'
    case 'predict-rotate':
    case 'predict-with-coordinates-rotate':
    case 'coordinate-reveal':                  return 'rotate'
    default: return null
  }
}

/**
 * The three Phase 3 predict states where coordinates are live.
 * Single source of truth — used for stageRoundIndex reset, constraint element
 * visibility guards, and FormulaReadout visibility gate.
 */
export const COORDINATE_STAGES = new Set<GuideState>([
  'predict-with-coordinates-translate',
  'predict-with-coordinates-reflect',
  'predict-with-coordinates-rotate',
])

export function isCoordinateStage(state: GuideState): boolean {
  return COORDINATE_STAGES.has(state)
}

/**
 * Maps a guide state to its display phase number (2–4).
 * Phase 01 has no corresponding guide state — the module starts at Phase 02.
 *   Phase 02: spatial predict (indices 0–2)
 *   Phase 03: coordinate-reveal + coordinate predict (indices 3–6)
 *   Phase 04: synthesis-reveal + capstone (indices 7–8)
 */
export function derivePhase(state: GuideState): 2 | 3 | 4 {
  if (state === 'capstone' || state === 'synthesis-reveal') return 4
  const index = getGuideStateConfig(state).index
  return index >= 3 ? 3 : 2
}
