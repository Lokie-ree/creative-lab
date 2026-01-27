import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useModuleFlow } from '../useModuleFlow'
import type { ModuleConfig } from '../types'

const mockConfig: ModuleConfig<{ amplitude: number }, { a: number }> = {
  id: 'test-module',
  stages: [
    {
      id: 'amplitude',
      parameter: 'amplitude',
      interactionMode: 'slider',
      controlConfig: { min: 0, max: 2, step: 0.1, defaultValue: 1 },
    },
  ],
  challenge: {
    generateTarget: () => ({ a: 1.5 }),
    matchThreshold: 0.95,
    proximityFn: (current, target) => 1 - Math.abs(current.amplitude - target.a),
    targetConstraints: { minimumDistance: 0.3, maximumDistance: 0.95, difficultyProgression: 'fixed' },
  },
  feedback: {
    intensityFn: () => 0.5,
    notation: (params) => `A = ${params.amplitude}`,
  },
  idle: { hintDelay: 15, hintType: 'pulse' },
  stageUnlock: {
    minimumEngagementSeconds: 5,
    intensityThreshold: 0.7,
    rangeExplorationThreshold: 0.6,
    timeFallbackSeconds: 45,
  },
}

describe('useModuleFlow', () => {
  it('starts in idle phase', () => {
    const { result } = renderHook(() => useModuleFlow(mockConfig, { amplitude: 1 }))
    expect(result.current.state.phase).toBe('idle')
  })

  it('transitions from idle to explore on first interaction', () => {
    const { result } = renderHook(() => useModuleFlow(mockConfig, { amplitude: 1 }))

    act(() => {
      result.current.recordInteraction()
    })

    expect(result.current.state.phase).toBe('explore')
  })

  it('tracks engagement time during explore', async () => {
    const { result } = renderHook(() => useModuleFlow(mockConfig, { amplitude: 1 }))

    act(() => {
      result.current.recordInteraction()
    })

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100))

    act(() => {
      result.current.recordInteraction()
    })

    expect(result.current.state.engagementTime).toBeGreaterThan(0)
  })
})
