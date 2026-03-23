import type { ModuleProps } from '@/config/modules'
import { useDilationsStage } from './hooks/useDilationsStage'
import { DilationsCanvas } from './DilationsCanvas'
import { DilationsHUD } from './DilationsHUD'

export default function DilationsModule({ onBack }: ModuleProps) {
  const { state, dispatch } = useDilationsStage()

  return (
    <div className="flex h-dvh flex-col bg-(--lab-bg)">
      {/* Back button */}
      {onBack && (
        <div className="shrink-0 flex items-center px-3 h-10">
          <button
            onClick={onBack}
            className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted) hover:text-(--lab-text) transition-colors duration-150 min-h-[44px] min-w-[44px] flex items-center"
          >
            ← BACK
          </button>
        </div>
      )}

      {/* Canvas + HUD */}
      <div className="relative flex-1 min-h-0">
        <DilationsCanvas
          coordinatesVisible={state.coordinatesVisible}
          angleLabelsVisible={state.angleLabelsVisible}
        />
        <DilationsHUD state={state} dispatch={dispatch} />
      </div>
    </div>
  )
}
