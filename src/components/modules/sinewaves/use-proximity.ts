import { useMemo } from 'react'
import { PROXIMITY_THRESHOLDS, MAX_DISTANCES } from './sinewaves-constants'
import { SINEWAVE_COPY } from './sinewaves-copy'

type ProximityLevel = 'far' | 'medium' | 'close'

interface ProximityResult {
  level: ProximityLevel
  feedback: string | null
  score: number
}

/**
 * Computes proximity score and feedback text for the active parameter.
 * Returns null feedback when too far (no signal) — only shows
 * "Getting closer..." and "Almost there..." as user approaches target.
 */
export function useProximity(
  activeParam: 'amplitude' | 'frequency' | null,
  currentValue: number,
  targetValue: number
): ProximityResult {
  return useMemo(() => {
    if (!activeParam) {
      return { level: 'far' as const, feedback: null, score: 0 }
    }

    const maxDist = MAX_DISTANCES[activeParam]
    const distance = Math.abs(currentValue - targetValue)
    const score = Math.max(0, 1 - distance / maxDist)

    if (score >= PROXIMITY_THRESHOLDS.close) {
      return { level: 'close', feedback: SINEWAVE_COPY.proximity.close, score }
    }
    if (score >= PROXIMITY_THRESHOLDS.medium) {
      return { level: 'medium', feedback: SINEWAVE_COPY.proximity.medium, score }
    }
    return { level: 'far', feedback: null, score }
  }, [activeParam, currentValue, targetValue])
}
