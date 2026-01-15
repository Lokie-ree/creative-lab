import { useRef, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { fadeInSlideUp } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface DelayIndicatorProps {
  duration: number // Duration in milliseconds
  label?: string
  onComplete?: () => void
  className?: string
}

export function DelayIndicator({
  duration,
  label = "Observing...",
  onComplete,
  className = "",
}: DelayIndicatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Entrance animation
  useGSAP(() => {
    if (containerRef.current) {
      fadeInSlideUp(containerRef.current)
    }
  }, { dependencies: [], scope: containerRef })

  // Progress animation
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, (elapsed / duration) * 100)

      // Animate progress bar
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          width: `${newProgress}%`,
          duration: 0.1,
          ease: "none",
        })
      }

      if (elapsed >= duration) {
        clearInterval(interval)
        if (onComplete) {
          onComplete()
        }
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col items-center gap-2", className)}
    >
      <div className="text-sm text-(--lab-text-muted)">{label}</div>
      <div className="w-32 h-1.5 bg-(--lab-border) rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="h-full bg-(--lab-accent) rounded-full"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  )
}
