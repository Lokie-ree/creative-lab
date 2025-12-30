import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"

interface HeroContentProps {
  onEnter: () => void
}

export function HeroContent({ onEnter }: HeroContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const roleRef = useRef<HTMLParagraphElement>(null)
  const hook1Ref = useRef<HTMLParagraphElement>(null)
  const hook2Ref = useRef<HTMLParagraphElement>(null)
  const hook3Ref = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Initial state
    gsap.set([nameRef.current, roleRef.current, hook1Ref.current, hook2Ref.current, hook3Ref.current, ctaRef.current], {
      opacity: 0,
      y: 20,
    })

    // Staggered reveal
    tl.to(nameRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
      .to(roleRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
      .to(hook1Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 1.0)
      .to(hook2Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 1.3)
      .to(hook3Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 1.6)
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6 }, 2.0)
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
    >
      {/* Name */}
      <h1
        ref={nameRef}
        className="text-5xl md:text-6xl font-semibold text-white tracking-tight mb-4"
      >
        Randall LaPoint, Jr.
      </h1>

      {/* Role line */}
      <p ref={roleRef} className="text-base sm:text-lg md:text-xl text-[var(--lab-text-muted)] mb-12 flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
        <span>Math Educator</span>
        <span className="text-[var(--lab-accent)] hidden sm:inline">→</span>
        <span>Full-Stack Developer</span>
        <span className="text-[var(--lab-accent)] hidden sm:inline">→</span>
        <span>Learning Designer</span>
      </p>

      {/* Hook lines */}
      <div className="space-y-2 mb-12">
        <p ref={hook1Ref} className="text-xl sm:text-2xl md:text-3xl font-light text-[var(--lab-text-dim)]">
          15 years in math classrooms.
        </p>
        <p ref={hook2Ref} className="text-xl sm:text-2xl md:text-3xl font-light text-[var(--lab-text-muted)]">
          10 days learning R3F.
        </p>
        <div ref={hook3Ref}>
          <AnimatedShinyText
            shimmerWidth={200}
            className="text-xl sm:text-2xl md:text-3xl font-light !text-[var(--lab-accent)]"
          >
            This is what I built.
          </AnimatedShinyText>
        </div>
      </div>

      {/* CTA Button */}
      <button
        ref={ctaRef}
        onClick={onEnter}
        className="group px-8 py-4 min-h-[48px] bg-[var(--lab-accent)] text-[var(--lab-bg)] font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:bg-[var(--lab-accent-hover)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
      >
        Enter the Module
        <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
      </button>
    </div>
  )
}
