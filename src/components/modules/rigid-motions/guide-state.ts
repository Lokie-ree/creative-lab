// src/components/modules/rigid-motions/guide-state.ts

import type { GuideState, TransformationType } from './types'

export interface GuideStateConfig {
  state: GuideState
  index: number
  transformationType: TransformationType
  successesRequired: number
}

export const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',        index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',          index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',           index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',        index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates', index: 4, transformationType: 'translate', successesRequired: 2 },
  { state: 'capstone',                 index: 5, transformationType: 'translate', successesRequired: 3 },
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

/** Map a predict guide state to the round stage it drives */
export function guideStateToStage(state: GuideState): 'translate' | 'reflect' | 'rotate' | null {
  switch (state) {
    case 'predict-translate': return 'translate'
    case 'predict-reflect':   return 'reflect'
    case 'predict-rotate':    return 'rotate'
    default: return null
  }
}
