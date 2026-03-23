// src/components/modules/dilations/utils/types.ts
//
// Type definitions for the Dilations module.
// Re-exports shared transform types; defines module-specific types.

export type {
  TransformationType,
  TranslationParams,
  ReflectionParams,
  RotationParams,
  DilationParams,
  TransformationParams,
} from '@/lib/types/transforms'

export type Vec2 = { x: number; y: number }

export type Triangle = { a: Vec2; b: Vec2; c: Vec2 }

export type ScaleFactor = 2 | 3 | 0.5 | 0.333

export type RoundId =
  | 'dilate-k2' | 'dilate-k2-properties' | 'dilate-k3'
  | 'dilate-k-half' | 'dilate-summary'
  | 'coord-k2' | 'coord-k-half' | 'coord-k-third'
  | 'similarity-guided' | 'similarity-rigid-dilation' | 'similarity-inverse'
  | 'aa-discover' | 'aa-confirm' | 'capstone-final'

export type PhaseId = 'scale-factor' | 'coordinate' | 'similarity' | 'aa-capstone'

export type RoundState = 'entry' | 'active' | 'prediction' | 'reveal' | 'completion'

export type RoundConfig = {
  id: RoundId
  phase: PhaseId
  label: string
  scaleFactor?: ScaleFactor
  hasGhostDrag: boolean
  hasSequenceBuilder: boolean
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
}

export type TransformType = 'translate' | 'reflect' | 'rotate' | 'dilate'

export type TranslateStepParams = { dx: number; dy: number }
export type ReflectStepParams = { axis: 'x' | 'y' }
export type RotateStepParams = { angleDeg: number }
export type DilateStepParams = { k: number }

export type TransformStep = {
  type: TransformType
  params: TranslateStepParams | ReflectStepParams | RotateStepParams | DilateStepParams
}

export type SimilarityPair = {
  preImage: Triangle
  target: Triangle
  isSimilar: boolean
  validSequences?: TransformStep[][]
}

export type CapstonePair = SimilarityPair & {
  angleLabels: { a: number; b: number; c: number }[]
}
