// src/components/modules/pythagorean-theorem/components/ConverseToggle.tsx
//
// YES / NO pill radio group for Phase 2 converse rounds.
// Asks: "Is this a right triangle?"
//
// Design: two adjacent pills, --lab-surface unselected, --lab-accent selected.
// Accessibility: role="radiogroup" + role="radio" + aria-checked per option.

interface ConverseToggleProps {
  value: boolean | null
  onChange: (value: boolean) => void
}

const OPTIONS: { label: string; value: boolean }[] = [
  { label: 'YES', value: true },
  { label: 'NO',  value: false },
]

export function ConverseToggle({ value, onChange }: ConverseToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Is this a right triangle?"
      className="flex w-full gap-2"
    >
      {OPTIONS.map(opt => {
        const selected = value === opt.value
        return (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={[
              'flex-1 min-h-[44px] px-4',
              'lab-silk lab-display-font tracking-[0.1em]',
              'border transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)',
              selected
                ? 'bg-(--lab-accent) border-(--lab-accent) text-(--lab-bg)'
                : 'bg-(--lab-surface) border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
