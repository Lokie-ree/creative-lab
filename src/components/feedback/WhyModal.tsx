import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

interface WhyModalProps {
  open: boolean
  onClose: () => void
  title?: string
  content: string
}

export function WhyModal({
  open,
  onClose,
  title = "Why?",
  content,
}: WhyModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[#12121a] border-[#2a2a3a] text-[#e0e0e0] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#c8e44c]">{title}</DialogTitle>
          <DialogDescription className="text-[#e0e0e0] text-base leading-relaxed pt-2">
            {content}
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <button className="mt-4 w-full px-4 py-3 rounded-lg bg-[#c8e44c] text-[#0a0a0f] font-medium hover:bg-[#d4f06a] transition-colors">
            Got it
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
