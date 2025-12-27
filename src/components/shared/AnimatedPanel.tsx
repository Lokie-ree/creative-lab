import { useRef, useEffect, type ReactNode } from "react"
import gsap from "gsap"

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

    // Initial mount or key change - animate in
    if (prevKeyRef.current !== transitionKey) {
      // Animate out then in
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          clearProps: "all"
        }
      )
      prevKeyRef.current = transitionKey
    } else {
      // Initial mount
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          clearProps: "all"
        }
      )
    }
  }, [transitionKey])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
