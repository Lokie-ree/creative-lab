// src/components/modules/pythagorean-theorem/constants.ts
//
// Module-level constants for the Pythagorean Theorem module.

import type { PhaseId, RoundId } from './types'

export const ROUND_SEQUENCE: RoundId[] = [
  // Phase 1: Visual Proof (3 rounds)
  'proof-345',
  'proof-51213',
  'proof-properties',
  // Phase 2: Converse (3 rounds)
  'converse-6810',
  'converse-569',
  'converse-81517',
  // Phase 3: Unknown Sides (4 rounds)
  'solve-hyp-345',
  'solve-hyp-6810',
  'solve-leg-51213',
  'solve-leg-6810',
  // Phase 4: Coordinate Distance (3 rounds)
  'coord-345',
  'coord-51213',
  'coord-6810',
]

export const PHASE_LABELS: Record<PhaseId, string> = {
  'visual-proof':   'VISUAL PROOF',
  'converse':       'CONVERSE',
  'unknown-sides':  'UNKNOWN SIDES',
  'coord-distance': 'COORDINATE DISTANCE',
}

// TODO: Visual specs — camera, grid, z-layers (defined in Prompt 3)

export const DWELL_TIMER_MS = 1400
