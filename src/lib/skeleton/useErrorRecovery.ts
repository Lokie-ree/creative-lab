import { useState, useCallback, useEffect, useRef } from 'react'
import type { ErrorRecoveryConfig, PerformanceConfig } from './types'

interface UseErrorRecoveryReturn {
  // WebGL context state
  isContextLost: boolean
  contextLostMessage: string
  attemptRestore: () => void

  // Performance state
  isPerformanceDegraded: boolean
  currentFPS: number
  degradationLevel: 'none' | 'partial' | 'full'

  // Tab visibility
  isTabVisible: boolean
  tabHiddenDuration: number  // milliseconds

  // Actions
  startMonitoring: () => void
  stopMonitoring: () => void
}

const DEFAULT_ERROR_CONFIG: ErrorRecoveryConfig = {
  onContextLost: 'pause',
  contextLostMessage: 'Visualization paused. Tap to resume.',
}

const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  targetFPS: 60,
  degradationThreshold: 30,
  degradationStrategy: 'both',
}

export function useErrorRecovery(
  errorConfig: Partial<ErrorRecoveryConfig> = {},
  performanceConfig: Partial<PerformanceConfig> = {}
): UseErrorRecoveryReturn {
  const config = { ...DEFAULT_ERROR_CONFIG, ...errorConfig }
  const perfConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...performanceConfig }

  // WebGL context state
  const [isContextLost, setIsContextLost] = useState(false)

  // Performance state
  const [isPerformanceDegraded, setIsPerformanceDegraded] = useState(false)
  const [currentFPS, setCurrentFPS] = useState(60)
  const [degradationLevel, setDegradationLevel] = useState<'none' | 'partial' | 'full'>('none')

  // Tab visibility
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [tabHiddenDuration, setTabHiddenDuration] = useState(0)

  // Refs for tracking
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(0)
  const tabHiddenStartRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isMonitoringRef = useRef(false)
  const degradationThresholdRef = useRef(perfConfig.degradationThreshold)

  // Keep threshold ref in sync
  useEffect(() => {
    degradationThresholdRef.current = perfConfig.degradationThreshold
  }, [perfConfig.degradationThreshold])

  // Use useEffect for the animation loop to avoid circular dependency
  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now()

      if (lastFrameTimeRef.current > 0) {
        const delta = now - lastFrameTimeRef.current
        const fps = 1000 / delta

        frameTimesRef.current.push(fps)
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift()
        }

        // Calculate average FPS
        const avgFPS = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
        setCurrentFPS(Math.round(avgFPS))

        const threshold = degradationThresholdRef.current
        // Check degradation
        if (avgFPS < threshold) {
          setIsPerformanceDegraded(true)
          setDegradationLevel(avgFPS < 15 ? 'full' : 'partial')
        } else if (avgFPS > threshold + 10) {
          // Hysteresis: need to be 10 FPS above threshold to recover
          setIsPerformanceDegraded(false)
          setDegradationLevel('none')
        }
      }

      lastFrameTimeRef.current = now

      if (isMonitoringRef.current) {
        animationFrameRef.current = requestAnimationFrame(measureFPS)
      }
    }

    if (isMonitoringRef.current) {
      animationFrameRef.current = requestAnimationFrame(measureFPS)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const attemptRestore = useCallback(() => {
    // In R3F, context restore is usually automatic
    // This is a manual trigger for cases where we need to reload
    if (config.onContextLost === 'reload') {
      window.location.reload()
    } else {
      // Try to restore - the actual restore happens in the Canvas component
      setIsContextLost(false)
    }
  }, [config.onContextLost])

  const startMonitoring = useCallback(() => {
    isMonitoringRef.current = true
    // Trigger the effect by forcing a re-render isn't ideal,
    // so we start the loop directly here
    const measureFPS = () => {
      const now = performance.now()

      if (lastFrameTimeRef.current > 0) {
        const delta = now - lastFrameTimeRef.current
        const fps = 1000 / delta

        frameTimesRef.current.push(fps)
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift()
        }

        const avgFPS = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
        setCurrentFPS(Math.round(avgFPS))

        const threshold = degradationThresholdRef.current
        if (avgFPS < threshold) {
          setIsPerformanceDegraded(true)
          setDegradationLevel(avgFPS < 15 ? 'full' : 'partial')
        } else if (avgFPS > threshold + 10) {
          setIsPerformanceDegraded(false)
          setDegradationLevel('none')
        }
      }

      lastFrameTimeRef.current = now

      if (isMonitoringRef.current) {
        animationFrameRef.current = requestAnimationFrame(measureFPS)
      }
    }
    animationFrameRef.current = requestAnimationFrame(measureFPS)
  }, [])

  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  // Tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false)
        tabHiddenStartRef.current = Date.now()
      } else {
        setIsTabVisible(true)
        if (tabHiddenStartRef.current) {
          const duration = Date.now() - tabHiddenStartRef.current
          setTabHiddenDuration(duration)
          tabHiddenStartRef.current = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    isContextLost,
    contextLostMessage: config.contextLostMessage,
    attemptRestore,
    isPerformanceDegraded,
    currentFPS,
    degradationLevel,
    isTabVisible,
    tabHiddenDuration,
    startMonitoring,
    stopMonitoring,
  }
}
