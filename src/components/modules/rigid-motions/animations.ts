// src/components/modules/rigid-motions/animations.ts
//
// GSAP timeline helpers and the pure interpolateReveal function.
// All Three.js geometry mutation happens in the R3F components via refs.

import type { TransformationType, TransformationParams, ReflectionParams, RotationParams } from './types'

/**
 * Interpolate between fromVerts and toVerts at time t (0 → 1), driven by GSAP.
 *
 * Interpolation strategy varies by transformation type per spec v3.1:
 *   - translate:          linear lerp of each vertex x and y
 *   - reflect over y:     x passes through 0 at t=0.5; y is constant
 *   - reflect over x:     y passes through 0 at t=0.5; x is constant
 *   - rotate:             each vertex sweeps its circular arc around the origin;
 *                         angle interpolated from startAngle to startAngle + sweep;
 *                         radius is constant throughout
 */
export function interpolateReveal(
  fromVerts: [number, number][],
  toVerts: [number, number][],
  t: number,
  type: TransformationType,
  params: TransformationParams,
): [number, number][] {
  switch (type) {
    case 'translate':
      return fromVerts.map(([x, y], i) => [
        x + (toVerts[i][0] - x) * t,
        y + (toVerts[i][1] - y) * t,
      ])

    case 'reflect': {
      const axis = (params as ReflectionParams).axis
      if (axis === 'y') {
        // x passes through 0 at t=0.5 (triangle crosses the y-axis); y is constant
        return fromVerts.map(([x, y], i) => {
          // Linear lerp of x — hits 0 at midpoint because fromX > 0 and toX < 0 (or vice-versa)
          const newX = x + (toVerts[i][0] - x) * t
          return [newX, y]
        })
      } else {
        // axis === 'x': y passes through 0 at t=0.5; x is constant
        return fromVerts.map(([x, y], i) => {
          const newY = y + (toVerts[i][1] - y) * t
          return [x, newY]
        })
      }
    }

    case 'rotate': {
      const { degrees, direction } = params as RotationParams
      const sign = direction === 'cw' ? -1 : 1
      const totalAngle = sign * (degrees * Math.PI / 180)
      return fromVerts.map(([x, y]) => {
        const r = Math.sqrt(x ** 2 + y ** 2)
        const startAngle = Math.atan2(y, x)
        const angle = startAngle + totalAngle * t
        return [r * Math.cos(angle), r * Math.sin(angle)]
      })
    }
  }
}
