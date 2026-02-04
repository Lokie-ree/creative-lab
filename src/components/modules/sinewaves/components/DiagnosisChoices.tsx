// src/components/modules/sinewaves/components/DiagnosisChoices.tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <div className={cn('flex w-full flex-col gap-2 sm:gap-3', className)}>
      <p className="text-center text-xs font-[family-name:var(--font-body)] text-(--lab-text) sm:text-sm">
        {question}
      </p>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        {choices.map((choice) => {
          const isSelected = selectedValue === choice.value
          return (
            <Button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              variant="outline"
              className={cn(
                'min-h-[44px] w-full justify-center sm:min-h-[40px]',
                'font-[family-name:var(--font-display)]',
                'transition-all duration-300 ease-out',
                isSelected
                  ? 'border-2 border-(--lab-accent) bg-[rgba(34,211,238,0.15)] text-(--lab-accent) shadow-[0_0_12px_rgba(34,211,238,0.3),inset_0_0_8px_rgba(34,211,238,0.1)]'
                  : 'border border-(--lab-border) bg-transparent text-(--lab-text)'
              )}
            >
              {choice.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
