// src/components/modules/dilations/rounds/SimilarityRounds.tsx
//
// Phase 3: Similarity rounds — similarity-guided, similarity-rigid-dilation, similarity-inverse
//
// No ghost drag in these rounds (hasGhostDrag: false). The student uses the
// SequenceBuilder HTML panel to compose a sequence of transforms. This scene
// renders:
//   - PreImageTriangle (always visible)
//   - ImageTriangle — the target the student is trying to reach
//   - SequencePreview — live ghost from composed sequence (when steps non-empty)
//   - SpriteLabels for side lengths on both triangles

import { useMemo } from 'react'
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { PreImageTriangle } from '../components/PreImageTriangle'
import { ImageTriangle } from '../components/ImageTriangle'
import { SequencePreview } from '../components/SequencePreview'
import { SpriteLabel } from '../components/SpriteLabel'
import { sideLength, triangleCentroid } from '../utils/math'
import type { SimilarityTask } from '../utils/similarityTasks'
import type { Triangle, Vec2 } from '../utils/types'

// ---------------------------------------------------------------------------
// Side-length label helpers
// ---------------------------------------------------------------------------

/** Midpoint of segment a→b */
function midpoint(a: Vec2, b: Vec2): Vec2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Offset a point outward from centroid by `distance` */
function offsetFromCentroid(point: Vec2, centroid: Vec2, distance = 0.45): Vec2 {
  const dx = point.x - centroid.x
  const dy = point.y - centroid.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { x: point.x + (dx / len) * distance, y: point.y + (dy / len) * distance }
}

/** Format a length to 1 decimal place, trimming ".0" */
function formatLength(len: number): string {
  const s = len.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

interface SideLengthLabelsProps {
  triangle: Triangle
  color: string
  zLayer?: number
}

function SideLengthLabels({ triangle, color, zLayer = 0.1 }: SideLengthLabelsProps) {
  const { a, b, c } = triangle
  const cent = useMemo(() => triangleCentroid(triangle), [triangle])

  const sides = useMemo(() => [
    { from: a, to: b, len: sideLength(a, b) },
    { from: b, to: c, len: sideLength(b, c) },
    { from: c, to: a, len: sideLength(c, a) },
  ], [a, b, c])

  return (
    <>
      {sides.map(({ from, to, len }, i) => {
        const mid = midpoint(from, to)
        const pos = offsetFromCentroid(mid, cent)
        return (
          <SpriteLabel
            key={i}
            text={formatLength(len)}
            position={pos}
            zLayer={zLayer}
            color={color}
            planeWidth={0.9}
          />
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// SimilarityScene
// ---------------------------------------------------------------------------

interface SimilaritySceneProps {
  state: StageState
  dispatch: Dispatch<StageAction>
  task: SimilarityTask
}

export function SimilarityScene({ state, task }: SimilaritySceneProps) {
  const { sequenceSteps } = state
  const hasSteps = sequenceSteps.length > 0

  return (
    <>
      {/* Pre-image — always visible, with side-length labels */}
      <PreImageTriangle vertices={task.preImage} suppressInlineCoords />
      <SideLengthLabels triangle={task.preImage} color="#b8b0a4" zLayer={0.1} />

      {/* Target triangle — always visible, accent color */}
      <ImageTriangle vertices={task.target} visible={true} suppressInlineCoords />
      <SideLengthLabels triangle={task.target} color="#7cc87c" zLayer={0.11} />

      {/* Sequence preview ghost — shown when student has built any steps */}
      <SequencePreview
        steps={sequenceSteps}
        preImage={task.preImage}
        visible={hasSteps}
      />
    </>
  )
}
