// src/components/modules/rigid-motions/rigid-motions-copy.ts
// All user-facing strings for the rigid motions module. No inline strings in component files.

import type { FeedbackState, GuideState } from './types'

export const PROMPT_TEXT: Record<string, string> = {
  'translate-4-2':   'TRANSLATE · 4 RIGHT, 2 UP',
  'translate-n3-n5': 'TRANSLATE · 3 LEFT, 5 DOWN',
  'reflect-y':       'REFLECT · OVER Y-AXIS',
  'reflect-x':       'REFLECT · OVER X-AXIS',
  'rotate-90-cw':    'ROTATE · 90° CLOCKWISE',
}

export const CLOSE_COPY: Partial<Record<GuideState, string>> = {
  'predict-translate': 'Adjust the position',
  'predict-rotate':    'Check the rotation',
}

export const FEEDBACK_COPY: Record<FeedbackState, string | null> = {
  idle:  null,
  match: null,  // Visual is the feedback
  close: null,  // See CLOSE_COPY for stage-specific text
  miss:  null,  // Gap lines are the feedback
}

// Fired on the first match per stage — the earned conceptual reveal
export const EARNED_REVEALS: Record<GuideState, string> = {
  'predict-translate':
    "Every point moved the same direction and distance. The shape didn't change — only its position.",
  'predict-reflect':
    'Every point is the same distance from the axis as its mirror image. Distances and angles are preserved.',
  'predict-rotate':
    'Every point swept the same arc around the origin. The distance from the origin never changed.',
  'coordinate-reveal':          '',
  'predict-with-coordinates':   '',
  'capstone':                   '',
}
