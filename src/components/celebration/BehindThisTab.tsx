import { Badge } from "@/components/ui/badge"
import { Lightbulb, Code, Target } from "lucide-react"

export function BehindThisTab() {
  return (
    <div className="space-y-6">
      {/* The Approach */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            The Approach
          </h4>
        </div>
        <div className="space-y-2 text-sm text-zinc-400">
          <p>
            <span className="text-cyan-400 font-medium">Challenge-first learning</span> — Brilliant's core pedagogy
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
          <Code className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            The Build
          </h4>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            React Three Fiber
          </Badge>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            TypeScript
          </Badge>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            GSAP
          </Badge>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            shadcn/ui
          </Badge>
        </div>
        <p className="text-sm text-zinc-500 italic">
          First R3F project — built in 10 days while learning the library
        </p>
        <ul className="mt-2 space-y-1 text-sm text-zinc-400">
          <li>• 60fps animation with Three.js</li>
          <li>• Unit circle → wave connection</li>
          <li>• Progressive discovery flow</li>
        </ul>
      </section>

      {/* The Opportunity */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
            The Opportunity
          </h4>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
          <p className="text-sm text-zinc-300 mb-2">
            <span className="text-cyan-400">Brilliant's gap:</span> No standalone Trigonometry
          </p>
          <p className="text-sm text-zinc-400">
            "Sine and Cosine" buried in Calculus Level 8
          </p>
          <p className="text-sm text-zinc-500 mt-2 italic">
            This module prototypes a dedicated Periodic Functions course
          </p>
        </div>
      </section>
    </div>
  )
}
