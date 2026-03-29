import { useReducer, useCallback, useMemo } from 'react'
import type { Vec2, Triangle } from '../utils/types'

export type Accuracy = 'exact' | 'close' | 'miss'

export interface PRState {
  ghostPosition: Vec2 | null
  isPredicted: boolean
  isRevealed: boolean
  accuracy: Accuracy | null
}

export type PRAction =
  | { type: 'PLACE_GHOST'; pos: Vec2 }
  | { type: 'COMMIT'; targetCentroid: Vec2; tolerance: number }
  | { type: 'REVEAL' }
  | { type: 'RESET' }

const INITIAL_PR_STATE: PRState = {
  ghostPosition: null,
  isPredicted: false,
  isRevealed: false,
  accuracy: null,
}

function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function computeAccuracy(ghostPos: Vec2, targetCentroid: Vec2, tolerance: number): Accuracy {
  const d = Math.sqrt((ghostPos.x - targetCentroid.x) ** 2 + (ghostPos.y - targetCentroid.y) ** 2)
  return d <= tolerance * 0.5 ? 'exact' : d <= tolerance ? 'close' : 'miss'
}

export function predictRevealReducer(state: PRState, action: PRAction): PRState {
  switch (action.type) {
    case 'PLACE_GHOST':
      return { ...state, ghostPosition: action.pos }

    case 'COMMIT': {
      const d = state.ghostPosition ? dist(state.ghostPosition, action.targetCentroid) : Infinity
      const accuracy: Accuracy =
        d <= action.tolerance * 0.5 ? 'exact' :
        d <= action.tolerance       ? 'close' :
                                      'miss'
      return { ...state, isPredicted: true, accuracy }
    }

    case 'REVEAL':
      if (!state.isPredicted) return state
      return { ...state, isRevealed: true }

    case 'RESET':
      return { ...INITIAL_PR_STATE }

    default:
      return state
  }
}

function triangleCentroid(t: Triangle): Vec2 {
  return {
    x: (t.a.x + t.b.x + t.c.x) / 3,
    y: (t.a.y + t.b.y + t.c.y) / 3,
  }
}

export function usePredictReveal(targetTriangle: Triangle, tolerance: number) {
  const [state, dispatch] = useReducer(predictRevealReducer, INITIAL_PR_STATE)
  const targetCentroid = useMemo(() => triangleCentroid(targetTriangle), [targetTriangle])

  const placeGhost = useCallback((pos: Vec2) => {
    dispatch({ type: 'PLACE_GHOST', pos })
  }, [])

  const commitPrediction = useCallback(() => {
    dispatch({ type: 'COMMIT', targetCentroid, tolerance })
  }, [targetCentroid, tolerance])

  const triggerReveal = useCallback(() => {
    dispatch({ type: 'REVEAL' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return { ...state, placeGhost, commitPrediction, triggerReveal, reset }
}
