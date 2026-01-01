import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Target, Calendar, Lightbulb, Rocket } from "lucide-react"

interface ProcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TIMELINE = [
  { days: "1-2", focus: "Research & Architecture" },
  { days: "3-6", focus: "Core Visualization (R3F, unit circle, wave)" },
  { days: "7-10", focus: "Stage Flow & Feedback" },
  { days: "11-12", focus: "Polish & Application Wrapper" },
]

const PEDAGOGY = [
  {
    title: "Challenge-First",
    description: "No explanations before exploration",
  },
  {
    title: "No Wrong Answers",
    description: '"Learning moments" instead of errors',
  },
  {
    title: "Progressive Reveal",
    description: "One parameter at a time, formula builds",
  },
]

const NEXT_STEPS = [
  "Signal Lab unification (multiple signal types)",
  "Sin → cos relationship exploration",
  "Decode transmission mechanic",
  "Fourier extension for advanced learners",
]

export function ProcessDialog({ open, onOpenChange }: ProcessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[var(--lab-surface)] border-[var(--lab-border)] text-[var(--lab-text)]">
        <DialogHeader className="pb-4 border-b border-[var(--lab-border)]">
          <DialogTitle className="text-2xl font-semibold text-white">
            Design Process
          </DialogTitle>
          <p className="text-[var(--lab-text-muted)] mt-1">
            How I approached building this module
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* The Challenge */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Challenge
              </h3>
            </div>
            <div className="text-[var(--lab-text-muted)] space-y-2">
              <p>
                Brilliant's application asked for an interactive learning module that demonstrates understanding of their pedagogical approach.
              </p>
              <p className="text-[var(--lab-text-dim)]">
                <span className="text-[var(--lab-accent)] font-medium">Constraint:</span> 12-day timeline while learning React Three Fiber from scratch.
              </p>
            </div>
          </section>

          {/* The Opportunity */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Opportunity
              </h3>
            </div>
            <div className="bg-[var(--lab-accent)]/10 border border-[var(--lab-accent)]/20 rounded-lg p-4">
              <p className="text-[var(--lab-text)] mb-2">
                <span className="text-[var(--lab-accent)] font-medium">Where I fit:</span> Brilliant is expanding beyond foundational algebra into higher-level mathematics.
              </p>
              <p className="text-[var(--lab-text-muted)] text-sm mb-2">
                Trigonometry, linear algebra, differential equations—these courses need someone who can design discovery-first experiences for abstract concepts.
              </p>
              <p className="text-[var(--lab-text-dim)] text-sm italic">
                This module demonstrates how I'd approach that expansion.
              </p>
            </div>
          </section>

          {/* The Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Timeline
              </h3>
            </div>
            <div className="space-y-2">
              {TIMELINE.map((item) => (
                <div
                  key={item.days}
                  className="flex items-center gap-4 p-3 bg-[var(--lab-bg-elevated)]/50 rounded-lg"
                >
                  <span className="text-[var(--lab-accent)] font-mono font-medium w-12">
                    {item.days}
                  </span>
                  <span className="text-[var(--lab-text)]">{item.focus}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pedagogical Decisions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Pedagogical Decisions
              </h3>
            </div>
            <div className="space-y-3">
              {PEDAGOGY.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--lab-accent)] mt-2 shrink-0" />
                  <div>
                    <span className="text-white font-medium">{item.title}:</span>{" "}
                    <span className="text-[var(--lab-text-muted)]">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What I'd Do Next */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--lab-accent)] uppercase tracking-wide mb-3">
              What I'd Do Next
            </h3>
            <ul className="space-y-2">
              {NEXT_STEPS.map((step, i) => (
                <li key={i} className="text-[var(--lab-text-muted)] pl-4 relative">
                  <span className="absolute left-0 text-[var(--lab-text-dim)]">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
