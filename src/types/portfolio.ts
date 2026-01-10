export type ModuleStatus = 'not-started' | 'in-progress' | 'completed'

export interface ModuleProgress {
  status: ModuleStatus
  progress?: number // 0-1, percentage through module
  currentStage?: string
  currentSubStage?: string
  discoveries?: {
    amplitude?: number | null
    frequency?: number | null
  }
  completedAt?: string
}

export interface PortfolioState {
  modules: Record<string, ModuleProgress>
  lastActiveModule?: string
}

export const INITIAL_PORTFOLIO_STATE: PortfolioState = {
  modules: {},
}
