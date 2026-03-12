import { HeroBackground } from "./HeroBackground"
import { HeroContent } from "./HeroContent"

interface HeroProps {
  onEnter: () => void
}

export function Hero({ onEnter }: HeroProps) {
  return (
    <main id="main-content" className="h-screen w-screen relative overflow-hidden bg-(--lab-bg)">
      <a
        href="#hero-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-(--lab-accent) focus:text-(--lab-bg) focus:uppercase focus:text-[9px] focus:tracking-[0.15em] focus:font-semibold"
      >
        Skip to content
      </a>
      <HeroBackground />
      <HeroContent onEnter={onEnter} />
    </main>
  )
}
