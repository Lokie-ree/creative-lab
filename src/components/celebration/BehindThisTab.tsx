import { Badge } from "@/components/ui/badge"
import { Lightbulb, Code, Target, Palette } from "lucide-react"
import { SINEWAVE_COPY } from "@/components/modules/sinewaves/sinewaves-copy"
import { BEHIND_THIS as RIGID_MOTIONS_BEHIND_THIS } from "@/components/modules/rigid-motions/rigid-motions-copy"

interface BehindThisTabProps {
  /** Module that was just completed; selects which "Behind This" copy to show */
  moduleId?: string | null
}

function CopyLayout({ copy }: { copy: typeof SINEWAVE_COPY.behindThis }) {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            {copy.approach.title}
          </h4>
        </div>
        <div className="space-y-2 text-sm text-[var(--lab-text-muted)]">
          {copy.approach.points.map((point, idx) => (
            <p key={idx}>{point}</p>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            {copy.build.title}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {copy.build.badges.map((badge, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="border border-(--lab-border) bg-(--lab-bg) text-(--lab-text) hover:border-(--lab-text-muted) rounded-none"
            >
              {badge}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-(--lab-text-muted) italic">
          {copy.build.note}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--lab-text-muted)]">
          {copy.build.features.map((feature, idx) => (
            <li key={idx}>• {feature}</li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            {copy.designDecisions.title}
          </h4>
        </div>
        <ul className="space-y-2 text-sm text-[var(--lab-text-muted)]">
          {copy.designDecisions.points.map((point, idx) => (
            <li key={idx}>• {point}</li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            {copy.whereThisFits.title}
          </h4>
        </div>
        <div className="border border-(--lab-border) bg-(--lab-bg) p-3">
          <p className="text-sm text-(--lab-text-muted) whitespace-pre-line">
            {copy.whereThisFits.content}
          </p>
        </div>
      </section>
    </div>
  )
}

function DilationsBehindThis() {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            The Approach
          </h4>
        </div>
        <div className="space-y-2 text-sm text-(--lab-text-muted)">
          <p>Students predict before the math is revealed. Each round earns the formula — not the other way around.</p>
          <p>The AA Criterion is never stated. Students discover it by observing angle matches across four phases, then prove it fails when angles don't match.</p>
          <p>No wrong answers — only getting closer. The sequence builder shows the composed result live so students can see the effect of each transformation.</p>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            The Build
          </h4>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {['React Three Fiber', 'CanvasTexture', 'GSAP', 'Vitest TDD', 'State machine'].map((badge, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="border border-(--lab-border) bg-(--lab-bg) text-(--lab-text) hover:border-(--lab-text-muted) rounded-none"
            >
              {badge}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-(--lab-text-muted) italic">
          14 rounds, 4 phases, one state machine
        </p>
        <ul className="mt-2 space-y-1 text-sm text-(--lab-text-muted)">
          <li>• Angle labels via CanvasTexture sprites — no drei Text or Html</li>
          <li>• Color-matched angle pairs computed from sorted angle arrays</li>
          <li>• SequencePreview live ghost updates on every step change</li>
          <li>• Drag capture plane at scene level — no event leakage</li>
        </ul>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            Design Decisions
          </h4>
        </div>
        <ul className="space-y-2 text-sm text-(--lab-text-muted)">
          <li>• Predict-and-reveal loop in every phase — commitment before feedback</li>
          <li>• Coordinate rule discovered by pattern, never announced</li>
          <li>• NOT SIMILAR only unlocks after revealing angles — prevents guessing</li>
          <li>• Chip-rail SequenceBuilder from Phase 3 reused in capstone</li>
        </ul>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-(--lab-accent)" />
          <h4 className="lab-silk lab-display-font font-bold text-(--lab-text)">
            Where This Fits
          </h4>
        </div>
        <div className="border border-(--lab-border) bg-(--lab-bg) p-3">
          <p className="text-sm text-(--lab-text-muted) whitespace-pre-line">
            Standards: 8.G.A.3 · 8.G.A.4 · 8.G.A.5{"\n"}
            Module 2 of 3 in the Grade 8 Geometry sequence.{"\n"}
            Bridges rigid motions (M1) to the Pythagorean Theorem (M3).
          </p>
        </div>
      </section>
    </div>
  )
}

function GenericBehindThis() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="lab-silk lab-display-font text-(--lab-text-muted) text-sm">
        Module notes coming soon
      </p>
    </div>
  )
}

export function BehindThisTab({ moduleId }: BehindThisTabProps) {
  if (moduleId === 'dilations') return <DilationsBehindThis />
  if (moduleId === 'rigid-motions') return <CopyLayout copy={RIGID_MOTIONS_BEHIND_THIS} />
  if (moduleId === 'sinewaves') return <CopyLayout copy={SINEWAVE_COPY.behindThis} />
  return <GenericBehindThis />
}
