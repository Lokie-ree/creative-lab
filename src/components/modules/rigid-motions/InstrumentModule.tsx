// src/components/modules/rigid-motions/InstrumentModule.tsx
/**
 * Rigid Motions — Phase 2 + Phase 4 capstone
 *
 * Navigation handled by the app shell EscapeHatch (LAB dropdown).
 * No back button or ESC in the status strip — that would duplicate it.
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import type { ModuleProps } from '@/config/modules'
import { fadeInReadout } from '@/lib/animation/presets'
import { useRigidMotionsState } from './hooks/useRigidMotionsState'
import { RigidMotionsScene } from './scene/RigidMotionsScene'
import { ControlStrip } from './controls/ControlStrip'
import { PROMPT_TEXT } from './rigid-motions-copy'
import { FormulaReadout } from './scene/FormulaReadout'
import { isCoordinateStage } from './guide-state'
import { computeGhostVertices, clampOffset } from './scene/scene-math'
import { useAccessibility } from '@/lib/skeleton/useAccessibility'
import { useErrorRecovery } from '@/lib/skeleton/useErrorRecovery'
import type { ReflectionParams } from './types'

export function InstrumentModule({ onComplete }: ModuleProps) {
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
  } = useRigidMotionsState()

  // ── Accessibility + Error recovery ─────────────────────────────────────
  const { announce } = useAccessibility()
  const { startMonitoring, stopMonitoring } = useErrorRecovery()
  const [contextLost, setContextLost] = useState(false)

  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [startMonitoring, stopMonitoring])

  // Announce feedback state changes for screen readers
  useEffect(() => {
    if (feedbackState === 'match') announce('Match! Press Next to continue.', 'assertive')
    else if (feedbackState === 'close') announce('Getting closer.')
    else if (feedbackState === 'miss') announce('Not quite. Try adjusting the position.')
  }, [feedbackState, announce])

  useEffect(() => {
    if (showCelebration) {
      onComplete({}, { completedSequence: capstoneSequence })
    }
  }, [showCelebration, onComplete, capstoneSequence])

  const promptText = PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.'
  const promptLabel =
    guideState === 'coordinate-reveal' ? 'Reveal' :
    isCoordinateStage(guideState)      ? 'Coordinate Rule' :
    'Predict'

  const promptRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (promptRef.current) fadeInReadout(promptRef.current)
  }, [promptText])

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

  return (
    <div className="grid h-dvh w-screen overflow-hidden bg-(--lab-bg) grid-rows-[3rem_auto_auto_1fr_auto]">

      {/* ── ROW 1: STATUS STRIP ─────────────────────────────── */}
      {/* Left pad clears the floating EscapeHatch LAB button (~72px wide at left-4) */}
      <header className="flex items-center gap-4 border-b border-(--lab-border) pl-24 pr-5 md:pr-6">
        <span className="shrink-0 lab-silk lab-display-font font-bold text-(--lab-text)">
          Rigid Motions
        </span>
        <span className="ml-auto shrink-0 lab-silk text-(--lab-success) lab-data-font">
          SYS:NOM
        </span>
      </header>

      {/* ── ROW 2: PROMPT ───────────────────────────────────── */}
      {guideState !== 'capstone' ? (
        <div
          ref={promptRef}
          className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-2.5 md:px-6"
          role="status"
          aria-live="polite"
        >
          <div className="mb-0.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
            {promptLabel}
          </div>
          <p className="text-sm font-medium lab-display-font text-(--lab-text)">
            {promptText}
          </p>
        </div>
      ) : <div aria-hidden />}

      {/* ── ROW 3: FORMULA READOUT (Phase 3+ only) ──────────── */}
      {showFormulaReadout && (
        <FormulaReadout
          round={currentRound}
          ghostVertices={liveGhostVertices}
          feedbackState={feedbackState}
        />
      )}
      {!showFormulaReadout && <div aria-hidden />}

      {/* ── ROW 4: VISUALIZATION ────────────────────────────── */}
      <main className="relative min-h-0">
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
        {/* WebGL context loss recovery overlay */}
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
      </main>

      {/* ── ROW 5: CONTROL STRIP ────────────────────────────── */}
      <footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2.5 md:px-6 md:py-3">
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
      </footer>
    </div>
  )
}

export default InstrumentModule
