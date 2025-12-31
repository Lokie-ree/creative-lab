import { CheckCircle } from "lucide-react"

interface DiscoveryTabProps {
  values: { a: number; f: number } | null
  skipped?: boolean
}

export function DiscoveryTab({ values, skipped }: DiscoveryTabProps) {
  if (skipped || !values) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--lab-text-muted)] text-lg">
          Complete the challenge to see your results
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--lab-accent)]/20 mb-4">
          <CheckCircle className="w-8 h-8 text-[var(--lab-accent)]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-1">
          You built the equation
        </h3>
        <p className="text-[var(--lab-text-muted)] text-sm">
          Through exploration, not explanation
        </p>
      </div>

      {/* Formula display */}
      <div className="bg-[var(--lab-bg-elevated)]/50 rounded-lg p-4 text-center">
        <p className="text-lg sm:text-2xl font-mono text-white break-words">
          y = <span className="text-[var(--lab-accent)]">{values.a}</span> sin(
          <span className="text-[var(--lab-accent)]">{values.f}</span>t)
        </p>
      </div>

      {/* Parameter grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-semibold text-[var(--lab-accent)] mb-1">
            {values.a}
          </div>
          <div className="text-xs text-[var(--lab-text-dim)] uppercase tracking-wide">
            Amplitude
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-[var(--lab-accent)] mb-1">
            {values.f}
          </div>
          <div className="text-xs text-[var(--lab-text-dim)] uppercase tracking-wide">
            Frequency
          </div>
        </div>
      </div>

      {/* Understanding summary */}
      <div className="text-center text-[var(--lab-text-muted)] text-sm">
        <p>Amplitude controls how far from center.</p>
        <p>Frequency controls how fast it spins.</p>
      </div>
    </div>
  )
}
