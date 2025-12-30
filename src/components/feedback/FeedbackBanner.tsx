import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Lightbulb } from "lucide-react"

interface FeedbackBannerProps {
  correct: boolean
  onWhy: () => void
  onContinue: () => void
  className?: string
}

export function FeedbackBanner({
  correct,
  onWhy,
  onContinue,
  className = "",
}: FeedbackBannerProps) {
  // Warm amber for "learning moment" state, accent green for correct
  const bgColor = correct ? "bg-[var(--lab-accent)]/20" : "bg-[var(--lab-accent-warm)]/20"
  const borderColor = correct ? "border-[var(--lab-accent)]" : "border-[var(--lab-accent-warm)]"
  const textColor = correct ? "text-[var(--lab-accent)]" : "text-[var(--lab-accent-warm)]"
  const iconColor = correct ? "text-[var(--lab-accent)]" : "text-[var(--lab-accent-warm)]"

  return (
    <Alert
      className={`
        fixed bottom-0 left-0 right-0 z-30 rounded-none border-x-0 border-b-0
        ${bgColor} ${borderColor}
        animate-in slide-in-from-bottom duration-300
        ${className}
      `}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-3 py-2.5 sm:py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {correct ? (
            <CheckCircle2 className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${iconColor}`} />
          ) : (
            <Lightbulb className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${iconColor}`} />
          )}
          <AlertDescription className={`text-sm sm:text-base md:text-lg font-medium whitespace-nowrap ${textColor}`}>
            {correct ? "That's it!" : "Not quite — let's see why"}
          </AlertDescription>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={onWhy}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg bg-[var(--lab-bg-elevated)] text-[var(--lab-text-muted)] hover:text-[var(--lab-text)] transition-colors text-sm sm:text-base"
          >
            Why?
          </button>
          <button
            onClick={onContinue}
            className={`
              flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-lg font-medium transition-colors text-sm sm:text-base
              ${correct
                ? "bg-[var(--lab-accent)] text-[var(--lab-bg)] hover:bg-[var(--lab-accent-hover)]"
                : "bg-[var(--lab-accent-warm)] text-[var(--lab-bg)] hover:bg-[var(--lab-accent-warm-hover)]"
              }
            `}
          >
            {correct ? "Continue" : "Try Again"}
          </button>
        </div>
      </div>
    </Alert>
  )
}
