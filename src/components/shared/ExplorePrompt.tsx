import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { fadeInSlideDown, fadeOutSlideDown } from "@/lib/animations"

interface ExplorePromptProps {
  text: string
  subtext?: string
  setupCopy?: string
  visible?: boolean
  className?: string
  /** Add glass panel background for better readability over 3D scene */
  withGlassPanel?: boolean
}

export function ExplorePrompt({
  text,
  subtext,
  setupCopy,
  visible = true,
  className = "",
  withGlassPanel = false
}: ExplorePromptProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prevVisibleRef = useRef<boolean>(visible)

  // Entrance and exit animations
  useGSAP(() => {
    if (!containerRef.current) return

    if (visible && !prevVisibleRef.current) {
      // Becoming visible - animate in
      fadeInSlideDown(containerRef.current)
    } else if (!visible && prevVisibleRef.current) {
      // Becoming hidden - animate out
      fadeOutSlideDown(containerRef.current)
    }

    prevVisibleRef.current = visible
  }, { dependencies: [visible], scope: containerRef })

  const glassStyles = withGlassPanel
    ? "bg-black/60 backdrop-blur-md rounded-xl p-4 border border-(--lab-accent)/20"
    : ""

  return (
    <div
      ref={containerRef}
      className={`text-center ${
        visible ? "opacity-100" : "opacity-0"
      } ${glassStyles} ${className}`}
    >
      {setupCopy && (
        <p className="text-(--lab-text-muted) text-sm sm:text-base mb-2 max-w-2xl mx-auto">
          {setupCopy}
        </p>
      )}
      <p className="text-(--lab-text) text-base sm:text-lg font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {text}
      </p>
      {subtext && (
        <p className="text-(--lab-text-muted) text-xs sm:text-sm mt-1">
          {subtext}
        </p>
      )}
    </div>
  )
}
