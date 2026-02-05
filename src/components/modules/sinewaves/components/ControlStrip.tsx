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
 * - Mobile: sliders stacked, then buttons row
 * - Desktop: sliders side-by-side, then buttons row
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
          'mx-auto flex w-full max-w-2xl flex-col items-center gap-4',
          className
        )}
      >
        {/* Sliders row */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-6">
          <div className="flex-1">{amplitudeSlider}</div>
          <div className="flex-1">{frequencySlider}</div>
        </div>

        {/* Instrument controls row */}
        {instrumentControls}

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
