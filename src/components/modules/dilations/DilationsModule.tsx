// src/components/modules/dilations/DilationsModule.tsx
import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft } from 'lucide-react'
import type { ModuleProps } from '@/config/modules'
import { useDilationsStage } from './hooks/useDilationsStage'
import { DilationsScene } from './DilationsScene'
import { ModuleLayout } from './Layout'
import { PromptReadout } from './components/PromptReadout'
import { ControlStrip } from './components/ControlStrip'
import { ScaleFactorDisplay } from './components/ScaleFactorDisplay'
import { ScaleFactorScene } from './rounds/ScaleFactorRounds'
import { PHASE_LABELS, PHASE_INTROS, ROUND_PROMPTS, EARNED_REVEALS } from './dilations-copy'
import type { EarnedReveal } from './dilations-copy'
import { ROUND_CONFIGS } from './utils/constants'
import type { PhaseId } from './utils/types'
import { useAccessibility } from '@/lib/skeleton/useAccessibility'

const PHASE_SEQUENCE: PhaseId[] = ['scale-factor', 'coordinate', 'similarity', 'aa-capstone']

export default function DilationsModule({ onBack }: ModuleProps) {
  const { state, dispatch } = useDilationsStage()
  const { phase, currentRound, roundState } = state
  const config = ROUND_CONFIGS[currentRound]
  const [contextLost, setContextLost] = useState(false)

  const isScaleFactorPhase = phase === 'scale-factor'

  // ── Accessibility ────────────────────────────────────────────────────────
  const { announce } = useAccessibility()

  // ── Keyboard nudge state ─────────────────────────────────────────────────
  const [nudgePosition, setNudgePosition] = useState<{ x: number; y: number } | null>(null)

  const handleGhostPositionChange = useCallback((pos: { x: number; y: number }) => {
    setNudgePosition(pos)
  }, [])

  // Reset nudge on round change
  useEffect(() => {
    setNudgePosition(null)
  }, [currentRound])

  // Arrow key nudging — only active in ghost-drag rounds during active/prediction states
  const isNudgeActive =
    config.hasGhostDrag &&
    (roundState === 'active' || roundState === 'prediction')

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isNudgeActive) return
    const step = e.shiftKey ? 0.25 : 0.5
    let dx = 0, dy = 0
    if (e.key === 'ArrowLeft')       dx = -step
    else if (e.key === 'ArrowRight') dx = step
    else if (e.key === 'ArrowUp')    dy = step
    else if (e.key === 'ArrowDown')  dy = -step
    else return
    e.preventDefault()
    // CANONICAL_TRIANGLE centroid: ((1+4+2)/3, (1+2+4)/3)
    const base = nudgePosition ?? { x: 7 / 3, y: 7 / 3 }
    const snapped = { x: Math.round((base.x + dx) * 2) / 2, y: Math.round((base.y + dy) * 2) / 2 }
    setNudgePosition(snapped)
  }, [isNudgeActive, nudgePosition])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ── Earned reveal state ──────────────────────────────────────────────────
  const [shownReveals, setShownReveals] = useState<Set<string>>(new Set())
  const revealKey = currentRound
  const earnedReveal: EarnedReveal | undefined = EARNED_REVEALS[currentRound]
  const isFirstReveal = roundState === 'completion' && !!earnedReveal && !shownReveals.has(revealKey)

  // Announce earned reveals for screen readers + haptic on first reveal
  useEffect(() => {
    if (!isFirstReveal) return
    announce('Discovered! ' + (earnedReveal?.text ?? ''), 'assertive')
    navigator.vibrate?.(80)
  }, [isFirstReveal]) // eslint-disable-line react-hooks/exhaustive-deps

  // Record reveal on NEXT, then advance
  const handleAdvance = useCallback(() => {
    if (earnedReveal && !shownReveals.has(revealKey)) {
      setShownReveals(prev => new Set([...prev, revealKey]))
    }
    dispatch({ type: 'ADVANCE_ROUND' })
  }, [earnedReveal, shownReveals, revealKey, dispatch])

  // ── Prompt label derivation ──────────────────────────────────────────────
  const promptLabel = (() => {
    if (isFirstReveal) return 'Discovered'
    if (roundState === 'entry') return PHASE_LABELS[phase]
    if (roundState === 'reveal') return 'Discovered'
    if (roundState === 'completion') return 'Complete'
    return 'Predict'
  })()

  // ── Prompt text derivation ───────────────────────────────────────────────
  const promptText = (() => {
    if (isFirstReveal && earnedReveal) return earnedReveal.text
    if (roundState === 'entry') return PHASE_INTROS[phase] || config.label
    return ROUND_PROMPTS[currentRound] ?? config.label
  })()

  // ── Amber: earned reveal or phase entry with non-empty intro copy ────────
  const amber = isFirstReveal || (roundState === 'entry' && PHASE_INTROS[phase] !== '')
  const notation = isFirstReveal ? earnedReveal?.notation : undefined
  const notationStyle = isFirstReveal ? earnedReveal?.notationStyle : undefined

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

          <div
            className="flex flex-1 items-center justify-center gap-1.5"
            aria-label={`Phase ${PHASE_SEQUENCE.indexOf(phase) + 1} of ${PHASE_SEQUENCE.length}`}
          >
            {PHASE_SEQUENCE.map((p, i) => {
              const phaseIndex = PHASE_SEQUENCE.indexOf(phase)
              return (
                <span
                  key={p}
                  className={[
                    'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                    i < phaseIndex
                      ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
                      : i === phaseIndex
                        ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
                        : 'bg-transparent border-(--lab-ghost)/40',
                  ].join(' ')}
                />
              )
            })}
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
          notation={notation}
          notationStyle={notationStyle}
        />
      }
      formulaReadout={formulaReadout}
      visualization={
        <>
          <AnimatePresence>
            {isFirstReveal && (
              <motion.div
                key={revealKey}
                className="pointer-events-none absolute inset-0 z-10 border-2 border-(--lab-accent)"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

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
                ghostExternalPosition={nudgePosition}
                onGhostPositionChange={handleGhostPositionChange}
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
        <ControlStrip state={state} dispatch={dispatch} onAdvance={handleAdvance} />
      }
    />
  )
}
