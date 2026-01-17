/**
 * Vector Transformations Module - Challenge Targets
 *
 * Predefined transformation targets for challenge mode.
 * Each challenge is a recognizable transformation with pedagogical value.
 */

import type { ChallengeTarget, Matrix2x2 } from './types'

/**
 * Predefined challenge targets
 * Ordered from simpler (scaling) to more complex (rotation)
 */
export const challengeTargets: ChallengeTarget[] = [
  {
    name: '2× Scaling',
    matrix: { a11: 2, a12: 0, a21: 0, a22: 2 },
    description: 'Uniform 2× scaling',
    transformationType: 'scaling',
  },
  {
    name: 'Horizontal Reflection',
    matrix: { a11: 1, a12: 0, a21: 0, a22: -1 },
    description: 'Reflection across x-axis',
    transformationType: 'reflection',
  },
  {
    name: 'Vertical Reflection',
    matrix: { a11: -1, a12: 0, a21: 0, a22: 1 },
    description: 'Reflection across y-axis',
    transformationType: 'reflection',
  },
  {
    name: '90° Rotation',
    matrix: {
      a11: Math.cos(Math.PI / 2),  // 0
      a12: -Math.sin(Math.PI / 2), // -1
      a21: Math.sin(Math.PI / 2),  // 1
      a22: Math.cos(Math.PI / 2),  // 0
    },
    description: 'Counterclockwise 90° rotation',
    transformationType: 'rotation',
  },
  {
    name: '45° Rotation',
    matrix: {
      a11: Math.cos(Math.PI / 4),  // ~0.707
      a12: -Math.sin(Math.PI / 4), // ~-0.707
      a21: Math.sin(Math.PI / 4),  // ~0.707
      a22: Math.cos(Math.PI / 4),  // ~0.707
    },
    description: 'Counterclockwise 45° rotation',
    transformationType: 'rotation',
  },
  {
    name: 'Half Scale',
    matrix: { a11: 0.5, a12: 0, a21: 0, a22: 0.5 },
    description: 'Uniform 0.5× scaling',
    transformationType: 'scaling',
  },
]

/**
 * Get a random challenge target
 *
 * @param excludeNames - Optional array of challenge names to exclude (avoid repeats)
 * @returns A random challenge target
 */
export function getRandomChallenge(excludeNames: string[] = []): ChallengeTarget {
  const available = challengeTargets.filter(
    (target) => !excludeNames.includes(target.name)
  )

  // If all challenges excluded, reset and pick from all
  const pool = available.length > 0 ? available : challengeTargets

  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Get a challenge target by name
 *
 * @param name - The challenge name
 * @returns The challenge target or undefined
 */
export function getChallengeByName(name: string): ChallengeTarget | undefined {
  return challengeTargets.find((target) => target.name === name)
}

/**
 * Calculate the target vector for a challenge
 * (Transforms the basis vector [1, 0] by the challenge matrix)
 *
 * @param challenge - The challenge target
 * @returns The target vector position
 */
export function getChallengeTargetVector(challenge: ChallengeTarget): {
  x: number
  y: number
} {
  const { matrix } = challenge
  // Transform basis vector [1, 0]
  return {
    x: matrix.a11 * 1 + matrix.a12 * 0,
    y: matrix.a21 * 1 + matrix.a22 * 0,
  }
}

/**
 * Format matrix values for display (clean up floating point)
 *
 * @param matrix - The matrix to format
 * @returns Matrix with cleaned up values for display
 */
export function formatMatrixForDisplay(matrix: Matrix2x2): Matrix2x2 {
  const clean = (n: number) => {
    // Round to 2 decimal places to clean up floating point
    const rounded = Math.round(n * 100) / 100
    // If very close to an integer, use the integer
    if (Math.abs(rounded - Math.round(rounded)) < 0.01) {
      return Math.round(rounded)
    }
    return rounded
  }

  return {
    a11: clean(matrix.a11),
    a12: clean(matrix.a12),
    a21: clean(matrix.a21),
    a22: clean(matrix.a22),
  }
}
