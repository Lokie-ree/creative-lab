// src/components/modules/rigid-motions/types.ts

export type TransformationType = 'translate' | 'reflect' | 'rotate'

export type GuideState =
  | 'predict-translate'
  | 'predict-reflect'
  | 'predict-rotate'
  | 'coordinate-reveal'
  | 'predict-with-coordinates'
  | 'capstone'

export type FeedbackState = 'idle' | 'match' | 'close' | 'miss'

export type TranslationParams = { type: 'translate'; dx: number; dy: number }
export type ReflectionParams  = { type: 'reflect'; axis: 'x' | 'y' }
export type RotationParams    = { type: 'rotate'; degrees: 90 | 180 | 270; direction: 'cw' | 'ccw' }
export type TransformationParams = TranslationParams | ReflectionParams | RotationParams

export interface Round {
  id: string
  stage: 'translate' | 'reflect' | 'rotate'
  params: TransformationParams
  targetVertices: [number, number][]
}
