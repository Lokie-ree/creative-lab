interface ExplorePromptProps {
  text: string
  subtext?: string
  setupCopy?: string
  visible?: boolean
  className?: string
  /** Add glass panel background for better readability over 3D scene */
  withGlassPanel?: boolean
}

export function ExplorePrompt({
  text,
  subtext,
  setupCopy,
  visible = true,
  className = "",
  withGlassPanel = false
}: ExplorePromptProps) {
  const glassStyles = withGlassPanel
    ? "bg-black/60 backdrop-blur-sm rounded-xl p-4"
    : ""

  return (
    <div
      className={`text-center transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      } ${glassStyles} ${className}`}
    >
      {setupCopy && (
        <p className="text-[var(--lab-text-muted)] text-sm sm:text-base mb-2 max-w-2xl mx-auto">
          {setupCopy}
        </p>
      )}
      <p className="text-[var(--lab-text)] text-base sm:text-lg font-medium tracking-wide">
        {text}
      </p>
      {subtext && (
        <p className="text-[var(--lab-text-muted)] text-xs sm:text-sm mt-1">
          {subtext}
        </p>
      )}
    </div>
  )
}
