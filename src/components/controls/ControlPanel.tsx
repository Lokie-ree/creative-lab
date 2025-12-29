import { cn } from "@/lib/utils"
import { ParameterSlider } from "@/components/shared/ParameterSlider"

type SliderType = 'amplitude' | 'frequency' | 'phase'

interface Discoveries {
  amplitude: number | null
  frequency: number | null
  phase: number | null
}

interface ControlPanelProps {
  amplitude: number
  frequency: number
  phase: number
  onAmplitudeChange: (value: number) => void
  onFrequencyChange: (value: number) => void
  onPhaseChange: (value: number) => void
  matchScore?: number
  visibleSliders?: SliderType[]
  lockedSliders?: SliderType[]
  discoveries?: Discoveries  // Discovered values to display on locked sliders
}

export function ControlPanel({
  amplitude,
  frequency,
  phase,
  onAmplitudeChange,
  onFrequencyChange,
  onPhaseChange,
  matchScore,
  visibleSliders,
  lockedSliders = [],
  discoveries,
}: ControlPanelProps) {
  // If no visibleSliders specified, show all
  const showAmplitude = !visibleSliders || visibleSliders.includes('amplitude')
  const showFrequency = !visibleSliders || visibleSliders.includes('frequency')
  const showPhase = !visibleSliders || visibleSliders.includes('phase')

  // Check if sliders are locked
  const amplitudeLocked = lockedSliders.includes('amplitude')
  const frequencyLocked = lockedSliders.includes('frequency')
  const phaseLocked = lockedSliders.includes('phase')
  const formatPhase = (value: number) => {
    const piMultiple = value / Math.PI
    if (piMultiple === 0) return "0"
    if (piMultiple === 1) return "π"
    if (piMultiple === -1) return "-π"
    return `${piMultiple.toFixed(2)}π`
  }

  const getFeedbackText = (score: number): string | null => {
    if (score >= 95) return null // Triggers reveal, no text needed
    if (score >= 80) return "Almost there..."
    if (score >= 50) return "Getting closer..."
    return "Keep exploring..."
  }

  // Count visible sliders for grid layout
  const visibleCount = [showAmplitude, showFrequency, showPhase].filter(Boolean).length
  const gridCols = visibleCount === 1 ? 'grid-cols-1' : visibleCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'

  return (
    <div className="bg-black/80 backdrop-blur-sm px-4 py-4 md:px-8 md:py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Sliders */}
          <div className={cn("flex-1 grid grid-cols-1 gap-4 md:gap-6", gridCols)}>
            {showAmplitude && (
              <ParameterSlider
                label="Amplitude"
                value={amplitude}
                min={0.5}
                max={2}
                step={0.05}
                onChange={onAmplitudeChange}
                locked={amplitudeLocked}
                discoveredValue={discoveries?.amplitude}
              />
            )}
            {showFrequency && (
              <ParameterSlider
                label="Frequency"
                value={frequency}
                min={0.5}
                max={3}
                step={0.1}
                onChange={onFrequencyChange}
                locked={frequencyLocked}
                discoveredValue={discoveries?.frequency}
              />
            )}
            {showPhase && (
              <ParameterSlider
                label="Phase"
                value={phase}
                min={0}
                max={Math.PI * 2}
                step={Math.PI / 16}
                onChange={onPhaseChange}
                formatValue={formatPhase}
                locked={phaseLocked}
                discoveredValue={discoveries?.phase}
              />
            )}
          </div>

          {/* Qualitative feedback - no numbers shown */}
          {matchScore !== undefined && matchScore > 0 && getFeedbackText(matchScore) && (
            <div className="flex items-center justify-center md:justify-end">
              <div className="text-[#c8e44c] text-lg font-medium animate-pulse">
                {getFeedbackText(matchScore)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
