import { Badge } from "@/components/ui/badge"
import { Lightbulb, Code, Target, Palette } from "lucide-react"
import { SINEWAVE_COPY } from "@/components/modules/sinewaves/sinewaves-copy"

export function BehindThisTab() {
  const copy = SINEWAVE_COPY.behindThis

  return (
    <div className="space-y-6">
      {/* The Approach */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[var(--lab-accent)]" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
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
          <Code className="w-4 h-4 text-[var(--lab-accent)]" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            {copy.build.title}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {copy.build.badges.map((badge, idx) => (
            <Badge 
              key={idx}
              variant="secondary" 
              className="bg-[var(--lab-bg-elevated)] text-[var(--lab-text)] hover:bg-[var(--lab-surface-elevated)]"
            >
              {badge}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-[var(--lab-text-dim)] italic">
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
          <Palette className="w-4 h-4 text-[var(--lab-accent)]" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
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
          <Target className="w-4 h-4 text-[var(--lab-accent)]" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            {copy.whereThisFits.title}
          </h4>
        </div>
        <div className="bg-[var(--lab-bg-elevated)]/50 rounded-lg p-3 border border-[var(--lab-border)]">
          <p className="text-sm text-[var(--lab-text-muted)] whitespace-pre-line">
            {copy.whereThisFits.content}
          </p>
        </div>
      </section>
    </div>
  )
}
