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
}

function ParameterSlider({ label, value, min, max, step, onChange, formatValue }: ParameterSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <label className="text-gray-400">{label}</label>
        <span className="text-[#c8e44c] font-mono tabular-nums">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

interface ControlPanelProps {
  amplitude: number
  frequency: number
  phase: number
  onAmplitudeChange: (value: number) => void
  onFrequencyChange: (value: number) => void
  onPhaseChange: (value: number) => void
  matchScore?: number
}

export function ControlPanel({
  amplitude,
  frequency,
  phase,
  onAmplitudeChange,
  onFrequencyChange,
  onPhaseChange,
  matchScore,
}: ControlPanelProps) {
  const formatPhase = (value: number) => {
    const piMultiple = value / Math.PI
    if (piMultiple === 0) return "0"
    if (piMultiple === 1) return "π"
    if (piMultiple === -1) return "-π"
    return `${piMultiple.toFixed(2)}π`
  }

  const getMatchColor = (score: number) => {
    if (score >= 95) return "text-[#c8e44c]"
    if (score >= 80) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="bg-black/80 backdrop-blur-sm px-4 py-4 md:px-8 md:py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Sliders */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <ParameterSlider
              label="Amplitude"
              value={amplitude}
              min={0.1}
              max={2}
              step={0.1}
              onChange={onAmplitudeChange}
            />
            <ParameterSlider
              label="Frequency"
              value={frequency}
              min={0.5}
              max={3}
              step={0.1}
              onChange={onFrequencyChange}
            />
            <ParameterSlider
              label="Phase"
              value={phase}
              min={0}
              max={Math.PI * 2}
              step={0.1}
              onChange={onPhaseChange}
              formatValue={formatPhase}
            />
          </div>

          {/* Match indicator */}
          {matchScore !== undefined && (
            <div className="flex items-center justify-center md:justify-end">
              <div className={cn(
                "text-center md:text-right",
                getMatchColor(matchScore)
              )}>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Match</div>
                <div className="text-2xl font-bold font-mono">
                  {Math.round(matchScore)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
