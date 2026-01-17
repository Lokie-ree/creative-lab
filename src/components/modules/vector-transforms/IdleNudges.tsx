/* eslint-disable react-refresh/only-export-components */
/**
 * Vector Transformations Module - Idle Nudges & Hints
 *
 * Guidance system for users who seem stuck.
 * Includes tooltips, hints, and auto-demo features.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Lightbulb } from 'lucide-react'
import type { Vector2 } from './utils'
import { generateHint } from './utils'

/**
 * Timing configuration (ms)
 */
const INITIAL_IDLE_THRESHOLD = 5000 // 5 seconds for first nudge
const EXTENDED_IDLE_THRESHOLD = 30000 // 30 seconds for auto-demo
const TOOLTIP_DURATION = 5000 // Auto-dismiss after 5s
const CHALLENGE_STUCK_THRESHOLD = 10 // Adjustments before showing hint

/**
 * Tooltip Component
 *
 * Positioned tooltip with arrow pointer for guidance.
 */
interface TooltipProps {
  /** Text to display */
  text: string
  /** Whether tooltip is visible */
  visible: boolean
  /** Position relative to viewport */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Callback when dismissed */
  onDismiss: () => void
  /** Additional CSS classes */
  className?: string
}

export function Tooltip({
  text,
  visible,
  position = 'top',
  onDismiss,
  className,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Auto-dismiss timer
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, TOOLTIP_DURATION)
      return () => clearTimeout(timer)
    }
  }, [visible, onDismiss])

  // Entrance animation
  useGSAP(
    () => {
      if (visible && tooltipRef.current) {
        gsap.fromTo(
          tooltipRef.current,
          { opacity: 0, y: position === 'top' ? 10 : -10 },
          { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
        )
      }
    },
    { dependencies: [visible], scope: tooltipRef }
  )

  if (!visible) return null

  return (
    <div
      ref={tooltipRef}
      className={cn(
        'absolute z-30 px-3 py-2 rounded-md',
        'bg-[var(--lab-surface-elevated)] border border-[var(--lab-accent)]/50',
        'text-xs text-[var(--lab-text)]',
        'shadow-lg',
        className
      )}
      role="tooltip"
      aria-live="polite"
    >
      {text}
      {/* Arrow pointer */}
      <div
        className={cn(
          'absolute w-2 h-2 bg-[var(--lab-surface-elevated)] border-[var(--lab-accent)]/50',
          'transform rotate-45',
          position === 'top' && '-bottom-1 left-1/2 -translate-x-1/2 border-b border-r',
          position === 'bottom' && '-top-1 left-1/2 -translate-x-1/2 border-t border-l'
        )}
      />
    </div>
  )
}

/**
 * Hint Button & Display
 *
 * Shows hint button when user is stuck in challenge mode.
 */
interface HintSystemProps {
  /** Whether hint should be available */
  available: boolean
  /** Current transformed vector */
  currentVector: Vector2
  /** Target vector */
  targetVector: Vector2
  /** Additional CSS classes */
  className?: string
}

export function HintSystem({
  available,
  currentVector,
  targetVector,
  className,
}: HintSystemProps) {
  const [showHint, setShowHint] = useState(false)
  const [hintText, setHintText] = useState<string | null>(null)

  // Generate hint when requested
  const handleShowHint = useCallback(() => {
    const hint = generateHint(currentVector, targetVector)
    setHintText(hint)
    setShowHint(true)
  }, [currentVector, targetVector])

  // Reset when availability changes
  useEffect(() => {
    if (!available) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowHint(false)
       
      setHintText(null)
    }
  }, [available])

  if (!available) return null

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {!showHint ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShowHint}
          className="text-[var(--lab-text-dim)] hover:text-[var(--lab-text)] flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Show Hint
        </Button>
      ) : (
        <div className="flex items-start gap-2 text-sm text-[var(--lab-text-dim)]">
          <Lightbulb className="h-4 w-4 mt-0.5 text-[var(--lab-accent)]" />
          <span>{hintText}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Initial Nudge Component
 *
 * Shows a pulsing indicator on the first slider when user hasn't interacted.
 */
interface InitialNudgeProps {
  /** Whether nudge should be shown */
  visible: boolean
  /** Callback when dismissed */
  onDismiss: () => void
}

export function InitialNudge({ visible, onDismiss }: InitialNudgeProps) {
  if (!visible) return null

  return (
    <Tooltip
      text="Try dragging this →"
      visible={visible}
      position="top"
      onDismiss={onDismiss}
      className="top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2"
    />
  )
}

/**
 * Hook for managing idle state and nudges
 */
interface UseIdleNudgesOptions {
  /** Whether challenge mode is active */
  isChallengeMode: boolean
  /** Number of slider adjustments made */
  adjustmentCount: number
  /** Callback when auto-demo should trigger */
  onAutoDemo?: () => void
}

export function useIdleNudges({
  isChallengeMode,
  adjustmentCount,
  onAutoDemo,
}: UseIdleNudgesOptions) {
  const [showInitialNudge, setShowInitialNudge] = useState(false)
  const [showChallengeHint, setShowChallengeHint] = useState(false)
  const [hasAutoAnimated, setHasAutoAnimated] = useState(false)

  // eslint-disable-next-line react-hooks/purity
  const lastInteractionRef = useRef<number>(Date.now())
  const challengeAdjustmentsRef = useRef<number>(0)

  // Reset interaction timer
  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now()
    setShowInitialNudge(false)
  }, [])

  // Track challenge adjustments
  const recordChallengeAdjustment = useCallback(() => {
    challengeAdjustmentsRef.current++
    if (challengeAdjustmentsRef.current >= CHALLENGE_STUCK_THRESHOLD) {
      setShowChallengeHint(true)
    }
  }, [])

  // Reset challenge tracking
  const resetChallengeTracking = useCallback(() => {
    challengeAdjustmentsRef.current = 0
    setShowChallengeHint(false)
  }, [])

  // Check for idle states
  useEffect(() => {
    const checkIdle = setInterval(() => {
      const idleTime = Date.now() - lastInteractionRef.current

      // Initial nudge (5s without interaction, no adjustments yet)
      if (idleTime >= INITIAL_IDLE_THRESHOLD && adjustmentCount === 0) {
        setShowInitialNudge(true)
      }

      // Extended idle auto-demo (30s without interaction)
      if (idleTime >= EXTENDED_IDLE_THRESHOLD && !hasAutoAnimated && !isChallengeMode) {
        setHasAutoAnimated(true)
        onAutoDemo?.()
      }
    }, 1000)

    return () => clearInterval(checkIdle)
  }, [adjustmentCount, hasAutoAnimated, isChallengeMode, onAutoDemo])

  // Dismiss initial nudge
  const dismissInitialNudge = useCallback(() => {
    setShowInitialNudge(false)
  }, [])

  return {
    showInitialNudge,
    showChallengeHint,
    recordInteraction,
    recordChallengeAdjustment,
    resetChallengeTracking,
    dismissInitialNudge,
  }
}

/**
 * Explore Prompt Component
 *
 * Shows contextual instructions at the top of the canvas.
 */
interface ExplorePromptProps {
  /** Main prompt text */
  text: string
  /** Optional subtext */
  subtext?: string
  /** Whether prompt is visible */
  visible?: boolean
  /** Additional CSS classes */
  className?: string
}

export function ExplorePrompt({
  text,
  subtext,
  visible = true,
  className,
}: ExplorePromptProps) {
  const promptRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (visible && promptRef.current) {
        gsap.fromTo(
          promptRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        )
      }
    },
    { dependencies: [visible], scope: promptRef }
  )

  if (!visible) return null

  return (
    <div
      ref={promptRef}
      className={cn(
        'bg-[var(--lab-surface)]/80 backdrop-blur-sm',
        'border border-[var(--lab-border)] rounded-xl',
        'px-4 py-3 text-center',
        className
      )}
    >
      <p className="text-sm text-[var(--lab-text)]">{text}</p>
      {subtext && (
        <p className="text-xs text-[var(--lab-text-muted)] mt-1">{subtext}</p>
      )}
    </div>
  )
}

export default {
  Tooltip,
  HintSystem,
  InitialNudge,
  ExplorePrompt,
  useIdleNudges,
}
