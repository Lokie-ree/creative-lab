/**
 * Design System Color Tokens
 *
 * Centralized color definitions for the interactive learning modules.
 * Eurorack / synth module aesthetic: warm faceplate, phosphor green accent,
 * silk-screened labels, scored dividers, no glow.
 *
 * Usage:
 * - Import: `import { colors } from '@/lib/colors'`
 * - Use in JS: `colors.accent.primary`
 * - Use in CSS: CSS variables are available (see index.css)
 */

export const colors = {
  // Primary accent (phosphor green)
  accent: {
    primary: '#7cc87c',
    primaryHover: '#96e496',
    primaryMuted: '#4a8a4a',
  },

  // Learning moment accent (amber/orange)
  learning: {
    primary: '#f5a623',
    primaryHover: '#f7b84a',
  },

  // Background colors (warm faceplate)
  background: {
    primary: '#1e1d1c',
    secondary: '#252422',
    tertiary: '#2e2c28',
    elevated: '#3a3733',
  },

  // Border colors
  border: {
    primary: '#2e2c28',
    subtle: '#252422',
    muted: '#7a746a',
  },

  // Text colors (silk cream)
  text: {
    primary: '#b8b0a4',
    secondary: '#8a847a',
    muted: '#4a463e',
    dim: '#4a463e',
  },

  // Ghost/target visualization
  ghost: '#7a746a',

  // Panel hardware (screws)
  screw: {
    border: '#4a4844',
    bg: '#3a3836',
    slot: '#1a1918',
  },

  // LED indicators
  led: {
    completedBorder: '#3e5e3e',
    upcomingBorder: '#3a3632',
  },

  // Additional semantic colors
  success: '#5a7a5a',
  danger: '#8a4a4a',
  warning: '#f5a623',
} as const

/**
 * Helper function to get color with opacity
 * Uses color-mix() for modern browsers, falling back to hex+alpha
 */
export function colorWithOpacity(color: string, opacity: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`
}

/**
 * Export individual color values for convenience
 */
export const {
  accent,
  learning,
  background,
  border,
  text,
  ghost,
  success,
  warning,
} = colors
