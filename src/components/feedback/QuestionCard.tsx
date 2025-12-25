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
    <Card className={`bg-[#12121a] border-[#2a2a3a] ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-[#e0e0e0] text-lg font-medium">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {choices.map((choice) => (
            <button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              className={`
                px-4 py-3 rounded-lg border-2 font-mono text-lg
                transition-all duration-200
                ${
                  selectedValue === choice.value
                    ? "border-[#c8e44c] bg-[#c8e44c]/10 text-[#c8e44c]"
                    : "border-[#2a2a3a] text-[#e0e0e0] hover:border-[#888888]"
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
