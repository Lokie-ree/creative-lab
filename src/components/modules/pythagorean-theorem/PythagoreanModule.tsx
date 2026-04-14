// src/components/modules/pythagorean-theorem/PythagoreanModule.tsx
//
// Module orchestrator — wires state machine, scene, and controls together.
// Phase 1 (visual-proof) is fully playable after Prompt 5.
// Phases 2–4 controls added in Prompts 6–8.

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { ModuleProps } from '@/config/modules'
import { usePythagoreanState } from './hooks/usePythagoreanState'
import { ModuleLayout } from './Layout'
import { PromptReadout } from './components/PromptReadout'
import { ControlStrip } from './components/ControlStrip'
import { PythagoreanScene } from './scene/PythagoreanScene'
import { RevealAnimation } from './scene/RevealAnimation'
import { PHASE_LABELS, ROUND_SEQUENCE } from './constants'
import { PROMPT_TEXT } from './pythagorean-copy'
import { useAccessibility } from '@/lib/skeleton/useAccessibility'
import { CelebrationModal } from '@/components/celebration/CelebrationModal'

// ---------------------------------------------------------------------------
// LED progress dots — 13 rounds in 4 phase groups (3 + 3 + 4 + 3)
// ---------------------------------------------------------------------------

const PHASE_GROUP_SIZES = [3, 3, 4, 3]

function StatusDots({ roundIndex }: { roundIndex: number }) {
  const dots: { groupIndex: number; dotIndex: number; flatIndex: number }[] = []
  let flat = 0
  PHASE_GROUP_SIZES.forEach((size, gi) => {
    for (let di = 0; di < size; di++) {
      dots.push({ groupIndex: gi, dotIndex: di, flatIndex: flat++ })
    }
  })

  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {dots.map(({ groupIndex, dotIndex, flatIndex }) => {
        const isFirst = dotIndex === 0
        const isDone    = flatIndex < roundIndex
        const isActive  = flatIndex === roundIndex
        return (
          <span
            key={flatIndex}
            className={[
              'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
              isFirst && groupIndex > 0 ? 'ml-2' : '',
              isDone
                ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
                : isActive
                  ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
                  : 'bg-transparent border-(--lab-ghost)/40',
            ].join(' ')}
          />
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FormulaReadout — builds progressively as phases are completed
// ---------------------------------------------------------------------------

// FormulaReadout builds progressively as phases complete.
// Uses grid-template-rows 0fr→1fr to smoothly expand without layout shift.
function FormulaReadout({
  formulaVisible,
  converseVisible,
}: {
  formulaVisible: boolean
  converseVisible: boolean
}) {
  return (
    <div
      className={[
        'grid transition-[grid-template-rows] duration-300 ease-out',
        formulaVisible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      ].join(' ')}
      aria-hidden={!formulaVisible}
    >
      <div className="overflow-hidden min-h-0">
        <div className="px-5 py-2 md:px-4 flex flex-col gap-0.5">
          <p className="lab-data-font text-sm text-(--lab-earned)">
            a² + b² = c²
          </p>
          <div
            className={[
              'grid transition-[grid-template-rows] duration-300 ease-out',
              converseVisible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            ].join(' ')}
          >
            <div className="overflow-hidden min-h-0">
              <p className="lab-data-font text-xs text-(--lab-text-muted)">
                a² + b² = c²  ↔  right triangle
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PythagoreanModule
// ---------------------------------------------------------------------------

export default function PythagoreanModule({ onBack, onComplete }: ModuleProps) {
  const {
    state,
    dispatch,
    phase,
    roundConfig,
    isFirstReveal,
    earnedReveal,
    isConstructStep,
    isSolveStep: _isSolveStep,
    checkEnabled,
    isPropertiesPause,
    isFinalRound,
    handleCheck,
    handleNext,
    handleContinue,
    handleConfirmConstruction,
    handleInputChange,
    handleToggleChange,
  } = usePythagoreanState()

  const { announce } = useAccessibility()
  const [contextLost, setContextLost] = useState(false)

  // ── Announce correct/incorrect ───────────────────────────────────────────
  useEffect(() => {
    if (state.feedbackState === 'correct') {
      announce((earnedReveal?.text ?? state.feedbackMessage ?? 'Correct!'), 'assertive')
      navigator.vibrate?.(80)
    } else if (state.feedbackState === 'incorrect') {
      announce(state.feedbackMessage ?? 'Not quite — try again.', 'polite')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.feedbackState])

  // ── Announce phase transitions ───────────────────────────────────────────
  useEffect(() => {
    announce(`Phase: ${PHASE_LABELS[phase]}`, 'polite')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── Celebration ──────────────────────────────────────────────────────────
  // showCelebration lives in the reducer state
  const showCelebration = state.showCelebration

  // Show earned reveal text during both 'reveal' (animation) and 'completion' (NEXT shown)
  const showEarnedReveal =
    (state.roundState === 'reveal' || isFirstReveal) && !!earnedReveal

  // ── Prompt label ─────────────────────────────────────────────────────────
  const promptLabel = (() => {
    if (showEarnedReveal) return 'DISCOVERED'
    if (state.roundState === 'completion') return 'COMPLETE'
    if (state.roundState === 'entry') return PHASE_LABELS[phase]
    return PHASE_LABELS[phase]
  })()

  // ── Prompt text ──────────────────────────────────────────────────────────
  const promptText = (() => {
    if (showEarnedReveal) return earnedReveal!.text
    return PROMPT_TEXT[state.currentRound]?.prompt ?? ''
  })()

  const promptSubtext = (() => {
    if (showEarnedReveal) return undefined
    return PROMPT_TEXT[state.currentRound]?.subtext
  })()

  const amber = showEarnedReveal

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
            Pythagorean Theorem
          </span>

          <div
            className="flex flex-1 items-center justify-center"
            aria-label={`Round ${state.roundIndex + 1} of ${ROUND_SEQUENCE.length}`}
          >
            <StatusDots roundIndex={state.roundIndex} />
          </div>

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
          notation={showEarnedReveal ? earnedReveal?.notation : undefined}
          notationStyle={showEarnedReveal ? earnedReveal?.notationStyle : undefined}
          subtext={promptSubtext}
        />
      }
      formulaReadout={
        <FormulaReadout
          formulaVisible={state.formulaVisible}
          converseVisible={state.converseVisible}
        />
      }
      visualization={
        <>
          <PythagoreanScene
            phase={phase}
            roundConfig={roundConfig}
            roundState={state.roundState}
            feedbackState={state.feedbackState}
            formulaVisible={state.formulaVisible}
            converseVisible={state.converseVisible}
            coordinatesVisible={state.coordinatesVisible}
            constructionConfirmed={state.constructionConfirmed}
            onContextLost={() => setContextLost(true)}
            onContextRestored={() => setContextLost(false)}
          />

          <RevealAnimation
            phase={phase}
            roundState={state.roundState}
            dispatch={dispatch}
          />

          <CelebrationModal
            show={showCelebration}
            values={{ phases: 4, rounds: 13 }}
            moduleId="pythagorean-theorem"
            onDismiss={() => {
              onComplete({ phases: 4, rounds: 13 })
            }}
            onNewChallenge={() => {}}
            onNextModule={() => { onBack?.() }}
            onOpenProcess={() => {}}
          />

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
        <ControlStrip
          roundState={state.roundState}
          phase={phase}
          numericInput={state.numericInput}
          feedbackMessage={state.feedbackMessage}
          checkEnabled={checkEnabled}
          isConstructStep={isConstructStep}
          isPropertiesPause={isPropertiesPause}
          isFinalRound={isFinalRound}
          converseToggle={state.converseToggle}
          onCheck={handleCheck}
          onNext={handleNext}
          onContinue={handleContinue}
          onConfirm={handleConfirmConstruction}
          onInputChange={handleInputChange}
          onToggleChange={handleToggleChange}
        />
      }
    />
  )
}
