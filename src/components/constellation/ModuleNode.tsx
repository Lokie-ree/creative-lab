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
  const isComingSoon = module.comingSoon ?? false

  return (
    <button
      onClick={onClick}
      disabled={isComingSoon}
      className={cn(
        'group flex flex-col items-center gap-3 p-4 rounded-lg transition-all duration-150',
        isComingSoon
          ? 'cursor-not-allowed opacity-50'
          : 'hover:scale-108 active:scale-98',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,200,124,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]'
      )}
    >
      {/* Layered rings */}
      {isComingSoon ? (
        <svg
          viewBox="0 0 48 48"
          className="w-12 h-12 opacity-50"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="stroke-gray-600"
          />
          <circle
            cx="24"
            cy="24"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="stroke-gray-600"
          />
        </svg>
      ) : (
        <NodeRings
          status={status}
          progress={progress}
          isRecommended={isRecommended}
          className={cn(
            'transition-all duration-150',
            'group-hover:[&_circle]:stroke-[3px]',
            'group-hover:drop-shadow-[0_0_12px_rgba(124,200,124,0.3)]',
            isRecommended && status === 'not-started' && 'animate-ring-pulse'
          )}
        />
      )}

      {/* Domain label */}
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {module.domain}
      </span>

      {/* Module title */}
      <span
        className={cn(
          'text-sm font-medium transition-colors duration-150 max-w-[120px] text-center',
          status === 'completed' ? 'text-[var(--lab-accent)]' : 'text-white',
          !isComingSoon && 'group-hover:text-[var(--lab-accent)]'
        )}
      >
        {module.title}
      </span>

      {/* Coming soon badge */}
      {isComingSoon && (
        <span className="text-xs text-gray-600 italic">Coming soon</span>
      )}
    </button>
  )
}
