// src/components/modules/pythagorean-theorem/scene/scene-layout.ts
//
// ============================================================
// VISUAL SPECS — Pythagorean Theorem Module (M3)
// Written before first pixel per CLAUDE.md convention.
// ============================================================
//
// 1. CONTAINER FILL
//    Reuses Dilations' ModuleLayout (or M3's own copy of it).
//    Portrait (all widths):
//      flex column — statusStrip (h-10) | prompt | visualization (aspect-square,
//      shrink-0) | formula strip | controls
//      Visualization gets roughly 55–65% of dvh on a phone; the rest is controls.
//    Landscape:
//      flex row — visualization (flex-1) | controls panel (w-72 fixed)
//
// 2. CAMERA / WORLD SIZE
//    Orthographic camera. worldSize = the number of world-units that fit in the
//    SHORTER viewport dimension (width in portrait, height in landscape).
//    zoom = Math.min(viewport.width, viewport.height) / worldSize
//
//    Phase 1–3 (visual-proof / converse / unknown-sides):
//      worldSize = 28
//      Camera center = (3, 5)  ← centroid of the typical triangle+squares figure
//      Visible range on a square viewport: x ∈ [-11, 17], y ∈ [-9, 19]
//      Triangle vertex positions in round-configs.ts are set with right-angle
//      at or near (0,0); MUST BE REFINED in Prompt 4 once actual geometry renders.
//      The 8-15-17 figure (largest, used in Phases 2–3) requires ~38×31 world units;
//      some cropping at worldSize=28 is acceptable — the triangle itself fits, the
//      full hypotenuse square may clip on small viewports and will be addressed
//      when building AreaSquare in Prompt 4.
//
//    Phase 4 (coord-distance):
//      worldSize = 16
//      Camera center = (6, 6)
//      Visible range on a square viewport: x ∈ [-2, 14], y ∈ [-2, 14]
//      Grid range displayed: [0, 12] on both axes.
//      All Phase 4 point pairs fall within [0, 12], so all are visible.
//
// 3. GRID / AXIS BOUNDS
//    Phases 1–3: No coordinate grid. Unit-square grid lines live INSIDE the
//    AreaSquare components (subdivisions showing countable unit squares).
//    Phase 4: Numbered coordinate grid, integer range [0, 12] on both axes.
//    Axis number labels via SpriteLabel (never drei <Text>).
//
// 4. Z-LAYER MAP
//    z = 0.00  Grid lines (Phase 4 only)
//    z = 0.01  Triangle fill
//    z = 0.02  Triangle outline, right-angle marker
//    z = 0.03  Square fills (area squares on triangle sides)
//    z = 0.04  Square outlines, unit-grid lines inside squares
//    z = 0.05  Area labels (SpriteLabel), side-length labels
//    z = 0.06  Coordinate point dots, leg labels (Phase 4)
//    z = 0.07  Distance label (Phase 4, after reveal)
//
// ============================================================

import { useMemo } from 'react'
import type { PhaseId, RoundConfig } from '../types'

export interface LayoutConfig {
  worldSize: number
  center: { x: number; y: number }
}

// ---------------------------------------------------------------------------
// computeRoundLayout — per-round layout derived from triangle geometry.
//
// For a right triangle at standard orientation (right angle at A=(0,0),
// B=(a,0), C=(0,b)):
//   - AB square (size a) extends downward:  x ∈ [0, a],    y ∈ [-a, 0]
//   - AC square (size b) extends leftward:  x ∈ [-b, 0],   y ∈ [0, b]
//   - BC square (size c) extends outward:
//       far corners at (a+b, a) and (b, a+b)
//   Figure bounds:  x ∈ [-b, a+b],  y ∈ [-a, a+b]
//   Figure center:  (a/2, b/2)
//   Figure span:    max(a+2b, 2a+b) = a+b+max(a,b)
// ---------------------------------------------------------------------------
export function computeRoundLayout(roundConfig: RoundConfig): LayoutConfig {
  if (roundConfig.type === 'coord-distance') {
    return { worldSize: 16, center: { x: 6, y: 6 } }
  }

  const [a, b] = roundConfig.triangle.sides

  if (!roundConfig.triangle.isRight) {
    // Non-right triangle: rough estimate based on longest side.
    const maxSide = Math.max(...roundConfig.triangle.sides)
    return {
      worldSize: Math.ceil(maxSide * 3 + 4),
      center: { x: a / 2, y: b / 4 },
    }
  }

  // Right triangle — analytic figure bounds (see comment above).
  const figureSpan = a + b + Math.max(a, b)
  const worldSize  = Math.ceil(figureSpan + 4) // +4 world-unit padding
  const center     = { x: a / 2, y: b / 2 }

  return { worldSize, center }
}

// Phase-level fallback configs (used when no roundConfig is available,
// e.g. during module entry before the first round is loaded).
const PHASE_LAYOUT: Record<PhaseId, LayoutConfig> = {
  'visual-proof':   { worldSize: 28, center: { x: 3, y: 5 } },
  'converse':       { worldSize: 28, center: { x: 3, y: 5 } },
  'unknown-sides':  { worldSize: 28, center: { x: 3, y: 5 } },
  'coord-distance': { worldSize: 16, center: { x: 6, y: 6 } },
}

export function usePythagoreanLayout(phase: PhaseId): LayoutConfig {
  return useMemo(() => PHASE_LAYOUT[phase], [phase])
}

// Named constants used by CameraSetup and scene components.
export const Z = {
  GRID:            0.00,
  TRIANGLE_FILL:   0.01,
  TRIANGLE_OUTLINE:0.02,
  SQUARE_FILL:     0.03,
  SQUARE_OUTLINE:  0.04,
  AREA_LABEL:      0.05,
  COORD_DOT:       0.06,
  DISTANCE_LABEL:  0.07,
} as const
