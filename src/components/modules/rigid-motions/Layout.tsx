// src/components/modules/rigid-motions/Layout.tsx
import { type ReactNode } from 'react'

interface ModuleLayoutProps {
  statusStrip: ReactNode
  /** null → row removed from DOM; scene reclaims the space */
  prompt: ReactNode
  /** null → formula strip row is empty but its height is always reserved */
  formulaReadout: ReactNode
  visualization: ReactNode
  controls: ReactNode
  /** Overlays: WebGL recovery, celebrations, etc. */
  children?: ReactNode
}

/**
 * Eurorack faceplate layout for rigid-motions (and future geometry modules).
 *
 * Mobile (<md): flex column — status | prompt? | scene | [formula strip | controls]
 * Desktop (≥md): flex column — status | scene | [formula strip | prompt + controls]
 *
 * The bottom panel always reserves two rows so the scene height never shifts
 * when the formula readout appears at Phase 3 entry.
 *
 * The prompt slot renders in two DOM positions (mobile row above scene, desktop
 * controls-row left side) via responsive visibility. Both instances receive the
 * same React node — PromptReadout handles its own animation internally.
 */
export function ModuleLayout({
  statusStrip,
  prompt,
  formulaReadout,
  visualization,
  controls,
  children,
}: ModuleLayoutProps) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-(--lab-bg)">

      {/* ── STATUS STRIP ───────────────────────────── */}
      <header className="shrink-0 h-10 flex items-center border-b border-(--lab-border)">
        {statusStrip}
      </header>

      {/* ── PROMPT (mobile only — above scene) ─────── */}
      {/* bg-(--lab-surface) matches the existing mobile prompt row background */}
      {prompt && (
        <div className="shrink-0 bg-(--lab-surface) border-b border-(--lab-border) md:hidden">
          {prompt}
        </div>
      )}

      {/* ── VISUALIZATION ──────────────────────────── */}
      <main className="flex-1 min-h-0 relative overflow-hidden">
        {visualization}
      </main>

      {/* ── BOTTOM PANEL ───────────────────────────── */}
      <footer className="shrink-0 border-t border-(--lab-border)">

        {/* Formula strip — always two rows; this one is always reserved */}
        <div className="border-b border-(--lab-border) min-h-8">
          {formulaReadout}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-4 px-5 py-3 md:px-6">
          {/* Desktop: prompt on left side of controls row */}
          {prompt && (
            <div className="hidden md:flex flex-1 min-w-0">
              {prompt}
            </div>
          )}
          {/* Controls — full width on mobile, shrink on desktop */}
          <div className="w-full md:w-auto md:shrink-0">
            {controls}
          </div>
        </div>

      </footer>

      {/* ── OVERLAYS ───────────────────────────────── */}
      {children}

    </div>
  )
}
