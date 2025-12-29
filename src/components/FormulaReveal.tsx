import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { colors } from "@/lib/colors"
import { CelebrationModal } from "./feedback/CelebrationModal"

interface FormulaRevealProps {
  show: boolean
  values: { a: number; f: number; p: number }
  onDismiss: () => void
  onNewChallenge: () => void
  onStartOver?: () => void
}

export function FormulaReveal({ show, values, onDismiss, onNewChallenge, onStartOver }: FormulaRevealProps) {
  const formulaRef = useRef<HTMLDivElement>(null)

  // Animate formula parts when modal shows
  useGSAP(
    () => {
      if (show && formulaRef.current) {
        const tl = gsap.timeline({ delay: 0.3 }) // Wait for modal animation

        // Animate the formula parts sequentially
        tl.from(
          ".formula-part",
          {
            opacity: 0,
            y: 10,
            stagger: 0.1,
            duration: 0.3,
            ease: "power2.out",
          }
        )

        // Pulse the values
        tl.to(
          ".formula-value",
          {
            scale: 1.1,
            color: colors.accent.primary,
            duration: 0.2,
            stagger: 0.1,
          },
          "-=0.1"
        )
        tl.to(".formula-value", {
          scale: 1,
          duration: 0.2,
          stagger: 0.1,
        })
      }
    },
    { dependencies: [show], scope: formulaRef }
  )

  const formatPhase = (value: number) => {
    const piMultiple = value / Math.PI
    if (Math.abs(piMultiple) < 0.01) return "0"
    if (Math.abs(piMultiple - 1) < 0.01) return "π"
    if (Math.abs(piMultiple + 1) < 0.01) return "-π"
    return `${piMultiple.toFixed(2)}π`
  }

  const actions = [
    {
      label: "Keep Exploring",
      onClick: onDismiss,
      variant: "secondary" as const,
    },
    {
      label: "Try Another",
      onClick: onNewChallenge,
      variant: "primary" as const,
    },
    ...(onStartOver
      ? [
          {
            label: "Start Over",
            onClick: onStartOver,
            variant: "ghost" as const,
          },
        ]
      : []),
  ]

  return (
    <CelebrationModal
      show={show}
      title="Pattern Matched!"
      subtitle="You just built:"
      onDismiss={onDismiss}
      actions={actions}
    >
      <div ref={formulaRef}>
        {/* The formula */}
        <div className="bg-[var(--lab-surface-elevated)] rounded-lg p-6 mb-6 font-mono text-center">
          <div className="text-2xl text-[var(--lab-text)] flex items-center justify-center gap-1 flex-wrap">
            <span className="formula-part text-[var(--lab-text-muted)]">y</span>
            <span className="formula-part text-[var(--lab-text-muted)]">=</span>
            <span className="formula-part formula-value text-[var(--lab-accent)]">
              {values.a.toFixed(1)}
            </span>
            <span className="formula-part text-[var(--lab-text-muted)]">×</span>
            <span className="formula-part text-[var(--lab-text-muted)]">sin(</span>
            <span className="formula-part formula-value text-[var(--lab-accent)]">
              {values.f.toFixed(1)}
            </span>
            <span className="formula-part text-[var(--lab-text-muted)]">t</span>
            <span className="formula-part text-[var(--lab-text-muted)]">+</span>
            <span className="formula-part formula-value text-[var(--lab-accent)]">
              {formatPhase(values.p)}
            </span>
            <span className="formula-part text-[var(--lab-text-muted)]">)</span>
          </div>
        </div>

        {/* Parameter explanations */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-[var(--lab-accent)] font-mono">{values.a.toFixed(1)}</div>
            <div className="text-[var(--lab-text-muted)]">amplitude</div>
          </div>
          <div>
            <div className="text-[var(--lab-accent)] font-mono">{values.f.toFixed(1)}</div>
            <div className="text-[var(--lab-text-muted)]">frequency</div>
          </div>
          <div>
            <div className="text-[var(--lab-accent)] font-mono">{formatPhase(values.p)}</div>
            <div className="text-[var(--lab-text-muted)]">phase</div>
          </div>
        </div>
      </div>
    </CelebrationModal>
  )
}
