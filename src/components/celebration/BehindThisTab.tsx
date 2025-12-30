import { Badge } from "@/components/ui/badge"
import { Lightbulb, Code, Target } from "lucide-react"

export function BehindThisTab() {
  return (
    <div className="space-y-6">
      {/* The Approach */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[var(--lab-accent)]" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            The Approach
          </h4>
        </div>
        <div className="space-y-2 text-sm text-[var(--lab-text-muted)]">
          <p>
            <span className="text-[var(--lab-accent)] font-medium">Challenge-first learning</span> — Brilliant's core pedagogy
          </p>
          <p>
            Manipulate → discover patterns → earn the formula
          </p>
          <p>
            Equation as label for intuition, not prerequisite
          </p>
        </div>
      </section>

      {/* The Build */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-[var(--lab-accent)]" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            The Build
          </h4>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="bg-[var(--lab-bg-elevated)] text-[var(--lab-text)] hover:bg-[var(--lab-surface-elevated)]">
            React Three Fiber
          </Badge>
          <Badge variant="secondary" className="bg-[var(--lab-bg-elevated)] text-[var(--lab-text)] hover:bg-[var(--lab-surface-elevated)]">
            TypeScript
          </Badge>
          <Badge variant="secondary" className="bg-[var(--lab-bg-elevated)] text-[var(--lab-text)] hover:bg-[var(--lab-surface-elevated)]">
            GSAP
          </Badge>
          <Badge variant="secondary" className="bg-[var(--lab-bg-elevated)] text-[var(--lab-text)] hover:bg-[var(--lab-surface-elevated)]">
            shadcn/ui
          </Badge>
        </div>
        <p className="text-sm text-[var(--lab-text-dim)] italic">
          First R3F project — built in 10 days while learning the library
        </p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--lab-text-muted)]">
          <li>• 60fps animation with Three.js</li>
          <li>• Unit circle → wave connection</li>
          <li>• Progressive discovery flow</li>
        </ul>
      </section>

      {/* The Opportunity */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[var(--lab-accent)]" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            The Opportunity
          </h4>
        </div>
        <div className="bg-[var(--lab-bg-elevated)]/50 rounded-lg p-3 border border-[var(--lab-border)]">
          <p className="text-sm text-[var(--lab-text)] mb-2">
            <span className="text-[var(--lab-accent)]">Brilliant's gap:</span> No standalone Trigonometry
          </p>
          <p className="text-sm text-[var(--lab-text-muted)]">
            "Sine and Cosine" buried in Calculus Level 8
          </p>
          <p className="text-sm text-[var(--lab-text-dim)] mt-2 italic">
            This module prototypes a dedicated Periodic Functions course
          </p>
        </div>
      </section>
    </div>
  )
}
