import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

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
        { scale: 1.3, color: "#c8e44c" },
        { scale: 1, color: "#c8e44c", duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, { dependencies: [discoveries.amplitude], scope: containerRef })

  // Animate frequency reveal
  useGSAP(() => {
    if (discoveries.frequency !== null && frequencyRef.current) {
      gsap.fromTo(
        frequencyRef.current,
        { scale: 1.3, color: "#c8e44c" },
        { scale: 1, color: "#c8e44c", duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, { dependencies: [discoveries.frequency], scope: containerRef })

  // Animate phase reveal
  useGSAP(() => {
    if (discoveries.phase !== null && phaseRef.current) {
      gsap.fromTo(
        phaseRef.current,
        { scale: 1.3, color: "#c8e44c" },
        { scale: 1, color: "#c8e44c", duration: 0.4, ease: "back.out(1.7)" }
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
        bg-[#12121a]/90 backdrop-blur-sm border border-[#2a2a3a] rounded-xl
        px-4 py-3 font-mono text-lg
        ${className}
      `}
    >
      <div className="text-[#888888] text-xs uppercase tracking-wider mb-1">
        You're building
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[#888888]">y</span>
        <span className="text-[#888888]">=</span>

        {/* Amplitude */}
        <span
          ref={amplitudeRef}
          className={discoveries.amplitude !== null ? "text-[#c8e44c]" : "text-[#4a5568]"}
        >
          {discoveries.amplitude !== null ? discoveries.amplitude.toFixed(1) : "?"}
        </span>

        <span className="text-[#888888]">×</span>
        <span className="text-[#888888]">sin(</span>

        {/* Frequency */}
        <span
          ref={frequencyRef}
          className={discoveries.frequency !== null ? "text-[#c8e44c]" : "text-[#4a5568]"}
        >
          {discoveries.frequency !== null ? discoveries.frequency.toFixed(1) : "?"}
        </span>

        <span className="text-[#888888]">t</span>
        <span className="text-[#888888]">+</span>

        {/* Phase */}
        <span
          ref={phaseRef}
          className={discoveries.phase !== null ? "text-[#c8e44c]" : "text-[#4a5568]"}
        >
          {discoveries.phase !== null ? formatPhase(discoveries.phase) : "?"}
        </span>

        <span className="text-[#888888]">)</span>
      </div>
    </div>
  )
}
