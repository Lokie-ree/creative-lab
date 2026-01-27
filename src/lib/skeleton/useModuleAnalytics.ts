import { useCallback, useRef, useEffect } from 'react'
import type {
  SessionStartEvent,
  SessionEndEvent,
  StageUnlockEvent,
  ChallengeEndEvent
} from './types'

type AnalyticsEvent =
  | { type: 'sessionStart'; data: SessionStartEvent }
  | { type: 'sessionEnd'; data: SessionEndEvent }
  | { type: 'stageUnlock'; data: StageUnlockEvent }
  | { type: 'challengeEnd'; data: ChallengeEndEvent }

interface UseModuleAnalyticsReturn {
  // Event recording
  trackSessionStart: (moduleId: string) => void
  trackSessionEnd: (data: Omit<SessionEndEvent, 'moduleId'>) => void
  trackStageUnlock: (data: StageUnlockEvent) => void
  trackChallengeEnd: (data: ChallengeEndEvent) => void

  // For testing/debugging
  getEvents: () => AnalyticsEvent[]
  clearEvents: () => void
}

// In production, replace with actual analytics service
const sendToAnalytics = (event: AnalyticsEvent) => {
  // Queue for batch sending
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event.type, event.data)
  }

  // TODO: Integrate with actual analytics service
  // - Segment
  // - PostHog
  // - Custom backend
}

export function useModuleAnalytics(): UseModuleAnalyticsReturn {
  const eventsRef = useRef<AnalyticsEvent[]>([])
  const moduleIdRef = useRef<string | null>(null)
  const sessionStartRef = useRef<number | null>(null)

  const trackSessionStart = useCallback((moduleId: string) => {
    moduleIdRef.current = moduleId
    sessionStartRef.current = Date.now()

    const event: AnalyticsEvent = {
      type: 'sessionStart',
      data: { moduleId, timestamp: Date.now() },
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const trackSessionEnd = useCallback((data: Omit<SessionEndEvent, 'moduleId'>) => {
    if (!moduleIdRef.current) return

    const event: AnalyticsEvent = {
      type: 'sessionEnd',
      data: { ...data, moduleId: moduleIdRef.current },
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const trackStageUnlock = useCallback((data: StageUnlockEvent) => {
    const event: AnalyticsEvent = {
      type: 'stageUnlock',
      data,
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const trackChallengeEnd = useCallback((data: ChallengeEndEvent) => {
    const event: AnalyticsEvent = {
      type: 'challengeEnd',
      data,
    }
    eventsRef.current.push(event)
    sendToAnalytics(event)
  }, [])

  const getEvents = useCallback(() => eventsRef.current, [])

  const clearEvents = useCallback(() => {
    eventsRef.current = []
  }, [])

  // Track session end on unmount
  useEffect(() => {
    return () => {
      if (sessionStartRef.current && moduleIdRef.current) {
        const duration = Date.now() - sessionStartRef.current
        trackSessionEnd({
          duration,
          completedChallenges: 0, // Would need to track this
          exitReason: 'abandoned',
        })
      }
    }
  }, [trackSessionEnd])

  return {
    trackSessionStart,
    trackSessionEnd,
    trackStageUnlock,
    trackChallengeEnd,
    getEvents,
    clearEvents,
  }
}
