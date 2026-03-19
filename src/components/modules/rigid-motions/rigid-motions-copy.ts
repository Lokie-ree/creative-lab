// src/components/modules/rigid-motions/rigid-motions-copy.ts
// All user-facing strings for the rigid motions module. No inline strings in component files.

import type { FeedbackState, GuideState } from './types'
import type { TransformationParams } from '@/lib/types/transforms'

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

export type RevealBeat = {
  text: string
  notation?: string          // static string — congruence beats only
  notationStyle?: 'congruence'  // 'rule' is set at call site, never stored
  trailingText?: string
}

// Keyed by `${guideState}-${beatIndex}` where beatIndex = stageSuccessCount at render time.
// Beat-1 (spatial stages) notation is computed at render time via formatCoordinateRule —
// those entries have no notation field here.
export const EARNED_REVEALS: Record<string, RevealBeat> = {
  'predict-translate-0': {
    text: "Same distances. Same angles. Sliding the shape preserves everything.",
  },
  'predict-translate-1': {
    text: "Here's the rule for what you just did.",
  },
  'predict-with-coordinates-translate-0': {
    text: "Every vertex shifted by the same amount. Check the x-coordinates — then the y-coordinates.",
  },
  'predict-with-coordinates-translate-1': {
    text: "Translate every vertex the same way — distances and angles stay intact.",
    notation: "△ABC ≅ △A′B′C′",
    notationStyle: 'congruence',
    trailingText: "Same shape, same size — that's congruence.",
  },
  'predict-reflect-0': {
    text: "Flipped, but same distances. Same angles. The mirror changed orientation, not the triangle.",
  },
  'predict-reflect-1': {
    text: "The axis you crossed? That coordinate flips. The other stays.",
  },
  'predict-with-coordinates-reflect-0': {
    text: "Look at each vertex. One coordinate changed sign. Which one — and why?",
  },
  'predict-with-coordinates-reflect-1': {
    text: "Flip one coordinate — the triangle mirrors, but distances and angles don't change.",
    notation: "△ABC ≅ △A′B′C′",
    notationStyle: 'congruence',
    trailingText: "Still congruent.",
  },
  'predict-rotate-0': {
    text: "Turned, but same distances. Same angles. Rotation preserves everything.",
  },
  'predict-rotate-1': {
    text: "Here's the pattern in the coordinates.",
  },
  'predict-with-coordinates-rotate-0': {
    text: "Follow each vertex. How did (x, y) become the new coordinates? Look for the pattern.",
  },
  'predict-with-coordinates-rotate-1': {
    text: "Every vertex rotated the same angle around the origin. Distances and angles — preserved.",
    notation: "△ABC ≅ △A′B′C′",
    notationStyle: 'congruence',
    trailingText: "Congruent. Every time.",
  },
}

export const SYNTHESIS_REVEAL: RevealBeat = {
  text: "Translations, reflections, rotations. Three different moves — one result.",
  notation: "△ABC ≅ △A′B′C′",
  notationStyle: 'congruence',
  trailingText: "Every rigid motion preserves distances and angles. Every one produces congruence.",
}

export const PHASE_LABELS: Record<2 | 3 | 4, string> = {
  2: 'PHASE 02 · PREDICT & REVEAL',
  3: 'PHASE 03 · COORDINATE LAYER',
  4: 'PHASE 04 · CAPSTONE',
}

/**
 * Returns the coordinate transformation rule as a display string.
 * Called at render time for beat-1 spatial reveals — not stored in EARNED_REVEALS.
 * Uses typographic minus sign (−) not hyphen (-) for readability.
 */
export function formatCoordinateRule(params: TransformationParams): string {
  if (params.type === 'translate') {
    const dx = params.dx >= 0 ? `x + ${params.dx}` : `x − ${Math.abs(params.dx)}`
    const dy = params.dy >= 0 ? `y + ${params.dy}` : `y − ${Math.abs(params.dy)}`
    return `(x, y) → (${dx}, ${dy})`
  }
  if (params.type === 'reflect') {
    return params.axis === 'y' ? '(x, y) → (−x, y)' : '(x, y) → (x, −y)'
  }
  // rotate
  if (params.degrees === 90 && params.direction === 'cw')  return '(x, y) → (y, −x)'
  if (params.degrees === 180)                               return '(x, y) → (−x, −y)'
  if (params.degrees === 90 && params.direction === 'ccw') return '(x, y) → (−y, x)'
  return '(x, y) → (?)'
}

export type CapstoneRoundId = 'capstone-1' | 'capstone-2' | 'capstone-3'
export const CAPSTONE_EARNED_REVEALS: Record<CapstoneRoundId, string> = {
  'capstone-1': 'One transformation was enough. You described it completely with a type and a parameter.',
  'capstone-2': 'Two transformations composed. The order mattered — try reversing them to see why.',
  'capstone-3': "Rotation and translation don't commute. The order you chose was the one that works.",
}

/**
 * Prompt shown when the student first arrives at each capstone round (idle state).
 * Frames the task without giving away the answer.
 * capstone-3 hints at non-commutativity — the module's Level 5 pedagogical moment.
 */
export const CAPSTONE_PROMPT_TEXT: Record<CapstoneRoundId, string> = {
  'capstone-1': "You've proved what each move does. Now build a sequence.",
  'capstone-2': 'This one takes two steps. Build your sequence — the order you choose determines the result.',
  'capstone-3': 'Two steps again. If your first attempt misses, try reversing the order.',
}

export const CAPSTONE_COMPLETION_COPY: Record<string, string> = {
  'capstone-1': 'One rigid motion mapped △ABC onto △A″B″C″. Congruence — proved by construction.',
  'capstone-2': 'Two steps, one proof. You built the sequence that shows △ABC ≅ △A″B″C″.',
  'capstone-3': 'You found the order that works. △ABC ≅ △A″B″C″ — rigid motions compose.',
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
