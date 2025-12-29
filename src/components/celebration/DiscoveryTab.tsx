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
        <p className="text-zinc-400 text-lg">
          Complete the challenge to see your results
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
          <CheckCircle className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-1">
          You built the equation
        </h3>
        <p className="text-zinc-400 text-sm">
          Through exploration, not explanation
        </p>
      </div>

      {/* Formula display */}
      <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
        <p className="text-2xl font-mono text-white">
          y = <span className="text-cyan-400">{values.a}</span> × sin(
          <span className="text-cyan-400">{values.f}</span>t +
          <span className="text-cyan-400">{formatPhase(values.p)}</span>)
        </p>
      </div>

      {/* Parameter grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-semibold text-cyan-400 mb-1">
            {values.a}
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">
            Amplitude
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-cyan-400 mb-1">
            {values.f}
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">
            Frequency
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-cyan-400 mb-1">
            {formatPhase(values.p)}
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">
            Phase
          </div>
        </div>
      </div>
    </div>
  )
}
