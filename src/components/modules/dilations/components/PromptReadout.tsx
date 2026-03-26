// src/components/modules/dilations/components/PromptReadout.tsx
import { useRef, useEffect } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'

interface PromptReadoutProps {
  label: string
  text: string
  amber?: boolean
  /** Notation line — renders in lab-data-font below text */
  notation?: string
  /** Color for notation: 'rule' = accent green, 'congruence' = earned amber */
  notationStyle?: 'rule' | 'congruence'
  /** Prose line rendered below notation in lab-display-font */
  trailingText?: string
}

/**
 * Prompt label + text with optional notation and trailing text.
 * Used in both mobile (above-scene) and desktop (bottom-panel left) positions.
 * Each instance manages its own ref and animation.
 */
export function PromptReadout({
  label,
  text,
  amber = false,
  notation,
  notationStyle,
  trailingText,
}: PromptReadoutProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) fadeInReadout(ref.current)
  }, [text])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className="px-5 py-1.5 md:px-4 md:py-3"
    >
      <div className="mb-0.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
        {label}
      </div>
      <p className={[
        'text-sm font-medium lab-display-font',
        amber ? 'text-(--lab-earned)' : 'text-(--lab-text)',
      ].join(' ')}>
        {text}
      </p>
      {notation && (
        <p className={[
          'text-sm font-medium lab-data-font mt-1',
          notationStyle === 'congruence' ? 'text-(--lab-earned)' : 'text-(--lab-accent)',
        ].join(' ')}>
          {notation}
        </p>
      )}
      {trailingText && (
        <p className="text-sm font-medium lab-display-font text-(--lab-text) mt-0.5">
          {trailingText}
        </p>
      )}
    </div>
  )
}
