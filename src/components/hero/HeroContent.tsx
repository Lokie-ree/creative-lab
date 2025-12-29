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
      <p ref={roleRef} className="text-lg md:text-xl text-zinc-400 mb-12 flex items-center gap-3">
        <span>Math Educator</span>
        <span className="text-cyan-400">→</span>
        <span>Full-Stack Developer</span>
        <span className="text-cyan-400">→</span>
        <span>Learning Designer</span>
      </p>

      {/* Hook lines */}
      <div className="space-y-2 mb-12">
        <p ref={hook1Ref} className="text-2xl md:text-3xl font-light text-zinc-500">
          15 years in math classrooms.
        </p>
        <p ref={hook2Ref} className="text-2xl md:text-3xl font-light text-zinc-400">
          10 days learning R3F.
        </p>
        <div ref={hook3Ref}>
          <AnimatedShinyText
            shimmerWidth={200}
            className="text-2xl md:text-3xl font-light !text-cyan-400"
          >
            This is what I built.
          </AnimatedShinyText>
        </div>
      </div>

      {/* CTA Button */}
      <button
        ref={ctaRef}
        onClick={onEnter}
        className="group px-8 py-4 bg-cyan-500 text-zinc-900 font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
      >
        Enter the Module
        <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
      </button>
    </div>
  )
}
