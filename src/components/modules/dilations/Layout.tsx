// src/components/modules/dilations/Layout.tsx
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
 * Eurorack faceplate layout for Dilations module.
 *
 * Portrait (all widths):
 *   flex column — status | prompt (above scene) | scene (flex-1, min-h-[40dvh]) | formula strip | controls
 *   Prompt always shows above scene in portrait; never buried in the bottom panel.
 *
 * Landscape:
 *   flex row — scene (flex-1) | controls panel (w-72 fixed, not flex fraction)
 *   Fixed-width right column eliminates the huge empty panel on wide screens.
 *   Prompt moves to top of controls panel.
 *
 * Note: "landscape" uses CSS @media(orientation:landscape), independent of
 * the md: width breakpoint. Both can be active simultaneously on iPad landscape.
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
    <div className="h-dvh w-full flex flex-col overflow-hidden bg-(--lab-bg)">

      {/* ── STATUS STRIP ───────────────────────────── */}
      <header className="shrink-0 h-10 flex items-center border-b border-(--lab-border)">
        {statusStrip}
      </header>

      {/* ── BODY — portrait: column, landscape: row ─ */}
      <div className="flex-1 min-h-0 flex flex-col [@media(orientation:landscape)]:flex-row overflow-hidden">

        {/* ── PROMPT (portrait row — all widths; hidden only in landscape) ── */}
        {prompt && (
          <div className="shrink-0 bg-(--lab-surface) border-b border-(--lab-border) [@media(orientation:landscape)]:hidden">
            {prompt}
          </div>
        )}

        {/* ── VISUALIZATION ──────────────────────────── */}
        <main className="flex-1 min-h-[40dvh] relative overflow-hidden [@media(orientation:landscape)]:flex-1 [@media(orientation:landscape)]:min-h-0 [@media(orientation:landscape)]:min-w-0">
          {visualization}
        </main>

        {/* ── CONTROLS PANEL ─────────────────────────
            Portrait:  bottom strip; no height cap (formula + one button = always short)
            Landscape: right column, fixed w-72 — no wasted space on wide screens
        ── */}
        <div className="shrink-0 border-t border-(--lab-border) [@media(orientation:landscape)]:w-72 [@media(orientation:landscape)]:shrink-0 [@media(orientation:landscape)]:min-w-0 [@media(orientation:landscape)]:border-t-0 [@media(orientation:landscape)]:border-l [@media(orientation:landscape)]:flex [@media(orientation:landscape)]:flex-col">

          {/* Landscape prompt — top of panel, visible only in landscape */}
          {prompt && (
            <div className="hidden [@media(orientation:landscape)]:block shrink-0 bg-(--lab-surface) border-b border-(--lab-border)">
              {prompt}
            </div>
          )}

          {/* Formula strip — always reserved */}
          <div className="border-b border-(--lab-border) min-h-8">
            {formulaReadout}
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4 px-5 py-2 md:px-6 [@media(orientation:landscape)]:px-4 [@media(orientation:landscape)]:py-3">
            <div className="w-full [@media(orientation:landscape)]:w-full">
              {controls}
            </div>
          </div>

        </div>

      </div>

      {/* ── OVERLAYS ───────────────────────────────── */}
      {children}

    </div>
  )
}
