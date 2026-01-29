// src/components/modules/sinewaves/ObservatoryModule.tsx
/**
 * Observatory HUD Module - New sinewaves learning experience
 * User-controlled pacing, staged reveals, mobile-first layout
 */
import { useState, useCallback, useEffect } from 'react'
import { ObservatoryLayout } from './Layout'
import {
  StatusStrip,
  PromptReadout,
  FormulaReadout,
  ControlStrip,
  ContinueButton,
} from './components'
import { Scene } from './Scene'
import { Slider } from '@/components/ui/slider'
import { SINEWAVE_COPY } from './sinewaves-copy'

// Stage types
type ViewStage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'

interface ObservatoryModuleProps {
  onComplete?: () => void
}

// Match threshold for slider matching
const AMPLITUDE_MATCH_THRESHOLD = 0.1

/**
 * Sinewaves learning module with Observatory HUD design
 * User-controlled pacing, staged reveals, mobile-first layout
 */
export function ObservatoryModule({ onComplete: _onComplete }: ObservatoryModuleProps) {
  // Core state
  const [stage, setStage] = useState<ViewStage>('observe')
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, _setFrequency] = useState(1)

  // Target values
  const [amplitudeTarget] = useState(1.5)
  const [amplitudeMatched, setAmplitudeMatched] = useState(false)

  // TODO: These will be used in subsequent tasks
  void _onComplete
  void _setFrequency

  // Amplitude match detection
  useEffect(() => {
    if (stage === 'amplitude' && !amplitudeMatched) {
      if (Math.abs(amplitude - amplitudeTarget) <= AMPLITUDE_MATCH_THRESHOLD) {
        setAmplitudeMatched(true)
        // Transition to frequency stage after brief celebration
        setTimeout(() => setStage('frequency'), 1500)
      }
    }
  }, [stage, amplitude, amplitudeTarget, amplitudeMatched])

  // Stage-based content
  const getStageContent = useCallback(() => {
    switch (stage) {
      case 'observe':
        return {
          prompt: SINEWAVE_COPY.stages.observe.prompt,
          description: SINEWAVE_COPY.stages.observe.subtext,
          showFormula: false,
          showContinue: true,
        }
      case 'amplitude':
        return {
          prompt: SINEWAVE_COPY.stages.amplitude.prompt,
          description: SINEWAVE_COPY.stages.amplitude.subtext,
          showFormula: true,
          showContinue: false,
        }
      case 'frequency':
        return {
          prompt: SINEWAVE_COPY.stages.frequency.prompt,
          description: SINEWAVE_COPY.stages.frequency.subtext,
          showFormula: true,
          showContinue: false,
        }
      case 'challenge':
        return {
          prompt: SINEWAVE_COPY.stages.challenge.observe.prompt,
          description: SINEWAVE_COPY.stages.challenge.observe.subtext,
          showFormula: true,
          showContinue: false,
        }
      case 'reveal':
        return {
          prompt: SINEWAVE_COPY.stages.reveal.title,
          description: SINEWAVE_COPY.stages.reveal.description,
          showFormula: true,
          showContinue: false,
        }
    }
  }, [stage])

  const content = getStageContent()

  // Progress calculation (0-100)
  const stageProgress: Record<ViewStage, number> = {
    observe: 5,
    amplitude: 25,
    frequency: 50,
    challenge: 75,
    reveal: 100,
  }

  const stageNumber: Record<ViewStage, number> = {
    observe: 1,
    amplitude: 2,
    frequency: 3,
    challenge: 4,
    reveal: 4,
  }

  // Handlers
  const handleContinue = useCallback(() => {
    if (stage === 'observe') {
      setStage('amplitude')
    }
  }, [stage])

  // Scene props - map to existing Scene interface
  const sceneProps = {
    amplitude,
    frequency,
    phase: 0,
    target: { a: amplitudeTarget, f: 2, p: 0 },
    stage: stage as 'observe' | 'amplitude' | 'frequency' | 'phase' | 'challenge' | 'reveal',
    isPaused: false,
    onPauseChange: () => {},
    stageTargets: { amplitude: amplitudeTarget, frequency: 2, phase: 0 },
    isVisible: true,
  }

  return (
    <ObservatoryLayout
      statusStrip={
        <StatusStrip
          currentStage={stageNumber[stage]}
          totalStages={4}
          progress={stageProgress[stage]}
        />
      }
      promptReadout={
        <PromptReadout
          title={content.prompt}
          description={content.description}
        />
      }
      formulaReadout={
        content.showFormula ? (
          <FormulaReadout
            amplitude={amplitude}
            frequency={frequency}
            highlightAmplitude={stage === 'amplitude'}
            highlightFrequency={stage === 'frequency'}
          />
        ) : undefined
      }
      visualization={
        <div className="h-full w-full">
          <Scene {...sceneProps} />
        </div>
      }
      controlStrip={
        <ControlStrip>
          {content.showContinue && (
            <ContinueButton onClick={handleContinue} />
          )}

          {/* Amplitude slider */}
          {stage === 'amplitude' && (
            <div className="w-full">
              <div
                className="mb-2 flex justify-between text-sm"
                style={{
                  fontFamily: 'var(--font-data)',
                  color: 'var(--lab-text-muted)',
                }}
              >
                <span>Amplitude</span>
                <span style={{ color: 'var(--lab-accent)' }}>
                  {amplitude.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[amplitude]}
                onValueChange={([value]) => setAmplitude(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </ControlStrip>
      }
    />
  )
}

export default ObservatoryModule
