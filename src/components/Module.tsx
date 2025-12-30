import { useState, useMemo, useEffect, useCallback } from "react"
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
import { WhyModal } from "./feedback/WhyModal"

// Stage types
type Stage = 'observe' | 'amplitude' | 'frequency' | 'phase' | 'challenge' | 'reveal'
type SubStage = 'explore' | 'question' | 'feedback'

// Question content for each parameter stage
const QUESTIONS = {
  amplitude: {
    question: "What value doubled the wave's height?",
    choices: [
      { label: "1.0", value: 1.0 },
      { label: "1.5", value: 1.5 },
      { label: "2.0", value: 2.0 },
      { label: "2.5", value: 2.5 },
    ],
    answer: 2.0,
    why: "Amplitude multiplies every point's distance from the center line. A = 2 means the wave is twice as tall.",
    wrongExplanations: {
      1.0: "At A = 1, the wave height stays the same as the original. We need a value that makes it twice as tall.",
      1.5: "A = 1.5 makes the wave 1.5× taller, but we asked for double. What value would give us 2×?",
      2.5: "A = 2.5 makes it 2.5× taller — more than double! We need exactly twice the height.",
    } as Record<number, string>,
  },
  frequency: {
    question: "How many complete waves fit when frequency doubles?",
    choices: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
    answer: 2,
    why: "Frequency controls cycles per interval. Double the frequency means double the waves in the same space.",
    wrongExplanations: {
      1: "With 1 wave, that's the same as before. Doubling the frequency should pack more waves into the same space.",
      3: "3 waves would mean tripling the frequency. We only doubled it, so how many waves should fit?",
      4: "4 waves would mean quadrupling the frequency. Think about what 'double' means for the wave count.",
    } as Record<number, string>,
  },
  phase: {
    question: "What phase makes sine start at its peak?",
    choices: [
      { label: "0", value: 0 },
      { label: "π/4", value: Math.PI / 4 },
      { label: "π/2", value: Math.PI / 2 },
      { label: "π", value: Math.PI },
    ],
    answer: Math.PI / 2,
    why: "At φ = π/2, sine starts at its maximum value. This is actually the cosine function!",
    wrongExplanations: {
      0: "At phase = 0, sine starts at zero and rises. We want it to start at its highest point.",
      [Math.PI / 4]: "At π/4, sine starts partway up but not at the peak. The peak is at a quarter of the full cycle.",
      [Math.PI]: "At phase = π, sine starts at zero and falls. We want it to start at its maximum, not crossing zero.",
    } as Record<number, string>,
  },
}

const MATCH_THRESHOLD = 95
const TOTAL_STAGES = 6

// Nice educational numbers for targets
const NICE_AMPLITUDES = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
const NICE_FREQUENCIES = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
const NICE_PHASES = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI]

// Thresholds for matching
const OPT_IN_AMPLITUDE_THRESHOLD = 0.1
const OPT_IN_FREQUENCY_THRESHOLD = 0.15
const OPT_IN_PHASE_THRESHOLD = 0.2

function generateTarget() {
  return {
    a: NICE_AMPLITUDES[Math.floor(Math.random() * NICE_AMPLITUDES.length)],
    f: NICE_FREQUENCIES[Math.floor(Math.random() * NICE_FREQUENCIES.length)],
    p: NICE_PHASES[Math.floor(Math.random() * NICE_PHASES.length)],
  }
}

function calculateMatchScore(
  user: { a: number; f: number; p: number },
  target: { a: number; f: number; p: number }
): number {
  const ampRange = 2.0 - 0.5
  const freqRange = 3.0 - 0.5
  const phaseRange = 2 * Math.PI

  const ampMatch = 1 - Math.abs(user.a - target.a) / ampRange
  const freqMatch = 1 - Math.abs(user.f - target.f) / freqRange
  const phaseMatch = 1 - Math.abs(user.p - target.p) / phaseRange

  return Math.min(ampMatch, freqMatch, phaseMatch) * 100
}

function getStageNumber(stage: Stage): number {
  const stages: Stage[] = ['observe', 'amplitude', 'frequency', 'phase', 'challenge', 'reveal']
  return stages.indexOf(stage) + 1
}

interface ModuleProps {
  onComplete: (values: { a: number; f: number; p: number }) => void
  isVisible?: boolean
}

export function Module({ onComplete, isVisible = true }: ModuleProps) {
  // Stage management
  const [stage, setStage] = useState<Stage>('observe')
  const [subStage, setSubStage] = useState<SubStage>('explore')
  const [showContinue, setShowContinue] = useState(false)
  const [promptVisible, setPromptVisible] = useState(true)

  // Wave parameters
  const [amplitude, setAmplitude] = useState(1.0)
  const [frequency, setFrequency] = useState(1.0)
  const [phase, setPhase] = useState(0)

  // Fixed targets for parameter stages (always 2.0, 2, π/2 to match questions)
  const stageTargets = useMemo(() => ({
    amplitude: 2.0,
    frequency: 2.0,
    phase: Math.PI / 2,
  }), [])

  // Question state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showWhyModal, setShowWhyModal] = useState(false)

  // Discovery memory - tracks what values user discovered in each stage
  const [discoveries, setDiscoveries] = useState<{
    amplitude: number | null
    frequency: number | null
    phase: number | null
  }>({
    amplitude: null,
    frequency: null,
    phase: null,
  })

  // Challenge state
  const [target] = useState(generateTarget)
  const [hasMatched, setHasMatched] = useState(false)

  // Celebration counter - increments to trigger celebration pulse
  const [celebrationCount, setCelebrationCount] = useState(0)

  // Animation control
  const [isPaused, setIsPaused] = useState(false)

  const matchScore = useMemo(
    () => calculateMatchScore({ a: amplitude, f: frequency, p: phase }, target),
    [amplitude, frequency, phase, target]
  )

  // Get current question content
  const currentQuestion = stage === 'amplitude' || stage === 'frequency' || stage === 'phase'
    ? QUESTIONS[stage]
    : null

  // Stage 1: Show "Continue →" after delay
  useEffect(() => {
    if (stage === 'observe') {
      const timer = setTimeout(() => setShowContinue(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  // Detect match and trigger question
  useEffect(() => {
    if (subStage !== 'explore') return

    const checkMatch = () => {
      if (stage === 'amplitude') {
        return Math.abs(amplitude - stageTargets.amplitude) <= OPT_IN_AMPLITUDE_THRESHOLD
      }
      if (stage === 'frequency') {
        return Math.abs(frequency - stageTargets.frequency) <= OPT_IN_FREQUENCY_THRESHOLD
      }
      if (stage === 'phase') {
        return Math.abs(phase - stageTargets.phase) <= OPT_IN_PHASE_THRESHOLD
      }
      return false
    }

    if (checkMatch()) {
      // Small delay before showing question
      setTimeout(() => {
        setSubStage('question')
        setSelectedAnswer(null)
      }, 500)
    }
  }, [stage, subStage, amplitude, frequency, phase, stageTargets])

  // Challenge stage: detect final match
  useEffect(() => {
    if (stage === 'challenge' && matchScore >= MATCH_THRESHOLD && !hasMatched) {
      setHasMatched(true)
      setTimeout(() => {
        setStage('reveal')
        onComplete({ a: amplitude, f: frequency, p: phase })
      }, 500)
    }
  }, [stage, matchScore, hasMatched, amplitude, frequency, phase, onComplete])

  const handleAnswerSelect = useCallback((value: string | number) => {
    if (!currentQuestion) return
    setSelectedAnswer(value as number)
    const correct = value === currentQuestion.answer
    setIsCorrect(correct)
    setSubStage('feedback')
  }, [currentQuestion])

  // Handle "Try Again" - go back to question without advancing
  const handleTryAgain = useCallback(() => {
    setSubStage('question')
    setSelectedAnswer(null)
    setShowWhyModal(false)
  }, [])

  // Handle continuing after correct answer - advance to next stage
  const handleContinueFromFeedback = useCallback(() => {
    // Only advance if answer was correct
    if (!isCorrect) {
      handleTryAgain()
      return
    }

    // Trigger celebration pulse
    setCelebrationCount(c => c + 1)

    setSubStage('explore')
    setSelectedAnswer(null)
    setPromptVisible(true)

    // Store discovery and move to next stage (keeping discovered values)
    switch (stage) {
      case 'amplitude':
        // Store discovered amplitude, keep it for next stages
        setDiscoveries(prev => ({ ...prev, amplitude: amplitude }))
        setStage('frequency')
        // Don't reset amplitude - it stays at discovered value
        break
      case 'frequency':
        // Store discovered frequency, keep it for next stages
        setDiscoveries(prev => ({ ...prev, frequency: frequency }))
        setStage('phase')
        // Don't reset frequency - it stays at discovered value
        break
      case 'phase':
        // Store discovered phase
        setDiscoveries(prev => ({ ...prev, phase: phase }))
        setStage('challenge')
        // For challenge, start fresh but with knowledge of discovered values
        setAmplitude(1.0)
        setFrequency(1.0)
        setPhase(0)
        break
    }
  }, [stage, isCorrect, handleTryAgain, amplitude, frequency, phase])

  const handleContinue = useCallback(() => {
    setShowContinue(false)
    setPromptVisible(true)

    if (stage === 'observe') {
      setStage('amplitude')
      setSubStage('explore')
    }
  }, [stage])

  // Get prompt text based on stage
  const getPromptContent = () => {
    if (subStage !== 'explore') return null

    switch (stage) {
      case 'observe':
        return { text: 'Watch where the wave comes from', subtext: undefined }
      case 'amplitude':
        return { text: 'Make the wave taller', subtext: 'Match the ghost wave' }
      case 'frequency':
        return { text: 'Make the wave faster', subtext: 'Match the ghost wave' }
      case 'phase':
        return { text: 'Shift where the wave starts', subtext: 'Match the ghost wave' }
      case 'challenge':
        return hasMatched ? null : { text: 'Match the wave', subtext: undefined }
      default:
        return null
    }
  }

  const promptContent = getPromptContent()
  const isParameterStage = stage === 'amplitude' || stage === 'frequency' || stage === 'phase'

  return (
    <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: 'var(--lab-bg)' }}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <ProgressBar current={getStageNumber(stage)} total={TOTAL_STAGES} />
      </div>

      {/* Celebration pulse effect */}
      <CelebrationPulse trigger={celebrationCount} />

      {/* Formula preview - shows building equation */}
      {/* Mobile: pushed down to avoid escape hatch, Desktop: top-right corner */}
      <div className="absolute top-16 right-2 sm:top-8 sm:right-4 z-10 max-w-[calc(100vw-1rem)]">
        <FormulaPreview discoveries={discoveries} />
      </div>

      {/* Explore prompt */}
      {/* Mobile: positioned after escape hatch, Desktop: centered */}
      {promptContent && (
        <div className="absolute top-4 sm:top-8 left-16 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-10 sm:w-auto">
          <ExplorePrompt
            text={promptContent.text}
            subtext={promptContent.subtext}
            visible={promptVisible}
          />
        </div>
      )}

      {/* Matched indicator for challenge stage */}
      {hasMatched && stage === 'challenge' && (
        <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-10">
          <span className="text-base sm:text-lg font-medium" style={{ color: 'var(--lab-accent)' }}>Matched!</span>
        </div>
      )}

      {/* Visualization area */}
      <div className={cn(
        "flex-1 min-h-0",
        (isParameterStage && subStage === 'feedback') && "pb-20 sm:pb-24"
      )}>
        <Scene
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          target={target}
          stage={stage}
          isPaused={isPaused || !isVisible}
          onPauseChange={setIsPaused}
          stageTargets={stageTargets}
        />
      </div>

      {/* Question card - appears after match */}
      {isParameterStage && subStage === 'question' && currentQuestion && (
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-[90vw] sm:max-w-md px-3 sm:px-4 md:px-0">
          <QuestionCard
            question={currentQuestion.question}
            choices={currentQuestion.choices}
            onSelect={handleAnswerSelect}
            selectedValue={selectedAnswer ?? undefined}
          />
        </div>
      )}

      {/* Continue button - Stage 1 only */}
      {stage === 'observe' && showContinue && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={handleContinue}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-transparent rounded-lg transition-all duration-300 text-sm font-medium tracking-wide border border-[var(--lab-accent)]/50 text-[var(--lab-accent)] hover:bg-[var(--lab-accent)]/10 hover:border-[var(--lab-accent)]"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Slider for amplitude stage - only amplitude visible */}
      {stage === 'amplitude' && subStage === 'explore' && (
        <AnimatedPanel
          transitionKey="amplitude"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[90vw] max-w-sm px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={setPhase}
            matchScore={0}
            visibleSliders={['amplitude']}
          />
        </AnimatedPanel>
      )}

      {/* Slider for frequency stage - amplitude locked, frequency active */}
      {stage === 'frequency' && subStage === 'explore' && (
        <AnimatedPanel
          transitionKey="frequency"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[90vw] max-w-md px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={setPhase}
            matchScore={0}
            visibleSliders={['amplitude', 'frequency']}
            lockedSliders={['amplitude']}
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}

      {/* Slider for phase stage - amplitude & frequency locked, phase active */}
      {stage === 'phase' && subStage === 'explore' && (
        <AnimatedPanel
          transitionKey="phase"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[90vw] max-w-lg px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={setPhase}
            matchScore={0}
            visibleSliders={['amplitude', 'frequency', 'phase']}
            lockedSliders={['amplitude', 'frequency']}
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}

      {/* Control panel for challenge stage */}
      {stage === 'challenge' && (
        <AnimatedPanel
          transitionKey="challenge"
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[90vw] max-w-md px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={setPhase}
            matchScore={matchScore}
          />
        </AnimatedPanel>
      )}

      {/* Feedback banner */}
      {isParameterStage && subStage === 'feedback' && (
        <FeedbackBanner
          correct={isCorrect}
          onWhy={() => setShowWhyModal(true)}
          onContinue={handleContinueFromFeedback}
        />
      )}

      {/* Why modal */}
      {currentQuestion && (
        <WhyModal
          open={showWhyModal}
          onClose={() => setShowWhyModal(false)}
          content={
            isCorrect
              ? currentQuestion.why
              : (selectedAnswer !== null && currentQuestion.wrongExplanations[selectedAnswer]) || currentQuestion.why
          }
          isCorrect={isCorrect}
          onTryAgain={handleTryAgain}
        />
      )}
    </div>
  )
}
