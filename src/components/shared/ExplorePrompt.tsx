interface ExplorePromptProps {
  text: string
  subtext?: string
  setupCopy?: string
  visible?: boolean
  className?: string
}

export function ExplorePrompt({ text, subtext, setupCopy, visible = true, className = "" }: ExplorePromptProps) {
  return (
    <div
      className={`text-center transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {setupCopy && (
        <p className="text-[var(--lab-text-muted)] text-sm sm:text-base mb-2 px-4 max-w-2xl mx-auto">
          {setupCopy}
        </p>
      )}
      <p className="text-[var(--lab-text)] text-base sm:text-lg font-medium tracking-wide px-4">
        {text}
      </p>
      {subtext && (
        <p className="text-[var(--lab-text-muted)] text-xs sm:text-sm mt-1 px-4">
          {subtext}
        </p>
      )}
    </div>
  )
}
