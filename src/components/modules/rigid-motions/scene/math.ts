// src/components/modules/rigid-motions/scene/math.ts

/**
 * Convert math coordinates to SVG pixel coordinates.
 * Origin (0,0) maps to SVG center (CENTER, CENTER).
 * SVG y-axis is inverted: math +y is SVG −y.
 */
export function mathToSVG(x: number, y: number): [number, number] {
  return [CENTER + x * SCALE, CENTER - y * SCALE]
}

/**
 * Convert SVG pixel coordinates to math coordinates.
 * Inverse of mathToSVG.
 */
export function svgToMath(svgX: number, svgY: number): [number, number] {
  return [(svgX - CENTER) / SCALE, (CENTER - svgY) / SCALE]
}

/**
 * Snap math coordinates to the nearest integer grid intersection.
 * Since all pre-image vertices are at integer coordinates, snapping
 * the offset to integers ensures all ghost vertices land on grid intersections.
 */
export function snapToGrid(x: number, y: number): [number, number] {
  return [Math.round(x), Math.round(y)]
}

/**
 * Convert client (screen) pointer coordinates to SVG math coordinates.
 * Requires the SVGSVGElement to compute the coordinate transform.
 */
export function clientToMath(
  clientX: number,
  clientY: number,
  svgEl: SVGSVGElement
): [number, number] {
  const pt = new DOMPoint(clientX, clientY)
  const ctm = svgEl.getScreenCTM()
  if (!ctm) return [0, 0]
  const svgPt = pt.matrixTransform(ctm.inverse())
  return svgToMath(svgPt.x, svgPt.y)
}

/**
 * Build the SVG `points` attribute string for a polygon from math vertices.
 */
export function toPolygonPoints(vertices: readonly [number, number][]): string {
  return vertices
    .map(([x, y]) => {
      const [sx, sy] = mathToSVG(x, y)
      return `${sx},${sy}`
    })
    .join(' ')
}

/**
 * Compute label position for a vertex, offset outward from the centroid.
 * Returns SVG coordinates and text-anchor for readability.
 */
export function vertexLabelPos(
  svgVx: number,
  svgVy: number,
  svgCx: number,
  svgCy: number,
  offset = 18
): { x: number; y: number; textAnchor: 'start' | 'middle' | 'end' } {
  const dx = svgVx - svgCx
  const dy = svgVy - svgCy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { x: svgVx, y: svgVy, textAnchor: 'middle' }
  const nx = dx / len
  const ny = dy / len
  const anchor: 'start' | 'middle' | 'end' =
    nx > 0.25 ? 'start' : nx < -0.25 ? 'end' : 'middle'
  return { x: svgVx + nx * offset, y: svgVy + ny * offset, textAnchor: anchor }
}

