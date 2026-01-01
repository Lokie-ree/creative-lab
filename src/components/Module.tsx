import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"
import { Scene } from "./modules/sinusoidal/Scene"
import { ControlPanel } from "./controls/ControlPanel"
import { FormulaPreview } from "./feedback/FormulaPreview"
import { ProgressBar } from "./shared/ProgressBar"
import { ExplorePrompt } from "./shared/ExplorePrompt"
import { AnimatedPanel } from "./shared/AnimatedPanel"
import { CelebrationPulse } from "./shared/CelebrationPulse"
import { QuestionCard } from "./feedback/QuestionCard"
import { FeedbackBanner } from "./feedback/FeedbackBanner"

// ============================================================================
// TYPES
// ============================================================================

type Stage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'
type SubStage = 'explore' | 'match' | 'reflect' | 'freeExplore'
type ChallengePhase = 'observe' | 'diagnose' | 'match'

// ============================================================================
// CONSTANTS
// ============================================================================

const TOTAL_STAGES = 4 // observe, amplitude, frequency, challenge (reveal is completion)

// Fixed educational targets - nice round numbers for learning
const STAGE_TARGETS = {
  amplitude: 1.5,
  frequency: 2.0,
}

// Match thresholds
const AMPLITUDE_THRESHOLD = 0.1
const FREQUENCY_THRESHOLD = 0.15
const CHALLENGE_MATCH_THRESHOLD = 95

// Prediction-based questions (test understanding, not recall)
const QUESTIONS = {
  amplitude: {
    question: "If amplitude were 3, how high would the wave peak?",
    choices: [
      { label: "1.5", value: 1.5 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "6", value: 6 },
    ],
    answer: 3,
    flashValue: 3,
  },
  frequency: {
    question: "How many complete waves fit when frequency = 3?",
    choices: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
    answer: 3,
    flashValue: 3,
  },
}

// Nice values for challenge stage (excluding the matched values)
const CHALLENGE_AMPLITUDES = [0.75, 1.0, 1.25, 1.75, 2.0]
const CHALLENGE_FREQUENCIES = [0.5, 1.0, 1.5, 2.5, 3.0]

// ============================================================================
// HELPERS
// ============================================================================

function getStageNumber(stage: Stage): number {
  const stages: Stage[] = ['observe', 'amplitude', 'frequency', 'challenge']
  const idx = stages.indexOf(stage)
  return idx >= 0 ? idx + 1 : TOTAL_STAGES
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function calculateMatchScore(
  userA: number,
  userF: number,
  targetA: number,
  targetF: number
): number {
  const ampScore = 1 - Math.min(Math.abs(userA - targetA) / 1.5, 1)
  const freqScore = 1 - Math.min(Math.abs(userF - targetF) / 2.5, 1)
  return Math.min(ampScore, freqScore) * 100
}

// ============================================================================
// COMPONENT
// ============================================================================

interface ModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  isVisible?: boolean
}

export function Module({ onComplete, isVisible = true }: ModuleProps) {
  // ---------------------------------------------------------------------------
  // Stage Management
  // ---------------------------------------------------------------------------
  const [stage, setStage] = useState<Stage>('observe')
  const [subStage, setSubStage] = useState<SubStage>('explore')
  const [showContinue, setShowContinue] = useState(false)

  // Challenge-specific state
  const [challengePhase, setChallengePhase] = useState<ChallengePhase>('diagnose')
  const [challengeParam, setChallengeParam] = useState<'amplitude' | 'frequency'>('amplitude')
  const [challengeWave, setChallengeWave] = useState({ a: 1.0, f: 2.0 })

  // ---------------------------------------------------------------------------
  // Wave Parameters
  // ---------------------------------------------------------------------------
  const [amplitude, setAmplitude] = useState(1.0)
  const [frequency, setFrequency] = useState(1.0)

  // Refs for flash animation (to avoid re-renders during animation)
  const amplitudeRef = useRef(amplitude)
  const frequencyRef = useRef(frequency)
  amplitudeRef.current = amplitude
  frequencyRef.current = frequency

  // ---------------------------------------------------------------------------
  // Question State
  // ---------------------------------------------------------------------------
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  // ---------------------------------------------------------------------------
  // Discovery Memory
  // ---------------------------------------------------------------------------
  const [discoveries, setDiscoveries] = useState<{
    amplitude: number | null
    frequency: number | null
  }>({
    amplitude: null,
    frequency: null,
  })

  // ---------------------------------------------------------------------------
  // Animation State
  // ---------------------------------------------------------------------------
  const [isPaused, setIsPaused] = useState(false)
  const [celebrationCount, setCelebrationCount] = useState(0)

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------
  const currentQuestion = (stage === 'amplitude' || stage === 'frequency')
    ? QUESTIONS[stage]
    : null

  const isParameterStage = stage === 'amplitude' || stage === 'frequency'

  // Match score for challenge stage
  const challengeMatchScore = useMemo(() => {
    if (stage !== 'challenge') return 0
    return calculateMatchScore(amplitude, frequency, challengeWave.a, challengeWave.f)
  }, [stage, amplitude, frequency, challengeWave])

  // Target for ghost wave display
  const ghostTarget = useMemo(() => {
    if (stage === 'amplitude') {
      return { a: STAGE_TARGETS.amplitude, f: 1.0, p: 0 }
    }
    if (stage === 'frequency') {
      return { a: STAGE_TARGETS.amplitude, f: STAGE_TARGETS.frequency, p: 0 }
    }
    if (stage === 'challenge') {
      return { a: challengeWave.a, f: challengeWave.f, p: 0 }
    }
    return { a: 1, f: 1, p: 0 }
  }, [stage, challengeWave])

  // ---------------------------------------------------------------------------
  // Stage 1: Observe - Show continue after delay
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (stage === 'observe') {
      const timer = setTimeout(() => setShowContinue(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  // ---------------------------------------------------------------------------
  // Parameter Stages: Detect match and transition to reflect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (subStage !== 'explore' || isFlashing) return

    const checkMatch = () => {
      if (stage === 'amplitude') {
        return Math.abs(amplitude - STAGE_TARGETS.amplitude) <= AMPLITUDE_THRESHOLD
      }
      if (stage === 'frequency') {
        return Math.abs(frequency - STAGE_TARGETS.frequency) <= FREQUENCY_THRESHOLD
      }
      return false
    }

    if (checkMatch()) {
      // Trigger celebration
      setCelebrationCount(c => c + 1)

      // Transition to match substage for visual feedback
      setSubStage('match')

      // Use GSAP delayedCall for timed transition to reflect
      gsap.delayedCall(2, () => {
        setSubStage('reflect')
        setSelectedAnswer(null)
      })
    }
  }, [stage, subStage, amplitude, frequency, isFlashing])

  // ---------------------------------------------------------------------------
  // Challenge Stage: Observation period before asking question
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (stage !== 'challenge' || challengePhase !== 'observe') return

    // Give user 3 seconds to observe the difference before asking
    const delayed = gsap.delayedCall(3, () => {
      setChallengePhase('diagnose')
    })

    return () => { delayed.kill() }
  }, [stage, challengePhase])

  // ---------------------------------------------------------------------------
  // Challenge Stage: Detect final match
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (stage !== 'challenge' || challengePhase !== 'match') return

    if (challengeMatchScore >= CHALLENGE_MATCH_THRESHOLD) {
      setCelebrationCount(c => c + 1)
      // Update discoveries with the final matched values
      setDiscoveries({ amplitude, frequency })
      // Go to reveal stage - don't call onComplete yet
      // User can choose to try another challenge or explore
      setTimeout(() => {
        setStage('reveal')
      }, 800)
    }
  }, [stage, challengePhase, challengeMatchScore, amplitude, frequency])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleContinueFromObserve = useCallback(() => {
    setShowContinue(false)
    setStage('amplitude')
    setSubStage('explore')
  }, [])

  const handleAnswerSelect = useCallback((value: string | number) => {
    if (!currentQuestion) return

    const numValue = typeof value === 'string' ? parseFloat(value) : value
    setSelectedAnswer(numValue)
    const correct = numValue === currentQuestion.answer
    setIsCorrect(correct)
  }, [currentQuestion])

  const handleContinueFromReflect = useCallback(() => {
    if (!isCorrect || !currentQuestion) return

    // Flash the predicted value to reinforce understanding
    setIsFlashing(true)
    const flashValue = currentQuestion.flashValue
    const originalValue = stage === 'amplitude' ? amplitude : frequency
    const setter = stage === 'amplitude' ? setAmplitude : setFrequency

    // Flash to predicted value
    setter(flashValue)

    // After flash, return to matched value and advance
    setTimeout(() => {
      setter(originalValue)
      setIsFlashing(false)

      // Store discovery and advance
      if (stage === 'amplitude') {
        setDiscoveries(prev => ({ ...prev, amplitude }))
        setStage('frequency')
        setSubStage('explore')
        setSelectedAnswer(null)
      } else if (stage === 'frequency') {
        setDiscoveries(prev => ({ ...prev, frequency }))
        // Set up challenge
        setupChallenge()
      }
    }, 1200)
  }, [isCorrect, currentQuestion, stage, amplitude, frequency])

  const setupChallenge = useCallback(() => {
    // Randomly pick which parameter differs
    const param = Math.random() > 0.5 ? 'amplitude' : 'frequency'
    setChallengeParam(param)

    // Generate challenge wave differing by ONE param
    const newChallengeWave = {
      a: param === 'amplitude' ? pickRandom(CHALLENGE_AMPLITUDES) : STAGE_TARGETS.amplitude,
      f: param === 'frequency' ? pickRandom(CHALLENGE_FREQUENCIES) : STAGE_TARGETS.frequency,
    }
    setChallengeWave(newChallengeWave)

    // Reset user values to matched values
    setAmplitude(STAGE_TARGETS.amplitude)
    setFrequency(STAGE_TARGETS.frequency)

    setStage('challenge')
    setChallengePhase('observe') // Start with observation, not immediate question
    setSelectedAnswer(null)
  }, [])

  const handleDiagnoseAnswer = useCallback((value: string | number) => {
    const answer = value as string
    const correct = answer === challengeParam

    if (correct) {
      setCelebrationCount(c => c + 1)
      setTimeout(() => {
        setChallengePhase('match')
      }, 500)
    } else {
      // Shake feedback - just reset selection for retry
      setSelectedAnswer(null)
    }
  }, [challengeParam])

  const handleTryAgain = useCallback(() => {
    setSelectedAnswer(null)
  }, [])

  const handleTryAnotherChallenge = useCallback(() => {
    setupChallenge()
  }, [setupChallenge])

  const handleFreeExplore = useCallback(() => {
    // Reset to free explore mode with all sliders unlocked
    setStage('reveal')
    setSubStage('freeExplore')
    setAmplitude(1.0)
    setFrequency(1.0)
  }, [])

  // ---------------------------------------------------------------------------
  // Prompt Content
  // ---------------------------------------------------------------------------
  const getPromptContent = () => {
    if (stage === 'observe') {
      return { text: 'Watch where the wave comes from', subtext: undefined }
    }
    if (stage === 'amplitude' && subStage === 'explore') {
      return { text: 'Make the wave taller', subtext: 'Match the ghost wave' }
    }
    if (stage === 'frequency' && subStage === 'explore') {
      return { text: 'Make the wave faster', subtext: 'Match the ghost wave' }
    }
    if (stage === 'challenge' && challengePhase === 'observe') {
      return { text: 'Something changed', subtext: 'Look closely at both waves' }
    }
    // Note: During diagnose, the QuestionCard shows "What changed?" so no prompt needed
    if (stage === 'challenge' && challengePhase === 'diagnose') {
      return null
    }
    if (stage === 'challenge' && challengePhase === 'match') {
      return { text: 'Now match it', subtext: undefined }
    }
    if (stage === 'reveal' && subStage === 'freeExplore') {
      return { text: 'Free exploration', subtext: 'Play with the parameters' }
    }
    if (stage === 'reveal') {
      return { text: 'Challenge complete!', subtext: undefined }
    }
    return null
  }

  const promptContent = getPromptContent()

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: 'var(--lab-bg)' }}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <ProgressBar current={getStageNumber(stage)} total={TOTAL_STAGES} />
      </div>

      {/* Celebration pulse effect */}
      <CelebrationPulse trigger={celebrationCount} />

      {/* Formula preview */}
      <div className="absolute top-16 right-2 sm:top-8 sm:right-4 z-10 max-w-[calc(100vw-1rem)]">
        <FormulaPreview discoveries={discoveries} />
      </div>

      {/* Explore prompt */}
      {promptContent && (
        <div className="absolute top-4 sm:top-8 left-16 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-10 sm:w-auto">
          <ExplorePrompt
            text={promptContent.text}
            subtext={promptContent.subtext}
            visible={true}
          />
        </div>
      )}

      {/* Visualization area */}
      <div className={cn(
        "flex-1 min-h-0",
        (isParameterStage && subStage === 'reflect') && "pb-20 sm:pb-24"
      )}>
        <Scene
          amplitude={amplitude}
          frequency={frequency}
          phase={0}
          target={ghostTarget}
          stage={stage}
          isPaused={isPaused || !isVisible}
          onPauseChange={setIsPaused}
          stageTargets={{ amplitude: STAGE_TARGETS.amplitude, frequency: STAGE_TARGETS.frequency, phase: 0 }}
          isVisible={isVisible}
        />
      </div>

      {/* Continue button - Observe stage only */}
      {stage === 'observe' && showContinue && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={handleContinueFromObserve}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-transparent rounded-lg transition-all duration-300 text-sm font-medium tracking-wide border border-[var(--lab-accent)]/50 text-[var(--lab-accent)] hover:bg-[var(--lab-accent)]/10 hover:border-[var(--lab-accent)]"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Amplitude slider */}
      {stage === 'amplitude' && subStage === 'explore' && (
        <AnimatedPanel
          transitionKey="amplitude"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-2rem)] max-w-sm px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={() => {}}
            matchScore={0}
            visibleSliders={['amplitude']}
          />
        </AnimatedPanel>
      )}

      {/* Frequency slider */}
      {stage === 'frequency' && subStage === 'explore' && (
        <AnimatedPanel
          transitionKey="frequency"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-2rem)] max-w-md px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={() => {}}
            matchScore={0}
            visibleSliders={['amplitude', 'frequency']}
            lockedSliders={['amplitude']}
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}

      {/* Challenge diagnose question */}
      {stage === 'challenge' && challengePhase === 'diagnose' && (
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-[90vw] sm:max-w-md px-3 sm:px-4 md:px-0">
          <QuestionCard
            question="What changed?"
            choices={[
              { label: "Amplitude", value: "amplitude" },
              { label: "Frequency", value: "frequency" },
              { label: "Both", value: "both" },
            ]}
            onSelect={handleDiagnoseAnswer}
            selectedValue={selectedAnswer ?? undefined}
          />
        </div>
      )}

      {/* Challenge match slider */}
      {stage === 'challenge' && challengePhase === 'match' && (
        <AnimatedPanel
          transitionKey="challenge"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-2rem)] max-w-md px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={() => {}}
            matchScore={challengeMatchScore}
            visibleSliders={['amplitude', 'frequency']}
            lockedSliders={challengeParam === 'amplitude' ? ['frequency'] : ['amplitude']}
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}

      {/* Match celebration message */}
      {isParameterStage && subStage === 'match' && (
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-20 animate-in fade-in zoom-in duration-300">
          <div className="text-2xl sm:text-3xl font-bold text-[var(--lab-accent)]">
            Perfect match!
          </div>
        </div>
      )}

      {/* Reflect question */}
      {isParameterStage && subStage === 'reflect' && currentQuestion && (
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-[90vw] sm:max-w-md px-3 sm:px-4 md:px-0">
          <QuestionCard
            question={currentQuestion.question}
            choices={currentQuestion.choices}
            onSelect={handleAnswerSelect}
            selectedValue={selectedAnswer ?? undefined}
          />
        </div>
      )}

      {/* Feedback banner for reflect phase */}
      {isParameterStage && subStage === 'reflect' && selectedAnswer !== null && (
        <FeedbackBanner
          correct={isCorrect}
          onContinue={isCorrect ? handleContinueFromReflect : handleTryAgain}
        />
      )}

      {/* Reveal stage - completion options (not in freeExplore mode) */}
      {stage === 'reveal' && subStage !== 'freeExplore' && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleTryAnotherChallenge}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-[var(--lab-accent)] text-[var(--lab-bg)] rounded-lg transition-all duration-300 text-sm font-medium tracking-wide hover:bg-[var(--lab-accent-hover)]"
          >
            Try Another
          </button>
          <button
            onClick={handleFreeExplore}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-transparent rounded-lg transition-all duration-300 text-sm font-medium tracking-wide border border-[var(--lab-accent)]/50 text-[var(--lab-accent)] hover:bg-[var(--lab-accent)]/10 hover:border-[var(--lab-accent)]"
          >
            Explore
          </button>
          <button
            onClick={() => onComplete({ a: amplitude, f: frequency })}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-transparent rounded-lg transition-all duration-300 text-sm font-medium tracking-wide border border-[var(--lab-accent)]/50 text-[var(--lab-accent)] hover:bg-[var(--lab-accent)]/10 hover:border-[var(--lab-accent)]"
          >
            Finish
          </button>
        </div>
      )}

      {/* Free explore mode - all sliders unlocked */}
      {stage === 'reveal' && subStage === 'freeExplore' && (
        <AnimatedPanel
          transitionKey="freeExplore"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-2rem)] max-w-md px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={() => {}}
            matchScore={0}
            visibleSliders={['amplitude', 'frequency']}
            lockedSliders={[]}
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}
    </div>
  )
}
