import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Lightbulb } from "lucide-react"
import { fadeInSlideUp } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface FeedbackBannerProps {
  correct: boolean
  onContinue: () => void
  className?: string
}

export function FeedbackBanner({
  correct,
  onContinue,
  className = "",
}: FeedbackBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Entrance animation with GSAP
  useGSAP(() => {
    if (containerRef.current) {
      fadeInSlideUp(containerRef.current)
    }
  }, { dependencies: [correct], scope: containerRef })

  // Warm amber for "learning moment" state, accent green for correct
  const bgColor = correct ? "bg-(--lab-accent)/20" : "bg-(--lab-accent-warm)/20"
  const borderColor = correct ? "border-(--lab-accent)" : "border-(--lab-accent-warm)"
  const textColor = correct ? "text-(--lab-accent)" : "text-(--lab-accent-warm)"
  const iconColor = correct ? "text-(--lab-accent)" : "text-(--lab-accent-warm)"

  return (
    <Alert
      ref={containerRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-(--z-fixed) rounded-none border-x-0 border-b-0",
        bgColor,
        borderColor,
        className
      )}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-3 py-2.5 sm:py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {correct ? (
            <CheckCircle2 className={cn("h-5 w-5 sm:h-6 sm:w-6 shrink-0", iconColor)} />
          ) : (
            <Lightbulb className={cn("h-5 w-5 sm:h-6 sm:w-6 shrink-0", iconColor)} />
          )}
          <AlertDescription className={cn("text-sm sm:text-base md:text-lg font-medium whitespace-nowrap", textColor)}>
            {correct ? "That's it!" : "Not quite — try again"}
          </AlertDescription>
        </div>

        <button
          onClick={onContinue}
          className={cn(
            "w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-lg font-medium transition-colors text-sm sm:text-base",
            correct
              ? "bg-(--lab-accent) text-(--lab-bg) hover:bg-(--lab-accent-hover)"
              : "bg-(--lab-accent-warm) text-(--lab-bg) hover:bg-(--lab-accent-warm-hover)"
          )}
        >
          {correct ? "Continue" : "Try Again"}
        </button>
      </div>
    </Alert>
  )
}
