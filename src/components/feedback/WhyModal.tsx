import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { colors } from "@/lib/colors"

interface WhyModalProps {
  open: boolean
  onClose: () => void
  content: string
  isCorrect: boolean
  onTryAgain?: () => void
}

export function WhyModal({
  open,
  onClose,
  content,
  isCorrect,
  onTryAgain,
}: WhyModalProps) {
  const title = isCorrect ? "Here's why that works" : "Here's what's happening"
  const accentColor = isCorrect ? colors.accent.primary : colors.learning.primary

  const handleTryAgain = () => {
    onClose()
    onTryAgain?.()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[var(--lab-surface)] border-[var(--lab-border)] text-[var(--lab-text)] max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: accentColor }}>{title}</DialogTitle>
          <DialogDescription className="text-[var(--lab-text)] text-base leading-relaxed pt-2">
            {content}
          </DialogDescription>
        </DialogHeader>

        {isCorrect ? (
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-3 rounded-lg bg-[var(--lab-accent)] text-[var(--lab-bg)] font-medium hover:bg-[var(--lab-accent-hover)] transition-colors"
          >
            Got it
          </button>
        ) : (
          <button
            onClick={handleTryAgain}
            className="mt-4 w-full px-4 py-3 rounded-lg bg-[var(--lab-accent-warm)] text-[var(--lab-bg)] font-medium hover:bg-[var(--lab-accent-warm-hover)] transition-colors"
          >
            Try Again
          </button>
        )}
      </DialogContent>
    </Dialog>
  )
}
