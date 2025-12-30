import { FileText, Compass, Github, Mail, ExternalLink } from "lucide-react"

interface GoDeeperTabProps {
  onOpenResume: () => void
  onOpenProcess: () => void
}

export function GoDeeperTab({ onOpenResume, onOpenProcess }: GoDeeperTabProps) {
  return (
    <div className="space-y-6">
      {/* Mini bio header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--lab-accent)] to-blue-600 flex items-center justify-center text-[var(--lab-bg)] font-semibold text-lg">
          RL
        </div>
        <div>
          <h4 className="text-white font-semibold">Randall LaPoint, Jr.</h4>
          <p className="text-sm text-[var(--lab-text-muted)]">
            15 years teaching math. MS in Mathematics. Now building interactive learning tools.
          </p>
        </div>
      </div>

      {/* Link cards */}
      <div className="space-y-2">
        <button
          onClick={onOpenResume}
          className="w-full flex items-center gap-3 p-3 min-h-[44px] rounded-lg bg-[var(--lab-bg-elevated)]/50 hover:bg-[var(--lab-bg-elevated)] border border-[var(--lab-border)] hover:border-[var(--lab-text-dim)] transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--lab-surface-elevated)] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[var(--lab-accent)]" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-[var(--lab-accent)] transition-colors">
              Resume
            </div>
            <div className="text-sm text-[var(--lab-text-dim)]">
              Education, experience, skills
            </div>
          </div>
        </button>

        <button
          onClick={onOpenProcess}
          className="w-full flex items-center gap-3 p-3 min-h-[44px] rounded-lg bg-[var(--lab-bg-elevated)]/50 hover:bg-[var(--lab-bg-elevated)] border border-[var(--lab-border)] hover:border-[var(--lab-text-dim)] transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--lab-surface-elevated)] flex items-center justify-center">
            <Compass className="w-5 h-5 text-[var(--lab-accent)]" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-[var(--lab-accent)] transition-colors">
              Design Process
            </div>
            <div className="text-sm text-[var(--lab-text-dim)]">
              How I approached this module
            </div>
          </div>
        </button>

        <a
          href="https://github.com/Lokie-ree/creative-lab"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 p-3 min-h-[44px] rounded-lg bg-[var(--lab-bg-elevated)]/50 hover:bg-[var(--lab-bg-elevated)] border border-[var(--lab-border)] hover:border-[var(--lab-text-dim)] transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--lab-surface-elevated)] flex items-center justify-center">
            <Github className="w-5 h-5 text-[var(--lab-accent)]" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-[var(--lab-accent)] transition-colors">
              Source Code
            </div>
            <div className="text-sm text-[var(--lab-text-dim)]">
              GitHub repository
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-[var(--lab-text-dim)] group-hover:text-[var(--lab-text-muted)]" />
        </a>

        <a
          href="mailto:rplapointjr@gmail.com"
          className="w-full flex items-center gap-3 p-3 min-h-[44px] rounded-lg bg-[var(--lab-bg-elevated)]/50 hover:bg-[var(--lab-bg-elevated)] border border-[var(--lab-border)] hover:border-[var(--lab-text-dim)] transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--lab-surface-elevated)] flex items-center justify-center">
            <Mail className="w-5 h-5 text-[var(--lab-accent)]" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-[var(--lab-accent)] transition-colors">
              Get in Touch
            </div>
            <div className="text-sm text-[var(--lab-text-dim)]">
              rplapointjr@gmail.com
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-[var(--lab-text-dim)] group-hover:text-[var(--lab-text-muted)]" />
        </a>
      </div>
    </div>
  )
}
