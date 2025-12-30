import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface ParameterSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  locked?: boolean
  discoveredValue?: number | null  // Show "You discovered" badge when set
  className?: string
}

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  locked = false,
  discoveredValue,
  className = "",
}: ParameterSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2)
  const isDiscovered = discoveredValue !== null && discoveredValue !== undefined

  return (
    <div className={cn("flex flex-col gap-2 min-w-0", className)}>
      {/* Discovery badge */}
      {isDiscovered && locked && (
        <div className="text-[10px] sm:text-xs text-[var(--lab-accent)] flex items-center gap-1">
          <span>✓</span>
          <span>You discovered</span>
        </div>
      )}

      <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
        <label className={cn(
          "text-[var(--lab-text-muted)] truncate",
          isDiscovered && locked && "text-[var(--lab-accent)]"
        )}>
          {label}
        </label>
        <span className={cn(
          "font-mono tabular-nums flex-shrink-0",
          locked ? "text-[var(--lab-text-muted)]" : "text-[var(--lab-accent)]",
          isDiscovered && locked && "text-[var(--lab-accent)]"
        )}>
          {displayValue}
        </span>
      </div>

      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        disabled={locked}
        className={cn(locked && "cursor-not-allowed opacity-50")}
      />
    </div>
  )
}
