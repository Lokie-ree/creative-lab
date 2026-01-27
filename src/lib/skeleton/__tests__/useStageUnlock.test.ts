import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useStageUnlock } from '../useStageUnlock'
import type { StageUnlockConfig } from '../types'

const defaultConfig: StageUnlockConfig = {
  minimumEngagementSeconds: 1, // Short for testing
  intensityThreshold: 0.7,
  rangeExplorationThreshold: 0.6,
  timeFallbackSeconds: 10,
}

describe('useStageUnlock', () => {
  it('does not unlock before minimum engagement', () => {
    const { result } = renderHook(() => useStageUnlock(defaultConfig))

    act(() => {
      result.current.recordValue(0.5, 0.8) // High intensity but no engagement
    })

    expect(result.current.shouldUnlock).toBe(false)
  })

  it('unlocks when intensity threshold held for 1 second', async () => {
    const { result } = renderHook(() => useStageUnlock(defaultConfig))

    // Simulate engagement
    act(() => {
      result.current.startEngagement()
    })

    // Wait for minimum engagement
    await new Promise(resolve => setTimeout(resolve, 1100))

    // Record high intensity for 1+ second
    act(() => {
      result.current.recordValue(0.5, 0.8) // intensity above 0.7
    })

    await new Promise(resolve => setTimeout(resolve, 1100))

    act(() => {
      result.current.recordValue(0.5, 0.8)
    })

    expect(result.current.shouldUnlock).toBe(true)
    expect(result.current.unlockTrigger).toBe('intensity')
  })

  it('unlocks when range exploration threshold met', async () => {
    const { result } = renderHook(() => useStageUnlock({
      ...defaultConfig,
      rangeExplorationThreshold: 0.5, // 50% of range
    }))

    act(() => {
      result.current.startEngagement()
    })

    await new Promise(resolve => setTimeout(resolve, 1100))

    // Explore values across range (0 to 1, so visit 0.1, 0.3, 0.5, 0.7, 0.9)
    act(() => {
      result.current.recordValue(0.1, 0.3)
      result.current.recordValue(0.3, 0.3)
      result.current.recordValue(0.5, 0.3)
      result.current.recordValue(0.7, 0.3)
      result.current.recordValue(0.9, 0.3)
    })

    expect(result.current.shouldUnlock).toBe(true)
    expect(result.current.unlockTrigger).toBe('range')
  })
})
