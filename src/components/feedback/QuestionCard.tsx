import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fadeInScale } from "@/lib/animations"

interface Choice {
  label: string
  value: string | number
}

interface QuestionCardProps {
  question: string
  choices: Choice[]
  onSelect: (value: string | number) => void
  selectedValue?: string | number
  className?: string
}

export function QuestionCard({
  question,
  choices,
  onSelect,
  selectedValue,
  className = "",
}: QuestionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Entrance animation
  useGSAP(() => {
    if (cardRef.current) {
      fadeInScale(cardRef.current)
    }
  }, { dependencies: [], scope: cardRef })

  return (
    <Card ref={cardRef} className={`bg-(--lab-surface) border-(--lab-border) ${className}`}>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-(--lab-text) text-base sm:text-lg font-medium">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {choices.map((choice) => (
            <button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              className={`
                px-4 py-3 sm:py-3 rounded-lg border-2 font-mono text-base sm:text-lg min-h-[44px]
                transition-all duration-200
                ${
                  selectedValue === choice.value
                    ? "border-(--lab-accent) bg-(--lab-accent)/10 text-(--lab-accent)"
                    : "border-(--lab-border) text-(--lab-text) hover:border-(--lab-border-muted) hover:scale-[1.02]"
                }
              `}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
