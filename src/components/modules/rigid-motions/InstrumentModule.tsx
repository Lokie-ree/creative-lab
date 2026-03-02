// src/components/modules/rigid-motions/InstrumentModule.tsx
/**
 * Rigid Motions — Phase 1
 *
 * Navigation handled by the app shell EscapeHatch (LAB dropdown).
 * No back button or ESC in the status strip — that would duplicate it.
 */
import type { ModuleProps } from '@/config/modules'
import { useRigidMotionsState } from './hooks/useRigidMotionsState'
import { RigidMotionsScene } from './scene/RigidMotionsScene'
import { ControlStrip } from './controls/ControlStrip'

// Props accepted per ModuleProps contract; onComplete and onBack wired in Phase 2.
// Navigation is handled by the app shell EscapeHatch (LAB dropdown).
export function InstrumentModule(_: ModuleProps) {
  const { ghostOffset, handleGhostMove } = useRigidMotionsState()

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
          Where will the triangle land? Drag the green triangle to make your prediction.
        </p>
      </div>

      {/* ── ROW 3: VISUALIZATION ────────────────────────────── */}
      <main className="relative min-h-0">
        <RigidMotionsScene ghostOffset={ghostOffset} onGhostMove={handleGhostMove} />
      </main>

      {/* ── ROW 4: CONTROL STRIP ────────────────────────────── */}
      <footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2.5 md:px-6 md:py-3">
        <ControlStrip />
      </footer>
    </div>
  )
}

export default InstrumentModule
