interface ConnectionLinesProps {
  nodeCount: number
}

export function ConnectionLines({ nodeCount }: ConnectionLinesProps) {
  if (nodeCount < 2) return null

  return (
    <svg
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {/* Vertical connecting line between nodes */}
      <line
        x1="50%"
        y1="20%"
        x2="50%"
        y2="80%"
        stroke="#4b5563"
        strokeWidth="1"
      />
    </svg>
  )
}
