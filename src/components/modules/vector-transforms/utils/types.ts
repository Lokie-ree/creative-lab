/**
 * Vector Transformations Module - Core Types
 *
 * Type definitions for 2x2 matrix transformations, vectors, and learning state.
 */

/**
 * 2x2 transformation matrix
 *
 * Standard matrix notation:
 * | a11  a12 |
 * | a21  a22 |
 */
export type Matrix2x2 = {
  a11: number  // top-left
  a12: number  // top-right
  a21: number  // bottom-left
  a22: number  // bottom-right
}

/**
 * 2D vector with x and y components
 */
export type Vector2 = {
  x: number
  y: number
}

/**
 * Classification of matrix transformation type
 * Based on geometric properties (determinant, orthogonality)
 */
export type TransformationType =
  | 'identity'
  | 'scaling'
  | 'rotation'
  | 'reflection'
  | 'shearing'

/**
 * Proximity score for target matching
 * Used to determine how close the user's transformed vector is to the target
 */
export type ProximityScore = {
  angleDiff: number      // degrees (0-180)
  magnitudeDiff: number  // percentage (0-100+)
}

/**
 * Threshold configuration for determining a successful match
 */
export type MatchThreshold = {
  maxAngleDiff: number      // degrees (default: 5)
  maxMagnitudeDiff: number  // percentage (default: 10)
}

/**
 * Stage progression for the learning experience
 */
export type Stage =
  | 'explore'    // Free exploration with diagonal sliders only
  | 'unlock'     // Off-diagonal sliders become available
  | 'challenge'  // Target matching mode
  | 'reveal'     // Formula and explanation shown

/**
 * Challenge target configuration
 */
export type ChallengeTarget = {
  name: string
  matrix: Matrix2x2
  description: string
  transformationType: TransformationType
}

/**
 * Module state for tracking discoveries
 */
export type DiscoveredTransformations = Set<TransformationType>

/**
 * Proximity feedback level for UI display
 */
export type ProximityLevel =
  | 'far'       // > 30 degrees or > 50% magnitude
  | 'medium'    // 15-30 degrees or 25-50% magnitude
  | 'close'     // 5-15 degrees or 10-25% magnitude
  | 'matched'   // < 5 degrees and < 10% magnitude

/**
 * Props for the main module component
 */
export interface ModuleProps {
  onComplete: (values: { matrix: Matrix2x2 }) => void
  isVisible?: boolean
}

/**
 * Identity matrix constant - the default starting state
 * [1, 0]
 * [0, 1]
 */
export const IDENTITY_MATRIX: Matrix2x2 = {
  a11: 1,
  a12: 0,
  a21: 0,
  a22: 1,
}

/**
 * Unit basis vector - the vector being transformed
 * Starting as (1, 0) pointing right
 */
export const BASIS_VECTOR: Vector2 = {
  x: 1,
  y: 0,
}

/**
 * Default match threshold configuration
 */
export const DEFAULT_MATCH_THRESHOLD: MatchThreshold = {
  maxAngleDiff: 5,      // 5 degrees
  maxMagnitudeDiff: 10, // 10 percent
}

/**
 * Slider configuration constants
 */
export const SLIDER_CONFIG = {
  min: -2,
  max: 2,
  step: 0.1,
} as const
