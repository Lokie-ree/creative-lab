// src/components/modules/dilations/utils/similarityTasks.ts
//
// Pre-defined task data for Phase 3 (Similarity Sequences).
// Each task defines a target triangle that the student must reach by composing
// a sequence of rigid motions + dilation using the SequenceBuilder.
//
// k=2 is fixed across all Phase 3 tasks intentionally — scale factor discovery
// was Phase 1. Phase 3 focuses on composing transformations, not varying k.
//
// Validation is result-only: any sequence whose composed output matches the
// target within tolerance is accepted. No validSequences array needed.

import type { Triangle, RoundId } from './types'
import { CANONICAL_TRIANGLE } from './constants'

export type SimilarityTask = {
  id: RoundId
  preImage: Triangle
  target: Triangle
  maxSteps: number
}

// ---------------------------------------------------------------------------
// Task 1: similarity-guided
// Intended sequence: Translate(1, 1) → Dilate(k=2)
//
// | Vertex | Original | +Translate(1,1) | ×Dilate(2) |
// |--------|----------|-----------------|------------|
// | A      | (1, 1)   | (2, 2)          | (4, 4)     |
// | B      | (4, 2)   | (5, 3)          | (10, 6)    |
// | C      | (2, 4)   | (3, 5)          | (6, 10)    |
//
// Target: A'(4,4) B'(10,6) C'(6,10)
// ---------------------------------------------------------------------------
const SIMILARITY_GUIDED: SimilarityTask = {
  id: 'similarity-guided',
  preImage: CANONICAL_TRIANGLE,
  target: {
    a: { x: 4, y: 4 },
    b: { x: 10, y: 6 },
    c: { x: 6, y: 10 },
  },
  maxSteps: 3,
}

// ---------------------------------------------------------------------------
// Task 2: similarity-rigid-dilation
// Intended sequence: Reflect(y-axis) → Translate(4, 0) → Dilate(k=2)
//
// | Vertex | Original | Reflect(y) | +Translate(4,0) | ×Dilate(2) |
// |--------|----------|------------|-----------------|------------|
// | A      | (1, 1)   | (−1, 1)   | (3, 1)          | (6, 2)     |
// | B      | (4, 2)   | (−4, 2)   | (0, 2)          | (0, 4)     |
// | C      | (2, 4)   | (−2, 4)   | (2, 4)          | (4, 8)     |
//
// Target: A'(6,2) B'(0,4) C'(4,8)
//
// Translate+Dilate alone cannot reach this target:
//   Translate(2,0)+Dilate(2) → B'=(12,4) ≠ (0,4). Reflection required.
// ---------------------------------------------------------------------------
const SIMILARITY_RIGID_DILATION: SimilarityTask = {
  id: 'similarity-rigid-dilation',
  preImage: CANONICAL_TRIANGLE,
  target: {
    a: { x: 6, y: 2 },
    b: { x: 0, y: 4 },
    c: { x: 4, y: 8 },
  },
  maxSteps: 3,
}

// ---------------------------------------------------------------------------
// Task 3: similarity-inverse
// Intended sequence: Rotate(90° CCW) → Translate(5, 2) → Dilate(k=2)
//
// Rotate 90° CCW about origin: (x, y) → (−y, x)
//
// | Vertex | Original | Rotate 90° CCW | +Translate(5,2) | ×Dilate(2) |
// |--------|----------|----------------|-----------------|------------|
// | A      | (1, 1)   | (−1, 1)        | (4, 3)          | (8, 6)     |
// | B      | (4, 2)   | (−2, 4)        | (3, 6)          | (6, 12)    |
// | C      | (2, 4)   | (−4, 2)        | (1, 4)          | (2, 8)     |
//
// Target: A'(8,6) B'(6,12) C'(2,8)
//
// Alternative valid path: Dilate(2) → Rotate(90° CCW) → Translate(10, 4)
// Reflect path fails: Reflect(y)+Translate(5,2)+Dilate(2) → B'=(2,8) ≠ (6,12).
// ---------------------------------------------------------------------------
const SIMILARITY_INVERSE: SimilarityTask = {
  id: 'similarity-inverse',
  preImage: CANONICAL_TRIANGLE,
  target: {
    a: { x: 8, y: 6 },
    b: { x: 6, y: 12 },
    c: { x: 2, y: 8 },
  },
  maxSteps: 3,
}

/** Phase 3 tasks in round order */
export const SIMILARITY_TASKS: readonly SimilarityTask[] = [
  SIMILARITY_GUIDED,
  SIMILARITY_RIGID_DILATION,
  SIMILARITY_INVERSE,
] as const
