// src/components/modules/sinewaves/components/ControlStrip.tsx
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ControlStripProps {
  amplitudeSlider: ReactNode
  frequencySlider: ReactNode
  instrumentControls: ReactNode
  actionButtons?: ReactNode // Continue, Try Another, Complete
  className?: string
}

/**
 * Control strip with always-visible sliders and instrument controls
 *
 * Layout:
 * - Mobile: sliders stacked → instrument controls → action buttons
 * - Desktop (sm+): [slider] [slider] [instrument controls] on one row, action buttons below
 */
export const ControlStrip = forwardRef<HTMLDivElement, ControlStripProps>(
  function ControlStrip(
    { amplitudeSlider, frequencySlider, instrumentControls, actionButtons, className = '' },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto flex w-full max-w-4xl flex-col items-center gap-2 md:gap-4',
          className
        )}
      >
        {/* Main controls row: sliders + instrument buttons */}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:gap-4 md:gap-6">
          <div className="flex-1">{amplitudeSlider}</div>
          <div className="flex-1">{frequencySlider}</div>
          <div className="shrink-0 self-center sm:self-end sm:pb-3 sm:ml-auto">
            {instrumentControls}
          </div>
        </div>

        {/* Action buttons (Continue, Try Another, Complete) */}
        {actionButtons && (
          <div className="flex items-center gap-3">
            {actionButtons}
          </div>
        )}
      </div>
    )
  }
)
