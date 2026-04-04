import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SequenceBuilder } from '../components/SequenceBuilder'

const noop = () => {}

function defaultProps(overrides = {}) {
  return {
    steps: [],
    maxSteps: 3,
    kLocked: true,
    lockedK: 2,
    feedbackState: 'idle' as const,
    onAddStep: noop,
    onUpdateStep: noop,
    onRemoveStep: noop,
    onCheckSequence: noop,
    onNext: noop,
    onReset: noop,
    ...overrides,
  }
}

describe('SequenceBuilder chip rail', () => {
  it('initializes with one empty draft chip showing "—"', () => {
    render(<SequenceBuilder {...defaultProps()} />)
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('shows STEP 1 label on the first chip', () => {
    render(<SequenceBuilder {...defaultProps()} />)
    expect(screen.getByText('STEP 1')).toBeTruthy()
  })

  it('shows CHECK button when steps array is empty', () => {
    render(<SequenceBuilder {...defaultProps()} />)
    expect(screen.getByText('CHECK')).toBeTruthy()
  })

  it('shows NEXT button and hides CHECK when feedbackState is match', () => {
    render(<SequenceBuilder {...defaultProps({ feedbackState: 'match' })} />)
    expect(screen.getByText('NEXT')).toBeTruthy()
    expect(screen.queryByText('CHECK')).toBeNull()
  })

  it('shows RESET button in idle state', () => {
    render(<SequenceBuilder {...defaultProps()} />)
    expect(screen.getByText('RESET')).toBeTruthy()
  })

  it('hides RESET button in match state', () => {
    render(<SequenceBuilder {...defaultProps({ feedbackState: 'match' })} />)
    expect(screen.queryByText('RESET')).toBeNull()
  })

  it('shows amber hint strip in miss state', () => {
    render(<SequenceBuilder {...defaultProps({ feedbackState: 'miss' })} />)
    expect(screen.getByText(/Tap any step/)).toBeTruthy()
  })

  it('calls onReset and resets to one empty chip when RESET is clicked', () => {
    const onReset = vi.fn()
    render(<SequenceBuilder {...defaultProps({ onReset })} />)
    fireEvent.click(screen.getByText('RESET'))
    expect(onReset).toHaveBeenCalledOnce()
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('calls onCheckSequence when CHECK is clicked', () => {
    const onCheckSequence = vi.fn()
    const step: import('../utils/types').TransformStep = { type: 'translate', params: { dx: 1, dy: 1 } }
    render(<SequenceBuilder {...defaultProps({ onCheckSequence, steps: [step] })} />)
    fireEvent.click(screen.getByText('CHECK'))
    expect(onCheckSequence).toHaveBeenCalledOnce()
  })

  it('does not show + button when last slot has no type', () => {
    render(<SequenceBuilder {...defaultProps()} />)
    expect(screen.queryByText('+')).toBeNull()
  })

  it('calls onAddStep when a type is selected in a draft slot', () => {
    const onAddStep = vi.fn()
    render(<SequenceBuilder {...defaultProps({ onAddStep })} />)
    // Click the chip to open editor
    fireEvent.click(screen.getByText('—'))
    // Select translate type
    fireEvent.click(screen.getByText('T'))
    expect(onAddStep).toHaveBeenCalledOnce()
    expect(onAddStep).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'translate' })
    )
  })

  it('calls onUpdateStep when changing type on a committed slot', () => {
    const onAddStep = vi.fn()
    const onUpdateStep = vi.fn()
    render(<SequenceBuilder {...defaultProps({ onAddStep, onUpdateStep })} />)
    // Click chip to open editor, select T to commit
    fireEvent.click(screen.getByText('—'))
    fireEvent.click(screen.getByText('T'))
    // Slot is now committed (type !== null), change to Ref to trigger onUpdateStep
    fireEvent.click(screen.getByText('Ref'))
    expect(onUpdateStep).toHaveBeenCalled()
  })

  it('calls onRemoveStep when × is clicked on a committed chip', () => {
    const onRemoveStep = vi.fn()
    render(<SequenceBuilder {...defaultProps({ onRemoveStep })} />)
    // Select a type in the draft slot to commit it
    fireEvent.click(screen.getByText('—'))
    fireEvent.click(screen.getByText('T'))
    // Find and click the × remove button via aria-label
    const removeBtn = screen.getByRole('button', { name: 'Remove step 1' })
    fireEvent.click(removeBtn)
    expect(onRemoveStep).toHaveBeenCalledOnce()
    expect(onRemoveStep).toHaveBeenCalledWith(0)
  })
})
