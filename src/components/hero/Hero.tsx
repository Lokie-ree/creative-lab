import { HeroBackground } from "./HeroBackground"
import { HeroContent } from "./HeroContent"

interface HeroProps {
  onEnter: () => void
}

export function Hero({ onEnter }: HeroProps) {
  return (
    <div className="h-screen w-screen relative overflow-hidden" style={{ backgroundColor: '#0a0a0f' }}>
      <HeroBackground />
      <HeroContent onEnter={onEnter} />
    </div>
  )
}
