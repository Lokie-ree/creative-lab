/**
 * Match score calculation utilities for the sinusoidal module.
 * Calculates how close user parameters are to target parameters.
 */

export interface MatchScores {
  amplitude: number  // 0-1 (1 = perfect match)
  frequency: number  // 0-1
  phase: number      // 0-1
  overall: number    // 0-1 (minimum of all three)
}

export interface MatchParams {
  a: number
  f: number
  p: number
}

// Parameter ranges for normalization
const AMPLITUDE_RANGE = 2.0 - 0.5  // 1.5
const FREQUENCY_RANGE = 3.0 - 0.5  // 2.5

/**
 * Calculate individual and overall match scores
 */
export function calculateMatchScores(
  user: MatchParams,
  target: MatchParams
): MatchScores {
  // Calculate individual scores (0-1, where 1 is perfect)
  const amplitude = Math.max(0, 1 - Math.abs(user.a - target.a) / AMPLITUDE_RANGE)
  const frequency = Math.max(0, 1 - Math.abs(user.f - target.f) / FREQUENCY_RANGE)

  // Phase wraps around, so we need to handle the circular distance
  const phaseDiff = Math.abs(user.p - target.p)
  const wrappedPhaseDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff)
  const phase = Math.max(0, 1 - wrappedPhaseDiff / (Math.PI))  // Max diff is π

  // Overall is the minimum (strictest)
  const overall = Math.min(amplitude, frequency, phase)

  return { amplitude, frequency, phase, overall }
}

/**
 * Convert a 0-1 score to a glow intensity with easing
 * Uses an eased curve so glow becomes visible earlier
 */
export function scoreToGlowIntensity(score: number): number {
  // Apply easing so glow is more noticeable at lower scores
  // Score 0.5 → Glow ~0.25, Score 0.8 → Glow ~0.64, Score 1.0 → Glow 1.0
  return Math.pow(score, 1.5)
}

/**
 * Check if a parameter is "close enough" to trigger feedback
 */
export function isNearMatch(score: number, threshold: number = 0.9): boolean {
  return score >= threshold
}
