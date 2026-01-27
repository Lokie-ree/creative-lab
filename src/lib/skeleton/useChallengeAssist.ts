import { useState, useCallback, useRef, useEffect } from 'react'

interface UseChallengeAssistReturn {
  // Visibility flags
  showDirectionalNudge: boolean  // ~60s
  showTryAnother: boolean        // ~90s
  showAssist: boolean            // ~120s

  // Actions
  startChallenge: () => void
  recordInteraction: () => void
  onTryAnother: () => void
  onAssist: () => void
  reset: () => void

  // For analytics
  elapsedSeconds: number
  interactionCount: number
}

const NUDGE_DELAY = 60000      // 60 seconds
const TRY_ANOTHER_DELAY = 90000 // 90 seconds
const ASSIST_DELAY = 120000    // 120 seconds

export function useChallengeAssist(): UseChallengeAssistReturn {
  const [showDirectionalNudge, setShowDirectionalNudge] = useState(false)
  const [showTryAnother, setShowTryAnother] = useState(false)
  const [showAssist, setShowAssist] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [interactionCount, setInteractionCount] = useState(0)

  const challengeStartRef = useRef<number | null>(null)
  const lastInteractionRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkTimers = useCallback(() => {
    if (!lastInteractionRef.current) return

    const timeSinceInteraction = Date.now() - lastInteractionRef.current
    const totalTime = challengeStartRef.current
      ? Date.now() - challengeStartRef.current
      : 0

    setElapsedSeconds(Math.floor(totalTime / 1000))

    // Progressive reveals based on time since last interaction
    if (timeSinceInteraction >= NUDGE_DELAY) {
      setShowDirectionalNudge(true)
    }
    if (timeSinceInteraction >= TRY_ANOTHER_DELAY) {
      setShowTryAnother(true)
    }
    if (timeSinceInteraction >= ASSIST_DELAY) {
      setShowAssist(true)
    }
  }, [])

  const startChallenge = useCallback(() => {
    const now = Date.now()
    challengeStartRef.current = now
    lastInteractionRef.current = now
    setShowDirectionalNudge(false)
    setShowTryAnother(false)
    setShowAssist(false)
    setElapsedSeconds(0)
    setInteractionCount(0)

    // Start interval to check timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(checkTimers, 1000)
  }, [checkTimers])

  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now()
    setInteractionCount(c => c + 1)

    // Reset visibility on interaction (user is actively trying)
    setShowDirectionalNudge(false)
    setShowTryAnother(false)
    setShowAssist(false)
  }, [])

  const onTryAnother = useCallback(() => {
    // Called when user chooses to try a different challenge
    // Parent should generate new target and call startChallenge
  }, [])

  const onAssist = useCallback(() => {
    // Called when user chooses "show me"
    // Parent should animate to solution
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    challengeStartRef.current = null
    lastInteractionRef.current = null
    setShowDirectionalNudge(false)
    setShowTryAnother(false)
    setShowAssist(false)
    setElapsedSeconds(0)
    setInteractionCount(0)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    showDirectionalNudge,
    showTryAnother,
    showAssist,
    startChallenge,
    recordInteraction,
    onTryAnother,
    onAssist,
    reset,
    elapsedSeconds,
    interactionCount,
  }
}
