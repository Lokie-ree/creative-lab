// src/components/modules/pythagorean-theorem/Layout.tsx
//
// Eurorack faceplate layout — Pythagorean Theorem module.
// Own copy (no premature sharing until all 3 geometry modules are done).
// Matches M2 (Dilations) Layout.tsx structure exactly.
//
// Portrait: flex column — status | prompt | scene (aspect-square) | formula | controls
// Landscape: flex row — scene (flex-1) | controls panel (w-72)

import { type ReactNode } from 'react'

interface ModuleLayoutProps {
  statusStrip: ReactNode
  /** null → row removed from DOM */
  prompt: ReactNode
  /** null → formula strip row is empty but height is always reserved */
  formulaReadout: ReactNode
  visualization: ReactNode
  controls: ReactNode
  children?: ReactNode
}

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

        {/* ── PROMPT (portrait — shown above scene; hidden in landscape) ── */}
        {prompt && (
          <div className="shrink-0 bg-(--lab-surface) border-b border-(--lab-border) [@media(orientation:landscape)]:hidden">
            {prompt}
          </div>
        )}

        {/* ── VISUALIZATION ──────────────────────────── */}
        <main className="relative overflow-hidden [@media(orientation:portrait)]:aspect-square [@media(orientation:portrait)]:w-full [@media(orientation:portrait)]:shrink-0 [@media(orientation:landscape)]:flex-1 [@media(orientation:landscape)]:min-h-0 [@media(orientation:landscape)]:min-w-0">
          {visualization}
        </main>

        {/* ── CONTROLS PANEL ─────────────────────────
            Portrait:  bottom strip
            Landscape: right column, fixed w-72
        ── */}
        <div className="flex-1 min-h-0 border-t border-(--lab-border) [@media(orientation:landscape)]:flex-none [@media(orientation:landscape)]:w-72 [@media(orientation:landscape)]:min-w-0 [@media(orientation:landscape)]:border-t-0 [@media(orientation:landscape)]:border-l [@media(orientation:landscape)]:flex [@media(orientation:landscape)]:flex-col">

          {/* Landscape prompt — top of panel, visible only in landscape */}
          {prompt && (
            <div className="hidden [@media(orientation:landscape)]:block shrink-0 bg-(--lab-surface) border-b border-(--lab-border)">
              {prompt}
            </div>
          )}

          {/* Formula strip — always reserves space */}
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
