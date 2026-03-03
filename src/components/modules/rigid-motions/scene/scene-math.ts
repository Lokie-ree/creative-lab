import { PRE_IMAGE_VERTICES, CONTENT_RANGE } from '../constants'
import { centroidOf, applyTransform } from '../transform-math'
import type { GuideState } from '../types'

/** Compute ghost triangle vertices: pre-image each offset by [dx, dy] */
export function ghostVertices(offset: [number, number]): [number, number][] {
  return PRE_IMAGE_VERTICES.map(([x, y]) => [x + offset[0], y + offset[1]])
}

/** Pre-image centroid in math coordinates */
function preImageCentroid(): [number, number] {
  const cx = PRE_IMAGE_VERTICES.reduce((s, [x]) => s + x, 0) / PRE_IMAGE_VERTICES.length
  const cy = PRE_IMAGE_VERTICES.reduce((s, [, y]) => s + y, 0) / PRE_IMAGE_VERTICES.length
  return [cx, cy]
}

/**
 * Clamp a raw ghost offset so the ghost centroid stays within ±CONTENT_RANGE.
 * Ghost centroid = preImageCentroid + offset.
 */
export function clampOffset(rawOffset: [number, number]): [number, number] {
  const [cx, cy] = preImageCentroid()
  const clampX = Math.min(CONTENT_RANGE - cx, Math.max(-CONTENT_RANGE - cx, rawOffset[0]))
  const clampY = Math.min(CONTENT_RANGE - cy, Math.max(-CONTENT_RANGE - cy, rawOffset[1]))
  return [clampX, clampY]
}

/**
 * Local flip of ghost vertices around the ghost's own centroid.
 *
 * FLIP is a local transformation — not a global reflection over the axis.
 * This forces the student to drag to the correct position first, then toggle orientation.
 * axis='y': mirror each vertex's x through the centroid's x (horizontal flip)
 * axis='x': mirror each vertex's y through the centroid's y (vertical flip)
 */
export function ghostVerticesWithFlip(
  baseOffset: [number, number],
  axis: 'x' | 'y',
  flipped: boolean,
): [number, number][] {
  const verts = ghostVertices(baseOffset)
  if (!flipped) return verts
  const [cx, cy] = centroidOf(verts)
  return axis === 'y'
    ? verts.map(([x, y]) => [2 * cx - x, y])
    : verts.map(([x, y]) => [x, 2 * cy - y])
}

/**
 * Local rotation of ghost vertices around the ghost's own centroid.
 *
 * Rotation is centroid-local so pressing the rotation toggle does not jump
 * the ghost to the correct global position — the student must drag first.
 */
export function ghostVerticesWithRotation(
  baseOffset: [number, number],
  degrees: 90 | 180 | 270,
  direction: 'cw' | 'ccw',
): [number, number][] {
  const verts = ghostVertices(baseOffset)
  const [cx, cy] = centroidOf(verts)
  // Translate to centroid-origin, apply rotation, translate back
  return verts.map(([x, y]) => {
    const local = applyTransform([[x - cx, y - cy]], { type: 'rotate', degrees, direction })[0]
    return [local[0] + cx, local[1] + cy]
  })
}

/**
 * Compute final ghost vertex positions for rendering and scoring.
 *
 * CRITICAL — composition order is load-bearing:
 *   1. Translate (apply baseOffset to pre-image vertices)
 *   2. Find centroid of translated position
 *   3. Apply FLIP or ROTATION around that translated centroid
 *
 * If rotation/flip is applied before translation, the wrong centroid is used.
 */
export function computeGhostVertices(
  baseOffset: [number, number],
  guideState: GuideState,
  flipped: boolean,
  rotationDegrees: 90 | 180 | 270,
  rotationDirection: 'cw' | 'ccw',
  reflectionAxis?: 'x' | 'y',
): [number, number][] {
  if (guideState === 'predict-reflect' && flipped && reflectionAxis) {
    return ghostVerticesWithFlip(baseOffset, reflectionAxis, true)
  }
  if (guideState === 'predict-rotate') {
    return ghostVerticesWithRotation(baseOffset, rotationDegrees, rotationDirection)
  }
  return ghostVertices(baseOffset)
}

/**
 * Compute label position: vertex offset outward from centroid by `dist` world units.
 * Returns [x, y] in math/world coordinates.
 * Falls back to vertex position if vertex === centroid.
 */
export function vertexLabelOffset(
  vertex: [number, number],
  centroid: [number, number],
  dist = 0.5
): [number, number] {
  const dx = vertex[0] - centroid[0]
  const dy = vertex[1] - centroid[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return [vertex[0], vertex[1]]
  return [vertex[0] + (dx / len) * dist, vertex[1] + (dy / len) * dist]
}
