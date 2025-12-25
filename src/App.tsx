import { useState, useMemo, useEffect, useCallback } from "react"
import { Scene } from "./components/modules/sinusoidal/Scene"
import { ControlPanel } from "./components/controls/ControlPanel"
import { FormulaReveal } from "./components/FormulaReveal"
import { ProgressBar } from "./components/shared/ProgressBar"
import { ExplorePrompt } from "./components/shared/ExplorePrompt"
import { QuestionCard } from "./components/feedback/QuestionCard"
import { FeedbackBanner } from "./components/feedback/FeedbackBanner"
import { WhyModal } from "./components/feedback/WhyModal"

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

function App() {
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

  // Challenge state
  const [target, setTarget] = useState(generateTarget)
  const [hasMatched, setHasMatched] = useState(false)
  const [showReveal, setShowReveal] = useState(false)

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
        setShowReveal(true)
      }, 500)
    }
  }, [stage, matchScore, hasMatched])

  const handleAnswerSelect = useCallback((value: string | number) => {
    if (!currentQuestion) return
    setSelectedAnswer(value as number)
    const correct = value === currentQuestion.answer
    setIsCorrect(correct)
    setSubStage('feedback')
  }, [currentQuestion])

  const handleContinueFromFeedback = useCallback(() => {
    setSubStage('explore')
    setSelectedAnswer(null)
    setPromptVisible(true)

    // Move to next stage
    switch (stage) {
      case 'amplitude':
        setStage('frequency')
        setAmplitude(1.0) // Reset for next stage
        break
      case 'frequency':
        setStage('phase')
        setFrequency(1.0) // Reset for next stage
        break
      case 'phase':
        setStage('challenge')
        // Reset all for challenge
        setAmplitude(1.0)
        setFrequency(1.0)
        setPhase(0)
        break
    }
  }, [stage])

  const handleContinue = useCallback(() => {
    setShowContinue(false)
    setPromptVisible(true)

    if (stage === 'observe') {
      setStage('amplitude')
      setSubStage('explore')
    }
  }, [stage])

  const handleNewChallenge = useCallback(() => {
    setTarget(generateTarget())
    setHasMatched(false)
    setShowReveal(false)
    setStage('challenge')
    setAmplitude(1.0)
    setFrequency(1.0)
    setPhase(0)
  }, [])

  const handleStartOver = useCallback(() => {
    setStage('observe')
    setSubStage('explore')
    setShowContinue(false)
    setPromptVisible(true)
    setTarget(generateTarget())
    setHasMatched(false)
    setShowReveal(false)
    setAmplitude(1.0)
    setFrequency(1.0)
    setPhase(0)
    setSelectedAnswer(null)
  }, [])

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
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f]">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <ProgressBar current={getStageNumber(stage)} total={TOTAL_STAGES} />
      </div>

      {/* Explore prompt */}
      {promptContent && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <ExplorePrompt
            text={promptContent.text}
            subtext={promptContent.subtext}
            visible={promptVisible}
          />
        </div>
      )}

      {/* Matched indicator for challenge stage */}
      {hasMatched && stage === 'challenge' && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <span className="text-[#c8e44c] text-lg font-medium">Matched!</span>
        </div>
      )}

      {/* Visualization area */}
      <div className="flex-1 min-h-0">
        <Scene
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          target={target}
          stage={stage}
          isPaused={isPaused}
          onPauseChange={setIsPaused}
          stageTargets={stageTargets}
        />
      </div>

      {/* Question card - appears after match */}
      {isParameterStage && subStage === 'question' && currentQuestion && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-96 max-w-[90vw]">
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-transparent border border-[#c8e44c]/50 text-[#c8e44c] rounded-lg
                       hover:bg-[#c8e44c]/10 hover:border-[#c8e44c] transition-all duration-300
                       text-sm font-medium tracking-wide"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Slider for amplitude stage */}
      {stage === 'amplitude' && subStage === 'explore' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-72">
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
        </div>
      )}

      {/* Slider for frequency stage */}
      {stage === 'frequency' && subStage === 'explore' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-72">
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={setPhase}
            matchScore={0}
            visibleSliders={['frequency']}
          />
        </div>
      )}

      {/* Slider for phase stage */}
      {stage === 'phase' && subStage === 'explore' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-72">
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            onAmplitudeChange={setAmplitude}
            onFrequencyChange={setFrequency}
            onPhaseChange={setPhase}
            matchScore={0}
            visibleSliders={['phase']}
          />
        </div>
      )}

      {/* Control panel for challenge stage */}
      {stage === 'challenge' && (
        <ControlPanel
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          onAmplitudeChange={setAmplitude}
          onFrequencyChange={setFrequency}
          onPhaseChange={setPhase}
          matchScore={matchScore}
        />
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
          content={currentQuestion.why}
        />
      )}

      {/* Formula reveal */}
      <FormulaReveal
        show={showReveal}
        values={{ a: amplitude, f: frequency, p: phase }}
        onDismiss={() => setShowReveal(false)}
        onNewChallenge={handleNewChallenge}
        onStartOver={handleStartOver}
      />
    </div>
  )
}

export default App
