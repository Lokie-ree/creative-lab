import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { colors } from "@/lib/colors"

interface FormulaPreviewProps {
  discoveries: {
    amplitude: number | null
    frequency: number | null
    phase: number | null
  }
  className?: string
}

export function FormulaPreview({ discoveries, className = "" }: FormulaPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const amplitudeRef = useRef<HTMLSpanElement>(null)
  const frequencyRef = useRef<HTMLSpanElement>(null)
  const phaseRef = useRef<HTMLSpanElement>(null)

  const formatPhase = (value: number) => {
    const piMultiple = value / Math.PI
    if (Math.abs(piMultiple) < 0.01) return "0"
    if (Math.abs(piMultiple - 0.5) < 0.01) return "π/2"
    if (Math.abs(piMultiple - 1) < 0.01) return "π"
    if (Math.abs(piMultiple + 1) < 0.01) return "-π"
    return `${piMultiple.toFixed(2)}π`
  }

  // Animate amplitude reveal
  useGSAP(() => {
    if (discoveries.amplitude !== null && amplitudeRef.current) {
      gsap.fromTo(
        amplitudeRef.current,
        { scale: 1.3, color: colors.accent.primary },
        { scale: 1, color: colors.accent.primary, duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, { dependencies: [discoveries.amplitude], scope: containerRef })

  // Animate frequency reveal
  useGSAP(() => {
    if (discoveries.frequency !== null && frequencyRef.current) {
      gsap.fromTo(
        frequencyRef.current,
        { scale: 1.3, color: colors.accent.primary },
        { scale: 1, color: colors.accent.primary, duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, { dependencies: [discoveries.frequency], scope: containerRef })

  // Animate phase reveal
  useGSAP(() => {
    if (discoveries.phase !== null && phaseRef.current) {
      gsap.fromTo(
        phaseRef.current,
        { scale: 1.3, color: colors.accent.primary },
        { scale: 1, color: colors.accent.primary, duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, { dependencies: [discoveries.phase], scope: containerRef })

  // Don't show until at least one discovery
  const hasAnyDiscovery = discoveries.amplitude !== null ||
                          discoveries.frequency !== null ||
                          discoveries.phase !== null

  if (!hasAnyDiscovery) return null

  return (
    <div
      ref={containerRef}
      className={`
        bg-[var(--lab-surface)]/90 backdrop-blur-sm border border-[var(--lab-border)] rounded-xl
        px-4 py-3 font-mono text-lg
        ${className}
      `}
    >
      <div className="text-[var(--lab-text-muted)] text-xs uppercase tracking-wider mb-1">
        You're building
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[var(--lab-text-muted)]">y</span>
        <span className="text-[var(--lab-text-muted)]">=</span>

        {/* Amplitude */}
        <span
          ref={amplitudeRef}
          className={discoveries.amplitude !== null ? "text-[var(--lab-accent)]" : "text-[var(--lab-text-muted)]"}
        >
          {discoveries.amplitude !== null ? discoveries.amplitude.toFixed(1) : "?"}
        </span>

        <span className="text-[var(--lab-text-muted)]">×</span>
        <span className="text-[var(--lab-text-muted)]">sin(</span>

        {/* Frequency */}
        <span
          ref={frequencyRef}
          className={discoveries.frequency !== null ? "text-[var(--lab-accent)]" : "text-[var(--lab-text-muted)]"}
        >
          {discoveries.frequency !== null ? discoveries.frequency.toFixed(1) : "?"}
        </span>

        <span className="text-[var(--lab-text-muted)]">t</span>
        <span className="text-[var(--lab-text-muted)]">+</span>

        {/* Phase */}
        <span
          ref={phaseRef}
          className={discoveries.phase !== null ? "text-[var(--lab-accent)]" : "text-[var(--lab-text-muted)]"}
        >
          {discoveries.phase !== null ? formatPhase(discoveries.phase) : "?"}
        </span>

        <span className="text-[var(--lab-text-muted)]">)</span>
      </div>
    </div>
  )
}
