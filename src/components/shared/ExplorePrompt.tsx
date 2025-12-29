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
      <p className="text-[var(--lab-text)] text-lg font-medium tracking-wide">
        {text}
      </p>
      {subtext && (
        <p className="text-[var(--lab-text-muted)] text-sm mt-1">
          {subtext}
        </p>
      )}
    </div>
  )
}
