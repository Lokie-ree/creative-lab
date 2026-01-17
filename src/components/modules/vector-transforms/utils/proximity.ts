/**
 * Vector Transformations Module - Proximity Utilities
 *
 * Functions for calculating how close a transformed vector is to a target vector.
 * Used for challenge mode feedback and match detection.
 */

import type {
  Vector2,
  ProximityScore,
  MatchThreshold,
  ProximityLevel,
} from './types'
import { DEFAULT_MATCH_THRESHOLD } from './types'

/**
 * Calculate the angle of a vector from the positive x-axis
 *
 * @param vector - The 2D vector
 * @returns Angle in degrees (-180 to 180)
 */
export function getVectorAngle(vector: Vector2): number {
  return Math.atan2(vector.y, vector.x) * (180 / Math.PI)
}

/**
 * Calculate the magnitude (length) of a vector
 *
 * @param vector - The 2D vector
 * @returns The magnitude (always >= 0)
 */
export function getVectorMagnitude(vector: Vector2): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
}

/**
 * Calculate the angular difference between two vectors
 * Handles wrap-around at ±180 degrees
 *
 * @param v1 - First vector
 * @param v2 - Second vector
 * @returns Absolute angle difference in degrees (0 to 180)
 */
function angleDifference(v1: Vector2, v2: Vector2): number {
  const angle1 = getVectorAngle(v1)
  const angle2 = getVectorAngle(v2)

  let diff = Math.abs(angle1 - angle2)

  // Handle wrap-around (e.g., -170° and 170° are only 20° apart)
  if (diff > 180) {
    diff = 360 - diff
  }

  return diff
}

/**
 * Calculate the magnitude difference between two vectors as a percentage
 *
 * @param current - The current vector
 * @param target - The target vector
 * @returns Percentage difference (0 = same magnitude, 100 = double or half)
 */
function magnitudeDifference(current: Vector2, target: Vector2): number {
  const currentMag = getVectorMagnitude(current)
  const targetMag = getVectorMagnitude(target)

  // Avoid division by zero
  if (targetMag === 0) {
    return currentMag === 0 ? 0 : 100
  }

  const ratio = currentMag / targetMag
  // Convert to percentage difference: 1.0 = 0%, 2.0 = 100%, 0.5 = 50%
  return Math.abs(ratio - 1) * 100
}

/**
 * Calculate the proximity score between current and target vectors
 *
 * @param current - The user's current transformed vector
 * @param target - The target vector to match
 * @returns ProximityScore with angle difference (degrees) and magnitude difference (percent)
 */
export function calculateProximity(
  current: Vector2,
  target: Vector2
): ProximityScore {
  return {
    angleDiff: angleDifference(current, target),
    magnitudeDiff: magnitudeDifference(current, target),
  }
}

/**
 * Check if the current vector matches the target within threshold
 *
 * @param current - The user's current transformed vector
 * @param target - The target vector to match
 * @param threshold - Match threshold configuration (defaults to 5° angle, 10% magnitude)
 * @returns True if vectors match within threshold
 */
export function isMatch(
  current: Vector2,
  target: Vector2,
  threshold: MatchThreshold = DEFAULT_MATCH_THRESHOLD
): boolean {
  const proximity = calculateProximity(current, target)

  return (
    proximity.angleDiff <= threshold.maxAngleDiff &&
    proximity.magnitudeDiff <= threshold.maxMagnitudeDiff
  )
}

/**
 * Get the proximity level for UI feedback
 *
 * @param proximity - The calculated proximity score
 * @param threshold - Match threshold for determining "matched" level
 * @returns ProximityLevel for displaying appropriate feedback
 */
export function getProximityLevel(
  proximity: ProximityScore,
  threshold: MatchThreshold = DEFAULT_MATCH_THRESHOLD
): ProximityLevel {
  // Check if matched first
  if (
    proximity.angleDiff <= threshold.maxAngleDiff &&
    proximity.magnitudeDiff <= threshold.maxMagnitudeDiff
  ) {
    return 'matched'
  }

  // Close: within 5-15° angle OR 10-25% magnitude
  if (
    proximity.angleDiff <= 15 &&
    proximity.magnitudeDiff <= 25
  ) {
    return 'close'
  }

  // Medium: within 15-30° angle OR 25-50% magnitude
  if (
    proximity.angleDiff <= 30 &&
    proximity.magnitudeDiff <= 50
  ) {
    return 'medium'
  }

  // Far: everything else
  return 'far'
}

/**
 * Get feedback text based on proximity level
 *
 * @param level - The proximity level
 * @returns Human-readable feedback string
 */
export function getProximityFeedbackText(level: ProximityLevel): string {
  switch (level) {
    case 'matched':
      return 'Perfect match!'
    case 'close':
      return 'Almost there!'
    case 'medium':
      return 'Getting closer...'
    case 'far':
      return 'Keep going...'
  }
}

/**
 * Generate a hint based on current vs target vector differences
 * Used when user is stuck in challenge mode
 *
 * @param current - The user's current transformed vector
 * @param target - The target vector
 * @returns A helpful hint string
 */
export function generateHint(current: Vector2, target: Vector2): string {
  const proximity = calculateProximity(current, target)

  // Prioritize angle adjustment if that's the bigger issue
  if (proximity.angleDiff > 15) {
    return 'Try adjusting the off-diagonal entries (a₁₂ or a₂₁) to change the rotation.'
  }

  // Focus on magnitude if angle is close
  if (proximity.magnitudeDiff > 25) {
    return 'Try adjusting the diagonal entries (a₁₁ or a₂₂) to change the size.'
  }

  // User is close, encourage fine-tuning
  return "You're close! Make small adjustments to fine-tune."
}

/**
 * Calculate a match score as a percentage (0-100)
 * Used for progress indicators
 *
 * @param current - The user's current transformed vector
 * @param target - The target vector
 * @returns Score from 0 (far) to 100 (perfect match)
 */
export function calculateMatchScore(current: Vector2, target: Vector2): number {
  const proximity = calculateProximity(current, target)

  // Weight angle more heavily than magnitude (angle is more noticeable)
  // Max angle diff we consider: 90°, max magnitude diff: 100%
  const angleScore = Math.max(0, 100 - (proximity.angleDiff / 90) * 100)
  const magnitudeScore = Math.max(0, 100 - proximity.magnitudeDiff)

  // Weighted average: 60% angle, 40% magnitude
  return angleScore * 0.6 + magnitudeScore * 0.4
}
