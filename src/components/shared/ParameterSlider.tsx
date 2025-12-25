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
  className = "",
}: ParameterSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2)

  return (
    <div className={cn("flex flex-col gap-2", locked && "opacity-50", className)}>
      <div className="flex justify-between text-sm">
        <label className={cn("text-[#888888]", locked && "flex items-center gap-1")}>
          {label}
          {locked && <span className="text-[#c8e44c]">✓</span>}
        </label>
        <span className={cn("font-mono tabular-nums", locked ? "text-[#888888]" : "text-[#c8e44c]")}>
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
        className={cn(locked && "cursor-not-allowed")}
      />
    </div>
  )
}
