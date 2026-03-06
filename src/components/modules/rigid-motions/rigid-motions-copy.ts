// src/components/modules/rigid-motions/rigid-motions-copy.ts
// All user-facing strings for the rigid motions module. No inline strings in component files.

import type { FeedbackState, GuideState } from './types'

export const PROMPT_TEXT: Record<string, string> = {
  'translate-5-3':   'TRANSLATE · 5 RIGHT, 3 UP',
  'translate-n3-n4': 'TRANSLATE · 3 LEFT, 4 DOWN',
  'reflect-y':       'REFLECT · OVER Y-AXIS',
  'reflect-x':       'REFLECT · OVER X-AXIS',
  'rotate-90-cw':    'ROTATE · 90° CLOCKWISE',
  'rotate-180':      'ROTATE · 180°',
  'rotate-90-ccw':   'ROTATE · 90° COUNTER-CLOCKWISE',
}

export const CLOSE_COPY: Partial<Record<GuideState, string>> = {
  'predict-translate': 'Adjust the position',
  'predict-rotate':    'Check the rotation',
  'predict-with-coordinates-translate': 'Check your coordinates',
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
  'coordinate-reveal': '',
  'predict-with-coordinates-translate':
    'The rule (x, y) → (x+dx, y+dy) describes exactly the drag you performed.',
  'predict-with-coordinates-reflect':
    'Negating one coordinate is the algebraic description of reflecting across that axis.',
  'predict-with-coordinates-rotate':
    'The swap (x, y) → (y, −x) is what 90° clockwise rotation does to every point.',
  'capstone': '',
}

export const CAPSTONE_EARNED_REVEALS: Record<string, string> = {
  'capstone-1': 'One transformation was enough. You described it completely with a type and a parameter.',
  'capstone-2': 'Two transformations composed. The order mattered — try reversing them to see why.',
  'capstone-3': "Rotation and translation don't commute. The order you chose was the one that works.",
}

export const CAPSTONE_COMPLETION_COPY: Record<string, string> = {
  'capstone-1': 'One transformation. You named it completely.',
  'capstone-2': 'Two steps composed. Order determined the outcome.',
  'capstone-3': 'Composition is non-commutative. You found the sequence that works.',
}

// Celebration modal · "Behind This" tab (same shape as sinewaves behindThis)
export const BEHIND_THIS = {
  approach: {
    title: "What You Discovered",
    points: [
      "You predicted where the triangle would land using spatial reasoning—before any formulas",
      "Translation, reflection, and rotation are rigid motions: they preserve distance and angle",
      "You matched the target by moving the ghost; the notation became a label for what you already did",
    ],
  },
  build: {
    title: "The Build",
    badges: ["React Three Fiber", "TypeScript", "GSAP", "Guide state machine"],
    note: "Predict-and-reveal loop with match scoring, constraint elements, and earned formula reveals",
    features: [
      "Draggable ghost triangle and coordinate grid in R3F",
      "Translate, reflect, rotate rounds with spatial then coordinate layers",
      "Phase 4 capstone: build the sequence that maps one figure onto the other",
    ],
  },
  designDecisions: {
    title: "Why It Works This Way",
    points: [
      "You manipulated before symbols—coordinates and rules appear after you demonstrate understanding",
      "No multiple choice—matching the target is the verification",
      "8.G.A.2 / 8.G.A.3: congruence through transformation composition, described with coordinates",
      "Designed for cold start: exhibit hall demo, 30 seconds to understand, no instructions required",
    ],
  },
  whereThisFits: {
    title: "The Bigger Picture",
    content: `Rigid Motions is dual-purpose: measurable learning for STEM Club students and conference-ready for ISTE Live 2026.

The goal at ISTE isn't a formal presentation—it's a QR code in the exhibit hall. A stranger on their own device who understands what to do within 30 seconds and finds it compelling enough to finish. Plant the flag, collect the signal. ISTE Live 27 is where we formalize the presentation.`,
  },
}
