import { CheckCircle } from "lucide-react"
import type { TransformationParams } from '@/lib/types/transforms'
import { CAPSTONE_COMPLETION_COPY } from '@/components/modules/rigid-motions/rigid-motions-copy'

interface DiscoveryTabProps {
  values: Record<string, number> | null
  skipped?: boolean
  moduleId?: string | null
  completedSequence?: TransformationParams[] | null
}

function TransformChip({ params }: { params: TransformationParams }) {
  let label: string
  if (params.type === 'translate') {
    const dx = params.dx >= 0 ? `+${params.dx}` : `${params.dx}`
    const dy = params.dy >= 0 ? `+${params.dy}` : `${params.dy}`
    label = `Translate ${dx}, ${dy}`
  } else if (params.type === 'reflect') {
    label = `Reflect over ${params.axis.toUpperCase()}-axis`
  } else {
    label = `Rotate ${params.degrees}° ${params.direction.toUpperCase()}`
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 border border-[var(--lab-border)] rounded text-sm lab-data-font text-[var(--lab-text)]">
      {label}
    </span>
  )
}

function RigidMotionsDiscovery({ completedSequence }: { completedSequence: TransformationParams[] }) {
  // Determine which capstone round based on sequence
  const roundId = completedSequence.length === 1
    ? 'capstone-1'
    : completedSequence[0]?.type === 'reflect'
    ? 'capstone-2'
    : 'capstone-3'

  const completionCopy = CAPSTONE_COMPLETION_COPY[roundId] ?? 'You built the sequence.'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--lab-accent)]/20 mb-4">
          <CheckCircle className="w-8 h-8 text-[var(--lab-accent)]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-1">You built:</h3>
        <p className="text-[var(--lab-text-muted)] text-sm">Through construction, not selection</p>
      </div>

      {/* Sequence chips */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {completedSequence.map((params, i) => (
          <span key={i} className="contents">
            {i > 0 && <span className="lab-data-font text-[var(--lab-text-muted)]">→</span>}
            <TransformChip params={params} />
          </span>
        ))}
      </div>

      {/* Completion summary */}
      <p className="text-center text-[var(--lab-text-muted)] text-sm">{completionCopy}</p>
    </div>
  )
}

export function DiscoveryTab({ values, skipped, moduleId, completedSequence }: DiscoveryTabProps) {
  // Rigid motions branch — shown when capstone is complete
  if (moduleId === 'rigid-motions' && completedSequence && completedSequence.length > 0) {
    return <RigidMotionsDiscovery completedSequence={completedSequence} />
  }

  if (skipped || (!values && !(moduleId === 'rigid-motions' && completedSequence?.length))) {
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
          You built:
        </h3>
        <p className="text-[var(--lab-text-muted)] text-sm">
          Through exploration, not explanation
        </p>
      </div>

      {/* Formula display */}
      <div className="bg-[var(--lab-bg-elevated)]/50 rounded-lg p-4 text-center">
        <p className="text-lg sm:text-2xl font-mono text-white break-words">
          y = <span className="text-[var(--lab-accent)]">{values!.a}</span> sin(
          <span className="text-[var(--lab-accent)]">{values!.f}</span>t)
        </p>
      </div>

      {/* Parameter grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-semibold text-[var(--lab-accent)] mb-1">
            {values!.a}
          </div>
          <div className="text-xs text-[var(--lab-text-dim)] uppercase tracking-wide">
            Amplitude
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-[var(--lab-accent)] mb-1">
            {values!.f}
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
