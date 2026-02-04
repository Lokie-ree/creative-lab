// src/components/modules/sinewaves/components/ParameterSlider.tsx
import { Slider } from '@/components/ui/slider'
import { SLIDER_CONFIG } from '../sinewaves-constants'

interface ParameterSliderProps {
  param: 'amplitude' | 'frequency'
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

/**
 * Labeled slider for amplitude or frequency parameter.
 * Automatically uses correct min/max/step from SLIDER_CONFIG.
 */
export function ParameterSlider({
  param,
  value,
  onChange,
  disabled,
}: ParameterSliderProps) {
  const config = SLIDER_CONFIG[param]
  const label = param.charAt(0).toUpperCase() + param.slice(1)

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm font-[family-name:var(--font-data)] text-(--lab-text-muted)">
        <span>{label}</span>
        <span className="text-(--lab-accent)">{value.toFixed(1)}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={config.min}
        max={config.max}
        step={config.step}
        disabled={disabled}
        className="w-full"
        aria-label={label}
      />
    </div>
  )
}
