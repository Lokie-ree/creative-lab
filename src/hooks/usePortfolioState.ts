import { useState, useEffect, useCallback } from 'react'
import type { PortfolioState, ModuleProgress, ModuleStatus } from '@/types/portfolio'
import { INITIAL_PORTFOLIO_STATE } from '@/types/portfolio'

const STORAGE_KEY = 'portfolio-state'

function loadState(): PortfolioState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load portfolio state:', e)
  }
  return INITIAL_PORTFOLIO_STATE
}

function saveState(state: PortfolioState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save portfolio state:', e)
  }
}

export function usePortfolioState() {
  const [state, setState] = useState<PortfolioState>(loadState)

  // Persist to localStorage when state changes
  useEffect(() => {
    saveState(state)
  }, [state])

  const getModuleProgress = useCallback((moduleId: string): ModuleProgress => {
    return state.modules[moduleId] || { status: 'not-started' }
  }, [state.modules])

  const updateModuleProgress = useCallback((
    moduleId: string,
    progress: Partial<ModuleProgress>
  ) => {
    setState(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleId]: {
          ...prev.modules[moduleId],
          ...progress,
        },
      },
      lastActiveModule: moduleId,
    }))
  }, [])

  const setModuleStatus = useCallback((moduleId: string, status: ModuleStatus) => {
    updateModuleProgress(moduleId, {
      status,
      ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
    })
  }, [updateModuleProgress])

  const clearProgress = useCallback(() => {
    setState(INITIAL_PORTFOLIO_STATE)
  }, [])

  return {
    state,
    getModuleProgress,
    updateModuleProgress,
    setModuleStatus,
    clearProgress,
  }
}
