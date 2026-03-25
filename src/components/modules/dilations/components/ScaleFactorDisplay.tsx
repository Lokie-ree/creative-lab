// src/components/modules/dilations/components/ScaleFactorDisplay.tsx

export interface ScaleFactorDisplayProps {
  k: number
}

export function ScaleFactorDisplay({ k }: ScaleFactorDisplayProps) {
  // Format: integers as "2", fractions as "½" or "⅓"
  const label =
    k === 0.5   ? '½' :
    k === 0.333 ? '⅓' :
    String(k)

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted)">
        SCALE FACTOR
      </span>
      <span className="lab-data-font text-2xl font-semibold text-(--lab-accent) leading-none">
        k = {label}
      </span>
    </div>
  )
}
