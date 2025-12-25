import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

interface FeedbackBannerProps {
  correct: boolean
  onWhy?: () => void
  onContinue: () => void
  className?: string
}

export function FeedbackBanner({
  correct,
  onWhy,
  onContinue,
  className = "",
}: FeedbackBannerProps) {
  return (
    <Alert
      className={`
        fixed bottom-0 left-0 right-0 rounded-none border-x-0 border-b-0
        ${correct ? "bg-[#c8e44c]/20 border-[#c8e44c]" : "bg-red-500/20 border-red-500"}
        ${className}
      `}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          {correct ? (
            <CheckCircle2 className="h-6 w-6 text-[#c8e44c]" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          <AlertDescription className={`text-lg font-medium ${correct ? "text-[#c8e44c]" : "text-red-400"}`}>
            {correct ? "Correct!" : "Not quite"}
          </AlertDescription>
        </div>

        <div className="flex items-center gap-3">
          {correct && onWhy && (
            <button
              onClick={onWhy}
              className="px-4 py-2 rounded-lg bg-[#2a2a3a] text-[#888888] hover:text-[#e0e0e0] transition-colors"
            >
              Why?
            </button>
          )}
          <button
            onClick={onContinue}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${correct
                ? "bg-[#c8e44c] text-[#0a0a0f] hover:bg-[#d4f06a]"
                : "bg-[#2a2a3a] text-[#e0e0e0] hover:bg-[#3a3a4a]"
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </Alert>
  )
}
