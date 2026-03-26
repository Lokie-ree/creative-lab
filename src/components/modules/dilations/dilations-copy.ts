// src/components/modules/dilations/dilations-copy.ts
//
// Copy constants for the Dilations module.
// Phase labels, intros, and round-specific prompts.

import type { PhaseId, RoundId } from './utils/types'

export const PHASE_LABELS: Record<PhaseId, string> = {
  'scale-factor': 'PHASE 1 — Scale Factor',
  'coordinate':   'PHASE 2 — Coordinate Rule',
  'similarity':   'PHASE 3 — Similarity',
  'aa-capstone':  'PHASE 4 — AA Criterion',
}

// Empty string = no entry pause on first phase load
export const PHASE_INTROS: Record<PhaseId, string> = {
  'scale-factor': '',
  'coordinate':   "Now let's look at the coordinates. What happens to (x, y) when you dilate by k?",
  'similarity':   'Similar figures have the same shape but different sizes. Can a sequence of transformations connect them?',
  'aa-capstone':  "Two angles are enough to determine similarity. Let's see why.",
}

// Partial — Phase 2–4 entries added when those phases are built
export const ROUND_PROMPTS: Partial<Record<RoundId, string>> = {
  'dilate-k2':                 'Where will the image triangle appear when k = 2?',
  'dilate-k2-properties':      'What properties are preserved by dilation?',
  'dilate-k3':                 'Predict the image for k = 3.',
  'dilate-k-half':             'What happens when k is less than 1?',
  'dilate-summary':            'What have you discovered about scale factors?',
}
