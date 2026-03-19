// src/components/modules/rigid-motions/InstrumentModule.tsx
/**
 * Rigid Motions — Phase 2 + Phase 4 capstone
 *
 * Back navigation lives in the status strip (ChevronLeft button).
 */
import { useEffect, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft } from 'lucide-react'
import type { ModuleProps } from '@/config/modules'
import { useRigidMotionsState } from './hooks/useRigidMotionsState'
import { RigidMotionsScene } from './scene/RigidMotionsScene'
import { ControlStrip } from './controls/ControlStrip'
import { PROMPT_TEXT, CLOSE_COPY, EARNED_REVEALS, CAPSTONE_EARNED_REVEALS, CAPSTONE_PROMPT_TEXT, type CapstoneRoundId } from './rigid-motions-copy'
import { FormulaReadout } from './scene/FormulaReadout'
import { isCoordinateStage, getGuideStateConfig } from './guide-state'
import { computeGhostVertices, clampOffset } from './scene/scene-math'
import { useAccessibility } from '@/lib/skeleton/useAccessibility'
import type { ReflectionParams } from './types'
import { ModuleLayout } from './Layout'
import { PromptReadout } from './components/PromptReadout'

export function InstrumentModule({ onComplete, onBack }: ModuleProps) {
  const {
    ghostOffset,
    handleGhostMove,
    guideState,
    feedbackState,
    currentRound,
    flipped,
    rotationDegrees,
    rotationDirection,
    coordinatesActive,
    handleCheck,
    handleNext,
    handleReset,
    handleFlip,
    handleRotation,
    handleAnimationComplete,
    capstoneRound,
    capstoneSequence,
    showCelebration,
    handleSequenceChange,
    handleCheckSequence,
    handleCapstoneNext,
    shownReveals,
  } = useRigidMotionsState()

  // ── Accessibility + Error recovery ─────────────────────────────────────
  const { announce } = useAccessibility()
  const [contextLost, setContextLost] = useState(false)

  // Announce feedback state changes for screen readers + haptic on match
  useEffect(() => {
    if (feedbackState === 'match') {
      announce('Match! Press Next to continue.', 'assertive')
      navigator.vibrate?.(80)
    }
    else if (feedbackState === 'close') announce('Getting closer.')
    else if (feedbackState === 'miss') announce('Not quite. Try adjusting the position.')
  }, [feedbackState, announce])

  useEffect(() => {
    if (showCelebration) {
      onComplete({}, { completedSequence: capstoneSequence })
    }
  }, [showCelebration, onComplete, capstoneSequence])

  const isMiss   = feedbackState === 'miss'
  const isClose  = feedbackState === 'close'
  const isMatch  = feedbackState === 'match'

  // Earned reveal key: capstone uses round ID, all others use guide state
  const revealKey = guideState === 'capstone' ? capstoneRound.id : guideState
  const firstMatch = isMatch && !shownReveals.has(revealKey)
  const repeatMatch = isMatch && shownReveals.has(revealKey)

  const _earnedRevealRaw =
    guideState === 'capstone'
      ? CAPSTONE_EARNED_REVEALS[capstoneRound.id as CapstoneRoundId]
      : EARNED_REVEALS[`${guideState}-0`]
  // TODO(Task 5): replace with full RevealBeat wiring (beat-keyed reveals)
  const earnedRevealText: string | undefined =
    typeof _earnedRevealRaw === 'string' ? _earnedRevealRaw : _earnedRevealRaw?.text

  const promptText = (() => {
    if (guideState === 'capstone' && feedbackState === 'idle')
      return CAPSTONE_PROMPT_TEXT[capstoneRound.id as CapstoneRoundId]
    if (firstMatch && earnedRevealText) return earnedRevealText
    if (repeatMatch)  return 'Match.'
    if (isMiss)       return 'Not quite — adjust your position.'
    if (isClose)      return CLOSE_COPY[guideState] ?? 'Getting closer.'
    return PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.'
  })()

  const promptLabel =
    guideState === 'capstone'          ? 'Build' :
    guideState === 'coordinate-reveal' ? 'Reveal' :
    isCoordinateStage(guideState)      ? 'Coordinate Rule' :
    firstMatch                         ? 'Discovered' :
    isMiss || isClose                  ? 'Hint' :
    'Predict'

  // ── Keyboard nudging for ghost ──────────────────────────────────────────
  // Arrow keys move the ghost 1 unit; Shift+Arrow moves 0.1 units (fine).
  // Only active during predict states where the ghost is draggable.
  const isNudgeActive = guideState.startsWith('predict-')
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isNudgeActive) return
    const step = e.shiftKey ? 0.1 : 1
    let dx = 0, dy = 0
    if (e.key === 'ArrowLeft')  { dx = -step }
    else if (e.key === 'ArrowRight') { dx = step }
    else if (e.key === 'ArrowUp')    { dy = step }
    else if (e.key === 'ArrowDown')  { dy = -step }
    else return
    e.preventDefault()
    handleGhostMove(clampOffset([ghostOffset[0] + dx, ghostOffset[1] + dy]))
  }, [isNudgeActive, ghostOffset, handleGhostMove])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const reflectionAxis = currentRound.params.type === 'reflect'
    ? (currentRound.params as ReflectionParams).axis
    : undefined

  // No live ghost in coordinate-reveal (pause state) or capstone
  const liveGhostVertices =
    (guideState === 'coordinate-reveal' || guideState === 'capstone')
      ? undefined
      : computeGhostVertices(ghostOffset, guideState, flipped, rotationDegrees, rotationDirection, reflectionAxis) as [number, number][]

  const showFormulaReadout = guideState === 'coordinate-reveal' || isCoordinateStage(guideState)

  const currentGuideIndex = guideState !== 'capstone' ? getGuideStateConfig(guideState).index : -1
  const GUIDE_STATE_TOTAL = 8 // one per guide state in GUIDE_STATE_SEQUENCE

  return (
    <ModuleLayout
      statusStrip={
        /* Layout.tsx already wraps this in <header> — use a fragment here, not another <header> */
        <div className="flex items-center w-full pl-2 pr-5 md:pl-4 md:pr-6">
          {/* Left: back chevron */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to module list"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-(--lab-text-muted) transition-colors duration-150 hover:text-(--lab-text) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Title (desktop only) */}
          <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
            Rigid Motions
          </span>

          {/* Center: progress LEDs */}
          {guideState !== 'capstone' ? (
            <div
              className="flex flex-1 items-center justify-center gap-1"
              aria-label={`Step ${currentGuideIndex + 1} of ${GUIDE_STATE_TOTAL}`}
            >
              {Array.from({ length: GUIDE_STATE_TOTAL }, (_, i) => (
                <span
                  key={i}
                  className={[
                    'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                    i < currentGuideIndex
                      ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
                      : i === currentGuideIndex
                        ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
                        : 'bg-transparent border-(--lab-ghost)/40',
                  ].join(' ')}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1" aria-hidden />
          )}

          {/* Right: invisible spacer to balance title on left */}
          <span
            className="hidden shrink-0 lab-silk lab-display-font font-bold md:block invisible"
            aria-hidden
          >
            Rigid Motions
          </span>
        </div>
      }
      prompt={
        <PromptReadout
          label={promptLabel}
          text={promptText}
          amber={firstMatch}
        />
      }
      formulaReadout={showFormulaReadout ? (
        <FormulaReadout
          round={currentRound}
          ghostVertices={liveGhostVertices}
          feedbackState={feedbackState}
        />
      ) : null}
      visualization={
        <>
          {/* Match flash — screen-edge accent burst on first match per round */}
          <AnimatePresence>
            {firstMatch && (
              <motion.div
                key={revealKey}
                className="pointer-events-none absolute inset-0 z-10 border-2 border-(--lab-accent)"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
          <RigidMotionsScene
            ghostOffset={ghostOffset}
            onGhostMove={handleGhostMove}
            guideState={guideState}
            feedbackState={feedbackState}
            currentRound={currentRound}
            flipped={flipped}
            rotationDegrees={rotationDegrees}
            rotationDirection={rotationDirection}
            coordinatesActive={coordinatesActive}
            onAnimationComplete={handleAnimationComplete}
            capstoneSequence={capstoneSequence}
            capstoneTargetVertices={capstoneRound.targetVertices}
            onContextLost={() => setContextLost(true)}
            onContextRestored={() => setContextLost(false)}
          />
          {contextLost && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-(--lab-bg)/90 z-10">
              <span className="lab-silk lab-display-font text-(--lab-text-muted)">
                SYS:REC — Visualization paused
              </span>
              <button
                type="button"
                onClick={() => setContextLost(false)}
                className="min-h-[44px] border border-(--lab-border) px-4 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus:ring-2 focus:ring-(--lab-accent)"
              >
                Tap to Resume
              </button>
            </div>
          )}
        </>
      }
      controls={
        <ControlStrip
          guideState={guideState}
          feedbackState={feedbackState}
          flipped={flipped}
          rotationDegrees={rotationDegrees}
          rotationDirection={rotationDirection}
          onCheck={handleCheck}
          onNext={handleNext}
          onReset={handleReset}
          onFlip={handleFlip}
          onRotation={handleRotation}
          capstoneSequence={capstoneSequence}
          onSequenceChange={handleSequenceChange}
          onCheckSequence={handleCheckSequence}
          onCapstoneNext={handleCapstoneNext}
        />
      }
    />
  )
}

export default InstrumentModule
