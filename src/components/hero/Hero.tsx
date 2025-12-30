import { HeroBackground } from "./HeroBackground"
import { HeroContent } from "./HeroContent"

interface HeroProps {
  onEnter: () => void
}

export function Hero({ onEnter }: HeroProps) {
  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[var(--lab-bg)]">
      <HeroBackground />
      <HeroContent onEnter={onEnter} />
    </div>
  )
}
