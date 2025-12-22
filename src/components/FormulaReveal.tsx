import { useRef, useEffect, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

interface FormulaRevealProps {
  show: boolean
  values: { a: number; f: number; p: number }
  onDismiss: () => void
  onNewChallenge: () => void
}

export function FormulaReveal({ show, values, onDismiss, onNewChallenge }: FormulaRevealProps) {
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

        // Initial state
        gsap.set(containerRef.current, { opacity: 0, scale: 0.9, y: 20 })

        // Animate in
        tl.to(containerRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        })

        // Animate the formula parts sequentially
        tl.from(
          ".formula-part",
          {
            opacity: 0,
            y: 10,
            stagger: 0.1,
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.2"
        )

        // Pulse the values
        tl.to(
          ".formula-value",
          {
            scale: 1.1,
            color: "#c8e44c",
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

  const formatPhase = (value: number) => {
    const piMultiple = value / Math.PI
    if (Math.abs(piMultiple) < 0.01) return "0"
    if (Math.abs(piMultiple - 1) < 0.01) return "π"
    if (Math.abs(piMultiple + 1) < 0.01) return "-π"
    return `${piMultiple.toFixed(2)}π`
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        ref={containerRef}
        className="bg-black/90 backdrop-blur-lg border border-[#c8e44c]/30 rounded-2xl p-8 max-w-md mx-4 pointer-events-auto shadow-[0_0_60px_rgba(200,228,76,0.2)]"
      >
        {/* Celebration header */}
        <div className="text-center mb-6">
          <div className="text-[#c8e44c] text-sm uppercase tracking-widest mb-2">
            Pattern Matched!
          </div>
          <div className="text-white text-xl font-medium">You just built:</div>
        </div>

        {/* The formula */}
        <div className="bg-[#1a1a24] rounded-lg p-6 mb-6 font-mono text-center">
          <div className="text-2xl text-white flex items-center justify-center gap-1 flex-wrap">
            <span className="formula-part text-gray-400">y</span>
            <span className="formula-part text-gray-400">=</span>
            <span className="formula-part formula-value text-[#c8e44c]">
              {values.a.toFixed(1)}
            </span>
            <span className="formula-part text-gray-400">×</span>
            <span className="formula-part text-gray-400">sin(</span>
            <span className="formula-part formula-value text-[#c8e44c]">
              {values.f.toFixed(1)}
            </span>
            <span className="formula-part text-gray-400">t</span>
            <span className="formula-part text-gray-400">+</span>
            <span className="formula-part formula-value text-[#c8e44c]">
              {formatPhase(values.p)}
            </span>
            <span className="formula-part text-gray-400">)</span>
          </div>
        </div>

        {/* Parameter explanations */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
          <div>
            <div className="text-[#c8e44c] font-mono">{values.a.toFixed(1)}</div>
            <div className="text-gray-500">amplitude</div>
          </div>
          <div>
            <div className="text-[#c8e44c] font-mono">{values.f.toFixed(1)}</div>
            <div className="text-gray-500">frequency</div>
          </div>
          <div>
            <div className="text-[#c8e44c] font-mono">{formatPhase(values.p)}</div>
            <div className="text-gray-500">phase</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            Keep Exploring
          </button>
          <button
            onClick={() => {
              handleDismiss()
              setTimeout(onNewChallenge, 300)
            }}
            className="flex-1 px-4 py-3 rounded-lg bg-[#c8e44c] text-black font-medium hover:bg-[#d4ed5c] transition-colors"
          >
            New Challenge
          </button>
        </div>
      </div>
    </div>
  )
}
