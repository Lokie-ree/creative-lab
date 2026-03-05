// src/components/modules/rigid-motions/types.ts
export type { TransformationType, TranslationParams, ReflectionParams, RotationParams, TransformationParams } from '@/lib/types/transforms'
import type { TransformationParams } from '@/lib/types/transforms'

export type GuideState =
  | 'predict-translate'
  | 'predict-reflect'
  | 'predict-rotate'
  | 'coordinate-reveal'
  | 'predict-with-coordinates'
  | 'capstone'

export type FeedbackState = 'idle' | 'match' | 'close' | 'miss'

export interface Round {
  id: string
  stage: 'translate' | 'reflect' | 'rotate'
  params: TransformationParams
  targetVertices: [number, number][]
}
