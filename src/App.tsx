import { useState, useCallback, Suspense, useEffect, type ComponentType } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Hero } from "./components/hero"
import { ModuleLoader } from "./components/modules/ModuleLoader"
import { PortfolioProvider } from "@/context/PortfolioContext"
import { Constellation, CourseHub } from "@/components/constellation"
import { getModuleById, type ModuleProps } from "@/config/modules"
import { EscapeHatch, Navigation } from "./components/layout"
import { CelebrationModal } from "./components/celebration"
import { ResumeDialog, ProcessDialog } from "./components/dialogs"

type View = "hero" | "courses" | "constellation" | "module"
type TabId = "discovery" | "behind" | "deeper"

/**
 * Dynamic Module Loader
 * Loads the correct module component based on moduleId from the modules config
 */
interface DynamicModuleProps {
  moduleId: string
  onComplete: (values: { a: number; f: number }) => void
  isVisible: boolean
  onBack?: () => void
}

function DynamicModule({ moduleId, onComplete, isVisible, onBack }: DynamicModuleProps) {
  const [LoadedModule, setLoadedModule] = useState<ComponentType<ModuleProps> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const moduleConfig = getModuleById(moduleId)
    if (!moduleConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Error state for missing module
      setError(`Module "${moduleId}" not found`)
      return
    }

    // Load the module component
    moduleConfig.component()
      .then(module => {
        setLoadedModule(() => module.default)
        setError(null)
      })
      .catch(err => {
        console.error(`Failed to load module "${moduleId}":`, err)
        setError(`Failed to load module "${moduleId}"`)
      })
  }, [moduleId])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    )
  }

  if (!LoadedModule) {
    return <ModuleLoader />
  }

  return <LoadedModule onComplete={onComplete} isVisible={isVisible} onBack={onBack} />
}

function App() {
  // View state
  const [view, setView] = useState<View>("hero")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  
  // Transition origin for zoom animation
  const [transitionOrigin, setTransitionOrigin] = useState<{
    x: number
    y: number
  } | null>(null)

  // Completed values from module
  const [completedValues, setCompletedValues] = useState<{ a: number; f: number } | null>(null)

  // Modal states
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationTab, setCelebrationTab] = useState<TabId>("discovery")
  const [skippedToEnd, setSkippedToEnd] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [showProcess, setShowProcess] = useState(false)

  // Hero → Courses transition
  const handleEnter = useCallback(() => {
    setView("courses")
  }, [])

  // Courses → Constellation transition (with zoom origin tracking)
  const handleSelectCourse = useCallback((courseId: string, event?: React.MouseEvent) => {
    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      setTransitionOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
    setSelectedCourseId(courseId)
    setView("constellation")
  }, [])

  // Constellation → Module transition
  const handleSelectModule = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId)
    setView("module")
  }, [])

  // Module completion → Celebration modal
  const handleModuleComplete = useCallback((values: { a: number; f: number }) => {
    setCompletedValues(values)
    setSkippedToEnd(false)
    setCelebrationTab("discovery")
    setShowCelebration(true)
  }, [])

  // Back to constellation from module
  const handleBackToConstellation = useCallback(() => {
    setShowCelebration(false)
    setCompletedValues(null)
    setSkippedToEnd(false)
    setActiveModuleId(null)
    setView("constellation")
  }, [])

  // Back to courses from constellation
  const handleBackToCourses = useCallback(() => {
    setSelectedCourseId(null)
    setView("courses")
  }, [])

  // Back to hero from courses
  const handleBackToHero = useCallback(() => {
    setView("hero")
  }, [])

  // Skip to end (from escape hatch)
  const handleSkipToEnd = useCallback(() => {
    setSkippedToEnd(true)
    setCelebrationTab("deeper")
    setShowCelebration(true)
  }, [])

  // New challenge from celebration modal
  const handleNewChallenge = useCallback(() => {
    setShowCelebration(false)
    setCompletedValues(null)
    // Module will reset internally when re-rendered
  }, [])

  // Open resume dialog
  const handleOpenResume = useCallback(() => {
    setShowResume(true)
  }, [])

  // Open process dialog
  const handleOpenProcess = useCallback(() => {
    setShowProcess(true)
  }, [])

  // Zoom animation variants for course → constellation transition
  const zoomInVariants = {
    initial: (origin: { x: number; y: number } | null) => ({
      opacity: 0,
      scale: 0.8,
      transformOrigin: origin ? `${origin.x}px ${origin.y}px` : 'center',
    }),
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
    },
    exit: (origin: { x: number; y: number } | null) => ({
      opacity: 0,
      scale: 0.8,
      transformOrigin: origin ? `${origin.x}px ${origin.y}px` : 'center',
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
    }),
  }

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  return (
    <PortfolioProvider>
      <AnimatePresence mode="wait">
        {/* Hero View */}
        {view === "hero" && (
          <motion.div
            key="hero"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Hero onEnter={handleEnter} />
          </motion.div>
        )}

        {/* Courses View */}
        {view === "courses" && (
          <motion.div
            key="courses"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CourseHub
              onSelectCourse={handleSelectCourse}
              onBack={handleBackToHero}
            />
          </motion.div>
        )}

        {/* Constellation View - with zoom transition */}
        {view === "constellation" && selectedCourseId && (
          <motion.div
            key="constellation"
            custom={transitionOrigin}
            variants={zoomInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Constellation
              courseId={selectedCourseId}
              onSelectModule={handleSelectModule}
              onBack={handleBackToCourses}
            />
          </motion.div>
        )}

        {/* Module View */}
        {view === "module" && activeModuleId && (
          <motion.div
            key="module"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Navigation back button hidden - EscapeHatch handles navigation */}
            <Navigation
              showBackButton={false}
              onBack={handleBackToConstellation}
            />
            <Suspense fallback={<ModuleLoader />}>
              <DynamicModule
                moduleId={activeModuleId}
                onComplete={handleModuleComplete}
                isVisible={true}
                onBack={handleBackToConstellation}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escape hatch - only visible in module view, not during celebration */}
      {/* Hidden for sinewaves - Observatory HUD has its own status strip */}
      {view === "module" && !showCelebration && activeModuleId !== "sinewaves" && (
        <EscapeHatch
          onBackToStart={handleBackToConstellation}
          onViewResume={handleOpenResume}
          onSkipToEnd={handleSkipToEnd}
        />
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        show={showCelebration}
        values={completedValues}
        skipped={skippedToEnd}
        initialTab={celebrationTab}
        onDismiss={() => setShowCelebration(false)}
        onNewChallenge={handleNewChallenge}
        onNextModule={handleBackToConstellation}
        onOpenResume={handleOpenResume}
        onOpenProcess={handleOpenProcess}
      />

      {/* Resume Dialog */}
      <ResumeDialog open={showResume} onOpenChange={setShowResume} />

      {/* Process Dialog */}
      <ProcessDialog open={showProcess} onOpenChange={setShowProcess} />
    </PortfolioProvider>
  )
}

export default App
