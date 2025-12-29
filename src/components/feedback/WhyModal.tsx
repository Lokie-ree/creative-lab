import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

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
  const accentColor = isCorrect ? "#c8e44c" : "#f5a623"

  const handleTryAgain = () => {
    onClose()
    onTryAgain?.()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[#12121a] border-[#2a2a3a] text-[#e0e0e0] max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: accentColor }}>{title}</DialogTitle>
          <DialogDescription className="text-[#e0e0e0] text-base leading-relaxed pt-2">
            {content}
          </DialogDescription>
        </DialogHeader>

        {isCorrect ? (
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-3 rounded-lg bg-[#c8e44c] text-[#0a0a0f] font-medium hover:bg-[#d4f06a] transition-colors"
          >
            Got it
          </button>
        ) : (
          <button
            onClick={handleTryAgain}
            className="mt-4 w-full px-4 py-3 rounded-lg bg-[#f5a623] text-[#0a0a0f] font-medium hover:bg-[#f7b84a] transition-colors"
          >
            Try Again
          </button>
        )}
      </DialogContent>
    </Dialog>
  )
}
