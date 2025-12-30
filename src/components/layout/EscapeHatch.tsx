import { ChevronDown, Home, FileText, FastForward } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface EscapeHatchProps {
  onBackToStart: () => void
  onViewResume: () => void
  onSkipToEnd: () => void
}

export function EscapeHatch({
  onBackToStart,
  onViewResume,
  onSkipToEnd,
}: EscapeHatchProps) {
  return (
    <div className="fixed top-4 left-4 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-semibold">
                R
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">Randall LaPoint</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 bg-zinc-900 border-zinc-800"
        >
          <DropdownMenuItem
            onClick={onBackToStart}
            className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <Home className="w-4 h-4 text-zinc-500" />
            Back to Start
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onViewResume}
            className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <FileText className="w-4 h-4 text-zinc-500" />
            View Resume
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={onSkipToEnd}
            className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <FastForward className="w-4 h-4 text-zinc-500" />
            Skip to End
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
