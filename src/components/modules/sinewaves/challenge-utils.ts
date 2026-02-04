// src/components/modules/sinewaves/challenge-utils.ts
import {
  STAGE_TARGETS,
  CHALLENGE_RANGES,
  CHALLENGE_MIN_DISTANCE,
} from './sinewaves-constants'

export type ChallengeParam = 'amplitude' | 'frequency'

export interface ChallengeTarget {
  param: ChallengeParam
  value: number
}

/**
 * Generate a challenge target with minimum distance validation.
 * Ensures the target is far enough from the guided stage value
 * to make diagnosis non-trivial.
 *
 * @returns Challenge target with param and value
 */
export function generateChallengeTarget(): ChallengeTarget {
  const param: ChallengeParam = Math.random() > 0.5 ? 'amplitude' : 'frequency'
  const guidedValue = STAGE_TARGETS[param]
  const range = CHALLENGE_RANGES[param]

  let value: number
  let attempts = 0
  const maxAttempts = 10

  do {
    const raw = range.min + Math.random() * (range.max - range.min)
    value = Math.round(raw * 10) / 10
    attempts++
  } while (
    Math.abs(value - guidedValue) < CHALLENGE_MIN_DISTANCE &&
    attempts < maxAttempts
  )

  // Fallback: force valid distance if random attempts failed
  if (Math.abs(value - guidedValue) < CHALLENGE_MIN_DISTANCE) {
    // Move away from guided value in the direction with more room
    if (guidedValue - range.min > range.max - guidedValue) {
      // More room below, go lower
      value = guidedValue - CHALLENGE_MIN_DISTANCE - 0.1
    } else {
      // More room above, go higher
      value = guidedValue + CHALLENGE_MIN_DISTANCE + 0.1
    }
    value = Math.round(value * 10) / 10
    value = Math.max(range.min, Math.min(value, range.max))
  }

  return { param, value }
}
