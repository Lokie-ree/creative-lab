// src/components/modules/pythagorean-theorem/components/NumericInput.tsx
//
// Eurorack-styled numeric input.
// Used for area predictions (Phase 1–2), side solving (Phase 3), and
// distance solving (Phase 4).

interface NumericInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  ariaLabel: string
  placeholder?: string
  disabled?: boolean
}

export function NumericInput({
  value,
  onChange,
  onSubmit,
  ariaLabel,
  placeholder = '—',
  disabled = false,
}: NumericInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && !disabled) onSubmit()
      }}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        'min-h-[48px] w-full px-3',
        'bg-(--lab-bg) border border-(--lab-border)',
        'lab-data-font text-sm text-(--lab-text)',
        'placeholder:text-(--lab-ghost)',
        'focus:outline-none focus-visible:border-(--lab-accent)',
        'transition-colors duration-150',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    />
  )
}
