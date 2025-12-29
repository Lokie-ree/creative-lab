/**
 * Design System Color Tokens
 * 
 * Centralized color definitions for the Signal Lab module.
 * These tokens align with Brilliant's design language while maintaining
 * the dark, focused aesthetic of the interactive visualization.
 * 
 * Usage:
 * - Import: `import { colors } from '@/lib/colors'`
 * - Use in JS: `colors.accent.primary`
 * - Use in CSS: CSS variables are available (see index.css)
 */

export const colors = {
  // Primary accent (Brilliant Pear - warm yellow-green)
  accent: {
    primary: '#c8e44c',
    primaryHover: '#d4f06a',
    primaryMuted: '#d4ed5c',
  },

  // Learning moment accent (amber/orange)
  learning: {
    primary: '#f5a623',
    primaryHover: '#f7b84a',
  },

  // Background colors
  background: {
    primary: '#0a0a0f',
    secondary: '#12121a',
    tertiary: '#1a1a24',
    elevated: '#2a2a3a',
  },

  // Border colors
  border: {
    primary: '#2a2a3a',
    subtle: '#1f1f2a',
    muted: '#888888',
  },

  // Text colors
  text: {
    primary: '#e0e0e0',
    secondary: '#888888',
    muted: '#4a5568',
    dim: '#6b7280',
  },

  // Ghost/target visualization
  ghost: '#888888',

  // Additional semantic colors
  success: '#c8e44c',
  warning: '#f5a623',
} as const

/**
 * Helper function to get color with opacity
 * Useful for inline styles or dynamic opacity needs
 */
export function colorWithOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
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
