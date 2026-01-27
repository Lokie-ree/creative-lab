import { useState, useCallback, useRef } from 'react'
import type { StageUnlockConfig } from './types'

export type UnlockTrigger = 'intensity' | 'range' | 'time' | null

interface UseStageUnlockReturn {
  shouldUnlock: boolean
  unlockTrigger: UnlockTrigger

  // Actions
  startEngagement: () => void
  recordValue: (normalizedValue: number, intensity: number) => void
  reset: () => void

  // Debug info
  engagementSeconds: number
  exploredRangePercent: number
  intensityHoldSeconds: number
}

export function useStageUnlock(config: StageUnlockConfig): UseStageUnlockReturn {
  const [shouldUnlock, setShouldUnlock] = useState(false)
  const [unlockTrigger, setUnlockTrigger] = useState<UnlockTrigger>(null)

  // Tracking refs (to avoid re-renders on every value)
  const engagementStartRef = useRef<number | null>(null)
  const intensityStartRef = useRef<number | null>(null)
  const visitedBucketsRef = useRef<Set<number>>(new Set())
  const lastIntensityRef = useRef<number>(0)

  // State for computed values (for debugging/UI)
  const [engagementSeconds, setEngagementSeconds] = useState(0)
  const [exploredRangePercent, setExploredRangePercent] = useState(0)
  const [intensityHoldSeconds, setIntensityHoldSeconds] = useState(0)

  const startEngagement = useCallback(() => {
    engagementStartRef.current = Date.now()
  }, [])

  const recordValue = useCallback((normalizedValue: number, intensity: number) => {
    const now = Date.now()

    // Check minimum engagement
    const engagementMs = engagementStartRef.current
      ? now - engagementStartRef.current
      : 0
    const engagementSec = engagementMs / 1000
    setEngagementSeconds(engagementSec)

    if (engagementSec < config.minimumEngagementSeconds) {
      return // Too early to unlock
    }

    // Track intensity hold time
    if (intensity >= config.intensityThreshold) {
      if (intensityStartRef.current === null) {
        intensityStartRef.current = now
      }
      const holdMs = now - intensityStartRef.current
      const holdSec = holdMs / 1000
      setIntensityHoldSeconds(holdSec)

      if (holdSec >= 1) {
        setShouldUnlock(true)
        setUnlockTrigger('intensity')
        return
      }
    } else {
      intensityStartRef.current = null
      setIntensityHoldSeconds(0)
    }
    lastIntensityRef.current = intensity

    // Track range exploration (bucket values into 10 buckets)
    const bucket = Math.floor(normalizedValue * 10)
    visitedBucketsRef.current.add(Math.min(bucket, 9))
    const rangePercent = visitedBucketsRef.current.size / 10
    setExploredRangePercent(rangePercent)

    if (rangePercent >= config.rangeExplorationThreshold) {
      setShouldUnlock(true)
      setUnlockTrigger('range')
      return
    }

    // Time-based fallback
    if (engagementSec >= config.timeFallbackSeconds) {
      setShouldUnlock(true)
      setUnlockTrigger('time')
    }
  }, [config])

  const reset = useCallback(() => {
    setShouldUnlock(false)
    setUnlockTrigger(null)
    engagementStartRef.current = null
    intensityStartRef.current = null
    visitedBucketsRef.current.clear()
    setEngagementSeconds(0)
    setExploredRangePercent(0)
    setIntensityHoldSeconds(0)
  }, [])

  return {
    shouldUnlock,
    unlockTrigger,
    startEngagement,
    recordValue,
    reset,
    engagementSeconds,
    exploredRangePercent,
    intensityHoldSeconds,
  }
}
