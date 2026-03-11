import { Badge } from "@/components/ui/badge"
import { Lightbulb, Code, Target, Palette } from "lucide-react"
import { SINEWAVE_COPY } from "@/components/modules/sinewaves/sinewaves-copy"
import { BEHIND_THIS as RIGID_MOTIONS_BEHIND_THIS } from "@/components/modules/rigid-motions/rigid-motions-copy"

interface BehindThisTabProps {
  /** Module that was just completed; selects which "Behind This" copy to show */
  moduleId?: string | null
}

export function BehindThisTab({ moduleId }: BehindThisTabProps) {
  const copy =
    moduleId === "rigid-motions" ? RIGID_MOTIONS_BEHIND_THIS : SINEWAVE_COPY.behindThis

  return (
    <div className="space-y-6">
      {/* The Approach */}
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

      {/* The Build */}
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

      {/* Design Decisions */}
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

      {/* Where This Fits */}
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
