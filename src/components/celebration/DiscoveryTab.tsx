import { CheckCircle } from "lucide-react"

interface DiscoveryTabProps {
  values: { a: number; f: number; p: number } | null
  skipped?: boolean
}

function formatPhase(p: number): string {
  if (p === 0) return "0"
  if (Math.abs(p - Math.PI / 4) < 0.01) return "π/4"
  if (Math.abs(p - Math.PI / 2) < 0.01) return "π/2"
  if (Math.abs(p - (3 * Math.PI / 4)) < 0.01) return "3π/4"
  if (Math.abs(p - Math.PI) < 0.01) return "π"
  return p.toFixed(2)
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
          y = <span className="text-[var(--lab-accent)]">{values.a}</span> × sin(
          <span className="text-[var(--lab-accent)]">{values.f}</span>t +
          <span className="text-[var(--lab-accent)]">{formatPhase(values.p)}</span>)
        </p>
      </div>

      {/* Parameter grid */}
      <div className="grid grid-cols-3 gap-4">
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
        <div className="text-center">
          <div className="text-3xl font-semibold text-[var(--lab-accent)] mb-1">
            {formatPhase(values.p)}
          </div>
          <div className="text-xs text-[var(--lab-text-dim)] uppercase tracking-wide">
            Phase
          </div>
        </div>
      </div>
    </div>
  )
}
