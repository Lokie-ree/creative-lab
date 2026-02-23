import DotGrid from "./DotGrid"

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <DotGrid
        dotSize={4}
        gap={20}
        baseColor="#2e2c28"
        activeColor="#7cc87c"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
        className="w-full h-full !p-0"
      />
    </div>
  )
}
