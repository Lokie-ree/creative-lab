// src/components/modules/sinewaves/components/DiagnosisChoices.tsx
import { Button } from '@/components/ui/button'

interface DiagnosisChoice {
  label: string
  value: string
}

interface DiagnosisChoicesProps {
  question: string
  choices: DiagnosisChoice[]
  onSelect: (value: string) => void
  selectedValue?: string
  className?: string
}

/**
 * Multiple choice diagnosis panel for challenge stage
 * User identifies which parameter changed
 */
export function DiagnosisChoices({
  question,
  choices,
  onSelect,
  selectedValue,
  className = '',
}: DiagnosisChoicesProps) {
  return (
    <div
      className={`w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <p
        className="text-center text-sm"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--lab-text)',
        }}
      >
        {question}
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {choices.map((choice) => {
          const isSelected = selectedValue === choice.value
          return (
            <Button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              variant="outline"
              className="w-full justify-center"
              style={{
                fontFamily: 'var(--font-display)',
                borderColor: isSelected
                  ? 'var(--lab-accent)'
                  : 'var(--lab-border)',
                color: isSelected ? 'var(--lab-accent)' : 'var(--lab-text)',
                backgroundColor: isSelected
                  ? 'rgba(34, 211, 238, 0.1)'
                  : 'transparent',
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
            >
              {choice.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
