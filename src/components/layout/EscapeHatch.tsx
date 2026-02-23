import { ChevronDown, Home, FastForward } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EscapeHatchProps {
  onBackToStart: () => void
  onSkipToEnd: () => void
}

export function EscapeHatch({
  onBackToStart,
  onSkipToEnd,
}: EscapeHatchProps) {
  return (
    <div className="fixed top-4 left-4 z-[var(--z-fixed)]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--lab-surface)]/80 text-[var(--lab-ghost)] hover:bg-[var(--lab-surface)] hover:text-[var(--lab-text)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgba(124,200,124,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--lab-bg)]">
            <span className="lab-silk lab-display-font text-[var(--lab-accent)]">Lab</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-48 bg-[var(--lab-surface)] border-[var(--lab-border)]"
        >
          <DropdownMenuItem
            onClick={onBackToStart}
            aria-label="Navigate back to the start page"
            className="text-[var(--lab-text)] focus:bg-[var(--lab-surface-elevated)] focus:text-[var(--lab-text)] cursor-pointer"
          >
            <Home className="w-4 h-4 text-[var(--lab-ghost)]" />
            Back to Start
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onSkipToEnd}
            aria-label="Skip to the end of the module"
            className="text-[var(--lab-text)] focus:bg-[var(--lab-surface-elevated)] focus:text-[var(--lab-text)] cursor-pointer"
          >
            <FastForward className="w-4 h-4 text-[var(--lab-ghost)]" />
            Skip to End
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
