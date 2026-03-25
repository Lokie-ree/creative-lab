// src/components/modules/dilations/DilationsModule.tsx
import type { ModuleProps } from '@/config/modules'
import { useDilationsStage } from './hooks/useDilationsStage'
import { DilationsCanvas } from './DilationsCanvas'
import { DilationsHUD } from './DilationsHUD'
import { ScaleFactorScene, ScaleFactorHUD } from './rounds/ScaleFactorRounds'

export default function DilationsModule({ onBack }: ModuleProps) {
  const { state, dispatch } = useDilationsStage()
  const { phase, currentRound } = state

  const isScaleFactorPhase = phase === 'scale-factor'

  return (
    <div className="flex h-dvh flex-col bg-(--lab-bg)">
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

      <div className="relative flex-1 min-h-0">
        <DilationsCanvas
          coordinatesVisible={state.coordinatesVisible}
          angleLabelsVisible={state.angleLabelsVisible}
        >
          {/* key=currentRound forces remount on round change, resetting local hook state */}
          {isScaleFactorPhase && (
            <ScaleFactorScene
              key={currentRound}
              state={state}
              dispatch={dispatch}
            />
          )}
        </DilationsCanvas>

        <DilationsHUD state={state} dispatch={dispatch} />

        {isScaleFactorPhase && (
          <ScaleFactorHUD state={state} />
        )}
      </div>
    </div>
  )
}
