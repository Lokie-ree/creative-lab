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
  DiagnosisChoices,
  RevealPanel,
} from './components'
import { Scene } from './Scene'
import { Slider } from '@/components/ui/slider'
import { SINEWAVE_COPY } from './sinewaves-copy'

// Stage types
type ViewStage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'
type ChallengePhase = 'observe' | 'diagnose' | 'match'
type ChallengeParam = 'amplitude' | 'frequency'

interface ObservatoryModuleProps {
  onComplete?: () => void
}

// Match thresholds for slider matching
const AMPLITUDE_MATCH_THRESHOLD = 0.1
const FREQUENCY_MATCH_THRESHOLD = 0.15

/**
 * Sinewaves learning module with Observatory HUD design
 * User-controlled pacing, staged reveals, mobile-first layout
 */
export function ObservatoryModule({ onComplete: _onComplete }: ObservatoryModuleProps) {
  // Core state
  const [stage, setStage] = useState<ViewStage>('observe')
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, setFrequency] = useState(1)

  // Target values for guided stages
  const [amplitudeTarget] = useState(1.5)
  const [frequencyTarget] = useState(2)
  const [amplitudeMatched, setAmplitudeMatched] = useState(false)
  const [frequencyMatched, setFrequencyMatched] = useState(false)

  // Challenge state
  const [challengePhase, setChallengePhase] = useState<ChallengePhase>('observe')
  const [challengeParam, setChallengeParam] = useState<ChallengeParam>('amplitude')
  const [challengeTargetValue, setChallengeTargetValue] = useState(1.5)
  const [diagnosisAnswer, setDiagnosisAnswer] = useState<string | undefined>()
  const [challengeMatched, setChallengeMatched] = useState(false)

  // Free explore mode state
  const [isFreeExplore, setIsFreeExplore] = useState(false)

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

  // Frequency match detection
  useEffect(() => {
    if (stage === 'frequency' && !frequencyMatched) {
      if (Math.abs(frequency - frequencyTarget) <= FREQUENCY_MATCH_THRESHOLD) {
        setFrequencyMatched(true)
        // Transition to challenge stage after brief celebration
        setTimeout(() => {
          // Initialize challenge with random parameter
          const param: ChallengeParam = Math.random() > 0.5 ? 'amplitude' : 'frequency'
          const targetValue = param === 'amplitude'
            ? 0.5 + Math.random() * 1.5 // 0.5 to 2.0
            : 1 + Math.random() * 2 // 1 to 3

          setChallengeParam(param)
          setChallengeTargetValue(Math.round(targetValue * 10) / 10) // Round to 1 decimal
          setChallengePhase('observe')
          setDiagnosisAnswer(undefined)
          setChallengeMatched(false)
          setStage('challenge')
        }, 1500)
      }
    }
  }, [stage, frequency, frequencyTarget, frequencyMatched])

  // Challenge match detection
  useEffect(() => {
    if (stage === 'challenge' && challengePhase === 'match' && !challengeMatched) {
      const userValue = challengeParam === 'amplitude' ? amplitude : frequency
      const threshold = challengeParam === 'amplitude'
        ? AMPLITUDE_MATCH_THRESHOLD
        : FREQUENCY_MATCH_THRESHOLD

      if (Math.abs(userValue - challengeTargetValue) <= threshold) {
        setChallengeMatched(true)
        // Transition to reveal stage after brief celebration
        setTimeout(() => setStage('reveal'), 1500)
      }
    }
  }, [stage, challengePhase, challengeParam, amplitude, frequency, challengeTargetValue, challengeMatched])

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
        if (challengePhase === 'observe') {
          return {
            prompt: SINEWAVE_COPY.stages.challenge.observe.prompt,
            description: SINEWAVE_COPY.stages.challenge.observe.subtext,
            showFormula: true,
            showContinue: true,
          }
        } else if (challengePhase === 'diagnose') {
          return {
            prompt: SINEWAVE_COPY.stages.challenge.diagnose.question,
            description: 'Choose what you think changed',
            showFormula: true,
            showContinue: false,
          }
        } else {
          // match phase
          return {
            prompt: SINEWAVE_COPY.stages.challenge.match.prompt,
            description: `Adjust ${challengeParam} to match`,
            showFormula: true,
            showContinue: false,
          }
        }
      case 'reveal':
        return {
          prompt: SINEWAVE_COPY.stages.reveal.title,
          description: SINEWAVE_COPY.stages.reveal.description,
          showFormula: true,
          showContinue: false,
        }
    }
  }, [stage, challengePhase, challengeParam])

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
    } else if (stage === 'challenge' && challengePhase === 'observe') {
      setChallengePhase('diagnose')
    }
  }, [stage, challengePhase])

  // Handle diagnosis answer selection
  const handleDiagnosisSelect = useCallback((value: string) => {
    setDiagnosisAnswer(value)
    // After selection, move to match phase (regardless of correct/incorrect)
    // The matching task itself validates understanding
    setTimeout(() => setChallengePhase('match'), 500)
  }, [])

  // Reveal stage completion handlers
  const handleTryAnother = useCallback(() => {
    // Reset to a new challenge with different random parameter
    const param: ChallengeParam = Math.random() > 0.5 ? 'amplitude' : 'frequency'
    const targetValue = param === 'amplitude'
      ? 0.5 + Math.random() * 1.5
      : 1 + Math.random() * 2

    setChallengeParam(param)
    setChallengeTargetValue(Math.round(targetValue * 10) / 10)
    setChallengePhase('observe')
    setDiagnosisAnswer(undefined)
    setChallengeMatched(false)
    setIsFreeExplore(false)
    setStage('challenge')
  }, [])

  const handleExplore = useCallback(() => {
    // Enable free explore mode - user can manipulate without targets
    setIsFreeExplore(true)
  }, [])

  const handleFinish = useCallback(() => {
    // Call the onComplete callback if provided
    _onComplete?.()
  }, [_onComplete])

  // Compute effective targets for Scene
  // During challenge, the target is the challenge parameter value
  const effectiveAmplitudeTarget = stage === 'challenge' && challengeParam === 'amplitude'
    ? challengeTargetValue
    : amplitudeTarget
  const effectiveFrequencyTarget = stage === 'challenge' && challengeParam === 'frequency'
    ? challengeTargetValue
    : frequencyTarget

  // Scene props - map to existing Scene interface
  const sceneProps = {
    amplitude,
    frequency,
    phase: 0,
    target: { a: effectiveAmplitudeTarget, f: effectiveFrequencyTarget, p: 0 },
    stage: stage as 'observe' | 'amplitude' | 'frequency' | 'phase' | 'challenge' | 'reveal',
    isPaused: false,
    onPauseChange: () => {},
    stageTargets: { amplitude: effectiveAmplitudeTarget, frequency: effectiveFrequencyTarget, phase: 0 },
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

          {/* Frequency slider */}
          {stage === 'frequency' && (
            <div className="w-full">
              <div
                className="mb-2 flex justify-between text-sm"
                style={{
                  fontFamily: 'var(--font-data)',
                  color: 'var(--lab-text-muted)',
                }}
              >
                <span>Frequency</span>
                <span style={{ color: 'var(--lab-accent)' }}>
                  {frequency.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[frequency]}
                onValueChange={([value]) => setFrequency(value)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          {/* Challenge diagnosis choices */}
          {stage === 'challenge' && challengePhase === 'diagnose' && (
            <DiagnosisChoices
              question={SINEWAVE_COPY.stages.challenge.diagnose.question}
              choices={SINEWAVE_COPY.stages.challenge.diagnose.choices}
              onSelect={handleDiagnosisSelect}
              selectedValue={diagnosisAnswer}
            />
          )}

          {/* Challenge match slider */}
          {stage === 'challenge' && challengePhase === 'match' && (
            <div className="w-full">
              <div
                className="mb-2 flex justify-between text-sm"
                style={{
                  fontFamily: 'var(--font-data)',
                  color: 'var(--lab-text-muted)',
                }}
              >
                <span className="capitalize">{challengeParam}</span>
                <span style={{ color: 'var(--lab-accent)' }}>
                  {(challengeParam === 'amplitude' ? amplitude : frequency).toFixed(1)}
                </span>
              </div>
              <Slider
                value={[challengeParam === 'amplitude' ? amplitude : frequency]}
                onValueChange={([value]) => {
                  if (challengeParam === 'amplitude') {
                    setAmplitude(value)
                  } else {
                    setFrequency(value)
                  }
                }}
                min={challengeParam === 'amplitude' ? 0.5 : 0.5}
                max={challengeParam === 'amplitude' ? 2 : 3}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          {/* Reveal stage panel */}
          {stage === 'reveal' && !isFreeExplore && (
            <RevealPanel
              title={SINEWAVE_COPY.stages.reveal.title}
              description={SINEWAVE_COPY.stages.reveal.description}
              soWhat={SINEWAVE_COPY.stages.reveal.soWhat}
              onTryAnother={handleTryAnother}
              onExplore={handleExplore}
              onFinish={_onComplete ? handleFinish : undefined}
            />
          )}

          {/* Free explore mode controls */}
          {stage === 'reveal' && isFreeExplore && (
            <div className="flex w-full flex-col gap-4">
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
              <div className="w-full">
                <div
                  className="mb-2 flex justify-between text-sm"
                  style={{
                    fontFamily: 'var(--font-data)',
                    color: 'var(--lab-text-muted)',
                  }}
                >
                  <span>Frequency</span>
                  <span style={{ color: 'var(--lab-accent)' }}>
                    {frequency.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[frequency]}
                  onValueChange={([value]) => setFrequency(value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <ContinueButton onClick={() => setIsFreeExplore(false)}>
                Back to Results
              </ContinueButton>
            </div>
          )}
        </ControlStrip>
      }
    />
  )
}

export default ObservatoryModule
