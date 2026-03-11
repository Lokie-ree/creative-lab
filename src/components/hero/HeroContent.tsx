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
        className="lab-display-font text-5xl md:text-6xl font-semibold text-(--lab-text) tracking-tight"
      >
        IVLA STEM Club
      </h1>

      {/* Tagline: Where we [build / discover / explore / prove] */}
      <p
        ref={taglineRef}
        className="inline-flex flex-wrap items-center justify-center gap-x-3"
      >
        <span className="lab-silk lab-display-font text-[11px] tracking-[0.2em] text-(--lab-text-muted)">
          Where we
        </span>
        <span className="inline-flex min-w-[9ch] items-center justify-start border border-(--lab-border) bg-(--lab-surface) px-3 py-1.5">
          <RotatingText
            texts={['build', 'discover', 'explore', 'prove']}
            mainClassName="lab-silk lab-display-font text-[11px] tracking-[0.15em] text-(--lab-accent)"
            splitBy="words"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            staggerDuration={0}
            rotationInterval={2200}
          />
        </span>
      </p>

      {/* CTA Button */}
      <button
        ref={ctaRef}
        onClick={onEnter}
        className="group px-8 py-3.5 min-h-[48px] border border-(--lab-accent) bg-(--lab-accent) text-(--lab-bg) lab-silk lab-display-font tracking-[0.1em] transition-colors duration-150 hover:bg-(--lab-accent-hover) hover:border-(--lab-accent-hover)"
      >
        Enter the Lab
        <span className="inline-block ml-3 transition-transform duration-150 group-hover:translate-x-1">→</span>
      </button>
    </div>
  )
}
