// src/components/modules/rigid-motions/constants.ts

/** Full grid range: canvas shows −9 to +9 on each axis */
export const GRID_RANGE = 9

/** SVG viewBox dimension (square canvas, pixels) */
export const CANVAS_SIZE = 540

/** Content range: labels and shape vertices constrained to −6 to +6 */
export const CONTENT_RANGE = 6

/** Pixels per math unit: CANVAS_SIZE / (GRID_RANGE * 2) = 30 */
export const SCALE = CANVAS_SIZE / (GRID_RANGE * 2)

/** SVG center pixel (origin maps here) */
export const CENTER = CANVAS_SIZE / 2

/**
 * Pre-image triangle vertices in math coordinates [x, y].
 * Scalene: no equal sides, no equal angles — asymmetric in all orientations.
 */
export const PRE_IMAGE_VERTICES: readonly [number, number][] = [
  [1, 1], // A
  [4, 2], // B
  [2, 4], // C
]

/** Vertex labels for pre-image */
export const VERTEX_LABELS = ['A', 'B', 'C'] as const

/** Vertex labels for ghost (prime notation) */
export const GHOST_VERTEX_LABELS = ['A\u2032', 'B\u2032', 'C\u2032'] as const

/**
 * Initial ghost offset (translation vector in math units).
 * Ghost starts at A′(6,1), B′(9,2), C′(7,4) = pre-image + (5, 0).
 */
export const GHOST_INITIAL_OFFSET: [number, number] = [5, 0]

/** Phase 1 guide state */
export const GUIDE_STATE = 'predict-translate' as const
