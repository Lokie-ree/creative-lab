// src/components/modules/rigid-motions/scene/scene-layout.ts
import { useThree } from '@react-three/fiber'
import { GRID_RANGE } from '../constants'

export interface RigidMotionsLayout {
  /** Camera zoom to fit GRID_RANGE world units across the shorter viewport axis */
  zoom: number
  isPortrait: boolean
}

/**
 * Derives camera zoom and orientation from the R3F viewport.
 * Mirrors the sinewaves useSceneLayout pattern — separates layout
 * concerns from the camera component and makes portrait/landscape
 * extension straightforward in Phase 2.
 */
export function useRigidMotionsLayout(): RigidMotionsLayout {
  const { viewport, size } = useThree()
  const isPortrait = viewport.width <= viewport.height
  // Orthographic zoom: pixels per world unit, fitted to the shorter side
  // so the full grid is always visible regardless of aspect ratio.
  const shorterSide = Math.min(size.width, size.height)
  const zoom = shorterSide / (GRID_RANGE * 2)
  return { zoom, isPortrait }
}
