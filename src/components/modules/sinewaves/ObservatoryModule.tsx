// src/components/modules/sinewaves/ObservatoryModule.tsx
/**
 * Observatory HUD Module - New sinewaves learning experience
 * User-controlled pacing, staged reveals, mobile-first layout
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { ObservatoryLayout } from './Layout'
import {
  StatusStrip,
  PromptReadout,
  FormulaReadout,
  ControlStrip,
  ContinueButton,
  DiagnosisChoices,
  RevealPanel,
  MatchFeedback,
  ParameterSlider,
} from './components'
import { Scene } from './Scene'
import { SINEWAVE_COPY } from './sinewaves-copy'
import { consoleBootSequence, stageTransition } from './animations'
import { STAGE_TARGETS, MATCH_THRESHOLDS } from './sinewaves-constants'
import { generateChallengeTarget, type ChallengeParam } from './challenge-utils'

// Stage types
type ViewStage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'
type ChallengePhase = 'observe' | 'diagnose' | 'match'

interface ObservatoryModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  isVisible?: boolean
  onBack?: () => void
}

// Stage index map for dot nav (stable)
const STAGE_TO_INDEX: Record<ViewStage, number> = {
  observe: 0,
  amplitude: 1,
  frequency: 2,
  challenge: 3,
  reveal: 4,
}
const INDEX_TO_STAGE: ViewStage[] = ['observe', 'amplitude', 'frequency', 'challenge', 'reveal']

/**
 * Sinewaves learning module with Observatory HUD design
 * User-controlled pacing, staged reveals, mobile-first layout
 */
export function ObservatoryModule({ onComplete, onBack }: ObservatoryModuleProps) {
  // ─────────────────────────────────────────────────────────────
  // Boot sequence refs
  // ─────────────────────────────────────────────────────────────
  const statusStripRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const vizRef = useRef<HTMLDivElement>(null)
  const controlStripRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const [booted, setBooted] = useState(false)
  const [statusText, setStatusText] = useState('')

  // ─────────────────────────────────────────────────────────────
  // Stage progression
  // ─────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<ViewStage>('observe')

  // ─────────────────────────────────────────────────────────────
  // Wave parameters (user-controlled)
  // ─────────────────────────────────────────────────────────────
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, setFrequency] = useState(1)

  // ─────────────────────────────────────────────────────────────
  // Guided stage match state (targets from STAGE_TARGETS)
  // ─────────────────────────────────────────────────────────────
  const [amplitudeMatched, setAmplitudeMatched] = useState(false)
  const [frequencyMatched, setFrequencyMatched] = useState(false)

  // ─────────────────────────────────────────────────────────────
  // Challenge state
  // ─────────────────────────────────────────────────────────────
  const [challengePhase, setChallengePhase] = useState<ChallengePhase>('observe')
  const [challengeParam, setChallengeParam] = useState<ChallengeParam>('amplitude')
  const [challengeTargetValue, setChallengeTargetValue] = useState(1.5)
  const [diagnosisAnswer, setDiagnosisAnswer] = useState<string | undefined>()
  const [diagnosisWrongAttempts, setDiagnosisWrongAttempts] = useState(0)
  const [challengeMatched, setChallengeMatched] = useState(false)

  // ─────────────────────────────────────────────────────────────
  // Reveal stage
  // ─────────────────────────────────────────────────────────────
  const [isFreeExplore, setIsFreeExplore] = useState(false)

  // Boot sequence on mount
  useEffect(() => {
    // Run boot sequence once on mount
    consoleBootSequence(
      {
        statusStrip: statusStripRef.current,
        progressBar: null, // Dots replace progress bar; no draw animation
        prompt: promptRef.current,
      },
      () => {
        setBooted(true)
      }
    )
  }, [])

  // Match detection handlers - called from slider onChange
  const checkAmplitudeMatch = (value: number) => {
    if (stage === 'amplitude' && !amplitudeMatched) {
      if (Math.abs(value - STAGE_TARGETS.amplitude) <= MATCH_THRESHOLDS.amplitude) {
        setAmplitudeMatched(true)
      }
    }
  }

  const checkFrequencyMatch = (value: number) => {
    if (stage === 'frequency' && !frequencyMatched) {
      if (Math.abs(value - STAGE_TARGETS.frequency) <= MATCH_THRESHOLDS.frequency) {
        setFrequencyMatched(true)
      }
    }
  }

  const checkChallengeMatch = (param: ChallengeParam, value: number) => {
    if (stage === 'challenge' && challengePhase === 'match' && !challengeMatched) {
      const threshold = MATCH_THRESHOLDS[param]
      if (Math.abs(value - challengeTargetValue) <= threshold) {
        setChallengeMatched(true)
      }
    }
  }

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
          const diagnose = SINEWAVE_COPY.stages.challenge.diagnose
          const description =
            diagnosisWrongAttempts >= 2
              ? challengeParam === 'amplitude'
                ? diagnose.hintHeight
                : diagnose.hintSpeed
              : diagnosisWrongAttempts > 0
                ? diagnose.wrongFeedback
                : 'Choose what you think changed'
          return {
            prompt: diagnose.question,
            description,
            showFormula: true,
            showContinue: false,
          }
        } else {
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
  }, [stage, challengePhase, challengeParam, diagnosisWrongAttempts])

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
    reveal: 5,
  }
  const TOTAL_STAGES = 5

  // Control strip hint (title removed from status strip - was truncating badly on mobile)
  const controlHint =
    stage === 'observe'
      ? SINEWAVE_COPY.controlStripHints.observe
      : stage === 'amplitude'
        ? SINEWAVE_COPY.controlStripHints.amplitude
        : stage === 'frequency'
          ? SINEWAVE_COPY.controlStripHints.frequency
          : stage === 'challenge'
            ? challengePhase === 'observe'
              ? SINEWAVE_COPY.controlStripHints.challengeObserve
              : challengePhase === 'diagnose'
                ? content.description
                : SINEWAVE_COPY.controlStripHints.challengeMatch
            : undefined

  const runStageTransition = useCallback(
    (onFadeOutComplete: () => void) => {
      stageTransition(
        {
          controlStrip: controlStripRef.current,
          hint: hintRef.current,
        },
        {
          onFadeOutComplete,
          onComplete: () => setStatusText(''),
        }
      )
    },
    []
  )

  // Handlers
  const handleContinue = useCallback(() => {
    if (stage === 'observe') {
      const t = SINEWAVE_COPY.stageTransitions.observeToAmplitude
      runStageTransition(() => {
        setStage('amplitude')
        setStatusText(t.status)
      })
    } else if (stage === 'challenge' && challengePhase === 'observe') {
      setDiagnosisWrongAttempts(0)
      setChallengePhase('diagnose')
    }
  }, [stage, challengePhase, runStageTransition])

  // Handle diagnosis answer selection
  const handleDiagnosisSelect = useCallback((value: string) => {
    setDiagnosisAnswer(value)
    if (value === challengeParam) {
      setChallengePhase('match')
    } else {
      setDiagnosisWrongAttempts((prev) => prev + 1)
    }
  }, [challengeParam])

  // Match feedback continue handlers
  const handleAmplitudeMatchContinue = useCallback(() => {
    const t = SINEWAVE_COPY.stageTransitions.amplitudeToFrequency
    runStageTransition(() => {
      setStage('frequency')
      setStatusText(t.status)
    })
  }, [runStageTransition])

  const handleFrequencyMatchContinue = useCallback(() => {
    const t = SINEWAVE_COPY.stageTransitions.frequencyToChallenge
    const target = generateChallengeTarget()
    runStageTransition(() => {
      setChallengeParam(target.param)
      setChallengeTargetValue(target.value)
      setChallengePhase('observe')
      setDiagnosisAnswer(undefined)
      setDiagnosisWrongAttempts(0)
      setChallengeMatched(false)
      setStage('challenge')
      setStatusText(t.status)
    })
  }, [runStageTransition])

  const handleChallengeMatchContinue = useCallback(() => {
    const t = SINEWAVE_COPY.stageTransitions.challengeToReveal
    runStageTransition(() => {
      setStage('reveal')
      setStatusText(t.status)
    })
  }, [runStageTransition])

  // Dot nav: go to a previous or current stage (no skip-ahead)
  const handleStageSelect = useCallback(
    (index: number) => {
      const currentIndex = STAGE_TO_INDEX[stage]
      if (index > currentIndex) return
      if (index === currentIndex) return
      const newStage = INDEX_TO_STAGE[index]
      runStageTransition(() => {
        setStage(newStage)
        setAmplitudeMatched(index > 1)
        setFrequencyMatched(index > 2)
        setChallengeMatched(index > 3)
        if (newStage === 'challenge') {
          setChallengePhase('observe')
          setDiagnosisAnswer(undefined)
          setDiagnosisWrongAttempts(0)
        }
        setStatusText('')
      })
    },
    [stage, runStageTransition]
  )

  // Reveal stage completion handlers
  const handleTryAnother = useCallback(() => {
    // Reset to a new challenge with different random parameter
    const target = generateChallengeTarget()
    setChallengeParam(target.param)
    setChallengeTargetValue(target.value)
    setChallengePhase('observe')
    setDiagnosisAnswer(undefined)
    setDiagnosisWrongAttempts(0)
    setChallengeMatched(false)
    setIsFreeExplore(false)
    setStage('challenge')
  }, [])

  const handleExplore = useCallback(() => {
    // Enable free explore mode - user can manipulate without targets
    setIsFreeExplore(true)
  }, [])

  const handleFinish = useCallback(() => {
    // Call the onComplete callback with discovered values
    onComplete({ a: amplitude, f: frequency })
  }, [onComplete, amplitude, frequency])

  // Compute effective targets for Scene
  // During challenge, the target is the challenge parameter value
  const effectiveAmplitudeTarget = stage === 'challenge' && challengeParam === 'amplitude'
    ? challengeTargetValue
    : STAGE_TARGETS.amplitude
  const effectiveFrequencyTarget = stage === 'challenge' && challengeParam === 'frequency'
    ? challengeTargetValue
    : STAGE_TARGETS.frequency

  // Determine if we're in a match success state
  const isMatchSuccess =
    (stage === 'amplitude' && amplitudeMatched) ||
    (stage === 'frequency' && frequencyMatched) ||
    (stage === 'challenge' && challengeMatched)

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
    matchSuccess: isMatchSuccess,
  }

  return (
    <ObservatoryLayout
      statusStrip={
        <StatusStrip
          ref={statusStripRef}
          currentStage={stageNumber[stage]}
          totalStages={TOTAL_STAGES}
          progress={stageProgress[stage]}
          onBack={onBack}
          onStageSelect={handleStageSelect}
          statusText={statusText}
          className={booted ? '' : 'opacity-0'}
        />
      }
      promptReadout={
        <PromptReadout
          ref={promptRef}
          title={content.prompt}
          description={content.description}
          className={booted ? '' : 'opacity-0'}
        />
      }
      formulaReadout={
        content.showFormula ? (
          <FormulaReadout
            amplitude={amplitude}
            frequency={frequency}
            highlightAmplitude={stage === 'amplitude' || (stage === 'challenge' && challengeParam === 'amplitude')}
            highlightFrequency={stage === 'frequency' || (stage === 'challenge' && challengeParam === 'frequency')}
          />
        ) : undefined
      }
      visualization={
        <div ref={vizRef} className="h-full w-full">
          <Scene {...sceneProps} />
        </div>
      }
      controlStrip={
        <ControlStrip
          ref={controlStripRef}
          hintRef={hintRef}
          hint={controlHint}
          formula={
            content.showFormula ? (
              <FormulaReadout
                amplitude={amplitude}
                frequency={frequency}
                highlightAmplitude={stage === 'amplitude' || (stage === 'challenge' && challengeParam === 'amplitude')}
                highlightFrequency={stage === 'frequency' || (stage === 'challenge' && challengeParam === 'frequency')}
              />
            ) : undefined
          }
        >
          {content.showContinue && (
            <ContinueButton onClick={handleContinue} />
          )}

          {/* Amplitude stage: slider or match feedback */}
          {stage === 'amplitude' && !amplitudeMatched && (
            <ParameterSlider
              param="amplitude"
              value={amplitude}
              onChange={(value) => {
                setAmplitude(value)
                checkAmplitudeMatch(value)
              }}
            />
          )}
          {stage === 'amplitude' && amplitudeMatched && (
            <MatchFeedback
              message={SINEWAVE_COPY.matchCelebration.amplitude}
              onContinue={handleAmplitudeMatchContinue}
              isVisible={true}
            />
          )}

          {/* Frequency stage: slider or match feedback */}
          {stage === 'frequency' && !frequencyMatched && (
            <ParameterSlider
              param="frequency"
              value={frequency}
              onChange={(value) => {
                setFrequency(value)
                checkFrequencyMatch(value)
              }}
            />
          )}
          {stage === 'frequency' && frequencyMatched && (
            <MatchFeedback
              message={SINEWAVE_COPY.matchCelebration.frequency}
              onContinue={handleFrequencyMatchContinue}
              isVisible={true}
              visualizationRef={vizRef}
              matchedValue={STAGE_TARGETS.frequency}
              matchedLabel="Frequency"
            />
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

          {/* Challenge match: slider or match feedback */}
          {stage === 'challenge' && challengePhase === 'match' && !challengeMatched && (
            <ParameterSlider
              param={challengeParam}
              value={challengeParam === 'amplitude' ? amplitude : frequency}
              onChange={(value) => {
                if (challengeParam === 'amplitude') {
                  setAmplitude(value)
                } else {
                  setFrequency(value)
                }
                checkChallengeMatch(challengeParam, value)
              }}
            />
          )}
          {stage === 'challenge' && challengePhase === 'match' && challengeMatched && (
            <MatchFeedback
              message={
                challengeParam === 'amplitude'
                  ? SINEWAVE_COPY.matchCelebration.challengeAmplitude
                  : SINEWAVE_COPY.matchCelebration.challengeFrequency
              }
              onContinue={handleChallengeMatchContinue}
              isVisible={true}
              visualizationRef={vizRef}
              matchedValue={challengeTargetValue}
              matchedLabel={challengeParam === 'amplitude' ? 'Amplitude' : 'Frequency'}
            />
          )}

          {/* Reveal stage panel */}
          {stage === 'reveal' && !isFreeExplore && (
            <RevealPanel
              title={SINEWAVE_COPY.stages.reveal.title}
              description={SINEWAVE_COPY.stages.reveal.description}
              soWhat={SINEWAVE_COPY.stages.reveal.soWhat}
              onTryAnother={handleTryAnother}
              onExplore={handleExplore}
              onFinish={handleFinish}
            />
          )}

          {/* Free explore mode controls */}
          {stage === 'reveal' && isFreeExplore && (
            <div className="flex w-full flex-col gap-4">
              <ParameterSlider
                param="amplitude"
                value={amplitude}
                onChange={setAmplitude}
              />
              <ParameterSlider
                param="frequency"
                value={frequency}
                onChange={setFrequency}
              />
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
