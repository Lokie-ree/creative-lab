// src/components/modules/dilations/components/ControlStrip.tsx
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { ROUND_CONFIGS } from '../utils/constants'

interface ControlStripProps {
  state: StageState
  dispatch: Dispatch<StageAction>
}

export function ControlStrip({ state, dispatch }: ControlStripProps) {
  const { roundState, currentRound } = state
  const config = ROUND_CONFIGS[currentRound]

  // Entry pause — student presses CONTINUE to begin the round
  if (roundState === 'entry') {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_ROUND_STATE', state: 'active' })}
        className="min-h-[44px] min-w-[44px] border border-(--lab-border) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
      >
        CONTINUE
      </button>
    )
  }

  // Prediction — ghost-drag rounds show REVEAL; sequence-builder rounds show CHECK
  if (roundState === 'prediction') {
    if (config.hasGhostDrag) {
      return (
        <button
          type="button"
          onClick={() => dispatch({ type: 'TRIGGER_REVEAL' })}
          className="min-h-[44px] min-w-[44px] border border-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-accent) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          REVEAL
        </button>
      )
    }
    if (config.hasSequenceBuilder) {
      return (
        <button
          type="button"
          onClick={() => dispatch({ type: 'CHECK_SEQUENCE' })}
          className="min-h-[44px] min-w-[44px] border border-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-accent) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          CHECK
        </button>
      )
    }
  }

  // Completion — advance to next round
  if (roundState === 'completion') {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: 'ADVANCE_ROUND' })}
        className="min-h-[44px] min-w-[44px] bg-(--lab-accent) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-bg) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
      >
        NEXT
      </button>
    )
  }

  // active / reveal — no button (dragging or animation playing)
  return null
}
