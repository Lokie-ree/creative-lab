import { cn } from '@/lib/utils'
import type { ModuleConfig } from '@/config/modules'
import type { ModuleStatus } from '@/types/portfolio'
import { NodeRings } from './NodeRings'

interface ModuleNodeProps {
  module: ModuleConfig
  status: ModuleStatus
  progress: number // 0-1
  isRecommended: boolean
  onClick: () => void
}

export function ModuleNode({
  module,
  status,
  progress,
  isRecommended,
  onClick,
}: ModuleNodeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-3 p-4 rounded-lg transition-all duration-150',
        'hover:scale-108 active:scale-98',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]'
      )}
    >
      {/* Layered rings */}
      <NodeRings
        status={status}
        progress={progress}
        isRecommended={isRecommended}
        className={cn(
          'transition-all duration-150',
          'group-hover:[&_circle]:stroke-[3px]',
          'group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]',
          isRecommended && status === 'not-started' && 'animate-ring-pulse'
        )}
      />

      {/* Domain label */}
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {module.domain}
      </span>

      {/* Module title */}
      <span
        className={cn(
          'text-sm font-medium transition-colors duration-150 max-w-[120px] text-center',
          status === 'completed' ? 'text-cyan-400' : 'text-white',
          'group-hover:text-cyan-300'
        )}
      >
        {module.title}
      </span>
    </button>
  )
}
