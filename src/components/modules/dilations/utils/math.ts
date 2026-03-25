// src/components/modules/dilations/utils/math.ts
//
// Pure math functions for the Dilations module.
// No React, no side effects. All coordinates: origin at (0,0), +x right, +y up.

import type { Vec2, Triangle, TransformStep } from './types'

// ---------------------------------------------------------------------------
// Dilation
// ---------------------------------------------------------------------------

/** Origin-centered dilation: (x, y) → (kx, ky) */
export function dilatePoint(p: Vec2, k: number): Vec2 {
  return { x: p.x * k, y: p.y * k }
}

/** Apply origin-centered dilation to all 3 vertices */
export function dilateTriangle(t: Triangle, k: number): Triangle {
  return {
    a: dilatePoint(t.a, k),
    b: dilatePoint(t.b, k),
    c: dilatePoint(t.c, k),
  }
}

// ---------------------------------------------------------------------------
// Side lengths and ratios
// ---------------------------------------------------------------------------

/** Euclidean distance between two points */
export function sideLength(a: Vec2, b: Vec2): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** Side lengths [AB, BC, CA] */
export function triangleSideLengths(t: Triangle): [number, number, number] {
  return [
    sideLength(t.a, t.b),
    sideLength(t.b, t.c),
    sideLength(t.c, t.a),
  ]
}

/** image / pre-image ratio */
export function sideRatio(pre: number, image: number): number {
  return image / pre
}

// ---------------------------------------------------------------------------
// Angles
// ---------------------------------------------------------------------------

/** Angle at vertex in degrees, given points a-vertex-b. Rounded to nearest integer. */
export function angleDeg(a: Vec2, vertex: Vec2, b: Vec2): number {
  const v1x = a.x - vertex.x
  const v1y = a.y - vertex.y
  const v2x = b.x - vertex.x
  const v2y = b.y - vertex.y
  const dot = v1x * v2x + v1y * v2y
  const cross = v1x * v2y - v1y * v2x
  const rad = Math.atan2(Math.abs(cross), dot)
  return Math.round(rad * (180 / Math.PI))
}

/** Angles at vertices A, B, C in degrees */
export function triangleAngles(t: Triangle): [number, number, number] {
  return [
    angleDeg(t.b, t.a, t.c),
    angleDeg(t.a, t.b, t.c),
    angleDeg(t.a, t.c, t.b),
  ]
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/** True if two points are within tolerance (Euclidean distance) */
export function pointsMatch(a: Vec2, b: Vec2, tolerance: number): boolean {
  return sideLength(a, b) <= tolerance
}

/** True if all 3 vertex pairs match within tolerance */
export function trianglesMatch(a: Triangle, b: Triangle, tolerance: number): boolean {
  return (
    pointsMatch(a.a, b.a, tolerance) &&
    pointsMatch(a.b, b.b, tolerance) &&
    pointsMatch(a.c, b.c, tolerance)
  )
}

// ---------------------------------------------------------------------------
// Standalone transformation primitives
// ---------------------------------------------------------------------------

/** (x, y) → (x + dx, y + dy) */
export function translatePoint(p: Vec2, dx: number, dy: number): Vec2 {
  return { x: p.x + dx, y: p.y + dy }
}

/** Reflect over x-axis: (x, y) → (x, -y). Over y-axis: (x, y) → (-x, y). */
export function reflectPoint(p: Vec2, axis: 'x' | 'y'): Vec2 {
  return axis === 'x' ? { x: p.x, y: -p.y } : { x: -p.x, y: p.y }
}

/** Rotate around origin by angleDeg degrees (CCW positive) */
export function rotatePoint(p: Vec2, angleDeg: number): Vec2 {
  const rad = angleDeg * (Math.PI / 180)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    x: Math.round((p.x * cos - p.y * sin) * 1e10) / 1e10,
    y: Math.round((p.x * sin + p.y * cos) * 1e10) / 1e10,
  }
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

function applyStep(step: TransformStep, p: Vec2): Vec2 {
  switch (step.type) {
    case 'translate': {
      const params = step.params as { dx: number; dy: number }
      return translatePoint(p, params.dx, params.dy)
    }
    case 'reflect': {
      const params = step.params as { axis: 'x' | 'y' }
      return reflectPoint(p, params.axis)
    }
    case 'rotate': {
      const params = step.params as { angleDeg: number }
      return rotatePoint(p, params.angleDeg)
    }
    case 'dilate': {
      const params = step.params as { k: number }
      return dilatePoint(p, params.k)
    }
  }
}

/** Apply an ordered sequence of TransformSteps to a point */
export function composeTransformations(steps: TransformStep[], p: Vec2): Vec2 {
  return steps.reduce((point, step) => applyStep(step, point), p)
}

/** Apply an ordered sequence of TransformSteps to all vertices of a triangle */
export function composeTriangle(steps: TransformStep[], t: Triangle): Triangle {
  return {
    a: composeTransformations(steps, t.a),
    b: composeTransformations(steps, t.b),
    c: composeTransformations(steps, t.c),
  }
}
