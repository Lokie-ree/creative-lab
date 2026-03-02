// src/components/modules/rigid-motions/controls/ControlStrip.tsx
/**
 * Phase 1 placeholder control strip.
 * CHECK button is disabled — scoring is Phase 2.
 */
export function ControlStrip() {
  return (
    <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
      <button
        type="button"
        disabled
        className={[
          'min-h-[44px] w-full md:w-auto md:min-w-[160px]',
          'border border-(--lab-border)',
          'bg-transparent',
          'lab-silk lab-display-font text-[10px] tracking-[0.1em]',
          'text-(--lab-text-dim)',
          'cursor-not-allowed',
          'transition-colors duration-150',
        ].join(' ')}
        aria-label="Check answer — not yet available"
      >
        Check
      </button>
    </div>
  )
}
