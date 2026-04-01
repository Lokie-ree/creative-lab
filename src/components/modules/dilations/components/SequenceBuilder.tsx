// src/components/modules/dilations/components/SequenceBuilder.tsx
//
// HTML panel for composing a sequence of transformations.
// Rendered outside the Canvas in Layout.tsx's controls slot during Phase 3.
//
// Local SlotState[] drives the UI; changes are emitted to the parent via
// callbacks. The parent (DilationsModule) owns the committed TransformStep[]
// in stage state.

import { useState } from 'react'
import type { TransformStep, TransformType } from '../utils/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SlotState = {
  type: TransformType | null
  dx: number
  dy: number
  axis: 'x' | 'y'
  angleDeg: 90 | 180 | 270
  direction: 'cw' | 'ccw'
}

const DEFAULT_SLOT: SlotState = {
  type: null, dx: 0, dy: 0, axis: 'y', angleDeg: 90, direction: 'cw',
}

export interface SequenceBuilderProps {
  steps: TransformStep[]
  maxSteps: number
  kLocked: boolean
  lockedK: number
  feedbackState: 'idle' | 'match' | 'miss'
  guidance?: string
  onAddStep: (step: TransformStep) => void
  onUpdateStep: (index: number, step: TransformStep) => void
  onRemoveStep: (index: number) => void
  onCheckSequence: () => void
  onNext: () => void
  onReset: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slotToStep(slot: SlotState, lockedK: number): TransformStep | null {
  if (slot.type === null) return null
  switch (slot.type) {
    case 'translate':
      return { type: 'translate', params: { dx: slot.dx, dy: slot.dy } }
    case 'reflect':
      return { type: 'reflect', params: { axis: slot.axis } }
    case 'rotate':
      return { type: 'rotate', params: { angleDeg: slot.direction === 'cw' ? -slot.angleDeg : slot.angleDeg } }
    case 'dilate':
      return { type: 'dilate', params: { k: lockedK } }
  }
}

// ---------------------------------------------------------------------------
// StepperField
// ---------------------------------------------------------------------------

function StepperField({
  label, value, min, max, onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-(--lab-border) lab-data-font text-(--lab-text-muted) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          −
        </button>
        <span className="w-8 text-center lab-data-font text-sm text-(--lab-text)">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-(--lab-border) lab-data-font text-(--lab-text-muted) transition-colors duration-150 hover:border-(--lab-accent) hover:text-(--lab-accent) disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          +
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepEditor
// ---------------------------------------------------------------------------

function StepEditor({
  index, slot, kLocked, lockedK, onChange, onRemove,
}: {
  index: number
  slot: SlotState
  kLocked: boolean
  lockedK: number
  onChange: (slot: SlotState) => void
  onRemove: () => void
}) {
  const typeButtons: { key: TransformType; label: string }[] = [
    { key: 'translate', label: 'T' },
    { key: 'reflect',   label: 'Ref' },
    { key: 'rotate',    label: 'Rot' },
    { key: 'dilate',    label: 'Dil' },
  ]

  return (
    <div className="flex flex-col gap-3 p-3 border border-(--lab-border) bg-(--lab-surface)">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
          STEP {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-(--lab-text-muted) transition-colors duration-150 hover:text-(--lab-danger) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
          aria-label={`Remove step ${index + 1}`}
        >
          ×
        </button>
      </div>

      {/* Type selector */}
      <div className="flex gap-1">
        {typeButtons.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...slot, type: key })}
            className={[
              'flex-1 min-h-[44px] border lab-silk lab-display-font text-[9px] tracking-[0.1em] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)',
              slot.type === key
                ? 'border-(--lab-accent) text-(--lab-accent)'
                : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Type-specific controls */}
      {slot.type === 'translate' && (
        <div className="flex gap-3">
          <StepperField
            label="DX"
            value={slot.dx}
            min={-6}
            max={6}
            onChange={v => onChange({ ...slot, dx: v })}
          />
          <StepperField
            label="DY"
            value={slot.dy}
            min={-6}
            max={6}
            onChange={v => onChange({ ...slot, dy: v })}
          />
        </div>
      )}

      {slot.type === 'reflect' && (
        <div className="flex gap-1">
          {(['y', 'x'] as const).map(axis => (
            <button
              key={axis}
              type="button"
              onClick={() => onChange({ ...slot, axis })}
              className={[
                'flex-1 min-h-[44px] border lab-silk lab-display-font text-[9px] tracking-[0.1em] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)',
                slot.axis === axis
                  ? 'border-(--lab-accent) text-(--lab-accent)'
                  : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)',
              ].join(' ')}
            >
              {axis.toUpperCase()}-AXIS
            </button>
          ))}
        </div>
      )}

      {slot.type === 'rotate' && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {([90, 180, 270] as const).map(deg => (
              <button
                key={deg}
                type="button"
                onClick={() => onChange({ ...slot, angleDeg: deg })}
                className={[
                  'flex-1 min-h-[44px] border lab-silk lab-display-font text-[9px] tracking-[0.1em] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)',
                  slot.angleDeg === deg
                    ? 'border-(--lab-accent) text-(--lab-accent)'
                    : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)',
                ].join(' ')}
              >
                {deg}°
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['ccw', 'cw'] as const).map(dir => (
              <button
                key={dir}
                type="button"
                onClick={() => onChange({ ...slot, direction: dir })}
                className={[
                  'flex-1 min-h-[44px] border lab-silk lab-display-font text-[9px] tracking-[0.1em] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)',
                  slot.direction === dir
                    ? 'border-(--lab-accent) text-(--lab-accent)'
                    : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)',
                ].join(' ')}
              >
                {dir.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {slot.type === 'dilate' && (
        <div className="flex items-center gap-2">
          <span className="lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
            k =
          </span>
          <span className={[
            'lab-data-font text-sm',
            kLocked ? 'text-(--lab-text-muted) opacity-50' : 'text-(--lab-text)',
          ].join(' ')}>
            {lockedK}
          </span>
          {kLocked && (
            <span className="lab-silk lab-display-font text-[8px] tracking-[0.15em] text-(--lab-text-muted) opacity-50 ml-1">
              FIXED
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SequenceBuilder
// ---------------------------------------------------------------------------

export function SequenceBuilder({
  steps,
  maxSteps,
  kLocked,
  lockedK,
  feedbackState,
  guidance,
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  onCheckSequence,
  onNext,
  onReset,
}: SequenceBuilderProps) {
  const [slots, setSlots] = useState<SlotState[]>([{ ...DEFAULT_SLOT }])

  function handleSlotChange(index: number, newSlot: SlotState) {
    const prevSlot = slots[index]
    const updated = slots.map((s, i) => i === index ? newSlot : s)
    setSlots(updated)

    const step = slotToStep(newSlot, lockedK)
    if (!step) return

    if (prevSlot.type === null) {
      // First type selection on this slot — add a new step
      onAddStep(step)
    } else {
      // Updating existing step
      onUpdateStep(index, step)
    }
  }

  function handleRemoveSlot(index: number) {
    setSlots(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ ...DEFAULT_SLOT }])
    onRemoveStep(index)
  }

  function handleAddSlot() {
    setSlots(prev => [...prev, { ...DEFAULT_SLOT }])
  }

  function handleReset() {
    setSlots([{ ...DEFAULT_SLOT }])
    onReset()
  }

  const lastSlotHasType = slots[slots.length - 1]?.type !== null
  const canAddStep = slots.length < maxSteps && lastSlotHasType

  return (
    <div className={[
      'flex flex-col gap-0 border bg-(--lab-bg)',
      feedbackState === 'miss' ? 'border-(--lab-danger)' : 'border-(--lab-border)',
    ].join(' ')}>
      {/* Guidance text */}
      {guidance && (
        <div className="px-3 pt-3 pb-1">
          <p className="lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
            {guidance}
          </p>
        </div>
      )}

      {/* Step editors */}
      <div className="flex flex-col">
        {slots.map((slot, i) => (
          <div key={i}>
            {i > 0 && (
              <div className="flex items-center px-3 py-1">
                <div className="flex-1 border-t border-(--lab-border)" />
                <span className="px-2 lab-silk lab-display-font text-[8px] tracking-[0.2em] text-(--lab-text-muted)">
                  THEN
                </span>
                <div className="flex-1 border-t border-(--lab-border)" />
              </div>
            )}
            <StepEditor
              index={i}
              slot={slot}
              kLocked={kLocked}
              lockedK={lockedK}
              onChange={newSlot => handleSlotChange(i, newSlot)}
              onRemove={() => handleRemoveSlot(i)}
            />
          </div>
        ))}
      </div>

      {/* Add Step */}
      {canAddStep && (
        <button
          type="button"
          onClick={handleAddSlot}
          className="min-h-[44px] border-t border-(--lab-border) lab-silk lab-display-font text-[9px] tracking-[0.1em] text-(--lab-text-muted) transition-colors duration-150 hover:text-(--lab-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          + ADD STEP
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 p-3 border-t border-(--lab-border)">
        <button
          type="button"
          onClick={handleReset}
          className="min-h-[44px] px-3 border border-(--lab-danger) lab-silk lab-display-font text-[9px] tracking-[0.1em] text-(--lab-danger) transition-opacity duration-150 hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
        >
          RESET
        </button>

        <div className="flex-1" />

        {feedbackState === 'match' ? (
          <button
            type="button"
            onClick={onNext}
            className="min-h-[44px] px-4 bg-(--lab-accent) lab-silk lab-display-font text-[9px] tracking-[0.1em] text-(--lab-bg) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
          >
            NEXT
          </button>
        ) : (
          <button
            type="button"
            onClick={onCheckSequence}
            disabled={steps.length === 0}
            className="min-h-[44px] px-4 border border-(--lab-accent) lab-silk lab-display-font text-[9px] tracking-[0.1em] text-(--lab-accent) transition-opacity duration-150 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
          >
            CHECK
          </button>
        )}
      </div>
    </div>
  )
}
