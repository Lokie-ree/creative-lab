import { useRef, useEffect, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ArrowRight, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiscoveryTab } from "./DiscoveryTab"
import { BehindThisTab } from "./BehindThisTab"
import { GoDeeperTab } from "./GoDeeperTab"
import type { TransformationParams } from '@/lib/types/transforms'

type TabId = "discovery" | "behind" | "deeper"

interface CelebrationModalProps {
  show: boolean
  values: Record<string, number> | null
  skipped?: boolean
  initialTab?: TabId
  /** Module that was just completed; used to show module-specific "Behind This" content */
  moduleId?: string | null
  completedSequence?: TransformationParams[] | null
  onDismiss: () => void
  onNewChallenge: () => void
  onNextModule: () => void
  onOpenProcess: () => void
}

export function CelebrationModal({
  show,
  values,
  skipped = false,
  initialTab = "discovery",
  moduleId = null,
  completedSequence = null,
  onDismiss,
  onNewChallenge,
  onNextModule,
  onOpenProcess,
}: CelebrationModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: syncing prop to state for exit animation control
      setIsVisible(true)
      setActiveTab(initialTab)
    }
  }, [show, initialTab])

  useGSAP(
    () => {
      if (show && containerRef.current && backdropRef.current) {
        const tl = gsap.timeline()

        gsap.set(backdropRef.current, { opacity: 0 })
        gsap.set(containerRef.current, { opacity: 0, y: 12 })

        tl.to(backdropRef.current, {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
        }, 0)
        tl.to(containerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        }, 0.05)
      }
    },
    { dependencies: [show], scope: containerRef }
  )

  const handleDismiss = () => {
    if (containerRef.current && backdropRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsVisible(false)
          onDismiss()
        },
      })

      tl.to(containerRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        ease: "power2.in",
      }, 0)
      tl.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
      }, 0.05)
    }
  }

  const handleNewChallenge = () => {
    handleDismiss()
    setTimeout(onNewChallenge, 300)
  }

  const handleNextModule = () => {
    if (containerRef.current && backdropRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsVisible(false)
          onNextModule()
        },
      })

      tl.to(containerRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        ease: "power2.in",
      }, 0)
      tl.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
      }, 0.05)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/70"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        ref={containerRef}
        className="relative w-full max-w-lg mx-4 bg-(--lab-surface) border border-(--lab-border) overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-(--lab-text-muted) hover:text-(--lab-text) hover:bg-(--lab-bg) transition-colors duration-150 z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabId)}
          className="flex flex-col min-h-0 flex-1"
        >
          <TabsList className="w-full border-b border-(--lab-border) bg-transparent rounded-none p-0 pr-12 sm:pr-0 h-auto flex-shrink-0">
            <TabsTrigger
              value="discovery"
              className="flex-1 py-3 sm:py-4 lab-silk lab-display-font rounded-none border-b-2 border-transparent data-[state=active]:border-(--lab-accent) data-[state=active]:text-(--lab-accent) text-(--lab-text-muted) hover:text-(--lab-text) bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-150"
            >
              <span className="hidden sm:inline">Your </span>Discovery
            </TabsTrigger>
            <TabsTrigger
              value="behind"
              className="flex-1 py-3 sm:py-4 lab-silk lab-display-font rounded-none border-b-2 border-transparent data-[state=active]:border-(--lab-accent) data-[state=active]:text-(--lab-accent) text-(--lab-text-muted) hover:text-(--lab-text) bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-150"
            >
              Behind This
            </TabsTrigger>
            <TabsTrigger
              value="deeper"
              className="flex-1 py-3 sm:py-4 lab-silk lab-display-font rounded-none border-b-2 border-transparent data-[state=active]:border-(--lab-accent) data-[state=active]:text-(--lab-accent) text-(--lab-text-muted) hover:text-(--lab-text) bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-150"
            >
              Go Deeper
            </TabsTrigger>
          </TabsList>

          {/* Tab content */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0">
            <TabsContent value="discovery" className="mt-0">
              <DiscoveryTab values={values} skipped={skipped} moduleId={moduleId} completedSequence={completedSequence} />
            </TabsContent>
            <TabsContent value="behind" className="mt-0">
              <BehindThisTab moduleId={moduleId} />
            </TabsContent>
            <TabsContent value="deeper" className="mt-0">
              <GoDeeperTab
                onOpenProcess={onOpenProcess}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-(--lab-border) flex-shrink-0 flex gap-3">
          <button
            onClick={handleNewChallenge}
            className="flex-1 min-h-[44px] border border-(--lab-border) bg-(--lab-bg) hover:border-(--lab-text-muted) lab-silk lab-display-font tracking-[0.1em] text-(--lab-text) transition-colors duration-150"
          >
            Keep Exploring
          </button>
          <button
            onClick={handleNextModule}
            className="flex-1 min-h-[44px] border border-(--lab-accent) bg-(--lab-accent) hover:bg-(--lab-accent-hover) hover:border-(--lab-accent-hover) lab-silk lab-display-font tracking-[0.1em] text-(--lab-bg) transition-colors duration-150"
          >
            Next Module <ArrowRight size={14} aria-hidden="true" className="inline-block ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
