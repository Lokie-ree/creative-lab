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
 * Labeled fader for amplitude or frequency parameter.
 * Eurorack style: silk-screened label, tick marks, monospace readout.
 */
export function ParameterSlider({
  param,
  value,
  onChange,
  disabled,
}: ParameterSliderProps) {
  const config = SLIDER_CONFIG[param]
  const label = param.toUpperCase()

  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between items-baseline">
        <span className="lab-silk lab-display-font text-(--lab-text-muted)">
          {label}
        </span>
        <span className="lab-data-font text-sm font-semibold text-(--lab-accent) tabular-nums">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={config.min}
          max={config.max}
          step={config.step}
          disabled={disabled}
          className="w-full"
          aria-label={param}
        />
        {/* Tick marks */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-full flex justify-between px-1.5">
          {[0, 25, 50, 75, 100].map((pct) => (
            <div
              key={pct}
              className="w-px h-2 bg-(--lab-text-muted) opacity-40 -mt-[3px]"
            />
          ))}
        </div>
      </div>
      <div className="mt-1 flex justify-between">
        <span className="lab-data-font text-[8px] text-(--lab-text-muted)">
          {config.min.toFixed(1)}
        </span>
        <span className="lab-data-font text-[8px] text-(--lab-text-muted)">
          {config.max.toFixed(1)}
        </span>
      </div>
    </div>
  )
}
