import { useRef, useEffect, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiscoveryTab } from "./DiscoveryTab"
import { BehindThisTab } from "./BehindThisTab"
import { GoDeeperTab } from "./GoDeeperTab"

type TabId = "discovery" | "behind" | "deeper"

interface CelebrationModalProps {
  show: boolean
  values: { a: number; f: number } | null
  skipped?: boolean
  initialTab?: TabId
  onDismiss: () => void
  onNewChallenge: () => void
  onOpenResume: () => void
  onOpenProcess: () => void
}

export function CelebrationModal({
  show,
  values,
  skipped = false,
  initialTab = "discovery",
  onDismiss,
  onNewChallenge,
  onOpenResume,
  onOpenProcess,
}: CelebrationModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setActiveTab(initialTab)
    }
  }, [show, initialTab])

  useGSAP(
    () => {
      if (show && containerRef.current && backdropRef.current) {
        const tl = gsap.timeline()

        gsap.set(backdropRef.current, { opacity: 0 })
        gsap.set(containerRef.current, { opacity: 0, scale: 0.95, y: 20 })

        tl.to(backdropRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        }, 0)
        tl.to(containerRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.4)",
        }, 0.1)
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
        scale: 0.95,
        y: -10,
        duration: 0.25,
        ease: "power2.in",
      }, 0)
      tl.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
      }, 0.1)
    }
  }

  const handleNewChallenge = () => {
    handleDismiss()
    setTimeout(onNewChallenge, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        ref={containerRef}
        className="relative w-full max-w-lg mx-4 bg-[var(--lab-surface)] border border-[var(--lab-border)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--lab-text-muted)] hover:text-[var(--lab-text)] hover:bg-[var(--lab-bg-elevated)] transition-colors z-10"
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
          <TabsList className="w-full border-b border-[var(--lab-border)] bg-transparent rounded-none p-0 pr-12 sm:pr-0 h-auto flex-shrink-0">
            <TabsTrigger
              value="discovery"
              className="flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--lab-accent)] data-[state=active]:text-[var(--lab-accent)] text-[var(--lab-text-muted)] hover:text-[var(--lab-text)] bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <span className="hidden sm:inline">Your </span>Discovery
            </TabsTrigger>
            <TabsTrigger
              value="behind"
              className="flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--lab-accent)] data-[state=active]:text-[var(--lab-accent)] text-[var(--lab-text-muted)] hover:text-[var(--lab-text)] bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Behind This
            </TabsTrigger>
            <TabsTrigger
              value="deeper"
              className="flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--lab-accent)] data-[state=active]:text-[var(--lab-accent)] text-[var(--lab-text-muted)] hover:text-[var(--lab-text)] bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Go Deeper
            </TabsTrigger>
          </TabsList>

          {/* Tab content */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0">
            <TabsContent value="discovery" className="mt-0">
              <DiscoveryTab values={values} skipped={skipped} />
            </TabsContent>
            <TabsContent value="behind" className="mt-0">
              <BehindThisTab />
            </TabsContent>
            <TabsContent value="deeper" className="mt-0">
              <GoDeeperTab
                onOpenResume={onOpenResume}
                onOpenProcess={onOpenProcess}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--lab-border)] flex-shrink-0">
          <button
            onClick={handleNewChallenge}
            className="w-full py-2.5 sm:py-3 min-h-[44px] bg-[var(--lab-accent)] hover:bg-[var(--lab-accent-hover)] text-[var(--lab-bg)] font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            Try Another Challenge
          </button>
        </div>
      </div>
    </div>
  )
}
