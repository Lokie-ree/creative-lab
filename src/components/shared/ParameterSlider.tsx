import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { pulse } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Lock } from "lucide-react"

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
  const valueRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef<number>(value)
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2)
  const isDiscovered = discoveredValue !== null && discoveredValue !== undefined

  // Micro-interaction: pulse value display on significant change
  useGSAP(() => {
    if (!locked && valueRef.current && Math.abs(value - prevValueRef.current) > step * 2) {
      pulse(valueRef.current)
      prevValueRef.current = value
    }
  }, { dependencies: [value, locked, step], scope: valueRef })

  return (
    <div className={cn(
      "flex flex-col gap-2 min-w-0",
      locked && "opacity-90",
      className
    )}>
      {/* Discovery badge */}
      {isDiscovered && locked && (
        <div className="text-[10px] sm:text-xs text-(--lab-accent) flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          <span>You discovered</span>
        </div>
      )}

      <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
        <label className={cn(
          "text-(--lab-text-muted) truncate flex items-center gap-1.5",
          isDiscovered && locked && "text-(--lab-accent)",
          locked && !isDiscovered && "text-(--lab-text-muted)"
        )}>
          {locked && !isDiscovered && <Lock className="h-3 w-3" />}
          {label}
        </label>
        <span
          ref={valueRef}
          className={cn(
            "font-mono tabular-nums shrink-0",
            locked ? "text-(--lab-text-muted)" : "text-(--lab-accent)",
            isDiscovered && locked && "text-(--lab-accent)"
          )}
        >
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
        aria-label={`${label} slider, current value ${displayValue}, range ${min} to ${max}`}
        className={cn(locked && "cursor-not-allowed opacity-50")}
      />
    </div>
  )
}
