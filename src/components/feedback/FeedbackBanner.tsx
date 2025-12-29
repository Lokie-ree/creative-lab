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
        fixed bottom-0 left-0 right-0 rounded-none border-x-0 border-b-0
        ${bgColor} ${borderColor}
        animate-in slide-in-from-bottom duration-300
        ${className}
      `}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between py-2 px-4">
        <div className="flex items-center gap-3">
          {correct ? (
            <CheckCircle2 className={`h-6 w-6 ${iconColor}`} />
          ) : (
            <Lightbulb className={`h-6 w-6 ${iconColor}`} />
          )}
          <AlertDescription className={`text-lg font-medium ${textColor}`}>
            {correct ? "That's it!" : "Not this one — let's explore why"}
          </AlertDescription>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onWhy}
            className="px-4 py-2 rounded-lg bg-[var(--lab-bg-elevated)] text-[var(--lab-text-muted)] hover:text-[var(--lab-text)] transition-colors"
          >
            Why?
          </button>
          <button
            onClick={onContinue}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
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
