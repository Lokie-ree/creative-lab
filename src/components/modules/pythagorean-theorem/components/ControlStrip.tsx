// src/components/modules/pythagorean-theorem/components/ControlStrip.tsx
//
// Renders the appropriate button(s) for the current round/phase state.
//
// State → buttons:
//   entry + properties-pause  → CONTINUE (after dwell timer)
//   entry (other)             → CONTINUE (immediate)
//   active + isConstructStep  → CONFIRM
//   active (numeric rounds)   → NumericInput + CHECK
//   reveal                    → null (animation playing)
//   checking                  → null
//   completion                → NEXT (or FINISH on final round)

import { useState, useEffect } from 'react'
import type { RoundState, PhaseId } from '../types'
import { DWELL_TIMER_MS } from '../constants'
import { NumericInput } from './NumericInput'
import { ConverseToggle } from './ConverseToggle'

interface ControlStripProps {
  roundState: RoundState
  phase: PhaseId
  numericInput: string
  feedbackMessage: string | null
  checkEnabled: boolean
  isConstructStep: boolean
  isPropertiesPause: boolean
  isFinalRound: boolean
  /** Phase 2 only — null when not a converse round */
  converseToggle: boolean | null
  onCheck: () => void
  onNext: () => void
  onContinue: () => void
  onConfirm: () => void
  onInputChange: (value: string) => void
  onToggleChange: (value: boolean) => void
}

export function ControlStrip({
  roundState,
  phase,
  numericInput,
  feedbackMessage,
  checkEnabled,
  isConstructStep,
  isPropertiesPause,
  isFinalRound,
  converseToggle,
  onCheck,
  onNext,
  onContinue,
  onConfirm,
  onInputChange,
  onToggleChange,
}: ControlStripProps) {
  // Dwell timer — CONTINUE on properties-pause only appears after delay
  const [dwellReady, setDwellReady] = useState(false)

  useEffect(() => {
    setDwellReady(false)
    if (roundState === 'entry' && isPropertiesPause) {
      const timer = setTimeout(() => setDwellReady(true), DWELL_TIMER_MS)
      return () => clearTimeout(timer)
    } else {
      setDwellReady(true)
    }
  }, [roundState, isPropertiesPause])

  // ── entry ────────────────────────────────────────────────────────────────
  if (roundState === 'entry') {
    if (!dwellReady) return null
    return (
      <button
        type="button"
        onClick={onContinue}
        className="min-h-[44px] min-w-[120px] border border-(--lab-border) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
      >
        CONTINUE
      </button>
    )
  }

  // ── active ───────────────────────────────────────────────────────────────
  if (roundState === 'active') {
    // Phase 4 construct step — CONFIRM only
    if (isConstructStep) {
      return (
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-[44px] min-w-[120px] border border-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-accent) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          CONFIRM
        </button>
      )
    }

    // Numeric input + CHECK for all other active states
    const label =
      phase === 'converse' ? 'Enter the area of the largest square' :
      phase === 'coord-distance' ? 'Enter the distance' :
      'Enter your answer'

    return (
      <div className="flex w-full flex-col gap-2">
        {/* Phase 2: YES/NO toggle above the input row */}
        {phase === 'converse' && (
          <ConverseToggle value={converseToggle} onChange={onToggleChange} />
        )}
        {feedbackMessage && (
          <p className="lab-display-font text-xs text-(--lab-text-muted)">
            {feedbackMessage}
          </p>
        )}
        <div className="flex w-full items-center gap-2">
          <NumericInput
            value={numericInput}
            onChange={onInputChange}
            onSubmit={onCheck}
            ariaLabel={label}
            disabled={false}
          />
          <button
            type="button"
            onClick={onCheck}
            disabled={!checkEnabled}
            className={[
              'shrink-0 min-h-[44px] min-w-[80px] px-4',
              'lab-silk lab-display-font tracking-[0.1em]',
              'border border-(--lab-accent) text-(--lab-accent)',
              'transition-opacity duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)',
              checkEnabled ? 'hover:opacity-80' : 'opacity-30 cursor-not-allowed',
            ].join(' ')}
          >
            CHECK
          </button>
        </div>
      </div>
    )
  }

  // ── reveal / checking — animation playing, no controls ───────────────────
  if (roundState === 'reveal' || roundState === 'checking') {
    return null
  }

  // ── completion ───────────────────────────────────────────────────────────
  if (roundState === 'completion') {
    return (
      <button
        type="button"
        onClick={onNext}
        className="min-h-[44px] min-w-[120px] bg-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-bg) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
      >
        {isFinalRound ? 'FINISH' : 'NEXT →'}
      </button>
    )
  }

  return null
}
