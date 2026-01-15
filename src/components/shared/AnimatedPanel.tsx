import { useRef, useEffect, type ReactNode } from "react"
import { fadeInSlideUp, fadeOutSlideUp } from "@/lib/animations"

interface AnimatedPanelProps {
  children: ReactNode
  className?: string
  transitionKey: string  // Changes trigger re-animation
}

export function AnimatedPanel({ children, className = "", transitionKey }: AnimatedPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prevKeyRef = useRef(transitionKey)

  useEffect(() => {
    if (!containerRef.current) return

    // Initial mount or key change - animate out then in
    if (prevKeyRef.current !== transitionKey && prevKeyRef.current !== null) {
      // Animate out previous content
      const exitAnimation = fadeOutSlideUp(containerRef.current)
      
      // After exit completes, animate in new content
      if (exitAnimation) {
        exitAnimation.eventCallback("onComplete", () => {
          if (containerRef.current) {
            fadeInSlideUp(containerRef.current)
          }
        })
      } else {
        // If no animation (reduced motion), just animate in immediately
        if (containerRef.current) {
          fadeInSlideUp(containerRef.current)
        }
      }
      
      prevKeyRef.current = transitionKey
    } else {
      // Initial mount - just animate in
      fadeInSlideUp(containerRef.current)
      prevKeyRef.current = transitionKey
    }
  }, [transitionKey])

  return (
    <div ref={containerRef} className={className} data-stage-overlay>
      {children}
    </div>
  )
}
