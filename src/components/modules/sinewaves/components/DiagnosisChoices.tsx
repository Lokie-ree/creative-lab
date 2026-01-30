// src/components/modules/sinewaves/components/DiagnosisChoices.tsx
import { Check } from 'lucide-react'
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
 * Enhanced visual feedback on selection
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
              className="relative w-full justify-center"
              style={{
                fontFamily: 'var(--font-display)',
                borderColor: isSelected
                  ? 'var(--lab-accent)'
                  : 'var(--lab-border)',
                borderWidth: isSelected ? '2px' : '1px',
                color: isSelected ? 'var(--lab-accent)' : 'var(--lab-text)',
                backgroundColor: isSelected
                  ? 'rgba(34, 211, 238, 0.15)'
                  : 'transparent',
                boxShadow: isSelected
                  ? '0 0 12px rgba(34, 211, 238, 0.3), inset 0 0 8px rgba(34, 211, 238, 0.1)'
                  : 'none',
                transition: 'all var(--duration-normal) var(--ease-out)',
              }}
            >
              {isSelected && (
                <Check
                  className="absolute left-3 h-4 w-4"
                  style={{ color: 'var(--lab-accent)' }}
                />
              )}
              {choice.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
