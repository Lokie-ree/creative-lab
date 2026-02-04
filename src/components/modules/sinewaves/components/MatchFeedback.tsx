// src/components/modules/sinewaves/components/MatchFeedback.tsx
import { useRef, useEffect } from 'react'
import { ContinueButton } from './ContinueButton'
import { matchSuccessSequence, type MatchSuccessRefs } from '../animations'

interface MatchFeedbackProps {
  message: string
  onContinue: () => void
  isVisible: boolean
  /** Optional: ref to visualization container for pulse animation */
  visualizationRef?: React.RefObject<HTMLElement | null>
  /** Optional: matched value to highlight (e.g. 1.5) */
  matchedValue?: number
  /** Optional: label for the matched value (e.g. "Amplitude") */
  matchedLabel?: string
}

/**
 * Match celebration feedback with staged reveal animation
 * Sequence: pulse viz → value highlight → contextual message → continue button
 */
export function MatchFeedback({
  message,
  onContinue,
  isVisible,
  visualizationRef,
  matchedValue,
  matchedLabel,
}: MatchFeedbackProps) {
  const feedbackRef = useRef<HTMLDivElement>(null)
  const valueHighlightRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true

      const refs: MatchSuccessRefs = {
        visualization: visualizationRef?.current ?? null,
        valueHighlight: valueHighlightRef.current,
        feedback: feedbackRef.current,
        continueButton: buttonRef.current,
      }

      if (feedbackRef.current) feedbackRef.current.style.opacity = '0'
      if (buttonRef.current) buttonRef.current.style.opacity = '0'

      matchSuccessSequence(refs, () => {})
    }

    if (!isVisible) hasAnimated.current = false
  }, [isVisible, visualizationRef])

  if (!isVisible) return null

  return (
    <div className="flex w-full flex-col items-center gap-2 sm:gap-3 md:gap-4">
      {/* Optional matched value highlight (glows cyan in sequence) */}
      {(matchedValue !== undefined || matchedLabel) && (
        <div className="text-center text-xs font-[family-name:var(--font-data)] text-(--lab-text-muted) sm:text-sm">
          {matchedLabel && <span>{matchedLabel} </span>}
          <span
            ref={valueHighlightRef}
            className="font-medium text-(--lab-accent)"
          >
            {matchedValue !== undefined ? matchedValue.toFixed(1) : ''}
          </span>
        </div>
      )}

      {/* Contextual message */}
      <div
        ref={feedbackRef}
        className="text-center text-sm font-[family-name:var(--font-body)] text-(--lab-earned) sm:text-base"
        role="alert"
        aria-live="assertive"
      >
        {message}
      </div>

      <ContinueButton ref={buttonRef} onClick={onContinue} />
    </div>
  )
}
