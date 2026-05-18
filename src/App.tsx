import { useState, useCallback, Suspense, useEffect, useTransition, type ComponentType } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Hero } from "./components/hero/Hero"
import { ModuleLoader } from "./components/modules/ModuleLoader"
import { PortfolioProvider } from "@/context/PortfolioContext"
import { ModulePicker } from "@/components/picker/ModulePicker"
import { getModuleById, type ModuleProps } from "@/config/modules"
import { CelebrationModal } from "./components/celebration/CelebrationModal"
import { ProcessDialog } from "./components/dialogs/ProcessDialog"
import type { TransformationParams } from '@/lib/types/transforms'

type View = "hero" | "picker" | "module"
type TabId = "discovery" | "behind" | "deeper"

/**
 * Dynamic Module Loader
 * Loads the correct module component based on moduleId from the modules config
 */
interface DynamicModuleProps {
  moduleId: string
  onComplete: (values: Record<string, number>, meta?: { completedSequence?: TransformationParams[] }) => void
  isVisible: boolean
  onBack?: () => void
}

function DynamicModule({ moduleId, onComplete, isVisible, onBack }: DynamicModuleProps) {
  const [LoadedModule, setLoadedModule] = useState<ComponentType<ModuleProps> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    const moduleConfig = getModuleById(moduleId)
    if (!moduleConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Error state for missing module
      setError(`Module "${moduleId}" not found`)
      return
    }

    // Load the module component
    moduleConfig.component()
      .catch(() => moduleConfig.component())  // retry once on transient failure
      .then(module => {
        startTransition(() => {
          setLoadedModule(() => module.default)
          setError(null)
        })
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
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  // Completed values from module
  const [completedValues, setCompletedValues] = useState<Record<string, number> | null>(null)
  const [completedSequence, setCompletedSequence] = useState<TransformationParams[] | null>(null)

  // Modal states
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationTab, setCelebrationTab] = useState<TabId>("discovery")
  const [showProcess, setShowProcess] = useState(false)

  // Hero → Picker transition
  const handleEnter = useCallback(() => {
    setView("picker")
  }, [])

  // Picker → Module transition
  const handleSelectModule = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId)
    setView("module")
  }, [])

  // Module completion → Celebration modal
  const handleModuleComplete = useCallback(
    (values: Record<string, number>, meta?: { completedSequence?: TransformationParams[] }) => {
      setCompletedValues(values)
      setCompletedSequence(meta?.completedSequence ?? null)
      setCelebrationTab("discovery")
      setShowCelebration(true)
    },
    []
  )

  // Back to picker from module
  const handleBackToPicker = useCallback(() => {
    setShowCelebration(false)
    setCompletedValues(null)
    setCompletedSequence(null)
    setActiveModuleId(null)
    setView("picker")
  }, [])

  // Back to hero from picker
  const handleBackToHero = useCallback(() => {
    setView("hero")
  }, [])

  // Escape key — exit module back to picker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (view !== 'module') return
      if (showCelebration || showProcess) return
      handleBackToPicker()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, showCelebration, showProcess, handleBackToPicker])

  // New challenge from celebration modal
  const handleNewChallenge = useCallback(() => {
    setShowCelebration(false)
    setCompletedValues(null)
    setCompletedSequence(null)
    // Module will reset internally when re-rendered
  }, [])

  // Open process dialog
  const handleOpenProcess = useCallback(() => {
    setShowProcess(true)
  }, [])

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  return (
    <PortfolioProvider>
      <div className="min-h-dvh bg-(--lab-bg)">
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

        {/* Picker View */}
        {view === "picker" && (
          <motion.div
            key="picker"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ModulePicker onSelectModule={handleSelectModule} onBack={handleBackToHero} />
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
            <Suspense fallback={<ModuleLoader />}>
              <DynamicModule
                moduleId={activeModuleId}
                onComplete={handleModuleComplete}
                isVisible={true}
                onBack={handleBackToPicker}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        show={showCelebration}
        values={completedValues}
        initialTab={celebrationTab}
        moduleId={activeModuleId}
        completedSequence={completedSequence}
        onDismiss={() => setShowCelebration(false)}
        onNewChallenge={handleNewChallenge}
        onNextModule={handleBackToPicker}
        onOpenProcess={handleOpenProcess}
      />

      {/* Process Dialog */}
      <ProcessDialog open={showProcess} onOpenChange={setShowProcess} moduleId={activeModuleId} />
    </PortfolioProvider>
  )
}

export default App
