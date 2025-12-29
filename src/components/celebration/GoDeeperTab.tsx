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
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
          RL
        </div>
        <div>
          <h4 className="text-white font-semibold">Randall LaPoint, Jr.</h4>
          <p className="text-sm text-zinc-400">
            15 years teaching math. MS in Mathematics. Now building interactive learning tools.
          </p>
        </div>
      </div>

      {/* Link cards */}
      <div className="space-y-2">
        <button
          onClick={onOpenResume}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
              Resume
            </div>
            <div className="text-sm text-zinc-500">
              Education, experience, skills
            </div>
          </div>
        </button>

        <button
          onClick={onOpenProcess}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
            <Compass className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
              Design Process
            </div>
            <div className="text-sm text-zinc-500">
              How I approached this module
            </div>
          </div>
        </button>

        <a
          href="https://github.com/Lokie-ree/creative-lab"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
            <Github className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
              Source Code
            </div>
            <div className="text-sm text-zinc-500">
              GitHub repository
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
        </a>

        <a
          href="mailto:rplapointjr@gmail.com"
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
              Get in Touch
            </div>
            <div className="text-sm text-zinc-500">
              rplapointjr@gmail.com
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
        </a>
      </div>
    </div>
  )
}
