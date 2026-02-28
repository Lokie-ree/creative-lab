// src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts
import { useState, useCallback } from 'react'
import { GHOST_INITIAL_OFFSET } from '../constants'
import { snapToGrid } from '../scene/math'

export interface RigidMotionsState {
  /** Ghost triangle translation offset in math coordinates (snapped to integer grid) */
  ghostOffset: [number, number]
  /** Called during drag with raw (unsnapped) offset — hook handles snap */
  handleGhostMove: (rawOffset: [number, number]) => void
}

export function useRigidMotionsState(): RigidMotionsState {
  const [ghostOffset, setGhostOffset] = useState<[number, number]>(GHOST_INITIAL_OFFSET)

  const handleGhostMove = useCallback((rawOffset: [number, number]) => {
    setGhostOffset(snapToGrid(rawOffset[0], rawOffset[1]))
  }, [])

  return { ghostOffset, handleGhostMove }
}
