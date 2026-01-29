// src/lib/animation/tokens.ts
/**
 * Centralized animation timing tokens
 * All animation durations, easing, and stagger values in one place
 */

export const duration = {
  instant: 0,
  fast: 150,      // micro-interactions, hovers
  normal: 300,    // standard transitions
  slow: 500,      // emphasis, staged reveals
  dramatic: 800,  // major state changes
} as const

export const easing = {
  out: 'power3.out',       // primary exit easing
  inOut: 'power2.inOut',   // bidirectional transitions
  in: 'power2.in',         // entrance acceleration
} as const

export const stagger = {
  tight: 50,    // rapid sequence
  normal: 100,  // standard stagger
  loose: 150,   // deliberate sequence
} as const

// CSS custom properties version for use in stylesheets
export const cssTokens = `
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-dramatic: 800ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
`
