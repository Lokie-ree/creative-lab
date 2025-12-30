import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  return (
    <Card className={`bg-[var(--lab-surface)] border-[var(--lab-border)] ${className}`}>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-[var(--lab-text)] text-base sm:text-lg font-medium">
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
                    ? "border-[var(--lab-accent)] bg-[var(--lab-accent)]/10 text-[var(--lab-accent)]"
                    : "border-[var(--lab-border)] text-[var(--lab-text)] hover:border-[var(--lab-border-muted)]"
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
