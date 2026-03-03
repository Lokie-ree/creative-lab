// src/components/modules/rigid-motions/InstrumentModule.tsx
/**
 * Rigid Motions — Phase 2
 *
 * Navigation handled by the app shell EscapeHatch (LAB dropdown).
 * No back button or ESC in the status strip — that would duplicate it.
 */
import type { ModuleProps } from '@/config/modules'
import { useRigidMotionsState } from './hooks/useRigidMotionsState'
import { RigidMotionsScene } from './scene/RigidMotionsScene'
import { ControlStrip } from './controls/ControlStrip'
import { PROMPT_TEXT } from './rigid-motions-copy'

export function InstrumentModule(_: ModuleProps) {
  const {
    ghostOffset,
    handleGhostMove,
    guideState,
    feedbackState,
    currentRound,
    flipped,
    rotationDegrees,
    rotationDirection,
    speedMultiplier,
    coordinatesActive,
    handleCheck,
    handleNext,
    handleReset,
    handleFlip,
    handleRotation,
    handleSpeedChange,
    handleAnimationComplete,
  } = useRigidMotionsState()

  const promptText = PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.'

  return (
    <div className="grid h-dvh w-screen overflow-hidden bg-(--lab-bg) grid-rows-[3rem_auto_1fr_auto]">

      {/* ── ROW 1: STATUS STRIP ─────────────────────────────── */}
      {/* Left pad clears the floating EscapeHatch LAB button (~72px wide at left-4) */}
      <header className="flex items-center border-b border-(--lab-border) pl-24 pr-5 md:pr-6">
        <span className="shrink-0 lab-silk lab-display-font font-bold text-(--lab-text)">
          Rigid Motions
        </span>
      </header>

      {/* ── ROW 2: PROMPT ───────────────────────────────────── */}
      <div
        className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-2.5 md:px-6"
        role="status"
        aria-live="polite"
      >
        <div className="mb-0.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
          Predict
        </div>
        <p className="text-sm font-medium lab-display-font text-(--lab-text)">
          {promptText}
        </p>
      </div>

      {/* ── ROW 3: VISUALIZATION ────────────────────────────── */}
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
          speedMultiplier={speedMultiplier}
          coordinatesActive={coordinatesActive}
          onAnimationComplete={handleAnimationComplete}
        />
      </main>

      {/* ── ROW 4: CONTROL STRIP ────────────────────────────── */}
      <footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2.5 md:px-6 md:py-3">
        <ControlStrip
          guideState={guideState}
          feedbackState={feedbackState}
          flipped={flipped}
          rotationDegrees={rotationDegrees}
          rotationDirection={rotationDirection}
          speedMultiplier={speedMultiplier}
          onCheck={handleCheck}
          onNext={handleNext}
          onReset={handleReset}
          onFlip={handleFlip}
          onRotation={handleRotation}
          onSpeedChange={handleSpeedChange}
        />
      </footer>
    </div>
  )
}

export default InstrumentModule
