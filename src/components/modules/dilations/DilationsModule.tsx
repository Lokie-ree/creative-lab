// src/components/modules/dilations/DilationsModule.tsx
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { ModuleProps } from '@/config/modules'
import { useDilationsStage } from './hooks/useDilationsStage'
import { DilationsScene } from './DilationsScene'
import { ModuleLayout } from './Layout'
import { PromptReadout } from './components/PromptReadout'
import { ControlStrip } from './components/ControlStrip'
import { ScaleFactorDisplay } from './components/ScaleFactorDisplay'
import { ScaleFactorScene } from './rounds/ScaleFactorRounds'
import { PHASE_LABELS, PHASE_INTROS, ROUND_PROMPTS } from './dilations-copy'
import { ROUND_CONFIGS } from './utils/constants'

export default function DilationsModule({ onBack }: ModuleProps) {
  const { state, dispatch } = useDilationsStage()
  const { phase, currentRound, roundState } = state
  const config = ROUND_CONFIGS[currentRound]
  const [contextLost, setContextLost] = useState(false)

  const isScaleFactorPhase = phase === 'scale-factor'

  // ── Prompt label derivation ──────────────────────────────────────────────
  const promptLabel = (() => {
    if (roundState === 'entry') return PHASE_LABELS[phase]
    if (roundState === 'reveal') return 'Discovered'
    if (roundState === 'completion') return 'Complete'
    return 'Predict'
  })()

  // ── Prompt text derivation ───────────────────────────────────────────────
  const promptText = (() => {
    if (roundState === 'entry') return PHASE_INTROS[phase] || config.label
    return ROUND_PROMPTS[currentRound] ?? config.label
  })()

  // ── Amber: phase entry with non-empty intro copy ─────────────────────────
  const amber = roundState === 'entry' && PHASE_INTROS[phase] !== ''

  // ── Formula readout: scale factor in Phase 1 ────────────────────────────
  const formulaReadout = isScaleFactorPhase && config.scaleFactor != null
    ? <div className="px-5 py-2 md:px-4"><ScaleFactorDisplay k={config.scaleFactor} /></div>
    : null

  return (
    <ModuleLayout
      statusStrip={
        <div className="flex items-center w-full pl-2 pr-5 md:pl-4 md:pr-6">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to module list"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-(--lab-text-muted) transition-colors duration-150 hover:text-(--lab-text) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
            Dilations & Similarity
          </span>

          <div className="flex-1" />

          <span className="shrink-0 lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
            {PHASE_LABELS[phase]}
          </span>
        </div>
      }
      prompt={
        <PromptReadout
          label={promptLabel}
          text={promptText}
          amber={amber}
        />
      }
      formulaReadout={formulaReadout}
      visualization={
        <>
          <DilationsScene
            coordinatesVisible={state.coordinatesVisible}
            angleLabelsVisible={state.angleLabelsVisible}
            onContextLost={() => setContextLost(true)}
            onContextRestored={() => setContextLost(false)}
          >
            {isScaleFactorPhase && (
              <ScaleFactorScene
                key={currentRound}
                state={state}
                dispatch={dispatch}
              />
            )}
          </DilationsScene>

          {contextLost && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-(--lab-bg)/90 z-10">
              <span className="lab-silk lab-display-font text-(--lab-text-muted)">
                SYS:REC — Visualization paused
              </span>
              <button
                type="button"
                onClick={() => setContextLost(false)}
                className="min-h-[44px] border border-(--lab-border) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
              >
                Tap to Resume
              </button>
            </div>
          )}
        </>
      }
      controls={
        <ControlStrip state={state} dispatch={dispatch} />
      }
    />
  )
}
