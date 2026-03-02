// src/components/modules/rigid-motions/scene/math.ts

/**
 * Snap math coordinates to the nearest integer grid intersection.
 * Since all pre-image vertices are at integer coordinates, snapping
 * the offset to integers ensures all ghost vertices land on grid intersections.
 */
export function snapToGrid(x: number, y: number): [number, number] {
  return [Math.round(x), Math.round(y)]
}
