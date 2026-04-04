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
//   - AngleMarks on both triangles (communicates similarity: same angles, different sizes)

import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { PreImageTriangle } from '../components/PreImageTriangle'
import { ImageTriangle } from '../components/ImageTriangle'
import { SequencePreview } from '../components/SequencePreview'
import { AngleMarks } from '../components/AngleMarks'
import type { SimilarityTask } from '../utils/similarityTasks'

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
      {/* Pre-image — always visible */}
      <PreImageTriangle vertices={task.preImage} suppressInlineCoords />

      {/* Target triangle — always visible, accent color */}
      <ImageTriangle vertices={task.target} visible={true} suppressInlineCoords />

      {/* Angle marks — static (not animating), show immediately */}
      <AngleMarks
        triangles={[task.preImage]}
        visible={true}
        animating={false}
        color="#b8b0a4"
      />
      <AngleMarks
        triangles={[task.target]}
        visible={true}
        animating={false}
        color="#7cc87c"
      />

      {/* Sequence preview ghost — shown when student has built any steps */}
      <SequencePreview
        steps={sequenceSteps}
        preImage={task.preImage}
        visible={hasSteps}
      />
    </>
  )
}
