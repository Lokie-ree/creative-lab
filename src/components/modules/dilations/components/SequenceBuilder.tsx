// src/components/modules/dilations/components/SequenceBuilder.tsx
//
// Chip rail design: a horizontal rail of chip buttons (one per step),
// showing step label + current transform value. Clicking a chip opens
// an inline editor below the rail. More mobile-friendly than the previous
// vertical step-editor layout.

import { useState, useEffect } from 'react'
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

// DEFAULT_SLOT.direction is 'ccw' so the 3×2 rotate grid pre-selects 90°↺ (CCW, top-left cell)
const DEFAULT_SLOT: SlotState = {
  type: null, dx: 0, dy: 0, axis: 'y', angleDeg: 90, direction: 'ccw',
}

export interface SequenceBuilderProps {
  steps: TransformStep[]
  maxSteps: number
  kLocked: boolean
  lockedK: number
  feedbackState: 'idle' | 'match' | 'miss'
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
  if (!slot.type) return null
  switch (slot.type) {
    case 'translate': return { type: 'translate', params: { dx: slot.dx, dy: slot.dy } }
    case 'reflect':   return { type: 'reflect', params: { axis: slot.axis } }
    case 'rotate':    return { type: 'rotate', params: { angleDeg: slot.direction === 'cw' ? -slot.angleDeg : slot.angleDeg } }
    case 'dilate':    return { type: 'dilate', params: { k: lockedK } }
  }
}

function chipValue(slot: SlotState, lockedK: number): string {
  if (!slot.type) return '—'
  switch (slot.type) {
    case 'translate': {
      const dx = `${slot.dx >= 0 ? '+' : ''}${slot.dx}`
      const dy = `${slot.dy >= 0 ? '+' : ''}${slot.dy}`
      return `T ${dx},${dy}`
    }
    case 'reflect': return `Ref ${slot.axis.toUpperCase()}`
    case 'rotate':  return slot.angleDeg === 180
      ? `Rot 180°`
      : `Rot ${slot.angleDeg}°${slot.direction === 'ccw' ? '↺' : '↻'}`
    case 'dilate':  return `Dil ×${lockedK}`
  }
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function Stepper({
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
      <span className="lab-silk lab-display-font text-[7px] tracking-[0.2em] text-(--lab-text-muted)">
        {label}
      </span>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-[26px] h-[26px] flex items-center justify-center border border-(--lab-border) lab-data-font text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent) disabled:opacity-30 focus:outline-none"
        >
          −
        </button>
        <span className="w-[26px] text-center lab-data-font text-xs text-(--lab-text)">
          {value >= 0 ? `+${value}` : value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-[26px] h-[26px] flex items-center justify-center border border-(--lab-border) lab-data-font text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent) disabled:opacity-30 focus:outline-none"
        >
          +
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// InlineEditor
// ---------------------------------------------------------------------------

function InlineEditor({
  index, slot, lockedK, onChange,
}: {
  index: number
  slot: SlotState
  lockedK: number
  onChange: (s: SlotState) => void
}) {
  const types: { key: TransformType; label: string }[] = [
    { key: 'translate', label: 'T' },
    { key: 'reflect',   label: 'Ref' },
    { key: 'rotate',    label: 'Rot' },
    { key: 'dilate',    label: 'Dil' },
  ]

  function setType(t: TransformType) {
    // Type change resets all params to defaults for the new type
    onChange({ ...DEFAULT_SLOT, type: t })
  }

  return (
    <div className="px-3 py-2 bg-(--lab-surface) border-b border-(--lab-border)">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="lab-silk lab-display-font text-[8px] tracking-[0.15em] text-(--lab-accent)">
          EDITING STEP {index + 1}
        </span>
      </div>

      {/* Type row */}
      <div className="flex gap-1 mb-2">
        {types.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className={[
              'flex-1 min-h-[28px] border lab-silk lab-display-font text-[8px] tracking-[0.1em] focus:outline-none transition-colors duration-150',
              slot.type === key
                ? 'border-(--lab-accent) text-(--lab-accent) bg-(rgba(124,200,124,0.06))'
                : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Params */}
      {slot.type === 'translate' && (
        <div className="flex gap-3">
          <Stepper label="DX" value={slot.dx} min={-6} max={6} onChange={v => onChange({ ...slot, dx: v })} />
          <Stepper label="DY" value={slot.dy} min={-6} max={6} onChange={v => onChange({ ...slot, dy: v })} />
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
                'flex-1 min-h-[28px] border lab-silk lab-display-font text-[8px] tracking-[0.1em] focus:outline-none transition-colors duration-150',
                slot.axis === axis
                  ? 'border-(--lab-accent) text-(--lab-accent)'
                  : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent)',
              ].join(' ')}
            >
              {axis.toUpperCase()}-AXIS
            </button>
          ))}
        </div>
      )}

      {slot.type === 'rotate' && (
        // 3×2 combined grid: top row CCW, bottom row CW; middle cell (180° CW) is grayed
        <div className="grid grid-cols-3 gap-1">
          {([
            { deg: 90,  dir: 'ccw', label: '90°↺' },
            { deg: 180, dir: 'ccw', label: '180°' },
            { deg: 270, dir: 'ccw', label: '270°↺' },
            { deg: 90,  dir: 'cw',  label: '90°↻' },
            null, // grayed 180° CW cell — same as 180° CCW
            { deg: 270, dir: 'cw',  label: '270°↻' },
          ] as const).map((cell, i) => {
            if (!cell) {
              return (
                <div
                  key={i}
                  className="min-h-[28px] flex items-center justify-center border border-(--lab-border) opacity-30 pointer-events-none"
                >
                  <span className="lab-silk lab-display-font text-[7px] text-(--lab-text-muted)">(same)</span>
                </div>
              )
            }
            const isActive = slot.angleDeg === cell.deg && slot.direction === cell.dir
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange({ ...slot, angleDeg: cell.deg as 90 | 180 | 270, direction: cell.dir as 'cw' | 'ccw' })}
                className={[
                  'min-h-[28px] border lab-silk lab-display-font text-[8px] tracking-[0.08em] focus:outline-none transition-colors duration-150',
                  isActive
                    ? 'border-(--lab-accent) text-(--lab-accent)'
                    : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent)',
                ].join(' ')}
              >
                {cell.label}
              </button>
            )
          })}
        </div>
      )}

      {slot.type === 'dilate' && (
        <div className="flex items-center gap-2 py-1">
          <span className="lab-silk lab-display-font text-[8px] tracking-[0.15em] text-(--lab-text-muted)">k =</span>
          <span className="lab-data-font text-sm text-(--lab-text-muted) opacity-50">{lockedK}</span>
          <span className="lab-silk lab-display-font text-[7px] tracking-[0.15em] text-(--lab-text-muted) opacity-50 ml-1">
            · fixed for this task
          </span>
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
  kLocked: _kLocked,
  lockedK,
  feedbackState,
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  onCheckSequence,
  onNext,
  onReset,
}: SequenceBuilderProps) {
  const [slots, setSlots] = useState<SlotState[]>([{ ...DEFAULT_SLOT }])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Close editor on match
  useEffect(() => {
    if (feedbackState === 'match') setActiveIndex(null)
  }, [feedbackState])

  function handleSlotChange(index: number, newSlot: SlotState) {
    const prevSlot = slots[index]
    const updated = slots.map((s, i) => i === index ? newSlot : s)
    setSlots(updated)

    const step = slotToStep(newSlot, lockedK)
    if (!step) return

    if (prevSlot.type === null) {
      // First type selection — promote draft to committed
      onAddStep(step)
    } else {
      onUpdateStep(index, step)
    }
  }

  function handleRemoveSlot(index: number) {
    const newSlots = slots.length > 1
      ? slots.filter((_, i) => i !== index)
      : [{ ...DEFAULT_SLOT }]
    setSlots(newSlots)
    setActiveIndex(null)
    onRemoveStep(index)
  }

  function handleReset() {
    setSlots([{ ...DEFAULT_SLOT }])
    setActiveIndex(null)
    onReset()
  }

  function handleAddSlot() {
    setSlots(prev => [...prev, { ...DEFAULT_SLOT }])
    setActiveIndex(slots.length) // open editor for the new slot
  }

  const lastSlotCommitted = slots[slots.length - 1]?.type !== null
  const canAdd = slots.length < maxSteps && lastSlotCommitted

  return (
    <div className="flex flex-col bg-(--lab-bg)">
      {/* Chip rail */}
      <div className="flex items-center gap-0 px-2.5 py-1.5 border-b border-(--lab-border) overflow-x-auto">
        {slots.map((slot, i) => {
          const isActive = activeIndex === i
          const isMatch = feedbackState === 'match' && slot.type !== null
          return (
            <div key={i} className="contents">
              {i > 0 && (
                <span className="px-1.5 lab-silk lab-display-font text-[9px] text-(--lab-text-muted) flex-shrink-0">
                  →
                </span>
              )}
              <div className={[
                'flex items-stretch border flex-shrink-0 transition-colors duration-150',
                isMatch  ? 'border-(--lab-accent) bg-(rgba(124,200,124,0.08))' :
                isActive ? 'border-(--lab-accent) bg-(rgba(124,200,124,0.06))' :
                           'border-(--lab-border) bg-(--lab-surface)',
              ].join(' ')}>
                {/* Main chip button */}
                <button
                  type="button"
                  onClick={() => setActiveIndex(isActive ? null : i)}
                  className="flex flex-col items-start px-2.5 py-1 min-h-[44px] focus:outline-none"
                >
                  <span className="lab-silk lab-display-font text-[7px] tracking-[0.2em] text-(--lab-text-muted) mb-0.5">
                    STEP {i + 1}
                  </span>
                  <span className={[
                    'lab-data-font text-[11px] whitespace-nowrap',
                    slot.type === null ? 'text-(--lab-ghost) italic' : 'text-(--lab-accent)',
                  ].join(' ')}>
                    {chipValue(slot, lockedK)}
                  </span>
                </button>
                {/* Remove button — only shown for committed chips outside match state */}
                {slot.type !== null && feedbackState !== 'match' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(i)}
                    aria-label={`Remove step ${i + 1}`}
                    className="px-1.5 flex items-center justify-center text-(--lab-text-muted) hover:text-(--lab-danger) focus:outline-none transition-colors duration-150 border-l border-(--lab-border)"
                  >
                    <span className="text-[10px]">×</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {canAdd && (
          <button
            type="button"
            onClick={handleAddSlot}
            className="w-8 h-8 ml-1.5 flex items-center justify-center border border-dashed border-(--lab-border) text-(--lab-text-muted) text-base hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none flex-shrink-0 transition-colors duration-150"
          >
            +
          </button>
        )}
      </div>

      {/* Inline editor */}
      {activeIndex !== null && feedbackState !== 'match' && (
        <InlineEditor
          index={activeIndex}
          slot={slots[activeIndex]}
          lockedK={lockedK}
          onChange={newSlot => handleSlotChange(activeIndex, newSlot)}
        />
      )}

      {/* Amber hint strip on miss */}
      {feedbackState === 'miss' && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-(--lab-border) bg-(--lab-surface)">
          <div className="w-1.5 h-1.5 rounded-full bg-(--lab-earned) flex-shrink-0" />
          <span className="lab-display-font text-[10px] text-(--lab-earned)">
            Tap any step to adjust its parameters.
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        {feedbackState !== 'match' && (
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-2.5 border border-(--lab-danger) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-danger) hover:opacity-70 focus:outline-none transition-opacity duration-150"
          >
            RESET
          </button>
        )}
        <div className="flex-1" />
        {feedbackState === 'match' ? (
          <button
            type="button"
            onClick={onNext}
            className="min-h-[44px] px-3 bg-(--lab-accent) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-bg) hover:opacity-80 focus:outline-none transition-opacity duration-150"
          >
            NEXT
          </button>
        ) : (
          <button
            type="button"
            onClick={onCheckSequence}
            disabled={steps.length === 0}
            className="min-h-[44px] px-3 border border-(--lab-accent) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-accent) hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none transition-opacity duration-150"
          >
            CHECK
          </button>
        )}
      </div>
    </div>
  )
}
