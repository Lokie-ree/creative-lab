// src/components/modules/sinewaves/guide-state.ts

/**
 * Guide states for the instrument.
 * The instrument is always fully visible and interactive.
 * Guide states only change: prompts, formula highlights, ghost wave visibility.
 */
export type GuideState = 'watch' | 'match-amplitude' | 'match-frequency' | 'challenge' | 'free'

/**
 * Map guide states to dot navigation indices (0-indexed)
 */
export const GUIDE_STATE_TO_INDEX: Record<GuideState, number> = {
  'watch': 0,
  'match-amplitude': 1,
  'match-frequency': 2,
  'challenge': 3,
  'free': 4,
}

export const INDEX_TO_GUIDE_STATE: GuideState[] = [
  'watch',
  'match-amplitude',
  'match-frequency',
  'challenge',
  'free',
]

export const TOTAL_GUIDE_STATES = 5

/**
 * Guide state configuration
 */
export interface GuideStateConfig {
  prompt: string
  showGhost: boolean
  showConnector: boolean // Only applies in landscape
  highlightAmplitude: boolean
  highlightFrequency: boolean
}

/**
 * Prompt copy for each guide state
 */
export const GUIDE_STATE_PROMPTS: Record<GuideState, string> = {
  'watch': 'Watch how the circle drives the wave',
  'match-amplitude': 'Match the ghost wave — try the amplitude slider',
  'match-frequency': 'Now match this one — try frequency',
  'challenge': 'Something changed. Can you match it?',
  'free': 'Every sine wave is circular motion in disguise.',
}

/**
 * Get configuration for a guide state
 */
export function getGuideStateConfig(
  state: GuideState,
  challengeParam?: 'amplitude' | 'frequency'
): GuideStateConfig {
  switch (state) {
    case 'watch':
      return {
        prompt: GUIDE_STATE_PROMPTS.watch,
        showGhost: false,
        showConnector: true,
        highlightAmplitude: false,
        highlightFrequency: false,
      }
    case 'match-amplitude':
      return {
        prompt: GUIDE_STATE_PROMPTS['match-amplitude'],
        showGhost: true,
        showConnector: false,
        highlightAmplitude: true,
        highlightFrequency: false,
      }
    case 'match-frequency':
      return {
        prompt: GUIDE_STATE_PROMPTS['match-frequency'],
        showGhost: true,
        showConnector: false,
        highlightAmplitude: false,
        highlightFrequency: true,
      }
    case 'challenge':
      return {
        prompt: GUIDE_STATE_PROMPTS.challenge,
        showGhost: true,
        showConnector: false,
        highlightAmplitude: challengeParam === 'amplitude',
        highlightFrequency: challengeParam === 'frequency',
      }
    case 'free':
      return {
        prompt: GUIDE_STATE_PROMPTS.free,
        showGhost: false,
        showConnector: true,
        highlightAmplitude: true,
        highlightFrequency: true,
      }
  }
}

/**
 * Speed multiplier options for the instrument
 */
export const SPEED_OPTIONS = [0.5, 1, 2] as const
export type SpeedMultiplier = typeof SPEED_OPTIONS[number]

/**
 * Get next speed in the cycle
 */
export function cycleSpeed(current: SpeedMultiplier): SpeedMultiplier {
  const index = SPEED_OPTIONS.indexOf(current)
  const nextIndex = (index + 1) % SPEED_OPTIONS.length
  return SPEED_OPTIONS[nextIndex]
}
