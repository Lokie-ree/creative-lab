import { ArrowLeft } from "lucide-react"
import { MODULES } from "@/config/modules"

interface ModulePickerProps {
  onSelectModule: (moduleId: string) => void
  onBack: () => void
}

const STANDARDS: Record<string, string> = {
  'sinewaves': 'F-TF.A.1 · F-TF.A.2 · F-TF.B.5',
  'rigid-motions': '8.G.A.1 · 8.G.A.2 · 8.G.A.3',
  'dilations': '8.G.A.3 · 8.G.A.4 · 8.G.A.5',
  'pythagorean-theorem': '8.G.B.7 · 8.G.B.8',
}

export function ModulePicker({ onSelectModule, onBack }: ModulePickerProps) {
  const modules = MODULES.filter(m => !m.comingSoon).sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-dvh">
      <div className="flex flex-col h-dvh bg-(--lab-bg)">

        {/* Header */}
        <header className="h-12 shrink-0 flex items-center px-4 relative border-b border-(--lab-border)">
          <button
            onClick={onBack}
            className="flex items-center gap-2 min-h-[44px] px-2 text-(--lab-ghost) hover:text-(--lab-text) transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="lab-silk lab-display-font">Home</span>
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 lab-silk lab-display-font text-(--lab-text-muted)">
            IVLA STEM Club
          </span>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {modules.map(module => {
              const standards = STANDARDS[module.id]
              return (
                <button
                  key={module.id}
                  onClick={() => onSelectModule(module.id)}
                  className="bg-(--lab-surface) border border-(--lab-border) rounded-none px-5 py-4 text-left hover:border-(--lab-accent) transition-colors duration-150 group"
                >
                  <div className="lab-display-font font-semibold text-(--lab-text) group-hover:text-(--lab-accent) transition-colors duration-150">
                    {module.title}
                  </div>
                  {standards && (
                    <div className="lab-silk lab-data-font text-(--lab-text-muted) mt-1">
                      {standards}
                    </div>
                  )}
                  {module.description && (
                    <div className="text-sm lab-display-font text-(--lab-text-muted) mt-1">
                      {module.description}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </main>

      </div>
    </div>
  )
}
