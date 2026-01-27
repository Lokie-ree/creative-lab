import { useState, useCallback, useRef, useEffect } from 'react'
import type { ModuleConfig, ModuleState, FlowPhase } from './types'

interface UseModuleFlowReturn<TParams> {
  state: ModuleState<TParams>

  // Actions
  recordInteraction: () => void
  advanceStage: () => void
  enterChallenge: () => void
  recordMatch: (accuracy: number) => void
  exitToReveal: () => void
  reset: () => void

  // Computed
  currentStage: ModuleConfig<TParams, unknown>['stages'][number] | null
  isLastExploreStage: boolean
  canUnlockStage: boolean
}

function createInitialState<TParams>(params: TParams): ModuleState<TParams> {
  return {
    phase: 'idle',
    currentStageIndex: 0,
    params,
    discoveries: {},
    phaseStartTime: Date.now(),
    lastInteractionTime: 0,
    engagementTime: 0,
    currentTarget: null,
    challengeAttempts: 0,
    hintsShown: 0,
    matchAccuracy: 0,
    challengeStreak: 0,
  }
}

export function useModuleFlow<TParams, TTarget>(
  config: ModuleConfig<TParams, TTarget>,
  initialParams: TParams
): UseModuleFlowReturn<TParams> {
  const [state, setState] = useState<ModuleState<TParams>>(() =>
    createInitialState(initialParams)
  )

  const engagementStartRef = useRef<number | null>(null)

  // Track engagement time while in explore phase
  useEffect(() => {
    if (state.phase === 'explore' && engagementStartRef.current === null) {
      engagementStartRef.current = Date.now()
    }
    if (state.phase !== 'explore') {
      engagementStartRef.current = null
    }
  }, [state.phase])

  const recordInteraction = useCallback(() => {
    const now = Date.now()

    setState(prev => {
      // Transition from idle to explore on first interaction
      if (prev.phase === 'idle') {
        return {
          ...prev,
          phase: 'explore' as FlowPhase,
          phaseStartTime: now,
          lastInteractionTime: now,
        }
      }

      // Update engagement time during explore
      const engagementTime = engagementStartRef.current
        ? now - engagementStartRef.current
        : prev.engagementTime

      return {
        ...prev,
        lastInteractionTime: now,
        engagementTime,
      }
    })
  }, [])

  const advanceStage = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentStageIndex + 1
      const isLastStage = nextIndex >= config.stages.length

      if (isLastStage) {
        // Move to challenge
        return {
          ...prev,
          phase: 'challenge' as FlowPhase,
          currentTarget: config.challenge.generateTarget(),
          phaseStartTime: Date.now(),
          engagementTime: 0,
        }
      }

      return {
        ...prev,
        currentStageIndex: nextIndex,
        phaseStartTime: Date.now(),
        engagementTime: 0,
      }
    })
  }, [config])

  const enterChallenge = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'challenge' as FlowPhase,
      currentTarget: config.challenge.generateTarget(),
      phaseStartTime: Date.now(),
      challengeAttempts: prev.challengeAttempts + 1,
    }))
  }, [config])

  const recordMatch = useCallback((accuracy: number) => {
    setState(prev => ({
      ...prev,
      phase: 'success' as FlowPhase,
      matchAccuracy: accuracy,
      challengeStreak: prev.challengeStreak + 1,
      phaseStartTime: Date.now(),
    }))
  }, [])

  const exitToReveal = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'reveal' as FlowPhase,
      phaseStartTime: Date.now(),
    }))
  }, [])

  const reset = useCallback(() => {
    setState(createInitialState(initialParams))
  }, [initialParams])

  // Computed values
  const currentStage = config.stages[state.currentStageIndex] ?? null
  const isLastExploreStage = state.currentStageIndex >= config.stages.length - 1

  const canUnlockStage = state.engagementTime / 1000 >= config.stageUnlock.minimumEngagementSeconds

  return {
    state,
    recordInteraction,
    advanceStage,
    enterChallenge,
    recordMatch,
    exitToReveal,
    reset,
    currentStage,
    isLastExploreStage,
    canUnlockStage,
  }
}
