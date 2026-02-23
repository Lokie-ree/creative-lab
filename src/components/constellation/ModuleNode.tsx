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
        'group flex flex-col items-center gap-3 p-4 rounded transition-all duration-150',
        isComingSoon
          ? 'cursor-not-allowed opacity-40'
          : 'hover:scale-108 active:scale-98',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,200,124,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lab-bg)]'
      )}
    >
      {/* Rings */}
      {isComingSoon ? (
        <svg
          viewBox="0 0 48 48"
          className="w-12 h-12 opacity-40"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="var(--lab-border)"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="24"
            r="8"
            fill="none"
            stroke="var(--lab-border)"
            strokeWidth="1.5"
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
            isRecommended && status === 'not-started' && 'animate-ring-pulse'
          )}
        />
      )}

      {/* Domain label */}
      <span className="text-xs text-[var(--lab-ghost)] uppercase tracking-wider lab-display-font">
        {module.domain}
      </span>

      {/* Module title */}
      <span
        className={cn(
          'text-sm font-medium transition-colors duration-150 max-w-[120px] text-center',
          status === 'completed'
            ? 'text-[var(--lab-accent)]'
            : 'text-[var(--lab-text)]',
          !isComingSoon && 'group-hover:text-[var(--lab-accent)]'
        )}
      >
        {module.title}
      </span>

      {/* Coming soon */}
      {isComingSoon && (
        <span className="text-xs text-[var(--lab-ghost)] lab-silk lab-display-font">
          Coming soon
        </span>
      )}
    </button>
  )
}
