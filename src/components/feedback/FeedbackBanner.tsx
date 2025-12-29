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
  const bgColor = correct ? "bg-[#c8e44c]/20" : "bg-[#f5a623]/20"
  const borderColor = correct ? "border-[#c8e44c]" : "border-[#f5a623]"
  const textColor = correct ? "text-[#c8e44c]" : "text-[#f5a623]"
  const iconColor = correct ? "text-[#c8e44c]" : "text-[#f5a623]"

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
            className="px-4 py-2 rounded-lg bg-[#2a2a3a] text-[#888888] hover:text-[#e0e0e0] transition-colors"
          >
            Why?
          </button>
          <button
            onClick={onContinue}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${correct
                ? "bg-[#c8e44c] text-[#0a0a0f] hover:bg-[#d4f06a]"
                : "bg-[#f5a623] text-[#0a0a0f] hover:bg-[#f7b84a]"
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
