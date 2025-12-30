interface ExplorePromptProps {
  text: string
  subtext?: string
  visible?: boolean
  className?: string
}

export function ExplorePrompt({ text, subtext, visible = true, className = "" }: ExplorePromptProps) {
  return (
    <div
      className={`text-center transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
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
