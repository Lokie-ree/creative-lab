import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChallengeAssist } from '../useChallengeAssist'

describe('useChallengeAssist', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows directional nudge after 60 seconds', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    expect(result.current.showDirectionalNudge).toBe(false)

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.showDirectionalNudge).toBe(true)
  })

  it('shows "try another" option after 90 seconds', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    act(() => {
      vi.advanceTimersByTime(90000)
    })

    expect(result.current.showTryAnother).toBe(true)
  })

  it('shows "show me" option after 120 seconds', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    act(() => {
      vi.advanceTimersByTime(120000)
    })

    expect(result.current.showAssist).toBe(true)
  })

  it('extends timers when user interacts', () => {
    const { result } = renderHook(() => useChallengeAssist())

    act(() => {
      result.current.startChallenge()
    })

    // After 50 seconds, interact
    act(() => {
      vi.advanceTimersByTime(50000)
      result.current.recordInteraction()
    })

    // Nudge should still be hidden (timer reset)
    expect(result.current.showDirectionalNudge).toBe(false)

    // Need another 60 seconds from last interaction
    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.showDirectionalNudge).toBe(true)
  })
})
