import { useState, useMemo, useEffect, useCallback } from "react"
import { Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortfolio } from "@/context/PortfolioContext"
import {
  useModuleFlow,
  type ModuleConfig,
} from "@/lib/skeleton"
import { Scene } from "./Scene"
import { SinewavesLayout } from "./Layout"
import { ControlPanel } from "@/components/controls/ControlPanel"
import { FormulaPreview } from "@/components/feedback/FormulaPreview"
import { ProgressBar } from "@/components/shared/ProgressBar"
import { ExplorePrompt } from "@/components/shared/ExplorePrompt"
import { AnimatedPanel } from "@/components/shared/AnimatedPanel"
import { CelebrationPulse } from "@/components/shared/CelebrationPulse"
import { QuestionCard } from "@/components/feedback/QuestionCard"
import { FeedbackBanner } from "@/components/feedback/FeedbackBanner"
import { MatchCelebration } from "@/components/celebration/MatchCelebration"
import { DelayIndicator } from "@/components/shared/DelayIndicator"
import { stageTransitionOut, stageTransitionIn } from "@/lib/animations"
import { SINEWAVE_COPY } from "@/components/modules/sinewaves/sinewaves-copy"

// ============================================================================
// TYPES
// ============================================================================

type ViewStage = "observe" | "amplitude" | "frequency" | "challenge" | "reveal"
type SubStage = "explore" | "match" | "reflect" | "freeExplore"
type ChallengePhase = "observe" | "diagnose" | "match"

interface SineParams {
  amplitude: number
  frequency: number
}

interface SineTarget {
  a: number
  f: number
  param: "amplitude" | "frequency"
}

interface ModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  isVisible?: boolean
}

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

function getStageNumber(stage: ViewStage): number {
  const stages: ViewStage[] = ["observe", "amplitude", "frequency", "challenge"]
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

// Skeleton config
const SINE_MODULE_CONFIG: ModuleConfig<SineParams, SineTarget> = {
  id: "sinewaves",
  stages: [
    {
      id: "amplitude",
      parameter: "amplitude",
      interactionMode: "slider",
      controlConfig: {
        min: 0.5,
        max: 2,
        step: 0.05,
        defaultValue: 1,
      },
    },
    {
      id: "frequency",
      parameter: "frequency",
      interactionMode: "slider",
      controlConfig: {
        min: 0.5,
        max: 3,
        step: 0.1,
        defaultValue: 1,
      },
    },
  ],
  challenge: {
    generateTarget: () => {
      const param: SineTarget["param"] =
        Math.random() > 0.5 ? "amplitude" : "frequency"
      const a =
        param === "amplitude"
          ? pickRandom(CHALLENGE_AMPLITUDES)
          : STAGE_TARGETS.amplitude
      const f =
        param === "frequency"
          ? pickRandom(CHALLENGE_FREQUENCIES)
          : STAGE_TARGETS.frequency
      return { a, f, param }
    },
    matchThreshold: CHALLENGE_MATCH_THRESHOLD,
    proximityFn: (current, target) =>
      calculateMatchScore(current.amplitude, current.frequency, target.a, target.f) /
      100,
    targetConstraints: {
      minimumDistance: 0.3,
      maximumDistance: 0.95,
      difficultyProgression: "fixed",
    },
  },
  feedback: {
    intensityFn: (params) => {
      const ampDiff = Math.min(
        Math.abs(params.amplitude - STAGE_TARGETS.amplitude) / 1.5,
        1
      )
      const freqDiff = Math.min(
        Math.abs(params.frequency - STAGE_TARGETS.frequency) / 2.5,
        1
      )
      const proximity = 1 - Math.min(ampDiff, freqDiff)
      return proximity
    },
    notation: (params) =>
      `a = ${params.amplitude.toFixed(2)}, f = ${params.frequency.toFixed(2)}`,
  },
  idle: { hintDelay: 15, hintType: "pulse" },
  stageUnlock: {
    minimumEngagementSeconds: 5,
    intensityThreshold: 0.7,
    rangeExplorationThreshold: 0.6,
    timeFallbackSeconds: 45,
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Module({ onComplete, isVisible = true }: ModuleProps) {
  // ---------------------------------------------------------------------------
  // Parameters
  // ---------------------------------------------------------------------------
  const [amplitude, setAmplitude] = useState(1.0)
  const [frequency, setFrequency] = useState(1.0)

  // ---------------------------------------------------------------------------
  // Skeleton flow
  // ---------------------------------------------------------------------------
  const flow = useModuleFlow<SineParams, SineTarget>(SINE_MODULE_CONFIG, {
    amplitude,
    frequency,
  })

  const currentStageConfig = flow.currentStage

  const viewStage: ViewStage = useMemo(() => {
    if (flow.state.phase === "idle") return "observe"
    if (flow.state.phase === "explore") {
      if (currentStageConfig?.id === "amplitude") return "amplitude"
      if (currentStageConfig?.id === "frequency") return "frequency"
      return "amplitude"
    }
    if (flow.state.phase === "challenge") return "challenge"
    if (flow.state.phase === "success" || flow.state.phase === "reveal")
      return "reveal"
    return "observe"
  }, [flow.state.phase, currentStageConfig])

  const isParameterStage = viewStage === "amplitude" || viewStage === "frequency"

  // ---------------------------------------------------------------------------
  // Stage / substage state not modeled by skeleton
  // ---------------------------------------------------------------------------
  const [subStage, setSubStage] = useState<SubStage>("explore")
  const [showContinue, setShowContinue] = useState(false)

  // Challenge-specific state
  const [challengePhase, setChallengePhase] =
    useState<ChallengePhase>("diagnose")
  const [challengeParam, setChallengeParam] = useState<
    "amplitude" | "frequency"
  >("amplitude")
  const [challengeWave, setChallengeWave] = useState({ a: 1.0, f: 2.0 })

  // ---------------------------------------------------------------------------
  // Question state
  // ---------------------------------------------------------------------------
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  // ---------------------------------------------------------------------------
  // Discovery memory
  // ---------------------------------------------------------------------------
  const [discoveries, setDiscoveries] = useState<{
    amplitude: number | null
    frequency: number | null
  }>({
    amplitude: null,
    frequency: null,
  })

  // ---------------------------------------------------------------------------
  // Animation state
  // ---------------------------------------------------------------------------
  const [isPaused, setIsPaused] = useState(false)
  const [celebrationCount, setCelebrationCount] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prevStage, setPrevStage] = useState<ViewStage | null>(null)

  // ---------------------------------------------------------------------------
  // Portfolio progress tracking
  // ---------------------------------------------------------------------------
  const { updateModuleProgress } = usePortfolio()

  useEffect(() => {
    const progressMap: Record<ViewStage, number> = {
      observe: 0.05,
      amplitude: 0.25,
      frequency: 0.5,
      challenge: 0.75,
      reveal: 1,
    }

    const progress = progressMap[viewStage] ?? 0
    updateModuleProgress("sinewaves", {
      status: viewStage === "reveal" ? "completed" : "in-progress",
      progress,
      currentStage: viewStage,
    })
  }, [viewStage, updateModuleProgress])

  // ---------------------------------------------------------------------------
  // Stage transition system (driven by derived viewStage)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (prevStage === null) {
      // Initialize prevStage on mount without triggering re-render
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrevStage(viewStage)
      return
    }

    if (prevStage !== viewStage) {
      setIsTransitioning(true)

      const uiOverlays = document.querySelectorAll("[data-stage-overlay]")

      const exitPromises = Array.from(uiOverlays).map((el) => {
        return new Promise<void>((resolve) => {
          const animation = stageTransitionOut(el)
          if (animation) {
            animation.eventCallback("onComplete", () => resolve())
          } else {
            resolve()
          }
        })
      })

      Promise.all(exitPromises).then(() => {
        setPrevStage(viewStage)
        setIsTransitioning(false)

        setTimeout(() => {
          const newOverlays = document.querySelectorAll("[data-stage-overlay]")
          newOverlays.forEach((el) => {
            stageTransitionIn(el)
          })
        }, 50)
      })
    }
  }, [viewStage, prevStage])

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------
  const currentQuestion =
    viewStage === "amplitude" || viewStage === "frequency"
      ? QUESTIONS[viewStage]
      : null

  const challengeMatchScore = useMemo(() => {
    if (viewStage !== "challenge") return 0
    return calculateMatchScore(
      amplitude,
      frequency,
      challengeWave.a,
      challengeWave.f
    )
  }, [viewStage, amplitude, frequency, challengeWave])

  const ghostTarget = useMemo(() => {
    if (viewStage === "amplitude") {
      return { a: STAGE_TARGETS.amplitude, f: 1.0, p: 0 }
    }
    if (viewStage === "frequency") {
      return {
        a: STAGE_TARGETS.amplitude,
        f: STAGE_TARGETS.frequency,
        p: 0,
      }
    }
    if (viewStage === "challenge") {
      return { a: challengeWave.a, f: challengeWave.f, p: 0 }
    }
    return { a: 1, f: 1, p: 0 }
  }, [viewStage, challengeWave])

  // ---------------------------------------------------------------------------
  // Observe: show continue after delay
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (viewStage === "observe") {
      const timer = setTimeout(() => setShowContinue(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [viewStage])

  // ---------------------------------------------------------------------------
  // Explore: detect parameter match and transition to reflect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (subStage !== "explore" || isFlashing) return

    const checkMatch = () => {
      if (viewStage === "amplitude") {
        return Math.abs(amplitude - STAGE_TARGETS.amplitude) <= AMPLITUDE_THRESHOLD
      }
      if (viewStage === "frequency") {
        return Math.abs(frequency - STAGE_TARGETS.frequency) <= FREQUENCY_THRESHOLD
      }
      return false
    }

    if (checkMatch()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCelebrationCount((c) => c + 1)
      setSubStage("match")
    }
  }, [viewStage, subStage, amplitude, frequency, isFlashing])

  // ---------------------------------------------------------------------------
  // Challenge: when entering challenge, sync target and param from skeleton
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (flow.state.phase === "challenge" && flow.state.currentTarget) {
      const target = flow.state.currentTarget as SineTarget
      setChallengeWave({ a: target.a, f: target.f })
      setChallengeParam(target.param)
      setChallengePhase("observe")
      setSelectedAnswer(null)

      // Reset user values to matched values
      setAmplitude(STAGE_TARGETS.amplitude)
      setFrequency(STAGE_TARGETS.frequency)
    }
  }, [flow.state.phase, flow.state.currentTarget])

  // ---------------------------------------------------------------------------
  // Challenge: detect final match -> success -> reveal
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (viewStage !== "challenge" || challengePhase !== "match") return

    if (challengeMatchScore >= CHALLENGE_MATCH_THRESHOLD) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCelebrationCount((c) => c + 1)
      setDiscoveries({ amplitude, frequency })
      flow.recordMatch(challengeMatchScore)
    }
  }, [viewStage, challengePhase, challengeMatchScore, amplitude, frequency, flow])

  // Success -> Reveal transition (after brief celebration)
  useEffect(() => {
    if (flow.state.phase !== "success") return

    const timer = setTimeout(() => {
      flow.exitToReveal()
    }, 800)

    return () => clearTimeout(timer)
  }, [flow])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleContinueFromObserve = useCallback(() => {
    setShowContinue(false)
    setSubStage("explore")
    flow.recordInteraction()
  }, [flow])

  const handleAmplitudeChange = useCallback(
    (value: number) => {
      setAmplitude(value)
      flow.recordInteraction()
    },
    [flow]
  )

  const handleFrequencyChange = useCallback(
    (value: number) => {
      setFrequency(value)
      flow.recordInteraction()
    },
    [flow]
  )

  const handleAnswerSelect = useCallback(
    (value: string | number) => {
      if (!currentQuestion) return

      const numValue = typeof value === "string" ? parseFloat(value) : value
      setSelectedAnswer(numValue)
      const correct = numValue === currentQuestion.answer
      setIsCorrect(correct)
    },
    [currentQuestion]
  )

  const handleContinueFromReflect = useCallback(() => {
    if (!isCorrect || !currentQuestion) return

    if (viewStage === "amplitude") {
      setDiscoveries((prev) => ({ ...prev, amplitude }))
    } else if (viewStage === "frequency") {
      setDiscoveries((prev) => ({ ...prev, frequency }))
    }

    setIsFlashing(false)

    if (viewStage === "amplitude") {
      setSubStage("explore")
      setSelectedAnswer(null)
      flow.advanceStage()
    } else if (viewStage === "frequency") {
      setSubStage("explore")
      setSelectedAnswer(null)
      flow.advanceStage()
    }
  }, [isCorrect, currentQuestion, viewStage, amplitude, frequency, flow])

  const handleDiagnoseAnswer = useCallback(
    (value: string | number) => {
      const answer = value as string
      const correct = answer === challengeParam

      if (correct) {
        setCelebrationCount((c) => c + 1)
        setTimeout(() => {
          setChallengePhase("match")
        }, 500)
      } else {
        setSelectedAnswer(null)
      }
    },
    [challengeParam]
  )

  const handleTryAgain = useCallback(() => {
    setSelectedAnswer(null)
  }, [])

  const handleTryAnotherChallenge = useCallback(() => {
    flow.enterChallenge()
  }, [flow])

  const handleFreeExplore = useCallback(() => {
    setSubStage("freeExplore")
    setAmplitude(1.0)
    setFrequency(1.0)
  }, [])

  // ---------------------------------------------------------------------------
  // Prompt content
  // ---------------------------------------------------------------------------
  const getPromptContent = () => {
    if (viewStage === "observe") {
      return {
        setupCopy: SINEWAVE_COPY.stages.observe.setup,
        text: SINEWAVE_COPY.stages.observe.prompt,
        subtext: SINEWAVE_COPY.stages.observe.subtext,
      }
    }
    if (viewStage === "amplitude") {
      if (
        subStage === "explore" ||
        subStage === "match" ||
        subStage === "reflect"
      ) {
        return {
          setupCopy:
            subStage === "explore"
              ? SINEWAVE_COPY.stages.amplitude.setup
              : undefined,
          text: SINEWAVE_COPY.stages.amplitude.prompt,
          subtext: SINEWAVE_COPY.stages.amplitude.subtext,
        }
      }
    }
    if (viewStage === "frequency") {
      if (
        subStage === "explore" ||
        subStage === "match" ||
        subStage === "reflect"
      ) {
        return {
          setupCopy:
            subStage === "explore"
              ? SINEWAVE_COPY.stages.frequency.setup
              : undefined,
          text: SINEWAVE_COPY.stages.frequency.prompt,
          subtext: SINEWAVE_COPY.stages.frequency.subtext,
        }
      }
    }
    if (viewStage === "challenge" && challengePhase === "observe") {
      return {
        setupCopy: SINEWAVE_COPY.stages.challenge.observe.setup,
        text: SINEWAVE_COPY.stages.challenge.observe.prompt,
        subtext: SINEWAVE_COPY.stages.challenge.observe.subtext,
      }
    }
    if (viewStage === "challenge" && challengePhase === "diagnose") {
      return null
    }
    if (viewStage === "challenge" && challengePhase === "match") {
      return {
        setupCopy: SINEWAVE_COPY.stages.challenge.match.setup,
        text: SINEWAVE_COPY.stages.challenge.match.prompt,
        subtext: SINEWAVE_COPY.stages.challenge.match.subtext,
      }
    }
    if (viewStage === "reveal" && subStage === "freeExplore") {
      return { text: "Free exploration", subtext: "Play with the parameters" }
    }
    if (viewStage === "reveal") {
      return {
        text: SINEWAVE_COPY.stages.reveal.title,
        subtext: SINEWAVE_COPY.stages.reveal.description,
      }
    }
    return null
  }

  const promptContent = getPromptContent()

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SinewavesLayout
      header={
        <ProgressBar current={getStageNumber(viewStage)} total={TOTAL_STAGES} />
      }
      explorePrompt={
        promptContent ? (
          <div data-stage-overlay>
            <ExplorePrompt
              text={promptContent.text}
              subtext={promptContent.subtext}
              setupCopy={promptContent.setupCopy}
              visible={!isTransitioning}
              withGlassPanel={true}
            />
          </div>
        ) : null
      }
      formula={<FormulaPreview discoveries={discoveries} />}
      visualization={
        <div
          className={cn(
            "flex-1 min-h-0 pt-40",
            // Reserve space at bottom for controls/questions to prevent overlap
            (viewStage === "amplitude" || viewStage === "frequency") && subStage === "explore" && "pb-32 sm:pb-28",
            (viewStage === "amplitude" || viewStage === "frequency") && subStage === "reflect" && "pb-48 sm:pb-52",
            viewStage === "challenge" && challengePhase === "match" && "pb-40 sm:pb-36",
            viewStage === "challenge" && challengePhase === "diagnose" && "pb-56 sm:pb-52",
            viewStage === "reveal" && subStage !== "freeExplore" && "pb-72 sm:pb-64",
            viewStage === "reveal" && subStage === "freeExplore" && "pb-32 sm:pb-28"
          )}
        >
          <Scene
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            target={ghostTarget}
            stage={viewStage}
            isPaused={isPaused || !isVisible}
            onPauseChange={setIsPaused}
            stageTargets={{
              amplitude: STAGE_TARGETS.amplitude,
              frequency: STAGE_TARGETS.frequency,
              phase: 0,
            }}
            isVisible={isVisible}
          />
        </div>
      }
      controls={
        <>
          {/* Delay indicator - Observe stage */}
      {viewStage === "observe" && !showContinue && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-(--z-controls)">
          <DelayIndicator
            duration={5000}
            label="Observing..."
            onComplete={() => setShowContinue(true)}
          />
        </div>
      )}

      {/* Continue button - Observe stage only */}
      {viewStage === "observe" && showContinue && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-(--z-controls)">
          <button
            onClick={handleContinueFromObserve}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-transparent rounded-lg transition-all duration-300 text-sm font-medium tracking-wide border border-(--lab-accent)/50 text-(--lab-accent) hover:bg-(--lab-accent)/10 hover:border-(--lab-accent)"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Amplitude slider */}
      {viewStage === "amplitude" && subStage === "explore" && (
        <AnimatedPanel
          transitionKey="amplitude"
          className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-(--z-controls) w-[calc(100vw-2rem)] max-w-sm px-3 sm:px-4"
          data-stage-overlay
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={handleAmplitudeChange}
            onFrequencyChange={handleFrequencyChange}
            onPhaseChange={() => {}}
            matchScore={0}
            visibleSliders={["amplitude"]}
          />
        </AnimatedPanel>
      )}

      {/* Frequency slider */}
      {viewStage === "frequency" && subStage === "explore" && (
        <AnimatedPanel
          transitionKey="frequency"
          className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-(--z-controls) w-[calc(100vw-2rem)] max-w-md px-3 sm:px-4"
          data-stage-overlay
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={handleAmplitudeChange}
            onFrequencyChange={handleFrequencyChange}
            onPhaseChange={() => {}}
            matchScore={0}
            visibleSliders={["amplitude", "frequency"]}
            lockedSliders={["amplitude"]}
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}

      {/* Challenge diagnose question */}
      {viewStage === "challenge" && challengePhase === "diagnose" && (
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-(--z-content) w-full max-w-[90vw] sm:max-w-md px-3 sm:px-4 md:px-0">
          <QuestionCard
            question={SINEWAVE_COPY.stages.challenge.diagnose.question}
            choices={SINEWAVE_COPY.stages.challenge.diagnose.choices}
            onSelect={handleDiagnoseAnswer}
            selectedValue={selectedAnswer ?? undefined}
          />
        </div>
      )}

      {/* Delay indicator - Challenge observe phase */}
      {viewStage === "challenge" && challengePhase === "observe" && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-(--z-controls)">
          <DelayIndicator
            duration={3000}
            label="Observing changes..."
            onComplete={() => setChallengePhase("diagnose")}
          />
        </div>
      )}

      {/* Challenge match slider */}
      {viewStage === "challenge" && challengePhase === "match" && (
        <AnimatedPanel
          transitionKey="challenge"
          className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-(--z-controls) w-[calc(100vw-2rem)] max-w-md px-3 sm:px-4"
          data-stage-overlay
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={handleAmplitudeChange}
            onFrequencyChange={handleFrequencyChange}
            onPhaseChange={() => {}}
            matchScore={challengeMatchScore}
            visibleSliders={["amplitude", "frequency"]}
            lockedSliders={
              challengeParam === "amplitude" ? ["frequency"] : ["amplitude"]
            }
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}

      {/* Match celebration message */}
      {isParameterStage && subStage === "match" && (
        <MatchCelebration
          message={
            viewStage === "amplitude"
              ? SINEWAVE_COPY.matchCelebration.amplitude
              : SINEWAVE_COPY.matchCelebration.frequency
          }
          onContinue={() => {
            setSubStage("reflect")
            setSelectedAnswer(null)
          }}
          autoTransitionDelay={2000}
          onAutoTransition={() => {
            setSubStage("reflect")
            setSelectedAnswer(null)
          }}
        />
      )}

      {/* Reflect question */}
      {isParameterStage && subStage === "reflect" && currentQuestion && (
        <div className="absolute bottom-20 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-(--z-content) w-full max-w-[90vw] sm:max-w-md px-3 sm:px-4 md:px-0">
          <QuestionCard
            question={currentQuestion.question}
            choices={currentQuestion.choices}
            onSelect={handleAnswerSelect}
            selectedValue={selectedAnswer ?? undefined}
          />
        </div>
      )}

      {/* Feedback banner for reflect phase */}
      {isParameterStage && subStage === "reflect" && selectedAnswer !== null && (
        <FeedbackBanner
          correct={isCorrect}
          onContinue={isCorrect ? handleContinueFromReflect : handleTryAgain}
        />
      )}

      {/* Reveal stage - "So What" content */}
      {viewStage === "reveal" && subStage !== "freeExplore" && (
        <div className="absolute bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 z-(--z-floating) w-full max-w-2xl px-4 sm:px-6">
          <AnimatedPanel
            transitionKey="reveal-so-what"
            className="bg-(--lab-bg-elevated)/80 backdrop-blur-sm rounded-lg border border-(--lab-border) p-4 sm:p-6 pb-6 sm:pb-8"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-(--lab-accent) shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-(--lab-text)">
                  So What?
                </h3>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-(--lab-text-muted) whitespace-pre-line">
                {SINEWAVE_COPY.stages.reveal.soWhat}
              </div>
            </div>
          </AnimatedPanel>
        </div>
      )}

      {/* Reveal stage - completion options (not in freeExplore mode) */}
      {viewStage === "reveal" && subStage !== "freeExplore" && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-(--z-controls) flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleTryAnotherChallenge}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-(--lab-accent) text-(--lab-bg) rounded-lg transition-all duration-300 text-sm font-medium tracking-wide hover:bg-(--lab-accent-hover)"
          >
            Try Another
          </button>
          <button
            onClick={handleFreeExplore}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-transparent rounded-lg transition-all duration-300 text-sm font-medium tracking-wide border border-(--lab-accent)/50 text-(--lab-accent) hover:bg-(--lab-accent)/10 hover:border-(--lab-accent)"
          >
            Explore
          </button>
          <button
            onClick={() => onComplete({ a: amplitude, f: frequency })}
            className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-transparent rounded-lg transition-all duration-300 text-sm font-medium tracking-wide border border-(--lab-accent)/50 text-(--lab-accent) hover:bg-(--lab-accent)/10 hover:border-(--lab-accent)"
          >
            Finish
          </button>
        </div>
      )}

      {/* Free explore mode - all sliders unlocked */}
      {viewStage === "reveal" && subStage === "freeExplore" && (
        <AnimatedPanel
          transitionKey="freeExplore"
          className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-(--z-controls) w-[calc(100vw-2rem)] max-w-md px-3 sm:px-4"
        >
          <ControlPanel
            amplitude={amplitude}
            frequency={frequency}
            phase={0}
            onAmplitudeChange={handleAmplitudeChange}
            onFrequencyChange={handleFrequencyChange}
            onPhaseChange={() => {}}
            matchScore={0}
            visibleSliders={["amplitude", "frequency"]}
            lockedSliders={[]}
            discoveries={discoveries}
          />
        </AnimatedPanel>
      )}
        </>
      }
      children={<CelebrationPulse trigger={celebrationCount} />}
    />
  )
}

