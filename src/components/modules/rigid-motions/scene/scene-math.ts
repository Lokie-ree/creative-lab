import { PRE_IMAGE_VERTICES, CONTENT_RANGE } from '../constants'

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
