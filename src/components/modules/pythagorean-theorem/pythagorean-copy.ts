// src/components/modules/pythagorean-theorem/pythagorean-copy.ts
//
// All in-module copy for the Pythagorean Theorem module.
// No inline strings in components — all copy lives here.
//
// Voice: warm, discovery-first, never "wrong" or "incorrect."

import type { EarnedReveal, PhaseId, RoundId } from './types'

// ---------------------------------------------------------------------------
// Phase intro copy — shown on phase entry
// ---------------------------------------------------------------------------

export const PHASE_INTRO: Record<PhaseId, string> = {
  'visual-proof':
    'Every right triangle has squares on its sides. Count the small squares and see what you notice.',
  'converse':
    "You've seen the pattern once. Now let's test it — does it always hold?",
  'unknown-sides':
    'You know the relationship. Now use it to find a missing side.',
  'coord-distance':
    'Two points on a grid. A hidden right triangle connects them. Find the distance.',
}

// ---------------------------------------------------------------------------
// Round prompt copy — prompt text and optional subtext per round
// ---------------------------------------------------------------------------

export const PROMPT_TEXT: Record<RoundId, { prompt: string; subtext?: string }> = {

  // Phase 1: Visual Proof
  'proof-345': {
    prompt: 'The two smaller squares hold 9 and 16 unit squares.',
    subtext: 'How many unit squares will fill the largest square?',
  },
  'proof-51213': {
    prompt: 'Same setup — different triangle.',
    subtext: 'The two smaller squares hold 25 and 144 unit squares. Predict the largest.',
  },
  'proof-properties': {
    prompt: "You've seen this twice now.",
    subtext: 'What stays true across both triangles?',
  },

  // Phase 2: Converse
  'converse-6810': {
    prompt: 'Squares are drawn on all three sides.',
    subtext: 'Do the two smaller areas add up to the largest? Predict the total.',
  },
  'converse-569': {
    prompt: "This one looks like a triangle — but is it a right triangle?",
    subtext: 'Check whether the areas add up. Enter the area of the largest square.',
  },
  'converse-81517': {
    prompt: 'One more triangle.',
    subtext: 'Same question: do the two smaller squares add up to the largest?',
  },

  // Phase 3: Unknown Sides
  'solve-hyp-345': {
    prompt: 'The two legs are 3 and 4.',
    subtext: 'Use what you know to find the length of the longest side.',
  },
  'solve-hyp-6810': {
    prompt: 'Legs are 6 and 8.',
    subtext: 'Find the length of the hypotenuse.',
  },
  'solve-leg-51213': {
    prompt: 'The hypotenuse is 13. One leg is 5.',
    subtext: 'Find the missing leg.',
  },
  'solve-leg-6810': {
    prompt: 'The hypotenuse is 10. One leg is 8.',
    subtext: 'Find the missing leg.',
  },

  // Phase 4: Coordinate Distance
  'coord-345': {
    prompt: 'Two points: (1, 1) and (4, 5).',
    subtext: 'Find the distance between them.',
  },
  'coord-51213': {
    prompt: 'Two points: (0, 0) and (5, 12).',
    subtext: 'Find the distance.',
  },
  'coord-6810': {
    prompt: 'Two points: (2, 1) and (8, 9).',
    subtext: 'Find the distance.',
  },
}

// ---------------------------------------------------------------------------
// Earned reveals — appear after key rounds are completed
// ---------------------------------------------------------------------------

export const EARNED_REVEALS: Partial<Record<RoundId, EarnedReveal>> = {

  'proof-345': {
    text: '9 + 16 = 25. The two smaller squares filled the largest exactly.',
  },

  'proof-51213': {
    text: '25 + 144 = 169. It happened again — and this time the numbers are bigger.',
  },

  'proof-properties': {
    text: 'For any right triangle, the areas of the squares on the legs always add up to the area of the square on the hypotenuse.',
    notation: 'a² + b² = c²',
    notationStyle: 'equation',
  },

  'converse-6810': {
    text: '36 + 64 = 100. It holds for this triangle too.',
  },

  'converse-569': {
    text: '25 + 36 = 61, not 81. The areas don\'t add up — because this is not a right triangle.',
  },

  'converse-81517': {
    text: 'The relationship works both ways: if a² + b² = c², the triangle is a right triangle. If not, it isn\'t.',
    notation: 'a² + b² = c²  ↔  right triangle',
    notationStyle: 'equation',
  },

  'solve-hyp-345': {
    text: '3² + 4² = 5². The same triangle from Phase 1 — now you found the side instead of counting squares.',
  },

  'solve-leg-51213': {
    text: '13² − 5² = 144. √144 = 12. The formula works in reverse — subtract to find a missing leg.',
  },

  'coord-345': {
    text: 'Horizontal distance: 3. Vertical distance: 4. The 3-4-5 triangle again — hidden in the grid.',
  },

  'coord-6810': {
    text: 'You started by counting squares on a triangle. Now you\'re finding the distance between any two points on a grid — using the same relationship.',
    notation: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)',
    notationStyle: 'equation',
  },
}

// ---------------------------------------------------------------------------
// Feedback copy
// ---------------------------------------------------------------------------

export const FEEDBACK: { correct: string[]; incorrect: string } = {
  correct: [
    'Exactly.',
    'That\'s it.',
    'You got it.',
    'Right on.',
    'Yes — that\'s the one.',
  ],
  incorrect: 'Not quite — try again.',
}
