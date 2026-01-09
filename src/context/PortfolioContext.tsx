/* eslint-disable react-refresh/only-export-components -- Context pattern: exporting hook alongside provider */
import { createContext, useContext, type ReactNode } from 'react'
import { usePortfolioState } from '@/hooks/usePortfolioState'

type PortfolioContextValue = ReturnType<typeof usePortfolioState>

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const portfolioState = usePortfolioState()

  return (
    <PortfolioContext.Provider value={portfolioState}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio(): PortfolioContextValue {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
