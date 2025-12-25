import { useRef, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

interface Action {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary" | "ghost"
}

interface CelebrationModalProps {
  show: boolean
  title: string
  subtitle?: string
  children: ReactNode
  actions: Action[]
  onDismiss: () => void
}

export function CelebrationModal({
  show,
  title,
  subtitle,
  children,
  actions,
  onDismiss,
}: CelebrationModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    }
  }, [show])

  useGSAP(
    () => {
      if (show && containerRef.current) {
        const tl = gsap.timeline()

        gsap.set(containerRef.current, { opacity: 0, scale: 0.9, y: 20 })

        tl.to(containerRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        })

        tl.from(
          ".celebration-content",
          {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.2"
        )
      }
    },
    { dependencies: [show], scope: containerRef }
  )

  const handleDismiss = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setIsVisible(false)
          onDismiss()
        },
      })
    }
  }

  const getButtonClasses = (variant: Action["variant"] = "secondary") => {
    const base = "px-4 py-3 rounded-lg font-medium transition-colors"
    switch (variant) {
      case "primary":
        return `${base} bg-[#c8e44c] text-[#0a0a0f] hover:bg-[#d4f06a]`
      case "ghost":
        return `${base} text-[#888888] hover:text-[#e0e0e0]`
      default:
        return `${base} border border-[#2a2a3a] text-[#888888] hover:border-[#888888] hover:text-[#e0e0e0]`
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        ref={containerRef}
        className="bg-[#0a0a0f]/95 backdrop-blur-lg border border-[#c8e44c]/30 rounded-2xl p-8 max-w-md mx-4 pointer-events-auto shadow-[0_0_60px_rgba(200,228,76,0.2)]"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-[#c8e44c] text-sm uppercase tracking-widest mb-2">
            {title}
          </div>
          {subtitle && (
            <div className="text-[#e0e0e0] text-xl font-medium">{subtitle}</div>
          )}
        </div>

        {/* Content */}
        <div className="celebration-content mb-6">{children}</div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {actions
              .filter((a) => a.variant !== "ghost")
              .map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleDismiss()
                    setTimeout(action.onClick, 300)
                  }}
                  className={`flex-1 ${getButtonClasses(action.variant)}`}
                >
                  {action.label}
                </button>
              ))}
          </div>
          {actions
            .filter((a) => a.variant === "ghost")
            .map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  handleDismiss()
                  setTimeout(action.onClick, 300)
                }}
                className={`w-full text-sm ${getButtonClasses("ghost")}`}
              >
                {action.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
