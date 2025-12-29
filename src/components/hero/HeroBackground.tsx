import { cn } from "@/lib/utils"

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dot pattern using CSS */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(circle,_rgba(34,211,238,0.15)_1px,_transparent_1px)]",
          "bg-[size:24px_24px]",
          "[mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]"
        )}
      />
      {/* Subtle animated glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
      </div>
    </div>
  )
}
