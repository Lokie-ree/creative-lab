// src/components/modules/rigid-motions/controls/ControlStrip.tsx
//
// Phase 2 control strip. Context-sensitive visibility driven by guideState and feedbackState.
//
// Visibility table:
//   predict-translate (idle/close/miss): CHECK · RESET · SPEED
//   predict-translate (match):           NEXT  · RESET · SPEED
//   predict-reflect   (idle/miss):       FLIP  · CHECK · RESET · SPEED
//   predict-reflect   (match):           FLIP  · NEXT  · RESET · SPEED
//   predict-rotate    (idle/close/miss): ROTATION · CHECK · RESET · SPEED
//   predict-rotate    (match):           ROTATION · NEXT  · RESET · SPEED
//   coordinate-reveal:                   CONTINUE (only)

import type { GuideState, FeedbackState } from '../types'
import { SequenceBuilder } from './SequenceBuilder'
import type { TransformationParams } from '../types'

export interface ControlStripProps {
  guideState: GuideState
  feedbackState: FeedbackState
  flipped: boolean
  rotationDegrees: 90 | 180 | 270
  rotationDirection: 'cw' | 'ccw'
  speedMultiplier: 0.5 | 1 | 2
  onCheck: () => void
  onNext: () => void
  onReset: () => void
  onFlip: (value: boolean) => void
  onRotation: (degrees: 90 | 180 | 270, direction: 'cw' | 'ccw') => void
  onSpeedChange: (speed: 0.5 | 1 | 2) => void
  capstoneSequence?: TransformationParams[]
  onSequenceChange?: (steps: TransformationParams[]) => void
  onCheckSequence?: () => void
  onCapstoneNext?: () => void
}

const BTN_BASE = [
  'min-h-[44px] min-w-[44px] px-3',
  'border border-(--lab-border)',
  'lab-silk lab-display-font text-[10px] tracking-[0.1em]',
  'transition-colors duration-150',
  'cursor-pointer',
].join(' ')

const BTN_DEFAULT = `${BTN_BASE} bg-transparent text-(--lab-text) hover:border-(--lab-accent) hover:text-(--lab-accent)`
const BTN_ACTIVE  = `${BTN_BASE} bg-(--lab-accent) text-(--lab-bg) border-(--lab-accent)`
const BTN_PRIMARY = `${BTN_BASE} bg-(--lab-accent) text-(--lab-bg) border-(--lab-accent) hover:opacity-90`
const BTN_DIM     = `${BTN_BASE} bg-transparent text-(--lab-text-muted) hover:border-(--lab-text) hover:text-(--lab-text)`

const PREDICT_STATES: GuideState[] = [
  'predict-translate',
  'predict-reflect',
  'predict-rotate',
  'predict-with-coordinates-translate',
  'predict-with-coordinates-reflect',
  'predict-with-coordinates-rotate',
]

export function ControlStrip({
  guideState,
  feedbackState,
  flipped,
  rotationDegrees,
  rotationDirection,
  speedMultiplier,
  onCheck,
  onNext,
  onReset,
  onFlip,
  onRotation,
  onSpeedChange,
  onSequenceChange,
  onCheckSequence,
  onCapstoneNext,
}: ControlStripProps) {
  const isPredict = PREDICT_STATES.includes(guideState)
  const showCheck = isPredict && feedbackState !== 'match'
  const showNext = isPredict && feedbackState === 'match'
  const showFlip     = guideState === 'predict-reflect' || guideState === 'predict-with-coordinates-reflect'
  const showRotation = guideState === 'predict-rotate'  || guideState === 'predict-with-coordinates-rotate'

  // capstone: SequenceBuilder only
  if (guideState === 'capstone') {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <SequenceBuilder
          onSequenceChange={onSequenceChange ?? (() => {})}
          onCheckSequence={onCheckSequence ?? (() => {})}
          feedbackState={feedbackState}
          onNext={onCapstoneNext ?? (() => {})}
        />
      </div>
    )
  }

  // coordinate-reveal: CONTINUE only
  if (guideState === 'coordinate-reveal') {
    return (
      <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
        <button type="button" className={BTN_PRIMARY} onClick={onNext}>
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">

      {/* FLIP toggle — reflect stages */}
      {showFlip && (
        <button
          type="button"
          className={flipped ? BTN_ACTIVE : BTN_DEFAULT}
          onClick={() => onFlip(!flipped)}
          aria-pressed={flipped}
        >
          Flip
        </button>
      )}

      {/* ROTATION group — rotate stages */}
      {showRotation && (
        <div className="flex items-center gap-1">
          {([90, 180, 270] as const).map((deg) => (
            <button
              key={deg}
              type="button"
              className={rotationDegrees === deg ? BTN_ACTIVE : BTN_DEFAULT}
              onClick={() => onRotation(deg, rotationDirection)}
              aria-pressed={rotationDegrees === deg}
            >
              {deg}°
            </button>
          ))}
          <div className="mx-1 h-6 w-px bg-(--lab-border)" aria-hidden />
          {(['cw', 'ccw'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              className={rotationDirection === dir ? BTN_ACTIVE : BTN_DEFAULT}
              onClick={() => onRotation(rotationDegrees, dir)}
              aria-pressed={rotationDirection === dir}
            >
              {dir.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* CHECK */}
      {showCheck && (
        <button type="button" className={BTN_PRIMARY} onClick={onCheck}>
          Check
        </button>
      )}

      {/* NEXT */}
      {showNext && (
        <button type="button" className={BTN_PRIMARY} onClick={onNext}>
          Next
        </button>
      )}

      {/* RESET */}
      {isPredict && (
        <button type="button" className={BTN_DIM} onClick={onReset}>
          Reset
        </button>
      )}

      {/* SPEED — 0.5× / 1× / 2× */}
      {isPredict && (
        <div className="flex items-center gap-1">
          {([0.5, 1, 2] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              className={speedMultiplier === speed ? BTN_ACTIVE : BTN_DEFAULT}
              onClick={() => onSpeedChange(speed)}
              aria-pressed={speedMultiplier === speed}
            >
              {speed}×
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
