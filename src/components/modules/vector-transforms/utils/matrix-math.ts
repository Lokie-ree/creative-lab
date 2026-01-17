/**
 * Vector Transformations Module - Matrix Math Utilities
 *
 * Core mathematical functions for 2x2 matrix operations and transformation classification.
 */

import type { Matrix2x2, Vector2, TransformationType } from './types'

/**
 * Tolerance for floating-point comparisons
 */
const EPSILON = 0.01

/**
 * Transform a 2D vector by a 2x2 matrix
 *
 * Matrix multiplication:
 * | a11  a12 |   | vx |   | a11*vx + a12*vy |
 * | a21  a22 | × | vy | = | a21*vx + a22*vy |
 *
 * @param matrix - The 2x2 transformation matrix
 * @param vector - The 2D vector to transform
 * @returns The transformed vector
 */
export function transformVector(matrix: Matrix2x2, vector: Vector2): Vector2 {
  return {
    x: matrix.a11 * vector.x + matrix.a12 * vector.y,
    y: matrix.a21 * vector.x + matrix.a22 * vector.y,
  }
}

/**
 * Calculate the determinant of a 2x2 matrix
 *
 * det = a11 * a22 - a12 * a21
 *
 * @param matrix - The 2x2 matrix
 * @returns The determinant value
 */
export function determinant(matrix: Matrix2x2): number {
  return matrix.a11 * matrix.a22 - matrix.a12 * matrix.a21
}

/**
 * Check if a matrix is the identity matrix (within tolerance)
 *
 * Identity: [1, 0; 0, 1]
 */
function isIdentity(matrix: Matrix2x2): boolean {
  return (
    Math.abs(matrix.a11 - 1) < EPSILON &&
    Math.abs(matrix.a12) < EPSILON &&
    Math.abs(matrix.a21) < EPSILON &&
    Math.abs(matrix.a22 - 1) < EPSILON
  )
}

/**
 * Check if a matrix represents pure scaling (diagonal matrix with off-diagonal = 0)
 *
 * Scaling: [sx, 0; 0, sy] where at least one of sx, sy differs from 1
 */
function isScaling(matrix: Matrix2x2): boolean {
  const offDiagonalZero =
    Math.abs(matrix.a12) < EPSILON && Math.abs(matrix.a21) < EPSILON

  if (!offDiagonalZero) return false

  // At least one diagonal entry must differ from 1
  const diagonalNonIdentity =
    Math.abs(matrix.a11 - 1) > EPSILON || Math.abs(matrix.a22 - 1) > EPSILON

  return diagonalNonIdentity
}

/**
 * Check if a matrix is orthogonal (columns are perpendicular unit vectors)
 *
 * For a rotation matrix:
 * - Column vectors have unit length
 * - Column vectors are perpendicular (dot product = 0)
 */
function isOrthogonal(matrix: Matrix2x2): boolean {
  // Column 1: (a11, a21)
  // Column 2: (a12, a22)

  // Check column 1 has unit length
  const col1Length = Math.sqrt(
    matrix.a11 * matrix.a11 + matrix.a21 * matrix.a21
  )
  if (Math.abs(col1Length - 1) > EPSILON) return false

  // Check column 2 has unit length
  const col2Length = Math.sqrt(
    matrix.a12 * matrix.a12 + matrix.a22 * matrix.a22
  )
  if (Math.abs(col2Length - 1) > EPSILON) return false

  // Check columns are perpendicular (dot product = 0)
  const dotProduct = matrix.a11 * matrix.a12 + matrix.a21 * matrix.a22
  if (Math.abs(dotProduct) > EPSILON) return false

  return true
}

/**
 * Classify the geometric transformation type of a 2x2 matrix
 *
 * Classification hierarchy:
 * 1. Identity: [1, 0; 0, 1]
 * 2. Scaling: Diagonal matrix with off-diagonal = 0
 * 3. Rotation: det = 1 and orthogonal (det > 0, columns perpendicular)
 * 4. Reflection: det = -1 and orthogonal
 * 5. Shearing: Everything else (catch-all)
 *
 * @param matrix - The 2x2 matrix to classify
 * @returns The transformation type
 */
export function classifyTransformation(matrix: Matrix2x2): TransformationType {
  // Check identity first
  if (isIdentity(matrix)) {
    return 'identity'
  }

  // Check scaling (diagonal matrix with at least one entry != 1)
  if (isScaling(matrix)) {
    return 'scaling'
  }

  // Calculate determinant for rotation/reflection detection
  const det = determinant(matrix)

  // Check rotation: det = 1 and orthogonal
  if (Math.abs(det - 1) < EPSILON && isOrthogonal(matrix)) {
    return 'rotation'
  }

  // Check reflection: det = -1 and orthogonal
  if (Math.abs(det + 1) < EPSILON && isOrthogonal(matrix)) {
    return 'reflection'
  }

  // Everything else is shearing
  return 'shearing'
}

/**
 * Calculate the rotation angle from a rotation matrix
 *
 * For a rotation matrix [cos(θ), -sin(θ); sin(θ), cos(θ)]:
 * θ = atan2(a21, a11)
 *
 * @param matrix - A rotation matrix
 * @returns Angle in degrees (positive = counterclockwise)
 */
export function getRotationAngle(matrix: Matrix2x2): number {
  const radians = Math.atan2(matrix.a21, matrix.a11)
  return (radians * 180) / Math.PI
}

/**
 * Get a human-readable description of a transformation
 *
 * @param matrix - The transformation matrix
 * @param type - The classified transformation type
 * @returns A description string
 */
export function getTransformationDescription(
  matrix: Matrix2x2,
  type: TransformationType
): string {
  switch (type) {
    case 'identity':
      return 'This is the identity matrix - vectors remain unchanged.'

    case 'scaling': {
      const xScale = matrix.a11.toFixed(1)
      const yScale = matrix.a22.toFixed(1)
      if (Math.abs(matrix.a11 - matrix.a22) < EPSILON) {
        return `This uniformly scales vectors by ${xScale}×.`
      }
      return `This scales vectors by ${xScale}× horizontally and ${yScale}× vertically.`
    }

    case 'rotation': {
      const angle = getRotationAngle(matrix)
      const direction = angle >= 0 ? 'counterclockwise' : 'clockwise'
      return `This rotates vectors ${Math.abs(angle).toFixed(0)}° ${direction} around the origin.`
    }

    case 'reflection': {
      // Detect reflection axis
      if (Math.abs(matrix.a22 + 1) < EPSILON && Math.abs(matrix.a11 - 1) < EPSILON) {
        return 'This reflects vectors across the x-axis.'
      }
      if (Math.abs(matrix.a11 + 1) < EPSILON && Math.abs(matrix.a22 - 1) < EPSILON) {
        return 'This reflects vectors across the y-axis.'
      }
      return 'This reflects vectors across a line through the origin.'
    }

    case 'shearing':
      return 'This is a general linear transformation (shearing or combination).'

    default:
      return 'Unknown transformation type.'
  }
}

/**
 * Get explanations for each matrix entry based on transformation type
 *
 * @param matrix - The transformation matrix
 * @param type - The classified transformation type
 * @returns Array of explanation objects for each entry
 */
export function getEntryExplanations(
  matrix: Matrix2x2,
  type: TransformationType
): Array<{ entry: string; value: string; explanation: string }> {
  const entries = [
    { key: 'a11', value: matrix.a11, label: 'a₁₁' },
    { key: 'a12', value: matrix.a12, label: 'a₁₂' },
    { key: 'a21', value: matrix.a21, label: 'a₂₁' },
    { key: 'a22', value: matrix.a22, label: 'a₂₂' },
  ]

  return entries.map(({ key, value, label }) => {
    let explanation: string

    switch (type) {
      case 'scaling':
        if (key === 'a11') {
          explanation =
            value === 1
              ? 'Preserves horizontal scale'
              : `Stretches horizontally by ${value.toFixed(1)}×`
        } else if (key === 'a22') {
          explanation =
            value === 1
              ? 'Preserves vertical scale'
              : `Stretches vertically by ${value.toFixed(1)}×`
        } else {
          explanation = 'No rotation or shearing'
        }
        break

      case 'rotation':
        if (key === 'a11' || key === 'a22') {
          explanation = `cos(θ) component`
        } else if (key === 'a12') {
          explanation = `-sin(θ) component (rotation)`
        } else {
          explanation = `sin(θ) component (rotation)`
        }
        break

      case 'reflection':
        if (key === 'a11') {
          explanation =
            value < 0
              ? 'Flips horizontal direction'
              : 'Preserves horizontal direction'
        } else if (key === 'a22') {
          explanation =
            value < 0 ? 'Flips vertical direction' : 'Preserves vertical direction'
        } else {
          explanation = value === 0 ? 'No rotation' : 'Reflection component'
        }
        break

      default:
        if (key === 'a11') {
          explanation = 'Controls horizontal component of x-input'
        } else if (key === 'a12') {
          explanation = 'Controls horizontal component of y-input'
        } else if (key === 'a21') {
          explanation = 'Controls vertical component of x-input'
        } else {
          explanation = 'Controls vertical component of y-input'
        }
    }

    return {
      entry: label,
      value: value.toFixed(1),
      explanation,
    }
  })
}

/**
 * Create a rotation matrix for a given angle
 *
 * @param degrees - Rotation angle in degrees (positive = counterclockwise)
 * @returns The rotation matrix
 */
export function createRotationMatrix(degrees: number): Matrix2x2 {
  const radians = (degrees * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  return {
    a11: cos,
    a12: -sin,
    a21: sin,
    a22: cos,
  }
}

/**
 * Create a scaling matrix
 *
 * @param scaleX - Horizontal scale factor
 * @param scaleY - Vertical scale factor (defaults to scaleX for uniform scaling)
 * @returns The scaling matrix
 */
export function createScalingMatrix(scaleX: number, scaleY?: number): Matrix2x2 {
  return {
    a11: scaleX,
    a12: 0,
    a21: 0,
    a22: scaleY ?? scaleX,
  }
}

/**
 * Create a reflection matrix across the x-axis or y-axis
 *
 * @param axis - 'x' for reflection across x-axis, 'y' for y-axis
 * @returns The reflection matrix
 */
export function createReflectionMatrix(axis: 'x' | 'y'): Matrix2x2 {
  if (axis === 'x') {
    // Reflection across x-axis: y becomes -y
    return { a11: 1, a12: 0, a21: 0, a22: -1 }
  } else {
    // Reflection across y-axis: x becomes -x
    return { a11: -1, a12: 0, a21: 0, a22: 1 }
  }
}
