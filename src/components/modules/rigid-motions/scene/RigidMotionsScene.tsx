// src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
/**
 * Coordinate grid with pre-image and draggable ghost triangle.
 * SVG viewBox 0 0 540 540 — 30px per math unit, origin at (270, 270).
 * No R3F/Three.js: pure SVG for 2D geometry.
 */
import { useRef, useCallback } from 'react'
import {
  PRE_IMAGE_VERTICES,
  VERTEX_LABELS,
  GHOST_VERTEX_LABELS,
  GRID_RANGE,
  CONTENT_RANGE,
  CANVAS_SIZE,
} from '../constants'
import {
  mathToSVG,
  clientToMath,
  toPolygonPoints,
  vertexLabelPos,
} from './math'

interface RigidMotionsSceneProps {
  ghostOffset: [number, number]
  onGhostMove: (rawOffset: [number, number]) => void
}

/** Derive ghost vertices from pre-image + offset */
function ghostVertices(offset: [number, number]): [number, number][] {
  return PRE_IMAGE_VERTICES.map(([x, y]) => [x + offset[0], y + offset[1]])
}

/** Compute SVG centroid from an array of math vertices */
function svgCentroid(verts: readonly [number, number][]): [number, number] {
  const sumX = verts.reduce((s, [x]) => s + x, 0)
  const sumY = verts.reduce((s, [, y]) => s + y, 0)
  return mathToSVG(sumX / verts.length, sumY / verts.length)
}

export function RigidMotionsScene({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Drag state — refs avoid stale closure issues in pointer handlers
  const dragging = useRef(false)
  const dragStartMath = useRef<[number, number]>([0, 0])
  const offsetAtDragStart = useRef<[number, number]>([0, 0])

  const getPointerMath = useCallback((clientX: number, clientY: number): [number, number] => {
    if (!svgRef.current) return [0, 0]
    return clientToMath(clientX, clientY, svgRef.current)
  }, [])

  const handleGhostPointerDown = useCallback(
    (e: React.PointerEvent<SVGPolygonElement>) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      dragging.current = true
      dragStartMath.current = getPointerMath(e.clientX, e.clientY)
      offsetAtDragStart.current = ghostOffset
    },
    [getPointerMath, ghostOffset]
  )

  const handleGhostPointerMove = useCallback(
    (e: React.PointerEvent<SVGPolygonElement>) => {
      if (!dragging.current) return
      const [mx, my] = getPointerMath(e.clientX, e.clientY)
      const [sx, sy] = dragStartMath.current
      const [ox, oy] = offsetAtDragStart.current
      onGhostMove([ox + (mx - sx), oy + (my - sy)])
    },
    [getPointerMath, onGhostMove]
  )

  const handleGhostPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  // ─── Geometry ──────────────────────────────────────────────────
  const preImageSvg = PRE_IMAGE_VERTICES.map(([x, y]) => mathToSVG(x, y))
  const ghostVerts = ghostVertices(ghostOffset)
  const ghostSvg = ghostVerts.map(([x, y]) => mathToSVG(x, y))

  const [preCx, preCy] = svgCentroid(PRE_IMAGE_VERTICES)
  const [ghostCx, ghostCy] = svgCentroid(ghostVerts)

  const preImagePoints = toPolygonPoints(PRE_IMAGE_VERTICES)
  const ghostPoints = toPolygonPoints(ghostVerts)

  // ─── Grid lines ────────────────────────────────────────────────
  const gridIntegers: number[] = []
  for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) gridIntegers.push(i)

  // ─── Axis label integers (−CONTENT_RANGE to +CONTENT_RANGE, skip 0) ─
  const axisLabelIntegers: number[] = []
  for (let i = -CONTENT_RANGE; i <= CONTENT_RANGE; i++) {
    if (i !== 0) axisLabelIntegers.push(i)
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-(--lab-bg)">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', maxWidth: `${CANVAS_SIZE}px`, maxHeight: `${CANVAS_SIZE}px`, touchAction: 'none', display: 'block' }}
        aria-label="Coordinate grid with triangle shapes"
        role="img"
      >
        {/* ── Grid lines ────────────────────────────────────── */}
        <g aria-hidden="true">
          {gridIntegers.map((i) => {
            const isAxis = i === 0
            const stroke = isAxis ? '#3e3a34' : '#28251f'
            const strokeWidth = isAxis ? 1.5 : 0.75
            const [vx1, vy1] = mathToSVG(i, -GRID_RANGE)
            const [vx2, vy2] = mathToSVG(i, GRID_RANGE)
            const [hx1, hy1] = mathToSVG(-GRID_RANGE, i)
            const [hx2, hy2] = mathToSVG(GRID_RANGE, i)
            return (
              <g key={i}>
                {/* Vertical */}
                <line x1={vx1} y1={vy1} x2={vx2} y2={vy2} stroke={stroke} strokeWidth={strokeWidth} />
                {/* Horizontal */}
                <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke={stroke} strokeWidth={strokeWidth} />
              </g>
            )
          })}
        </g>

        {/* ── Origin dot ───────────────────────────────────── */}
        {(() => {
          const [ox, oy] = mathToSVG(0, 0)
          return (
            <circle
              cx={ox}
              cy={oy}
              r={3}
              fill="var(--lab-text-muted)"
              aria-hidden="true"
            />
          )
        })()}

        {/* ── Axis labels ──────────────────────────────────── */}
        <g aria-hidden="true">
          {axisLabelIntegers.map((i) => {
            const [xLabelX, xLabelY] = mathToSVG(i, 0)
            const [yLabelX, yLabelY] = mathToSVG(0, i)
            return (
              <g key={i}>
                {/* X-axis label (below x-axis) */}
                <text
                  x={xLabelX}
                  y={xLabelY + 14}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  fontSize="9"
                  fill="var(--lab-text-muted)"
                  fontFamily="var(--font-data)"
                >
                  {i}
                </text>
                {/* Y-axis label (left of y-axis) */}
                <text
                  x={yLabelX - 10}
                  y={yLabelY}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize="9"
                  fill="var(--lab-text-muted)"
                  fontFamily="var(--font-data)"
                >
                  {i}
                </text>
              </g>
            )
          })}
        </g>

        {/* ── Pre-image triangle ───────────────────────────── */}
        <g>
          <polygon
            points={preImagePoints}
            fill="var(--lab-text)"
            fillOpacity={0.07}
            stroke="var(--lab-text)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* Vertex labels */}
          {preImageSvg.map(([vx, vy], idx) => {
            const { x, y, textAnchor } = vertexLabelPos(vx, vy, preCx, preCy)
            return (
              <text
                key={VERTEX_LABELS[idx]}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize="11"
                fontWeight="600"
                fill="var(--lab-text)"
                fontFamily="var(--font-data)"
              >
                {VERTEX_LABELS[idx]}
              </text>
            )
          })}
        </g>

        {/* ── Ghost triangle (draggable) ───────────────────── */}
        <g opacity={0.55}>
          <polygon
            points={ghostPoints}
            fill="var(--lab-accent)"
            fillOpacity={0.12}
            stroke="var(--lab-accent)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeDasharray="5 3"
            style={{ cursor: 'grab' }}
            onPointerDown={handleGhostPointerDown}
            onPointerMove={handleGhostPointerMove}
            onPointerUp={handleGhostPointerUp}
            onPointerCancel={handleGhostPointerUp}
            aria-label="Ghost triangle — drag to reposition"
            role="img"
          />
          {/* Vertex labels */}
          {ghostSvg.map(([vx, vy], idx) => {
            const { x, y, textAnchor } = vertexLabelPos(vx, vy, ghostCx, ghostCy)
            return (
              <text
                key={GHOST_VERTEX_LABELS[idx]}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize="11"
                fontWeight="600"
                fill="var(--lab-accent)"
                fontFamily="var(--font-data)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {GHOST_VERTEX_LABELS[idx]}
              </text>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
