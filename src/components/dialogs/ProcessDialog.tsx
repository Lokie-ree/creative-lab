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
  { days: "3-5", focus: "Core Visualization (R3F, unit circle, wave)" },
  { days: "6-8", focus: "Stage Flow & Feedback" },
  { days: "9-10", focus: "Polish & Application Wrapper" },
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader className="pb-4 border-b border-zinc-800">
          <DialogTitle className="text-2xl font-semibold text-white">
            Design Process
          </DialogTitle>
          <p className="text-zinc-400 mt-1">
            How I approached building this module
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* The Challenge */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Challenge
              </h3>
            </div>
            <div className="text-zinc-400 space-y-2">
              <p>
                Brilliant's application asked for an interactive learning module that demonstrates understanding of their pedagogical approach.
              </p>
              <p className="text-zinc-500">
                <span className="text-cyan-400 font-medium">Constraint:</span> 10-day timeline while learning React Three Fiber from scratch.
              </p>
            </div>
          </section>

          {/* The Opportunity */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Opportunity
              </h3>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-zinc-300 mb-2">
                <span className="text-cyan-400 font-medium">Gap identified:</span> Brilliant's Advanced Math track has no standalone Trigonometry course.
              </p>
              <p className="text-zinc-400 text-sm mb-2">
                "Sine and Cosine" is buried in Calculus Level 8 — accessible only after completing prerequisite courses.
              </p>
              <p className="text-zinc-500 text-sm italic">
                This module prototypes a dedicated Periodic Functions course that could fill that gap.
              </p>
            </div>
          </section>

          {/* The Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Timeline
              </h3>
            </div>
            <div className="space-y-2">
              {TIMELINE.map((item) => (
                <div
                  key={item.days}
                  className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg"
                >
                  <span className="text-cyan-400 font-mono font-medium w-12">
                    {item.days}
                  </span>
                  <span className="text-zinc-300">{item.focus}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pedagogical Decisions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Pedagogical Decisions
              </h3>
            </div>
            <div className="space-y-3">
              {PEDAGOGY.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                  <div>
                    <span className="text-white font-medium">{item.title}:</span>{" "}
                    <span className="text-zinc-400">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What I'd Do Next */}
          <section>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
              What I'd Do Next
            </h3>
            <ul className="space-y-2">
              {NEXT_STEPS.map((step, i) => (
                <li key={i} className="text-zinc-400 pl-4 relative">
                  <span className="absolute left-0 text-zinc-600">•</span>
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
