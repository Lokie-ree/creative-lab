// src/components/modules/pythagorean-theorem/components/PromptReadout.tsx
//
// Phase label + round prompt text with optional notation and subtext.
// Own copy — same shape as M2 PromptReadout, adapted for M3 notationStyle values.

import { useRef, useEffect } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'

interface PromptReadoutProps {
  label: string
  text: string
  amber?: boolean
  /** Notation line — renders in lab-data-font below main text */
  notation?: string
  /** 'equation' = amber (earned), 'rule' = accent green */
  notationStyle?: 'equation' | 'rule'
  /** Supplementary prose line below notation */
  subtext?: string
}

export function PromptReadout({
  label,
  text,
  amber = false,
  notation,
  notationStyle,
  subtext,
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
          notationStyle === 'equation' ? 'text-(--lab-earned)' : 'text-(--lab-accent)',
        ].join(' ')}>
          {notation}
        </p>
      )}
      {subtext && (
        <p className="text-sm font-medium lab-display-font text-(--lab-text-muted) mt-0.5">
          {subtext}
        </p>
      )}
    </div>
  )
}
