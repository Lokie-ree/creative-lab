// src/components/modules/rigid-motions/controls/SequenceBuilder.tsx
//
// Two-slot transformation sequence builder for the Phase 4 capstone.
// The student constructs 1–2 transformation steps, then checks against the target.

import { useState, useCallback, useEffect } from 'react'
import type { TransformationParams } from '../types'
import type { FeedbackState } from '../types'

// ─── Button style constants (exact match to ControlStrip.tsx) ─────────────────

const BTN_BASE = [
  'min-h-[44px] min-w-[44px] px-3',
  'border border-(--lab-border)',
  'lab-silk lab-display-font text-[10px] tracking-[0.1em]',
  'transition-colors duration-150',
  'cursor-pointer',
].join(' ')

const BTN_DEFAULT  = `${BTN_BASE} bg-transparent text-(--lab-text) hover:border-(--lab-accent) hover:text-(--lab-accent)`
const BTN_ACTIVE   = `${BTN_BASE} bg-(--lab-accent) text-(--lab-bg) border-(--lab-accent)`
const BTN_PRIMARY  = `${BTN_BASE} bg-(--lab-accent) text-(--lab-bg) border-(--lab-accent) hover:opacity-90`
const BTN_DIM      = `${BTN_BASE} bg-transparent text-(--lab-text-muted) hover:border-(--lab-text) hover:text-(--lab-text)`
const BTN_DISABLED = `${BTN_BASE} bg-transparent text-(--lab-ghost) border-(--lab-border) cursor-not-allowed opacity-40`

// ─── Slot types ───────────────────────────────────────────────────────────────

type SlotType = 'translate' | 'reflect' | 'rotate' | null

interface SlotState {
  type: SlotType
  dx: string
  dy: string
  axis: 'x' | 'y'
  degrees: 90 | 180 | 270
  direction: 'cw' | 'ccw'
}

const DEFAULT_SLOT: SlotState = {
  type: null,
  dx: '0',
  dy: '0',
  axis: 'y',
  degrees: 90,
  direction: 'cw',
}

// ─── Slot → TransformationParams ──────────────────────────────────────────────

function slotToParams(slot: SlotState): TransformationParams | null {
  if (slot.type === null) return null
  if (slot.type === 'translate') {
    const dx = parseInt(slot.dx, 10)
    const dy = parseInt(slot.dy, 10)
    if (!Number.isInteger(dx) || !Number.isInteger(dy) || isNaN(dx) || isNaN(dy)) return null
    return { type: 'translate', dx, dy }
  }
  if (slot.type === 'reflect') {
    return { type: 'reflect', axis: slot.axis }
  }
  if (slot.type === 'rotate') {
    return { type: 'rotate', degrees: slot.degrees, direction: slot.direction }
  }
  return null
}

// ─── SlotEditor ───────────────────────────────────────────────────────────────

interface SlotEditorProps {
  label: string
  slot: SlotState
  onChange: (slot: SlotState) => void
  disabled?: boolean
}

function SlotEditor({ label, slot, onChange, disabled = false }: SlotEditorProps) {
  const wrapperClass = [
    'border border-(--lab-border) p-2 flex flex-col gap-2',
    disabled ? 'opacity-40 pointer-events-none' : '',
  ].join(' ')

  const handleType = (type: SlotType) => {
    if (type === slot.type) {
      // Clear the slot
      onChange({ ...DEFAULT_SLOT })
    } else {
      onChange({ ...slot, type })
    }
  }

  const handleClear = () => onChange({ ...DEFAULT_SLOT })

  return (
    <div className={wrapperClass}>
      {/* Slot label row */}
      <div className="flex items-center justify-between gap-2">
        <span className="lab-silk lab-display-font text-[8px] tracking-[0.2em] text-(--lab-text-muted)">
          {label}
        </span>
        {slot.type !== null && (
          <button
            type="button"
            className={BTN_DIM}
            onClick={handleClear}
            aria-label={`Clear ${label}`}
          >
            ×
          </button>
        )}
      </div>

      {/* Type toggle row */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={slot.type === 'translate' ? BTN_ACTIVE : BTN_DEFAULT}
          onClick={() => handleType('translate')}
          aria-pressed={slot.type === 'translate'}
        >
          T
        </button>
        <button
          type="button"
          className={slot.type === 'reflect' ? BTN_ACTIVE : BTN_DEFAULT}
          onClick={() => handleType('reflect')}
          aria-pressed={slot.type === 'reflect'}
        >
          Ref
        </button>
        <button
          type="button"
          className={slot.type === 'rotate' ? BTN_ACTIVE : BTN_DEFAULT}
          onClick={() => handleType('rotate')}
          aria-pressed={slot.type === 'rotate'}
        >
          Rot
        </button>
      </div>

      {/* Type-specific parameters */}
      {slot.type === 'translate' && (
        <div className="flex items-center gap-2">
          <label className="flex flex-col items-center gap-1">
            <span className="lab-silk lab-display-font text-[8px] tracking-[0.2em] text-(--lab-text-muted)">↔ dx</span>
            <input
              type="number"
              value={slot.dx}
              onChange={e => onChange({ ...slot, dx: e.target.value })}
              className="w-14 lab-data-font text-sm text-center bg-(--lab-surface) border border-(--lab-border) text-(--lab-text) py-1 min-h-[44px]"
              aria-label="dx (horizontal shift)"
            />
          </label>
          <label className="flex flex-col items-center gap-1">
            <span className="lab-silk lab-display-font text-[8px] tracking-[0.2em] text-(--lab-text-muted)">↕ dy</span>
            <input
              type="number"
              value={slot.dy}
              onChange={e => onChange({ ...slot, dy: e.target.value })}
              className="w-14 lab-data-font text-sm text-center bg-(--lab-surface) border border-(--lab-border) text-(--lab-text) py-1 min-h-[44px]"
              aria-label="dy (vertical shift)"
            />
          </label>
        </div>
      )}

      {slot.type === 'reflect' && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={slot.axis === 'y' ? BTN_ACTIVE : BTN_DEFAULT}
            onClick={() => onChange({ ...slot, axis: 'y' })}
            aria-pressed={slot.axis === 'y'}
          >
            Y-axis
          </button>
          <button
            type="button"
            className={slot.axis === 'x' ? BTN_ACTIVE : BTN_DEFAULT}
            onClick={() => onChange({ ...slot, axis: 'x' })}
            aria-pressed={slot.axis === 'x'}
          >
            X-axis
          </button>
        </div>
      )}

      {slot.type === 'rotate' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {([90, 180, 270] as const).map(deg => (
              <button
                key={deg}
                type="button"
                className={slot.degrees === deg ? BTN_ACTIVE : BTN_DEFAULT}
                onClick={() => onChange({ ...slot, degrees: deg })}
                aria-pressed={slot.degrees === deg}
              >
                {deg}°
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className="h-px flex-1 bg-(--lab-border)" aria-hidden />
            {(['cw', 'ccw'] as const).map(dir => (
              <button
                key={dir}
                type="button"
                className={slot.direction === dir ? BTN_ACTIVE : BTN_DEFAULT}
                onClick={() => onChange({ ...slot, direction: dir })}
                aria-pressed={slot.direction === dir}
              >
                {dir.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SequenceBuilder ──────────────────────────────────────────────────────────

export interface SequenceBuilderProps {
  onSequenceChange: (sequence: TransformationParams[]) => void
  onCheckSequence: () => void
  feedbackState: FeedbackState
  onNext: () => void
}

export function SequenceBuilder({
  onSequenceChange,
  onCheckSequence,
  feedbackState,
  onNext,
}: SequenceBuilderProps) {
  const [slot1, setSlot1] = useState<SlotState>({ ...DEFAULT_SLOT })
  const [slot2, setSlot2] = useState<SlotState>({ ...DEFAULT_SLOT })

  const params1 = slotToParams(slot1)
  const params2 = slotToParams(slot2)

  const sequence: TransformationParams[] = params1
    ? params2
      ? [params1, params2]
      : [params1]
    : []

  // Notify parent on every change
  useEffect(() => {
    onSequenceChange(sequence)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sequence)])

  const handleSlot1Change = useCallback((next: SlotState) => {
    setSlot1(next)
    // When slot 1 is cleared, also clear slot 2
    if (next.type === null) {
      setSlot2({ ...DEFAULT_SLOT })
    }
  }, [])

  const handleSlot2Change = useCallback((next: SlotState) => {
    setSlot2(next)
  }, [])

  const slot2Disabled = slot1.type === null

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Slots row */}
      <div className="flex flex-wrap items-start gap-2">
        <SlotEditor
          label="STEP 1"
          slot={slot1}
          onChange={handleSlot1Change}
        />

        {slot1.type !== null && (
          <>
            <span className="lab-data-font text-(--lab-text-muted) self-center">→</span>
            <SlotEditor
              label="STEP 2"
              slot={slot2}
              onChange={handleSlot2Change}
              disabled={slot2Disabled}
            />
          </>
        )}
      </div>

      {/* Actions row */}
      <div className="flex gap-2 justify-end">
        {feedbackState === 'match' ? (
          <button type="button" className={BTN_PRIMARY} onClick={onNext}>
            Next →
          </button>
        ) : (
          <button
            type="button"
            className={sequence.length > 0 ? BTN_PRIMARY : BTN_DISABLED}
            disabled={sequence.length === 0}
            onClick={onCheckSequence}
          >
            Check Sequence
          </button>
        )}
      </div>
    </div>
  )
}
