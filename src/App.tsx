import { useState, useCallback, lazy, Suspense } from "react"
import { Hero } from "./components/hero"
import { ModuleLoader } from "./components/ModuleLoader"
import { SlideTransition } from "./components/transitions"

// Lazy load the heavy Module component (includes Three.js/R3F)
const Module = lazy(() => import("./components/Module").then(m => ({ default: m.Module })))
import { EscapeHatch } from "./components/layout"
import { CelebrationModal } from "./components/celebration"
import { ResumeDialog, ProcessDialog } from "./components/dialogs"

type View = "hero" | "module"
type TabId = "discovery" | "behind" | "deeper"

function App() {
  // View state
  const [view, setView] = useState<View>("hero")

  // Completed values from module
  const [completedValues, setCompletedValues] = useState<{ a: number; f: number } | null>(null)

  // Modal states
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationTab, setCelebrationTab] = useState<TabId>("discovery")
  const [skippedToEnd, setSkippedToEnd] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [showProcess, setShowProcess] = useState(false)

  // Hero → Module transition
  const handleEnterModule = useCallback(() => {
    setView("module")
  }, [])

  // Module completion → Celebration modal
  const handleModuleComplete = useCallback((values: { a: number; f: number }) => {
    setCompletedValues(values)
    setSkippedToEnd(false)
    setCelebrationTab("discovery")
    setShowCelebration(true)
  }, [])

  // Back to hero
  const handleBackToStart = useCallback(() => {
    setShowCelebration(false)
    setCompletedValues(null)
    setSkippedToEnd(false)
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

  return (
    <>
      <SlideTransition
        view={view}
        heroContent={<Hero onEnter={handleEnterModule} />}
        moduleContent={
          <Suspense fallback={<ModuleLoader />}>
            <Module onComplete={handleModuleComplete} isVisible={view === "module"} />
          </Suspense>
        }
      />

      {/* Escape hatch - only visible in module view, not during celebration */}
      {view === "module" && !showCelebration && (
        <EscapeHatch
          onBackToStart={handleBackToStart}
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
        onOpenResume={handleOpenResume}
        onOpenProcess={handleOpenProcess}
      />

      {/* Resume Dialog */}
      <ResumeDialog open={showResume} onOpenChange={setShowResume} />

      {/* Process Dialog */}
      <ProcessDialog open={showProcess} onOpenChange={setShowProcess} />
    </>
  )
}

export default App
