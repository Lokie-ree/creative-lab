// src/lib/types/transforms.ts
// Shared transformation types — imported by both rigid-motions module and celebration components.
// GuideState, FeedbackState, Round stay in rigid-motions/types.ts (no outside consumers).

export type TransformationType = 'translate' | 'reflect' | 'rotate'

export type TranslationParams = { type: 'translate'; dx: number; dy: number }
export type ReflectionParams  = { type: 'reflect'; axis: 'x' | 'y' }
export type RotationParams    = { type: 'rotate'; degrees: 90 | 180 | 270; direction: 'cw' | 'ccw' }
export type TransformationParams = TranslationParams | ReflectionParams | RotationParams
