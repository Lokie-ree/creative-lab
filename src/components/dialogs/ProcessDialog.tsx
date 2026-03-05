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
  /** When set (e.g. from celebration after completing a module), shows module-specific process copy. */
  moduleId?: string | null
}

// ----- Sinewaves (default) -----
const SINEWAVES = {
  subtitle: "How I approached building this module",
  challenge: {
    main: "Build an interactive learning module that demonstrates my pedagogical approach: challenge-first learning through discovery and manipulation.",
    constraint: "12-day timeline while learning React Three Fiber from scratch.",
  },
  opportunity: {
    vision: "Making higher-level mathematics accessible through interactive discovery.",
    body: "Trigonometry, linear algebra, differential equations—these abstract concepts become tangible when learners manipulate them before encountering notation.",
    tagline: "This module demonstrates my approach to teaching through discovery.",
  },
  timeline: [
    { label: "1-2", focus: "Research & Architecture" },
    { label: "3-6", focus: "Core Visualization (R3F, unit circle, wave)" },
    { label: "7-10", focus: "Stage Flow & Feedback" },
    { label: "11-12", focus: "Polish & Application Wrapper" },
  ],
  pedagogy: [
    { title: "Challenge-First", description: "No explanations before exploration" },
    { title: "No Wrong Answers", description: '"Learning moments" instead of errors' },
    { title: "Progressive Reveal", description: "One parameter at a time, formula builds" },
  ],
  nextSteps: [
    "Signal Lab unification (multiple signal types)",
    "Sin → cos relationship exploration",
    "Decode transmission mechanic",
    "Fourier extension for advanced learners",
  ],
}

// ----- Rigid Motions + ISTE Live 26 -----
const RIGID_MOTIONS = {
  subtitle: "Rigid Motions · Road to ISTE Live 2026",
  challenge: {
    main: "Dual-purpose: deliver measurable learning for STEM Club students and become conference-ready for ISTE Live 2026. The goal at ISTE is not a formal presentation—it's a QR code in the exhibit hall and a stranger who understands what to do within 30 seconds and finds it compelling enough to finish.",
    constraint: "Every build decision carries two questions: does it deepen learning, and does it survive a cold start on an unfamiliar device in a noisy room?",
  },
  opportunity: {
    vision: "The capstone moment: a stranger completes the sequence builder, sees the ghost land exactly on the target, and says \"wait, that actually worked.\"",
    body: "8.G.A.2 and 8.G.A.3—congruence through transformation composition, and describing transformations with coordinates. Students construct the path instead of picking an answer; notation emerges from understanding, not before it.",
    tagline: "Plant the flag at ISTE Live 26. Collect the signal. Formalize at ISTE Live 27.",
  },
  timeline: [
    { label: "1–2", focus: "Draggable ghost, grid, R3F scene · Foundation" },
    { label: "3", focus: "Predict/reveal loop: translate, reflect, rotate · Core interaction" },
    { label: "4", focus: "Coordinate layer, FormulaReadout · Geometry to algebra" },
    { label: "5", focus: "SequenceBuilder, PreviewGhost · Capstone (two-step composition)" },
    { label: "Audit", focus: "Cold-start usability, cross-device polish · Conference-ready" },
  ],
  pedagogy: [
    { title: "Challenge-First", description: "No explanations before exploration" },
    { title: "No Wrong Answers", description: '"Learning moments" instead of errors' },
    { title: "Manipulate First, Symbolize Second", description: "Coordinates and formulas appear after spatial intuition" },
    { title: "Congruence Through Composition", description: "Build the sequence that maps one figure onto the other" },
  ],
  nextSteps: [
    "ISTE Live 26: exhibit hall demo, collect where users hesitate and accelerate",
    "ISTE Live 27: formal presentation and findings",
    "STEM Club validation through Phase 3 and 4",
  ],
}

function getContent(moduleId: string | null | undefined) {
  return moduleId === "rigid-motions" ? RIGID_MOTIONS : SINEWAVES
}

export function ProcessDialog({ open, onOpenChange, moduleId }: ProcessDialogProps) {
  const content = getContent(moduleId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[var(--lab-surface)] border-[var(--lab-border)] text-[var(--lab-text)]">
        <DialogHeader className="pb-4 border-b border-[var(--lab-border)]">
          <DialogTitle className="text-2xl font-semibold text-white">
            Design Process
          </DialogTitle>
          <p className="text-[var(--lab-text-muted)] mt-1">
            {content.subtitle}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Challenge
              </h3>
            </div>
            <div className="text-[var(--lab-text-muted)] space-y-2">
              <p>{content.challenge.main}</p>
              <p className="text-[var(--lab-text-dim)]">
                <span className="text-[var(--lab-accent)] font-medium">Constraint:</span>{" "}
                {content.challenge.constraint}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Opportunity
              </h3>
            </div>
            <div className="bg-[var(--lab-accent)]/10 border border-[var(--lab-accent)]/20 rounded-lg p-4">
              <p className="text-[var(--lab-text)] mb-2">
                <span className="text-[var(--lab-accent)] font-medium">The Vision:</span>{" "}
                {content.opportunity.vision}
              </p>
              <p className="text-[var(--lab-text-muted)] text-sm mb-2">
                {content.opportunity.body}
              </p>
              <p className="text-[var(--lab-text-dim)] text-sm italic">
                {content.opportunity.tagline}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                The Timeline
              </h3>
            </div>
            <div className="space-y-2">
              {content.timeline.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 p-3 bg-[var(--lab-bg-elevated)]/50 rounded-lg"
                >
                  <span className="text-[var(--lab-accent)] font-mono font-medium w-14 shrink-0">
                    {item.label}
                  </span>
                  <span className="text-[var(--lab-text)]">{item.focus}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[var(--lab-accent)]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Pedagogical Decisions
              </h3>
            </div>
            <div className="space-y-3">
              {content.pedagogy.map((item) => (
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

          <section>
            <h3 className="text-sm font-semibold text-[var(--lab-accent)] uppercase tracking-wide mb-3">
              What I'd Do Next
            </h3>
            <ul className="space-y-2">
              {content.nextSteps.map((step, i) => (
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
