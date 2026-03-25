// src/components/modules/dilations/utils/constants.ts

import type { Triangle, ScaleFactor, RoundId, RoundConfig } from './types'

/** Same scalene triangle as M1: A(1,1) B(4,2) C(2,4) */
export const CANONICAL_TRIANGLE: Triangle = {
  a: { x: 1, y: 1 },
  b: { x: 4, y: 2 },
  c: { x: 2, y: 4 },
}

export const SCALE_FACTORS: readonly ScaleFactor[] = [2, 3, 0.5, 0.333]

/** Grid units — how close ghost centroid must be to target centroid */
export const PREDICTION_TOLERANCE = 0.75

export const ROUND_SEQUENCE: readonly RoundId[] = [
  'dilate-k2', 'dilate-k2-properties', 'dilate-k3',
  'dilate-k-half', 'dilate-summary',
  'coord-k2', 'coord-k-half', 'coord-k-third',
  'similarity-guided', 'similarity-rigid-dilation', 'similarity-inverse',
  'aa-discover', 'aa-confirm', 'capstone-final',
]

export const ROUND_CONFIGS: Record<RoundId, RoundConfig> = {
  'dilate-k2':             { id: 'dilate-k2',             phase: 'scale-factor', label: 'k = 2 — Enlargement',     scaleFactor: 2,     hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-k2-properties':  { id: 'dilate-k2-properties',  phase: 'scale-factor', label: 'k = 2 — Properties',      scaleFactor: 2,     hasGhostDrag: false, hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-k3':             { id: 'dilate-k3',             phase: 'scale-factor', label: 'k = 3 — Confirm',         scaleFactor: 3,     hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-k-half':         { id: 'dilate-k-half',         phase: 'scale-factor', label: 'k = ½ — Reduction',       scaleFactor: 0.5,   hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'dilate-summary':        { id: 'dilate-summary',        phase: 'scale-factor', label: 'Scale Factor Summary',                         hasGhostDrag: false, hasSequenceBuilder: false, coordinatesVisible: false, angleLabelsVisible: false },
  'coord-k2':              { id: 'coord-k2',              phase: 'coordinate',   label: 'k = 2 with Coordinates',  scaleFactor: 2,     hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: false },
  'coord-k-half':          { id: 'coord-k-half',          phase: 'coordinate',   label: 'k = ½ with Coordinates',  scaleFactor: 0.5,   hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: false },
  'coord-k-third':         { id: 'coord-k-third',         phase: 'coordinate',   label: 'k = ⅓ — Generalize',     scaleFactor: 0.333, hasGhostDrag: true,  hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: false },
  'similarity-guided':     { id: 'similarity-guided',     phase: 'similarity',   label: 'Guided Similarity',                            hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: false },
  'similarity-rigid-dilation': { id: 'similarity-rigid-dilation', phase: 'similarity', label: 'Rigid + Dilation',                       hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: false },
  'similarity-inverse':    { id: 'similarity-inverse',    phase: 'similarity',   label: 'Inverse Similarity',                           hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: false },
  'aa-discover':           { id: 'aa-discover',           phase: 'aa-capstone',  label: 'AA Discovery',                                 hasGhostDrag: false, hasSequenceBuilder: false, coordinatesVisible: true,  angleLabelsVisible: true  },
  'aa-confirm':            { id: 'aa-confirm',            phase: 'aa-capstone',  label: 'AA Confirmation',                              hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: true  },
  'capstone-final':        { id: 'capstone-final',        phase: 'aa-capstone',  label: 'Capstone Challenge',                           hasGhostDrag: false, hasSequenceBuilder: true,  coordinatesVisible: true,  angleLabelsVisible: true  },
}
