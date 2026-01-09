import { cn } from '@/lib/utils'
import type { ModuleConfig } from '@/config/modules'
import type { ModuleStatus } from '@/types/portfolio'

interface ModuleNodeProps {
  module: ModuleConfig
  status: ModuleStatus
  isRecommended: boolean
  onClick: () => void
}

export function ModuleNode({ module, status, isRecommended, onClick }: ModuleNodeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2 p-4 rounded-lg transition-all',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
        isRecommended && 'animate-pulse-subtle'
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 transition-colors',
          status === 'completed' && 'bg-cyan-400 border-cyan-400',
          status === 'in-progress' && 'border-amber-400 bg-amber-400/30',
          status === 'not-started' && 'border-gray-500 bg-transparent',
          isRecommended && status === 'not-started' && 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
        )}
      />

      {/* Domain label */}
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {module.domain}
      </span>

      {/* Module title */}
      <span className={cn(
        'text-sm font-medium transition-colors',
        status === 'completed' ? 'text-cyan-400' : 'text-white',
        'group-hover:text-cyan-300'
      )}>
        {module.title}
      </span>
    </button>
  )
}
