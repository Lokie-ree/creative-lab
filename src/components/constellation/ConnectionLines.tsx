interface ConnectionLinesProps {
  nodeCount: number
}

export function ConnectionLines({ nodeCount }: ConnectionLinesProps) {
  if (nodeCount < 2) return null

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      {/* Vertical connecting lines between nodes */}
      <line
        x1="50%"
        y1="25%"
        x2="50%"
        y2="75%"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    </svg>
  )
}
