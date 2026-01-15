import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { cn } from "@/lib/utils"
import { ParameterSlider } from "@/components/shared/ParameterSlider"

type SliderType = 'amplitude' | 'frequency' | 'phase'

interface Discoveries {
  amplitude: number | null
  frequency: number | null
}

interface ControlPanelProps {
  amplitude: number
  frequency: number
  phase?: number  // Reserved for future use
  onAmplitudeChange: (value: number) => void
  onFrequencyChange: (value: number) => void
  onPhaseChange?: (value: number) => void  // Reserved for future use
  matchScore?: number
  visibleSliders?: SliderType[]
  lockedSliders?: SliderType[]
  discoveries?: Discoveries  // Discovered values to display on locked sliders
}

export function ControlPanel({
  amplitude,
  frequency,
  onAmplitudeChange,
  onFrequencyChange,
  matchScore,
  visibleSliders,
  lockedSliders = [],
  discoveries,
}: ControlPanelProps) {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const prevMatchScoreRef = useRef<number>(matchScore ?? 0)

  // If no visibleSliders specified, show all
  const showAmplitude = !visibleSliders || visibleSliders.includes('amplitude')
  const showFrequency = !visibleSliders || visibleSliders.includes('frequency')

  // Check if sliders are locked
  const amplitudeLocked = lockedSliders.includes('amplitude')
  const frequencyLocked = lockedSliders.includes('frequency')

  const getFeedbackText = (score: number): string | null => {
    if (score >= 95) return null // Triggers reveal, no text needed
    if (score >= 80) return "Almost there..."
    if (score >= 50) return "Getting closer..."
    return "Keep exploring..."
  }

  // Animate match score progress bar updates
  useGSAP(() => {
    if (matchScore !== undefined && matchScore > 0 && progressBarRef.current) {
      const prevScore = prevMatchScoreRef.current
      if (prevScore !== matchScore) {
        gsap.to(progressBarRef.current, {
          width: `${matchScore}%`,
          duration: 0.3,
          ease: "power2.out",
        })
        prevMatchScoreRef.current = matchScore
      }
    }
  }, { dependencies: [matchScore], scope: progressBarRef })

  // Count visible sliders for grid layout
  const visibleCount = [showAmplitude, showFrequency].filter(Boolean).length
  const gridCols = visibleCount === 1
    ? 'grid-cols-1'
    : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className="bg-black/60 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 rounded-xl transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 md:gap-6">
          {/* Sliders */}
          <div className={cn("flex-1 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6", gridCols)}>
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
            {/* Phase slider removed in v2 */}
          </div>

          {/* Match score feedback with visual indicator */}
          {matchScore !== undefined && matchScore > 0 && (
            <div className="flex flex-col items-center md:items-end gap-2 min-w-0">
              {getFeedbackText(matchScore) && (
                <div className="text-(--lab-accent) text-sm sm:text-base md:text-lg font-medium truncate">
                  {getFeedbackText(matchScore)}
                </div>
              )}
              {/* Simple progress bar */}
              <div className="w-full md:w-32 h-1.5 bg-(--lab-border) rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-(--lab-accent)"
                  style={{ width: `${matchScore ?? 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
