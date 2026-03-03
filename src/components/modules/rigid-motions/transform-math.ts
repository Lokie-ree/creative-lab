// src/components/modules/rigid-motions/transform-math.ts
//
// Pure math functions — no React, no Three.js.
// All coordinates are in math space (y-up). World coordinates = math coordinates (WORLD_SCALE = 1).

import type { TransformationParams } from './types'

/** Compute the centroid of a set of vertices */
export function centroidOf(vertices: readonly [number, number][]): [number, number] {
  const n = vertices.length
  const cx = vertices.reduce((s, [x]) => s + x, 0) / n
  const cy = vertices.reduce((s, [, y]) => s + y, 0) / n
  return [cx, cy]
}

// ---------------------------------------------------------------------------
// Primitive transforms — operate on a single vertex
// ---------------------------------------------------------------------------

export function translate(v: [number, number], dx: number, dy: number): [number, number] {
  return [v[0] + dx, v[1] + dy]
}

/** (x, y) → (x, -y) */
export function reflectOverX(v: [number, number]): [number, number] {
  return [v[0], -v[1]]
}

/** (x, y) → (-x, y) */
export function reflectOverY(v: [number, number]): [number, number] {
  return [-v[0], v[1]]
}

/** (x, y) → (y, -x) — clockwise 90° around origin */
export function rotateCW90(v: [number, number]): [number, number] {
  return [v[1], -v[0]]
}

/** (x, y) → (-x, -y) — 180° rotation around origin */
export function rotateCW180(v: [number, number]): [number, number] {
  return [-v[0], -v[1]]
}

/** (x, y) → (-y, x) — clockwise 270° (= counter-clockwise 90°) around origin */
export function rotateCW270(v: [number, number]): [number, number] {
  return [-v[1], v[0]]
}

// ---------------------------------------------------------------------------
// applyTransform — maps a set of vertices through a TransformationParams
// ---------------------------------------------------------------------------

/**
 * Apply a transformation to all vertices.
 * All rotations are around the global origin (0, 0) — per 8.G.A.3.
 */
export function applyTransform(
  vertices: [number, number][],
  params: TransformationParams,
): [number, number][] {
  switch (params.type) {
    case 'translate':
      return vertices.map(v => translate(v, params.dx, params.dy))

    case 'reflect':
      return params.axis === 'x'
        ? vertices.map(reflectOverX)
        : vertices.map(reflectOverY)

    case 'rotate': {
      // Map (degrees, direction) to a canonical CW step count:
      //   CW  90  → rotateCW90
      //   CW 180  → rotateCW180
      //   CW 270  → rotateCW270
      //   CCW 90  = CW 270
      //   CCW 180 = CW 180
      //   CCW 270 = CW 90
      const { degrees, direction } = params
      let fn: (v: [number, number]) => [number, number]
      if (degrees === 180) {
        fn = rotateCW180
      } else if ((degrees === 90 && direction === 'cw') || (degrees === 270 && direction === 'ccw')) {
        fn = rotateCW90
      } else {
        fn = rotateCW270
      }
      return vertices.map(fn)
    }
  }
}

// ---------------------------------------------------------------------------
// applySequence — apply an ordered list of transforms
// ---------------------------------------------------------------------------

/** Apply multiple transforms in sequence (used by the Phase 4 capstone builder) */
export function applySequence(
  vertices: [number, number][],
  sequence: TransformationParams[],
): [number, number][] {
  return sequence.reduce((verts, params) => applyTransform(verts, params), vertices)
}
