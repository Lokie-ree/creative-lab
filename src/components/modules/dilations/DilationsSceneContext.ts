// src/components/modules/dilations/DilationsSceneContext.ts
//
// React context for scene-level visibility flags.
// Separated from DilationsScene.tsx to satisfy react-refresh/only-export-components.
import { createContext, useContext } from 'react'

export interface DilationsSceneContextValue {
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
}

export const DilationsSceneCtx = createContext<DilationsSceneContextValue>({
  coordinatesVisible: false,
  angleLabelsVisible: false,
})

export function useDilationsSceneContext() {
  return useContext(DilationsSceneCtx)
}
