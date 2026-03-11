import { Compass, Github, ExternalLink } from "lucide-react"

interface GoDeeperTabProps {
  onOpenProcess: () => void
}

export function GoDeeperTab({ onOpenProcess }: GoDeeperTabProps) {
  return (
    <div className="space-y-6">
      {/* Link cards */}
      <div className="space-y-2">
        <button
          onClick={onOpenProcess}
          className="w-full flex items-center gap-3 p-3 min-h-[44px] border border-(--lab-border) bg-(--lab-bg) hover:border-(--lab-text-muted) transition-colors duration-150 text-left group"
        >
          <div className="w-10 h-10 border border-(--lab-border) bg-(--lab-surface) flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-(--lab-accent)" />
          </div>
          <div className="flex-1">
            <div className="lab-display-font text-sm font-medium text-(--lab-text) group-hover:text-(--lab-accent) transition-colors duration-150">
              Design Process
            </div>
            <div className="lab-silk lab-display-font text-(--lab-text-muted) mt-0.5">
              How I approached this module
            </div>
          </div>
        </button>

        <a
          href="https://github.com/Lokie-ree/creative-lab"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 p-3 min-h-[44px] border border-(--lab-border) bg-(--lab-bg) hover:border-(--lab-text-muted) transition-colors duration-150 text-left group"
        >
          <div className="w-10 h-10 border border-(--lab-border) bg-(--lab-surface) flex items-center justify-center shrink-0">
            <Github className="w-5 h-5 text-(--lab-accent)" />
          </div>
          <div className="flex-1">
            <div className="lab-display-font text-sm font-medium text-(--lab-text) group-hover:text-(--lab-accent) transition-colors duration-150">
              Source Code
            </div>
            <div className="lab-silk lab-display-font text-(--lab-text-muted) mt-0.5">
              GitHub repository
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-(--lab-ghost) group-hover:text-(--lab-text-muted)" />
        </a>

      </div>
    </div>
  )
}
