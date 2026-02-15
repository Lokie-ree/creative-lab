// src/components/modules/sinewaves/InstrumentModule.tsx
/**
 * Sinewaves Instrument Module
 *
 * Scientific instrument approach: everything always visible and interactive.
 * Guide states only change prompts and highlights, not the instrument itself.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { InstrumentLayout } from './Layout'
import { StatusStrip } from './components/StatusStrip'
import { PromptReadout } from './components/PromptReadout'
import { FormulaReadout } from './components/FormulaReadout'
import { ControlStrip } from './components/ControlStrip'
import { ParameterSlider } from './components/ParameterSlider'
import { ContinueButton } from './components/ContinueButton'
import { InstrumentControls } from './components/InstrumentControls'
import { Scene } from './Scene'
import {
  type GuideState,
  type SpeedMultiplier,
  GUIDE_STATE_TO_INDEX,
  INDEX_TO_GUIDE_STATE,
  TOTAL_GUIDE_STATES,
  getGuideStateConfig,
  cycleSpeed,
} from './guide-state'
import { consoleBootSequence, matchSuccessSequence } from './animations'
import { STAGE_TARGETS, MATCH_THRESHOLDS } from './sinewaves-constants'
import { generateChallengeTarget, type ChallengeParam } from './challenge-utils'
import { SINEWAVE_COPY } from './sinewaves-copy'
import { useProximity } from './use-proximity'

interface InstrumentModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  onBack?: () => void
}

export function InstrumentModule({ onComplete, onBack }: InstrumentModuleProps) {
  // ─────────────────────────────────────────────────────────────
  // Boot sequence
  // ─────────────────────────────────────────────────────────────
  const statusStripRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    consoleBootSequence(
      {
        statusStrip: statusStripRef.current,
        progressBar: null,
        prompt: promptRef.current,
      },
      () => setBooted(true)
    )
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Guide state
  // ─────────────────────────────────────────────────────────────
  const [guideState, setGuideState] = useState<GuideState>('watch')

  // ─────────────────────────────────────────────────────────────
  // Wave parameters
  // ─────────────────────────────────────────────────────────────
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, setFrequency] = useState(1)

  // ─────────────────────────────────────────────────────────────
  // Instrument controls
  // ─────────────────────────────────────────────────────────────
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState<SpeedMultiplier>(1)
  const [sceneKey, setSceneKey] = useState(0) // For reset functionality — forces Scene remount

  // ─────────────────────────────────────────────────────────────
  // Challenge state
  // ─────────────────────────────────────────────────────────────
  const [challengeParam, setChallengeParam] = useState<ChallengeParam>('amplitude')
  const [challengeTargetValue, setChallengeTargetValue] = useState(1.5)

  // ─────────────────────────────────────────────────────────────
  // Match state
  // ─────────────────────────────────────────────────────────────
  const [matchGlow, setMatchGlow] = useState(false)
  const [matchMessage, setMatchMessage] = useState<string | null>(null)

  // Refs for inline match feedback animation
  const matchFeedbackRef = useRef<HTMLDivElement>(null)
  const matchContinueRef = useRef<HTMLButtonElement>(null)

  // Get config for current guide state
  const config = getGuideStateConfig(guideState, challengeParam)

  // ─────────────────────────────────────────────────────────────
  // Proximity feedback
  // ─────────────────────────────────────────────────────────────
  const activeParam = guideState === 'match-amplitude' ? 'amplitude'
    : guideState === 'match-frequency' ? 'frequency'
    : guideState === 'challenge' ? challengeParam
    : null

  const activeTarget = guideState === 'match-amplitude' ? STAGE_TARGETS.amplitude
    : guideState === 'match-frequency' ? STAGE_TARGETS.frequency
    : guideState === 'challenge' ? challengeTargetValue
    : null

  const activeValue = activeParam === 'amplitude' ? amplitude
    : activeParam === 'frequency' ? frequency
    : 0

  const proximity = useProximity(activeParam, activeValue, activeTarget ?? 0)

  // ─────────────────────────────────────────────────────────────
  // State transitions
  // ─────────────────────────────────────────────────────────────
  const advanceGuideState = useCallback(() => {
    setSpeed(1) // Reset speed on advance

    switch (guideState) {
      case 'watch':
        setGuideState('match-amplitude')
        break
      case 'match-amplitude':
        setGuideState('match-frequency')
        break
      case 'match-frequency': {
        // Generate challenge target
        const target = generateChallengeTarget()
        setChallengeParam(target.param)
        setChallengeTargetValue(target.value)
        setGuideState('challenge')
        break
      }
      case 'challenge':
        setGuideState('free')
        break
      case 'free':
        // Already at end
        break
    }
  }, [guideState])

  // ─────────────────────────────────────────────────────────────
  // Match detection
  // ─────────────────────────────────────────────────────────────
  const getMatchMessage = useCallback((state: GuideState, param: ChallengeParam): string => {
    const copy = SINEWAVE_COPY.matchCelebration
    if (state === 'match-amplitude') return copy.amplitude
    if (state === 'match-frequency') return copy.frequency
    if (state === 'challenge' && param === 'amplitude') return copy.challengeAmplitude
    if (state === 'challenge' && param === 'frequency') return copy.challengeFrequency
    return copy.challengeBoth
  }, [])

  const handleMatchContinue = useCallback(() => {
    setMatchGlow(false)
    setMatchMessage(null)
    advanceGuideState()
  }, [advanceGuideState])

  // Run match success animation when matchMessage appears
  useEffect(() => {
    if (matchMessage && matchFeedbackRef.current) {
      matchSuccessSequence(
        {
          visualization: null,
          feedback: matchFeedbackRef.current,
          continueButton: matchContinueRef.current,
        },
        () => { /* animation complete */ }
      )
    }
  }, [matchMessage])

  const checkMatch = useCallback((param: 'amplitude' | 'frequency', value: number) => {
    if (matchGlow) return // Already matched, waiting for transition

    let target: number
    let threshold: number

    if (guideState === 'match-amplitude' && param === 'amplitude') {
      target = STAGE_TARGETS.amplitude
      threshold = MATCH_THRESHOLDS.amplitude
    } else if (guideState === 'match-frequency' && param === 'frequency') {
      target = STAGE_TARGETS.frequency
      threshold = MATCH_THRESHOLDS.frequency
    } else if (guideState === 'challenge' && param === challengeParam) {
      target = challengeTargetValue
      threshold = MATCH_THRESHOLDS[param]
    } else {
      return
    }

    if (Math.abs(value - target) <= threshold) {
      // Snap parameter to exact target value
      if (param === 'amplitude') setAmplitude(target)
      else setFrequency(target)

      // Match found — show inline banner
      setMatchGlow(true)
      setMatchMessage(getMatchMessage(guideState, challengeParam))
    }
  }, [guideState, challengeParam, challengeTargetValue, matchGlow, getMatchMessage])

  // Auto-advance from watch if user interacts with sliders
  const handleSliderChange = useCallback((param: 'amplitude' | 'frequency', value: number) => {
    if (param === 'amplitude') {
      setAmplitude(value)
    } else {
      setFrequency(value)
    }

    // Auto-advance from watch state on any slider interaction
    if (guideState === 'watch') {
      setGuideState('match-amplitude')
      return
    }

    checkMatch(param, value)
  }, [guideState, checkMatch])

  // ─────────────────────────────────────────────────────────────
  // Instrument controls
  // ─────────────────────────────────────────────────────────────
  const handleTogglePause = useCallback(() => {
    setIsPaused(p => !p)
  }, [])

  const handleReset = useCallback(() => {
    setAmplitude(1)
    setFrequency(1)
    setIsPaused(false)
    // Force Scene remount to reset animation
    setSceneKey(k => k + 1)
  }, [])

  const handleCycleSpeed = useCallback(() => {
    setSpeed(s => cycleSpeed(s))
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Action buttons
  // ─────────────────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    advanceGuideState()
  }, [advanceGuideState])

  const handleTryAnother = useCallback(() => {
    const target = generateChallengeTarget()
    setChallengeParam(target.param)
    setChallengeTargetValue(target.value)
    setGuideState('challenge')
  }, [])

  const handleComplete = useCallback(() => {
    onComplete({ a: amplitude, f: frequency })
  }, [onComplete, amplitude, frequency])

  // ─────────────────────────────────────────────────────────────
  // Dot navigation
  // ─────────────────────────────────────────────────────────────
  const handleStageSelect = useCallback((index: number) => {
    const currentIndex = GUIDE_STATE_TO_INDEX[guideState]
    if (index >= currentIndex) return // Can only go back
    const newState = INDEX_TO_GUIDE_STATE[index]
    setGuideState(newState)
    setSpeed(1)
  }, [guideState])

  // ─────────────────────────────────────────────────────────────
  // Compute effective targets for Scene
  // ─────────────────────────────────────────────────────────────
  const effectiveAmplitudeTarget = guideState === 'challenge' && challengeParam === 'amplitude'
    ? challengeTargetValue
    : STAGE_TARGETS.amplitude
  const effectiveFrequencyTarget = guideState === 'challenge' && challengeParam === 'frequency'
    ? challengeTargetValue
    : STAGE_TARGETS.frequency

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <InstrumentLayout
      booted={booted}
      statusStrip={
        <StatusStrip
          ref={statusStripRef}
          currentStage={GUIDE_STATE_TO_INDEX[guideState] + 1}
          totalStages={TOTAL_GUIDE_STATES}
          onBack={onBack}
          onStageSelect={handleStageSelect}
          className={booted ? '' : 'opacity-0'}
        />
      }
      promptReadout={
        <PromptReadout
          ref={promptRef}
          title={config.prompt}
          description={(!matchGlow && activeParam) ? proximity.feedback ?? undefined : undefined}
          className={booted ? '' : 'opacity-0'}
        />
      }
      formulaReadout={
        <FormulaReadout
          amplitude={amplitude}
          frequency={frequency}
          highlightAmplitude={config.highlightAmplitude}
          highlightFrequency={config.highlightFrequency}
        />
      }
      visualization={
        <Scene
          key={sceneKey} // Reset animation on reset
          amplitude={amplitude}
          frequency={frequency}
          phase={0}
          target={{ a: effectiveAmplitudeTarget, f: effectiveFrequencyTarget, p: 0 }}
          stage={
            guideState === 'watch' || guideState === 'free' ? 'observe'
            : guideState === 'match-amplitude' ? 'amplitude'
            : guideState === 'match-frequency' ? 'frequency'
            : 'challenge'
          }
          isPaused={isPaused}
          onPauseChange={setIsPaused}
          stageTargets={{ amplitude: effectiveAmplitudeTarget, frequency: effectiveFrequencyTarget, phase: 0 }}
          isVisible={true}
          matchSuccess={matchGlow}
          showGhost={config.showGhost}
          showConnector={config.showConnector}
          speedMultiplier={speed}
          challengeParam={guideState === 'challenge' ? challengeParam : undefined}
        />
      }
      controlStrip={
        <ControlStrip
          amplitudeSlider={
            <ParameterSlider
              param="amplitude"
              value={amplitude}
              onChange={(v) => handleSliderChange('amplitude', v)}
            />
          }
          frequencySlider={
            <ParameterSlider
              param="frequency"
              value={frequency}
              onChange={(v) => handleSliderChange('frequency', v)}
            />
          }
          instrumentControls={
            <InstrumentControls
              isPaused={isPaused}
              speed={speed}
              onTogglePause={handleTogglePause}
              onReset={handleReset}
              onCycleSpeed={handleCycleSpeed}
            />
          }
          actionButtons={
            <>
              {/* Inline match banner — NOT a full-screen overlay */}
              {matchMessage && (
                <div className="flex items-center gap-3">
                  <div
                    ref={matchFeedbackRef}
                    className="opacity-0 text-sm font-medium text-(--lab-earned) lab-display-font"
                  >
                    {matchMessage}
                  </div>
                  <ContinueButton
                    ref={matchContinueRef}
                    onClick={handleMatchContinue}
                    className="opacity-0"
                  >
                    Continue
                  </ContinueButton>
                </div>
              )}
              {!matchMessage && guideState === 'watch' && (
                <ContinueButton onClick={handleContinue}>
                  Continue
                </ContinueButton>
              )}
              {!matchMessage && guideState === 'free' && (
                <>
                  <ContinueButton onClick={handleTryAnother} variant="ghost">
                    Try Another
                  </ContinueButton>
                  <ContinueButton onClick={handleComplete}>
                    Complete
                  </ContinueButton>
                </>
              )}
            </>
          }
        />
      }
    />
  )
}

export default InstrumentModule
