import type { Triangle } from './types'

export interface AADiscoverSubPair {
  preImage: Triangle
  target: Triangle
  /** Number of angle-pair colors to show (capped — rest render ghost). */
  showMatchCount: 1 | 2 | 3
}

export interface CapstonePair {
  preImage: Triangle
  target: Triangle
  isSimilar: boolean
  maxSteps: number
}

// ---------------------------------------------------------------------------
// aa-discover — two sub-pairs
// ---------------------------------------------------------------------------
//
// Sub-pair 1: Right isosceles triangles (90°, 45°, 45°) — all 3 pairs colored.
// Sub-pair 2: 3-4-5 right triangles (90°, 53°, 37°) — only 2 pairs colored
//   to demonstrate AA: two matches are sufficient.
// Both pairs are similar (all 3 sorted angles match within ±2°).
// ---------------------------------------------------------------------------

export const AA_DISCOVER_SUB_PAIRS: AADiscoverSubPair[] = [
  {
    // Sub-pair 1: right isosceles, k ≈ 1.5 — all 3 match
    preImage: { a: { x: 1, y: 1 }, b: { x: 5, y: 1 }, c: { x: 1, y: 5 } },
    target:   { a: { x: 7, y: 1 }, b: { x: 13, y: 1 }, c: { x: 7, y: 7 } },
    showMatchCount: 3,
  },
  {
    // Sub-pair 2: 3-4-5 right triangle, k = 2 — only 2 pairs highlighted
    // Demonstrates: two matching angle pairs is enough to conclude similarity.
    preImage: { a: { x: 1, y: 1 }, b: { x: 4, y: 1 }, c: { x: 4, y: 5 } },
    target:   { a: { x: 7, y: 1 }, b: { x: 13, y: 1 }, c: { x: 13, y: 9 } },
    showMatchCount: 2,
  },
]

// ---------------------------------------------------------------------------
// aa-confirm — one non-similar pair
// ---------------------------------------------------------------------------
// Pre-image: right triangle (90°, 37°, 53°) sorted: [37°, 53°, 90°]
// Target: isosceles triangle (~63°, ~63°, ~54°) — no angle within 2° of pre-image
// ---------------------------------------------------------------------------

export const AA_CONFIRM_PAIR: { preImage: Triangle; target: Triangle } = {
  preImage: { a: { x: 1, y: 2 }, b: { x: 5, y: 2 }, c: { x: 1, y: 5 } },
  target:   { a: { x: 7, y: 1 }, b: { x: 11, y: 1 }, c: { x: 9, y: 5 } },
}

// ---------------------------------------------------------------------------
// capstone-final — 3 pairs
// ---------------------------------------------------------------------------

export const CAPSTONE_PAIRS: CapstonePair[] = [
  {
    // Pair 1 (similar): right isosceles (90°, 45°, 45°)
    // Intended sequence: translate(+2, -1) → dilate(×2)
    preImage: { a: { x: 1, y: 2 }, b: { x: 4, y: 2 }, c: { x: 1, y: 5 } },
    target:   { a: { x: 6, y: 2 }, b: { x: 12, y: 2 }, c: { x: 6, y: 8 } },
    isSimilar: true,
    maxSteps: 2,
  },
  {
    // Pair 2 (NOT similar): contrast pair. Pre-image [37°,53°,90°] vs target [54°,63°,63°]
    preImage: { a: { x: 1, y: 2 }, b: { x: 5, y: 2 }, c: { x: 1, y: 5 } },
    target:   { a: { x: 7, y: 1 }, b: { x: 11, y: 1 }, c: { x: 9, y: 5 } },
    isSimilar: false,
    maxSteps: 2,
  },
  {
    // Pair 3 (similar): 3-4-5 right triangle (90°, 53°, 37°)
    // Intended sequence: rotate(90°CCW) → translate(+6, 0) → dilate(×2)
    preImage: { a: { x: 1, y: 2 }, b: { x: 4, y: 2 }, c: { x: 1, y: 6 } },
    target:   { a: { x: 8, y: 2 }, b: { x: 8, y: 8 }, c: { x: 0, y: 2 } },
    isSimilar: true,
    maxSteps: 3,
  },
]
