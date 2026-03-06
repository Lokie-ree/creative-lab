// src/components/modules/rigid-motions/scene/scene-layout.ts
import { useThree } from '@react-three/fiber'
import { CONTENT_RANGE } from '../constants'

export interface RigidMotionsLayout {
  /** Camera zoom to fit CONTENT_RANGE+1 world units across the shorter viewport axis */
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
  // Orthographic zoom: pixels per world unit, fitted to CONTENT_RANGE+1
  // so all shapes and labels are visible with breathing room at the grid edge.
  const shorterSide = Math.min(size.width, size.height)
  const zoom = shorterSide / ((CONTENT_RANGE + 1) * 2)
  return { zoom, isPortrait }
}
