// src/components/modules/rigid-motions/InstrumentModule.tsx
/**
 * Rigid Motions — Phase 1
 *
 * Infrastructure only: coordinate grid, fixed pre-image triangle,
 * draggable ghost triangle that snaps to grid intersections.
 * No transformation logic, no scoring. Phase 2 adds those.
 */
import { ChevronLeft } from 'lucide-react'
import type { ModuleProps } from '@/config/modules'
import { useRigidMotionsState } from './hooks/useRigidMotionsState'
import { RigidMotionsScene } from './scene/RigidMotionsScene'
import { ControlStrip } from './controls/ControlStrip'

// onComplete accepted per ModuleProps contract — wired in Phase 2
export function InstrumentModule({ onBack }: ModuleProps) {
  const { ghostOffset, handleGhostMove } = useRigidMotionsState()

  return (
    <div className="grid h-dvh w-screen overflow-hidden bg-(--lab-bg) grid-rows-[3rem_auto_1fr_auto]">

      {/* ── ROW 1: STATUS STRIP ─────────────────────────────── */}
      <header className="flex items-center gap-2 border-b border-(--lab-border) px-5 md:gap-4 md:px-6">
        {/* Back chevron */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 min-h-[44px] min-w-[44px] items-center justify-center transition-colors duration-150 hover:bg-(--lab-surface) focus:outline-none focus:ring-2 focus:ring-(--lab-accent)"
            aria-label="Back to course"
          >
            <ChevronLeft className="h-5 w-5 text-(--lab-text-muted) md:h-6 md:w-6" />
          </button>
        )}

        {/* Module title — desktop only */}
        <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
          Rigid Motions
        </span>

        {/* Progress dots — one dot, active */}
        <nav
          className="flex flex-1 items-center justify-center"
          aria-label="Module progress: stage 1 of 1"
        >
          <ol className="flex items-center" role="list">
            <li>
              <span
                className="block h-[7px] w-[7px] rounded-full bg-(--lab-accent) border border-(--lab-accent-muted)"
                aria-label="Stage 1, current"
                aria-current="step"
              />
            </li>
          </ol>
        </nav>

        {/* SYS:NOM */}
        <span className="shrink-0 lab-silk text-(--lab-success) lab-data-font">
          SYS:NOM
        </span>

        {/* ESC — desktop only */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="hidden shrink-0 min-h-[44px] border border-(--lab-border) px-3 lab-silk lab-display-font tracking-[0.1em] text-(--lab-text-muted) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none focus:ring-2 focus:ring-(--lab-accent) md:flex md:items-center"
            aria-label="Exit module"
          >
            ESC
          </button>
        )}
      </header>

      {/* ── ROW 2: PROMPT ───────────────────────────────────── */}
      <div
        className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-3 md:px-6"
        role="status"
        aria-live="polite"
      >
        <div className="mb-1 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
          Predict
        </div>
        <p className="text-sm font-medium lab-display-font text-(--lab-text)">
          Where will the triangle land? Drag the green triangle to make your prediction.
        </p>
      </div>

      {/* ── ROW 3: VISUALIZATION ────────────────────────────── */}
      <main className="relative min-h-0">
        <RigidMotionsScene ghostOffset={ghostOffset} onGhostMove={handleGhostMove} />
      </main>

      {/* ── ROW 4: CONTROL STRIP ────────────────────────────── */}
      <footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-3 md:px-6 md:py-4">
        <ControlStrip />
      </footer>
    </div>
  )
}

export default InstrumentModule
