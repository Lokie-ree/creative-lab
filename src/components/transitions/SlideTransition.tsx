import { useRef, useState, useEffect } from "react"
import type { ReactNode } from "react"
import gsap from "gsap"

type View = "hero" | "module"

interface SlideTransitionProps {
  view: View
  heroContent: ReactNode
  moduleContent: ReactNode
  onTransitionComplete?: () => void
}

export function SlideTransition({
  view,
  heroContent,
  moduleContent,
  onTransitionComplete,
}: SlideTransitionProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const moduleRef = useRef<HTMLDivElement>(null)
  const [currentView, setCurrentView] = useState<View>(view)
  const [isAnimating, setIsAnimating] = useState(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Run animation when view prop changes
  useEffect(() => {
    if (view === currentView) return
    if (isAnimating) return

    // Both refs should exist since both are always mounted
    if (!heroRef.current || !moduleRef.current) return

    setIsAnimating(true)

    // Clean up any existing animations
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const duration = prefersReducedMotion ? 0 : 0.6

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentView(view)
        setIsAnimating(false)
        timelineRef.current = null
        onTransitionComplete?.()
      },
    })
    timelineRef.current = tl

    if (view === "module") {
      // Set starting positions
      gsap.set(heroRef.current, { yPercent: 0 })
      gsap.set(moduleRef.current, { yPercent: 100 })

      // Animate together
      tl.to(heroRef.current, {
        yPercent: -100,
        duration,
        ease: prefersReducedMotion ? "none" : "power2.inOut",
        force3D: true,
      }, 0)
      tl.to(moduleRef.current, {
        yPercent: 0,
        duration,
        ease: prefersReducedMotion ? "none" : "power2.inOut",
        force3D: true,
      }, 0)
    } else {
      // Set starting positions
      gsap.set(heroRef.current, { yPercent: -100 })
      gsap.set(moduleRef.current, { yPercent: 0 })

      // Animate together
      tl.to(heroRef.current, {
        yPercent: 0,
        duration,
        ease: prefersReducedMotion ? "none" : "power2.inOut",
        force3D: true,
      }, 0)
      tl.to(moduleRef.current, {
        yPercent: 100,
        duration,
        ease: prefersReducedMotion ? "none" : "power2.inOut",
        force3D: true,
      }, 0)
    }
  }, [view, currentView, isAnimating, onTransitionComplete, prefersReducedMotion])

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
      if (heroRef.current) {
        gsap.killTweensOf(heroRef.current)
      }
      if (moduleRef.current) {
        gsap.killTweensOf(moduleRef.current)
      }
    }
  }, [])

  // Set initial positions on mount
  useEffect(() => {
    if (heroRef.current) {
      gsap.set(heroRef.current, { yPercent: currentView === "hero" ? 0 : -100 })
    }
    if (moduleRef.current) {
      gsap.set(moduleRef.current, { yPercent: currentView === "module" ? 0 : 100 })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--lab-bg)]">
      {/* Hero layer - always mounted */}
      <div
        ref={heroRef}
        className="absolute inset-0 will-change-transform"
        style={{ zIndex: currentView === "hero" || (isAnimating && view === "hero") ? 10 : 5 }}
        aria-hidden={currentView !== "hero" && !isAnimating}
      >
        {heroContent}
      </div>

      {/* Module layer - always mounted for smooth transitions */}
      <div
        ref={moduleRef}
        className="absolute inset-0 will-change-transform"
        style={{ zIndex: currentView === "module" || (isAnimating && view === "module") ? 10 : 5 }}
        aria-hidden={currentView !== "module" && !isAnimating}
      >
        {moduleContent}
      </div>
    </div>
  )
}
