import { useState, useEffect, useRef } from 'react'
import type { StageState, StageAction } from './hooks/useDilationsStage'
import type { PhaseId, RoundId } from './utils/types'
import { ROUND_CONFIGS } from './utils/constants'

const PHASE_LABELS: Record<PhaseId, string> = {
  'scale-factor': 'PHASE 1 — Scale Factor',
  'coordinate':   'PHASE 2 — Coordinate Rule',
  'similarity':   'PHASE 3 — Similarity',
  'aa-capstone':  'PHASE 4 — AA Criterion',
}

// Empty string = no interstitial on first phase entry
const PHASE_INTROS: Record<PhaseId, string> = {
  'scale-factor': '',
  'coordinate':   "Now let's look at the coordinates. What happens to (x, y) when you dilate by k?",
  'similarity':   'Similar figures have the same shape but different sizes. Can a sequence of transformations connect them?',
  'aa-capstone':  "Two angles are enough to determine similarity. Let's see why.",
}

const ROUND_PROMPTS: Record<RoundId, string> = {
  'dilate-k2':                 'Where will the image triangle appear when k = 2?',
  'dilate-k2-properties':      'What properties are preserved by dilation?',
  'dilate-k3':                 'Predict the image for k = 3.',
  'dilate-k-half':             'What happens when k is less than 1?',
  'dilate-summary':            'What have you discovered about scale factors?',
  'coord-k2':                  'Predict the coordinates of the image vertices for k = 2.',
  'coord-k-half':              'Predict the coordinates for k = ½.',
  'coord-k-third':             'Can you predict the rule for any scale factor?',
  'similarity-guided':         'Build a sequence of transformations to map △ABC onto the target.',
  'similarity-rigid-dilation': 'Combine a rigid motion with a dilation to reach the target.',
  'similarity-inverse':        'Find a similarity transformation in reverse.',
  'aa-discover':               'Two triangles share two angle measures. What can you conclude?',
  'aa-confirm':                'Confirm: two angle pairs → similarity.',
  'capstone-final':            'Use what you know to complete the capstone challenge.',
}

export interface DilationsHUDProps {
  state: StageState
  dispatch: React.Dispatch<StageAction>
}

export function DilationsHUD({ state, dispatch }: DilationsHUDProps) {
  const { currentRound, roundState, phase } = state
  const config = ROUND_CONFIGS[currentRound]
  const prompt = ROUND_PROMPTS[currentRound]

  const inReveal = roundState === 'reveal'
  const showReveal = roundState === 'prediction' && config.hasGhostDrag
  const showCheck  = roundState === 'prediction' && config.hasSequenceBuilder
  const showNext   = roundState === 'completion'

  // Phase interstitial: show 1-2 sentences when phase changes, auto-dismiss after 2s
  const [interstitialText, setInterstitialText] = useState<string | null>(null)
  const prevPhaseRef = useRef<PhaseId>(phase)
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase
      const text = PHASE_INTROS[phase]
      if (text) {
        setInterstitialText(text)
        const timer = setTimeout(() => setInterstitialText(null), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [phase])

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
      {/* Top bar */}
      <div className="flex items-start justify-between">
        <span className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted)">
          {PHASE_LABELS[phase]}
        </span>
        <span className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted)">
          {config.label}
        </span>
      </div>

      {/* Phase interstitial overlay */}
      {interstitialText && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center"
          onClick={() => setInterstitialText(null)}
        >
          <div className="bg-(--lab-surface)/95 px-6 py-4 max-w-xs text-center">
            <p className="lab-display-font text-sm text-(--lab-text)">{interstitialText}</p>
          </div>
        </div>
      )}

      {/* Bottom area */}
      <div className="flex items-end justify-between gap-3">
        {/* Prompt text */}
        <p className="lab-display-font text-sm text-(--lab-text) max-w-[60%]">
          {prompt}
        </p>

        {/* Navigation buttons */}
        <div className="pointer-events-auto flex gap-2">
          {showReveal && (
            <button
              disabled={inReveal}
              onClick={() => dispatch({ type: 'TRIGGER_REVEAL' })}
              className="lab-silk lab-display-font text-[10px] tracking-[0.1em] px-3 min-h-[44px] min-w-[44px] border border-(--lab-accent) text-(--lab-accent) disabled:opacity-40 transition-opacity duration-150"
            >
              REVEAL
            </button>
          )}
          {showCheck && (
            <button
              disabled={inReveal}
              onClick={() => dispatch({ type: 'CHECK_SEQUENCE' })}
              className="lab-silk lab-display-font text-[10px] tracking-[0.1em] px-3 min-h-[44px] min-w-[44px] border border-(--lab-accent) text-(--lab-accent) disabled:opacity-40 transition-opacity duration-150"
            >
              CHECK
            </button>
          )}
          {showNext && (
            <button
              onClick={() => dispatch({ type: 'ADVANCE_ROUND' })}
              className="lab-silk lab-display-font text-[10px] tracking-[0.1em] px-4 min-h-[44px] bg-(--lab-accent) text-(--lab-bg) transition-opacity duration-150"
            >
              NEXT
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
