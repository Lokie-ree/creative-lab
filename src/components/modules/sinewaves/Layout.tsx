import type { ReactNode } from "react"

export interface SinewavesLayoutProps {
  header?: ReactNode
  explorePrompt?: ReactNode
  formula?: ReactNode
  visualization: ReactNode
  controls?: ReactNode
  children?: ReactNode
}

/**
 * Layout component for the sinewaves module. Defines where each section lives
 * (header, explore prompt, formula, visualization, controls) with a slot-based API.
 * Renders in order: header → explorePrompt → formula → visualization → controls → children.
 */
export function SinewavesLayout({
  header,
  explorePrompt,
  formula,
  visualization,
  controls,
  children,
}: SinewavesLayoutProps) {
  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: "var(--lab-bg)" }}
    >
      {/* Header: progress bar in a reserved top band so content below doesn’t bunch */}
      {header != null && (
        <div className="absolute top-0 left-0 right-0 z-(--z-base) min-h-10 flex flex-col justify-end">
          {header}
        </div>
      )}

      {/* Explore prompt: own row below header band, centered */}
      {explorePrompt != null && (
        <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-(--z-base) w-[calc(100vw-2rem)] sm:w-auto sm:max-w-md">
          {explorePrompt}
        </div>
      )}

      {/* Formula: separate row below prompt, top-right — avoids competing with prompt */}
      {formula != null && (
        <div className="absolute top-20 sm:top-24 right-2 sm:right-4 z-(--z-floating) max-w-[calc(100vw-2rem)]">
          {formula}
        </div>
      )}

      {/* Visualization: main 3D area — no wrapper; Module passes flex-1 block */}
      {visualization}

      {/* Controls: bottom UI fragment — no wrapper; Module owns each element's position */}
      {controls}

      {/* Full-screen overlays (e.g. CelebrationPulse) — rendered last for stacking */}
      {children}
    </div>
  )
}
