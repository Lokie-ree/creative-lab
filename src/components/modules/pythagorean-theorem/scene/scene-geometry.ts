// src/components/modules/pythagorean-theorem/scene/scene-geometry.ts
//
// Pure math helpers for positioning scene geometry.
// No React, no Three.js — safe to unit-test without DOM.

import type { Vec2 } from '../types'

// ---------------------------------------------------------------------------
// SquareTransform
// ---------------------------------------------------------------------------

export interface SquareTransform {
  /** World-space center of the square */
  position: Vec2
  /** Rotation about Z axis (radians). Aligns the square's local +x with the side. */
  rotation: number
  /** Side length (world units) */
  size: number
}

/**
 * Compute position/rotation/size for a square built on the edge from A to B,
 * extending outward from the triangle.
 *
 * - 'left'  → CCW 90° rotation of the side direction (outward to the left of A→B)
 * - 'right' → CW  90° rotation of the side direction (outward to the right of A→B)
 *
 * Standard right triangle at A=(0,0), B=(a,0), C=(0,b):
 *   AB (horizontal leg): outward='right' → extends below (-y direction)
 *   AC (vertical leg):   outward='left'  → extends left  (-x direction)
 *   BC (hypotenuse):     outward='right' → extends away from A
 */
export function computeSquareTransform(
  vertexA: Vec2,
  vertexB: Vec2,
  outward: 'left' | 'right',
): SquareTransform {
  const dx = vertexB.x - vertexA.x
  const dy = vertexB.y - vertexA.y
  const size = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / size
  const uy = dy / size

  // Perpendicular unit vector (outward direction)
  const outX = outward === 'left' ? -uy :  uy
  const outY = outward === 'left' ?  ux : -ux

  // Square center = midpoint of side + (size/2) * outward
  const mx = (vertexA.x + vertexB.x) / 2
  const my = (vertexA.y + vertexB.y) / 2
  const position: Vec2 = {
    x: mx + (size / 2) * outX,
    y: my + (size / 2) * outY,
  }

  return { position, rotation: Math.atan2(uy, ux), size }
}

// ---------------------------------------------------------------------------
// Side midpoint
// ---------------------------------------------------------------------------

export function computeSideMidpoint(vertexA: Vec2, vertexB: Vec2): Vec2 {
  return {
    x: (vertexA.x + vertexB.x) / 2,
    y: (vertexA.y + vertexB.y) / 2,
  }
}

// ---------------------------------------------------------------------------
// Outward label offset — push side-length label away from the triangle interior
// ---------------------------------------------------------------------------

/**
 * Returns a position offset from the side midpoint, toward the outward side
 * (same direction as the square face), suitable for a side-length label.
 */
export function computeSideLabelPosition(
  vertexA: Vec2,
  vertexB: Vec2,
  outward: 'left' | 'right',
  offsetDist: number,
): Vec2 {
  const dx = vertexB.x - vertexA.x
  const dy = vertexB.y - vertexA.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len
  const uy = dy / len
  const outX = outward === 'left' ? -uy :  uy
  const outY = outward === 'left' ?  ux : -ux
  const mid = computeSideMidpoint(vertexA, vertexB)
  return { x: mid.x + outX * offsetDist, y: mid.y + outY * offsetDist }
}

// ---------------------------------------------------------------------------
// Right-angle marker
// ---------------------------------------------------------------------------

export interface RightAngleMarkerTransform {
  /** World-space center of the marker square */
  position: Vec2
  /** Rotation about Z axis (radians) — aligns marker with the first adjacent side */
  rotation: number
  /** Side length of the marker square */
  size: number
}

/**
 * Compute the transform for the right-angle marker (a small square placed at
 * the right-angle vertex, inset along both adjacent sides).
 *
 * @param vertices  [A, B, C] vertex array
 * @param rightAngleIndex  0=A, 1=B, 2=C
 */
export function computeRightAngleMarker(
  vertices: [Vec2, Vec2, Vec2],
  rightAngleIndex: number,
): RightAngleMarkerTransform {
  const corner = vertices[rightAngleIndex]
  const others = vertices.filter((_, i) => i !== rightAngleIndex) as [Vec2, Vec2]

  const d1x = others[0].x - corner.x
  const d1y = others[0].y - corner.y
  const d2x = others[1].x - corner.x
  const d2y = others[1].y - corner.y
  const len1 = Math.sqrt(d1x * d1x + d1y * d1y)
  const len2 = Math.sqrt(d2x * d2x + d2y * d2y)

  const u1x = d1x / len1;  const u1y = d1y / len1
  const u2x = d2x / len2;  const u2y = d2y / len2

  // Marker size: 15% of the shorter adjacent side
  const markerSize = Math.min(len1, len2) * 0.15

  // Marker center: offset from corner along both side directions by markerSize/2
  const position: Vec2 = {
    x: corner.x + u1x * (markerSize / 2) + u2x * (markerSize / 2),
    y: corner.y + u1y * (markerSize / 2) + u2y * (markerSize / 2),
  }

  // Rotation aligned with the first adjacent side
  return { position, rotation: Math.atan2(u1y, u1x), size: markerSize }
}

// ---------------------------------------------------------------------------
// Unit-grid line positions for AreaSquare interior
// ---------------------------------------------------------------------------

/**
 * Returns an array of [x1,y1, x2,y2] pairs (in local square coordinates,
 * centered at origin, square side = 1) for the internal unit-grid lines.
 * The square goes from -0.5 to +0.5 on both axes.
 * `divisions` = number of unit cells along each axis (= side length in world units).
 */
export function computeUnitGridLines(divisions: number): Float32Array {
  const lines: number[] = []
  const step = 1 / divisions
  // Vertical lines (parallel to local Y axis)
  for (let i = 1; i < divisions; i++) {
    const x = -0.5 + i * step
    lines.push(x, -0.5, 0,  x, 0.5, 0)
  }
  // Horizontal lines (parallel to local X axis)
  for (let i = 1; i < divisions; i++) {
    const y = -0.5 + i * step
    lines.push(-0.5, y, 0,  0.5, y, 0)
  }
  return new Float32Array(lines)
}
