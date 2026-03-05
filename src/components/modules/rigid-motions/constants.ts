// src/components/modules/rigid-motions/constants.ts

/** Full grid range: canvas shows −9 to +9 on each axis */
export const GRID_RANGE = 9

/** SVG viewBox dimension (square canvas, pixels) */
// export const CANVAS_SIZE = 540 // SVG-only — not used in R3F

/** Content range: labels and shape vertices constrained to −6 to +6 */
export const CONTENT_RANGE = 6

/** Pixels per math unit: CANVAS_SIZE / (GRID_RANGE * 2) = 30 */
// export const SCALE = CANVAS_SIZE / (GRID_RANGE * 2) // SVG-only — not used in R3F

/** SVG center pixel (origin maps here) */
// export const CENTER = CANVAS_SIZE / 2 // SVG-only — not used in R3F

/** Math coordinates are world coordinates — no conversion needed */
export const WORLD_SCALE = 1

/**
 * Pre-image triangle vertices in math coordinates [x, y].
 * Scalene: no equal sides, no equal angles — asymmetric in all orientations.
 * Centroid ≈ (-1.33, -0.67), spanning Q2/Q3 so translations sweep the full grid.
 */
export const PRE_IMAGE_VERTICES: readonly [number, number][] = [
  [-3, -2], // A
  [ 1, -1], // B
  [-2,  1], // C
]

/** Vertex labels for pre-image */
export const VERTEX_LABELS = ['A', 'B', 'C'] as const

/** Vertex labels for ghost (prime notation) */
export const GHOST_VERTEX_LABELS = ['A\u2032', 'B\u2032', 'C\u2032'] as const

/**
 * Initial ghost offset (translation vector in math units).
 * Ghost starts at A′(0,-5), B′(4,-4), C′(1,-2) = pre-image + (3,-3).
 * Placed in Q4 so translate rounds require a diagonal sweep across the grid.
 */
export const GHOST_INITIAL_OFFSET: [number, number] = [3, -3]

/** Phase 1 guide state */
export const GUIDE_STATE = 'predict-translate' as const
