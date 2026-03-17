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
 * Portrait:  flex column — status | prompt? | scene | [formula strip | controls]
 *            Controls panel capped at max-h-[60dvh] so canvas keeps ≥40% of viewport.
 *
 * Landscape: flex row — status (full width) | [scene (flex-3) | controls panel (flex-2)]
 *            Prompt moves to top of controls panel; panel scrolls internally.
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

        {/* ── PROMPT (portrait-only row, hidden in landscape) ── */}
        {prompt && (
          <div className="shrink-0 bg-(--lab-surface) border-b border-(--lab-border) md:hidden [@media(orientation:landscape)]:hidden">
            {prompt}
          </div>
        )}

        {/* ── VISUALIZATION ──────────────────────────── */}
        <main className="flex-1 min-h-0 relative overflow-hidden [@media(orientation:landscape)]:flex-[3] [@media(orientation:landscape)]:min-w-0">
          {visualization}
        </main>

        {/* ── CONTROLS PANEL ─────────────────────────
            Portrait:  bottom strip; capped at 60dvh so canvas keeps ≥40%
            Landscape: right column (flex-[2]); full height; scrolls internally
        ── */}
        <div className="shrink-0 border-t border-(--lab-border) max-h-[60dvh] overflow-y-auto [@media(orientation:landscape)]:flex-[2] [@media(orientation:landscape)]:min-w-0 [@media(orientation:landscape)]:max-h-none [@media(orientation:landscape)]:border-t-0 [@media(orientation:landscape)]:border-l">

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
          <div className="flex items-center gap-4 px-5 py-3 md:px-6 [@media(orientation:landscape)]:px-4">
            {/* Desktop portrait prompt on left (hidden in landscape — prompt is above formula) */}
            {prompt && (
              <div className="hidden md:flex [@media(orientation:landscape)]:hidden flex-1 min-w-0">
                {prompt}
              </div>
            )}
            <div className="w-full md:w-auto md:shrink-0 [@media(orientation:landscape)]:w-full">
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
