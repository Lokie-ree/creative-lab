// src/components/modules/sinewaves/sinewaves-constants.ts

/**
 * Stage targets for ghost waves (guided stages).
 * These are the values the user must match during learning.
 */
export const STAGE_TARGETS = {
  amplitude: 1.5,
  frequency: 2.0,
  phase: 0,
} as const

/**
 * Match thresholds (absolute values).
 * User's value must be within ±threshold of target to trigger match.
 *
 * - Amplitude: ±0.1 means 1.4-1.6 matches target of 1.5
 * - Frequency: ±0.15 means 1.85-2.15 matches target of 2.0
 */
export const MATCH_THRESHOLDS = {
  amplitude: 0.1,
  frequency: 0.15,
} as const

/**
 * Slider configuration for each parameter.
 * Defines the range and step size for user interaction.
 */
export const SLIDER_CONFIG = {
  amplitude: { min: 0.5, max: 2, step: 0.1 },
  frequency: { min: 0.5, max: 3, step: 0.1 },
} as const

/**
 * Challenge target generation ranges.
 * Random targets are generated within these bounds.
 */
export const CHALLENGE_RANGES = {
  amplitude: { min: 0.5, max: 2.0 },
  frequency: { min: 1.0, max: 3.0 },
} as const

/**
 * Minimum distance from guided target for challenge.
 * Prevents trivial diagnosis where challenge target is too close
 * to what user just learned in guided stages.
 */
export const CHALLENGE_MIN_DISTANCE = 0.4
