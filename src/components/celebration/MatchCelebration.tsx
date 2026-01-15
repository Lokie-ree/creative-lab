import { useRef, useState, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { fadeInScale, fadeOutScale } from "@/lib/animations"

interface MatchCelebrationProps {
  message: string
  onContinue?: () => void
  autoTransitionDelay?: number
  onAutoTransition?: () => void
}

export function MatchCelebration({
  message,
  onContinue,
  autoTransitionDelay = 2000,
  onAutoTransition,
}: MatchCelebrationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [timeRemaining, setTimeRemaining] = useState(autoTransitionDelay / 1000)
  const [showContinue, setShowContinue] = useState(false)

  // Entrance animation
  useGSAP(() => {
    if (containerRef.current) {
      fadeInScale(containerRef.current)
    }
  }, { dependencies: [], scope: containerRef })

  // Countdown and auto-transition
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, (autoTransitionDelay - elapsed) / 1000)
      setTimeRemaining(Math.ceil(remaining))

      // Show continue button after 1 second
      if (elapsed >= 1000 && !showContinue) {
        setShowContinue(true)
      }

      // Auto-transition when time is up
      if (elapsed >= autoTransitionDelay) {
        clearInterval(interval)
        if (onAutoTransition) {
          // Animate out before transitioning
          if (containerRef.current) {
            const animation = fadeOutScale(containerRef.current)
            if (animation) {
              animation.eventCallback("onComplete", () => {
                onAutoTransition()
              })
            } else {
              onAutoTransition()
            }
          } else {
            onAutoTransition()
          }
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [autoTransitionDelay, onAutoTransition, showContinue])

  const handleContinue = () => {
    if (onContinue && containerRef.current) {
      const animation = fadeOutScale(containerRef.current)
      if (animation) {
        animation.eventCallback("onComplete", () => {
          onContinue()
        })
      } else {
        onContinue()
      }
    } else if (onContinue) {
      onContinue()
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-20 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-(--z-content) px-4"
    >
      <Card className="bg-(--lab-surface)/90 backdrop-blur-md border border-(--lab-accent)/30">
        <CardContent className="pt-6 pb-4 px-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-(--lab-accent)" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-(--lab-accent) mb-2">
                Perfect match!
              </div>
              <div className="text-sm sm:text-base text-(--lab-accent) font-medium">
                {message}
              </div>
            </div>
            {showContinue && (
              <button
                onClick={handleContinue}
                className="mt-2 px-4 py-2 bg-(--lab-accent) text-(--lab-bg) rounded-lg font-medium hover:bg-(--lab-accent-hover) transition-colors"
              >
                Continue
              </button>
            )}
            {timeRemaining > 0 && (
              <div className="text-xs text-(--lab-text-muted) mt-1">
                Auto-continuing in {timeRemaining}...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
