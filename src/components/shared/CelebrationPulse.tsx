import { useRef, useEffect } from "react"
import gsap from "gsap"

interface CelebrationPulseProps {
  trigger: number  // Increment to trigger celebration
  color?: string
}

export function CelebrationPulse({ trigger, color = "#c8e44c" }: CelebrationPulseProps) {
  const pulseRef = useRef<HTMLDivElement>(null)
  const prevTriggerRef = useRef(0)

  useEffect(() => {
    if (!pulseRef.current) return

    // Only animate when trigger changes (and not on initial mount)
    if (trigger > 0 && trigger !== prevTriggerRef.current) {
      prevTriggerRef.current = trigger

      gsap.fromTo(
        pulseRef.current,
        {
          scale: 0.5,
          opacity: 0.8,
        },
        {
          scale: 3,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        }
      )
    }
  }, [trigger])

  return (
    <div
      ref={pulseRef}
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
    >
      <div
        className="w-32 h-32 rounded-full opacity-0"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}
