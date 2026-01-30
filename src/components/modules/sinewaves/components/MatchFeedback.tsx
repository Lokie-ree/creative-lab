// src/components/modules/sinewaves/components/MatchFeedback.tsx
import { useRef, useEffect } from 'react'
import { ContinueButton } from './ContinueButton'
import { matchSuccessSequence, type MatchSuccessRefs } from '../animations'

interface MatchFeedbackProps {
  message: string
  onContinue: () => void
  isVisible: boolean
}

/**
 * Match celebration feedback with staged reveal animation
 * Shows celebratory message and continue button after user matches target
 */
export function MatchFeedback({
  message,
  onContinue,
  isVisible,
}: MatchFeedbackProps) {
  const feedbackRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true

      // Run staged reveal animation
      const refs: MatchSuccessRefs = {
        visualization: null, // Scene handles its own glow
        feedback: feedbackRef.current,
        continueButton: buttonRef.current,
      }

      // Start with elements hidden
      if (feedbackRef.current) {
        feedbackRef.current.style.opacity = '0'
      }
      if (buttonRef.current) {
        buttonRef.current.style.opacity = '0'
      }

      matchSuccessSequence(refs, () => {
        // Animation complete
      })
    }

    // Reset when hidden
    if (!isVisible) {
      hasAnimated.current = false
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Feedback message */}
      <div
        ref={feedbackRef}
        className="text-center"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--lab-earned)',
          fontSize: '0.95rem',
        }}
        role="alert"
        aria-live="assertive"
      >
        {message}
      </div>

      {/* Continue button */}
      <ContinueButton ref={buttonRef} onClick={onContinue} />
    </div>
  )
}
