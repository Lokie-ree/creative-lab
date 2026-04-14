// src/components/modules/pythagorean-theorem/round-configs.ts
//
// Round definitions with triangle data for all 13 rounds.
// Vertex positions are in world space — exact coordinates will be
// refined in Prompt 3 visual specs, but side lengths and areas are final.
//
// Triangle vertices:
//   A — right-angle vertex (for right triangles)
//   B — end of leg a (horizontal leg)
//   C — end of leg b (vertical leg)
//   Side a = BC (opposite A), side b = AC, side c = AB (hypotenuse)
//
// Convention: right angle at A, B is along horizontal, C is along vertical.

import type { RoundConfig, RoundId } from './types'

// ---------------------------------------------------------------------------
// Phase 1: Visual Proof — 3-4-5 and 5-12-13 triples
// ---------------------------------------------------------------------------

// 3-4-5 right triangle. Right angle at A = (0,0), B = (4,0), C = (0,3).
// sides: a=BC=5, b=AC=3, c=AB=4  ← wait, that doesn't match convention well.
// Let's use: A=(0,0) right angle, B=(3,0), C=(0,4).
// Then leg AB=3, leg AC=4, hypotenuse BC=5.
// areas: AB²=9, AC²=16, BC²=25.
// For the spec: sides[0]=leg a=3, sides[1]=leg b=4, sides[2]=hyp c=5.

const TRIANGLE_345 = {
  vertices: [
    { x:  0, y:  0 }, // A — right angle
    { x:  3, y:  0 }, // B — end of leg a (length 3)
    { x:  0, y:  4 }, // C — end of leg b (length 4)
  ] as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
  sides:  [3, 4, 5]  as [number, number, number],
  areas:  [9, 16, 25] as [number, number, number],
  isRight: true,
}

// 5-12-13 right triangle. A=(0,0), B=(5,0), C=(0,12).
const TRIANGLE_51213 = {
  vertices: [
    { x:  0, y:  0 },
    { x:  5, y:  0 },
    { x:  0, y: 12 },
  ] as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
  sides:  [5, 12, 13]  as [number, number, number],
  areas:  [25, 144, 169] as [number, number, number],
  isRight: true,
}

// ---------------------------------------------------------------------------
// Phase 2: Converse — 6-8-10, 5-6-9 (non-right), 8-15-17
// ---------------------------------------------------------------------------

// 6-8-10 right triangle. A=(0,0), B=(6,0), C=(0,8).
const TRIANGLE_6810 = {
  vertices: [
    { x: 0, y:  0 },
    { x: 6, y:  0 },
    { x: 0, y:  8 },
  ] as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
  sides:  [6, 8, 10]  as [number, number, number],
  areas:  [36, 64, 100] as [number, number, number],
  isRight: true,
}

// 5-6-9 non-right triangle. Not a right triangle — 25+36≠81.
// Position with approximate proportions; no right-angle vertex.
// A=(0,0), B=(6,0), C=(2.5, 4.8) — approximately correct for sides 5,6,9.
// Actual: side AB=6, side AC=5, side BC=9. Verify: 6²+5²=61≠81=9².
const TRIANGLE_569_NON_RIGHT = {
  vertices: [
    { x: 0,   y: 0   },
    { x: 6,   y: 0   },
    { x: 2.5, y: 4.8 },
  ] as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
  sides:  [5, 6, 9]  as [number, number, number],
  areas:  [25, 36, 81] as [number, number, number],
  isRight: false,
}

// 8-15-17 right triangle. A=(0,0), B=(8,0), C=(0,15).
const TRIANGLE_81517 = {
  vertices: [
    { x: 0, y:  0 },
    { x: 8, y:  0 },
    { x: 0, y: 15 },
  ] as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
  sides:  [8, 15, 17]  as [number, number, number],
  areas:  [64, 225, 289] as [number, number, number],
  isRight: true,
}

// ---------------------------------------------------------------------------
// ROUND_CONFIGS — all 13 rounds
// ---------------------------------------------------------------------------

export const ROUND_CONFIGS: Record<RoundId, RoundConfig> = {

  // --- Phase 1: Visual Proof ---

  'proof-345': {
    id: 'proof-345',
    phase: 'visual-proof',
    type: 'predict-area',
    triangle: TRIANGLE_345,
    answer: 25, // area of hypotenuse square (c²)
  },

  'proof-51213': {
    id: 'proof-51213',
    phase: 'visual-proof',
    type: 'predict-area',
    triangle: TRIANGLE_51213,
    answer: 169,
  },

  'proof-properties': {
    id: 'proof-properties',
    phase: 'visual-proof',
    type: 'properties-pause',
    triangle: TRIANGLE_345, // reuse for visual backdrop
    answer: 0, // no numeric answer — properties pause
  },

  // --- Phase 2: Converse ---

  'converse-6810': {
    id: 'converse-6810',
    phase: 'converse',
    type: 'converse-predict',
    triangle: TRIANGLE_6810,
    answer: 100, // area of largest square
    converseAnswer: true, // is right triangle
  },

  'converse-569': {
    id: 'converse-569',
    phase: 'converse',
    type: 'converse-predict',
    triangle: TRIANGLE_569_NON_RIGHT,
    answer: 81, // area of largest square (c²=81, but a²+b²=61≠81)
    converseAnswer: false, // not a right triangle
  },

  'converse-81517': {
    id: 'converse-81517',
    phase: 'converse',
    type: 'converse-predict',
    triangle: TRIANGLE_81517,
    answer: 289,
    converseAnswer: true,
  },

  // --- Phase 3: Unknown Sides ---

  'solve-hyp-345': {
    id: 'solve-hyp-345',
    phase: 'unknown-sides',
    type: 'solve-side',
    triangle: TRIANGLE_345,
    unknownSide: 'c',
    answer: 5, // hypotenuse
  },

  'solve-hyp-6810': {
    id: 'solve-hyp-6810',
    phase: 'unknown-sides',
    type: 'solve-side',
    triangle: TRIANGLE_6810,
    unknownSide: 'c',
    answer: 10,
  },

  'solve-leg-51213': {
    id: 'solve-leg-51213',
    phase: 'unknown-sides',
    type: 'solve-side',
    triangle: TRIANGLE_51213,
    unknownSide: 'b', // leg b=12 is unknown; leg a=5 and hyp c=13 are known
    answer: 12,
  },

  'solve-leg-6810': {
    id: 'solve-leg-6810',
    phase: 'unknown-sides',
    type: 'solve-side',
    triangle: TRIANGLE_6810,
    unknownSide: 'a', // leg a=6 is unknown; leg b=8 and hyp c=10 are known
    answer: 6,
  },

  // --- Phase 4: Coordinate Distance ---

  'coord-345': {
    id: 'coord-345',
    phase: 'coord-distance',
    type: 'coord-distance',
    triangle: TRIANGLE_345, // legs 3 and 4, distance 5
    coordPoints: [{ x: 1, y: 1 }, { x: 4, y: 5 }],
    answer: 5,
  },

  'coord-51213': {
    id: 'coord-51213',
    phase: 'coord-distance',
    type: 'coord-distance',
    triangle: TRIANGLE_51213, // legs 5 and 12, distance 13
    coordPoints: [{ x: 0, y: 0 }, { x: 5, y: 12 }],
    answer: 13,
  },

  'coord-6810': {
    id: 'coord-6810',
    phase: 'coord-distance',
    type: 'coord-distance',
    triangle: TRIANGLE_6810, // legs 6 and 8, distance 10
    coordPoints: [{ x: 2, y: 1 }, { x: 8, y: 9 }],
    answer: 10,
  },
}
