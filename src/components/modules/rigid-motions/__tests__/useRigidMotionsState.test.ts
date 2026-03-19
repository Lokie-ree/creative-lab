import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRigidMotionsState } from '../hooks/useRigidMotionsState'

describe('useRigidMotionsState — match gating', () => {
  it('does not set feedbackState to match when ghost is moved to the correct position without pressing CHECK', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    act(() => {
      result.current.handleGhostMove([3, 1])
    })

    expect(result.current.feedbackState).toBe('idle')
  })

  it('does not update feedbackState from idle when ghost moves after no CHECK', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    act(() => {
      result.current.handleGhostMove([1, 2])
    })
    act(() => {
      result.current.handleGhostMove([3, 4])
    })

    expect(result.current.feedbackState).toBe('idle')
  })

  it('sets feedbackState only after handleCheck is called', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    act(() => {
      result.current.handleGhostMove([0, 0])
    })
    expect(result.current.feedbackState).toBe('idle')

    act(() => {
      result.current.handleCheck()
    })
    expect(result.current.feedbackState).not.toBe('idle')
  })

  it('does not re-score after CHECK when ghost is moved again', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    act(() => {
      result.current.handleCheck()
    })
    const stateAfterCheck = result.current.feedbackState

    act(() => {
      result.current.handleGhostMove([5, 5])
    })

    expect(result.current.feedbackState).toBe(stateAfterCheck)
  })
})

describe('useRigidMotionsState — beat-keyed shownReveals', () => {
  it('shownReveals is initially empty', () => {
    const { result } = renderHook(() => useRigidMotionsState())
    expect(result.current.shownReveals.size).toBe(0)
  })

  it('does not add a beat key before CHECK is called', () => {
    const { result } = renderHook(() => useRigidMotionsState())
    // Beat key would be 'predict-translate-0' on first match
    expect(result.current.shownReveals.has('predict-translate-0')).toBe(false)
  })
})
