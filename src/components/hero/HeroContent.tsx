import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import RotatingText from "./RotatingText"

interface HeroContentProps {
  onEnter: () => void
}

export function HeroContent({ onEnter }: HeroContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })

    gsap.set([nameRef.current, taglineRef.current, ctaRef.current], { opacity: 0, y: 16 })

    tl.to(nameRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.5)
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.9)
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 gap-6 md:gap-8"
    >
      {/* Name */}
      <h1
        ref={nameRef}
        className="text-5xl md:text-6xl font-semibold text-[var(--lab-text)] tracking-tight"
      >
        IVLA STEM Club
      </h1>

      {/* Tagline: Where we [build / discover / explore / prove] */}
      <p
        ref={taglineRef}
        className="inline-flex flex-wrap items-baseline justify-center gap-x-2"
      >
        <span className="text-lg sm:text-xl md:text-2xl text-[var(--lab-text-muted)]">
          Where we
        </span>
        <span className="inline-flex min-w-[8ch] justify-start rounded-full bg-[var(--lab-surface)]/95 px-4 py-2 shadow-sm ring-1 ring-[var(--lab-border)] backdrop-blur-sm">
          <RotatingText
            texts={['build', 'discover', 'explore', 'prove']}
            mainClassName="text-base sm:text-lg md:text-xl font-medium text-[var(--lab-text)]"
            splitBy="words"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            staggerDuration={0}
            rotationInterval={2200}
          />
        </span>
      </p>

      {/* CTA Button */}
      <button
        ref={ctaRef}
        onClick={onEnter}
        className="group px-8 py-4 min-h-[48px] bg-[var(--lab-accent)] text-[var(--lab-bg)] font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:bg-[var(--lab-accent-hover)] hover:shadow-[0_0_30px_rgba(124,200,124,0.4)]"
      >
        Enter the Lab
        <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
      </button>
    </div>
  )
}
