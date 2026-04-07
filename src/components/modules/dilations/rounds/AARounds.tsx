// src/components/modules/dilations/rounds/AARounds.tsx
//
// Phase 4 scene: renders two triangles side by side with AngleLabels.
// Used by aa-discover, aa-confirm, and capstone-final.
// No ghost drag. Angle labels start dim; revealed state supplied by parent.

import { useMemo } from 'react'
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { PreImageTriangle } from '../components/PreImageTriangle'
import { ImageTriangle } from '../components/ImageTriangle'
import { AngleLabels, computeMatchColors } from '../components/AngleLabels'
import { triangleAngles } from '../utils/math'
import type { Triangle } from '../utils/types'
import type { AADiscoverSubPair, CapstonePair } from '../utils/aaTasks'
import { SequencePreview } from '../components/SequencePreview'

interface AASceneProps {
  preImage: Triangle
  target: Triangle
  revealed: boolean
  showMatchCount: number
}

export function AAScene({ preImage, target, revealed, showMatchCount }: AASceneProps) {
  const [preColors, tgtColors] = useMemo(() => {
    if (!revealed) return [null, null] as const
    const preAngles = triangleAngles(preImage) as [number, number, number]
    const tgtAngles = triangleAngles(target) as [number, number, number]
    return computeMatchColors(preAngles, tgtAngles, showMatchCount)
  }, [revealed, preImage, target, showMatchCount])

  return (
    <>
      <PreImageTriangle vertices={preImage} suppressInlineCoords />
      <ImageTriangle vertices={target} visible={true} suppressInlineCoords />

      <AngleLabels
        triangle={preImage}
        visible={true}
        revealed={revealed}
        matchColors={preColors}
      />
      <AngleLabels
        triangle={target}
        visible={true}
        revealed={revealed}
        matchColors={tgtColors}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// AADiscoverScene — aa-discover: manages sub-pair via state.subPairIndex
// ---------------------------------------------------------------------------

interface AADiscoverSceneProps {
  state: StageState
  dispatch: Dispatch<StageAction>
  subPairs: AADiscoverSubPair[]
}

export function AADiscoverScene({ state, subPairs }: AADiscoverSceneProps) {
  const pair = subPairs[state.subPairIndex]
  if (!pair) return null
  return (
    <AAScene
      preImage={pair.preImage}
      target={pair.target}
      revealed={state.anglesRevealed}
      showMatchCount={pair.showMatchCount}
    />
  )
}

// ---------------------------------------------------------------------------
// AAConfirmScene — aa-confirm: single non-similar pair
// ---------------------------------------------------------------------------

interface AAConfirmSceneProps {
  state: StageState
  preImage: Triangle
  target: Triangle
}

export function AAConfirmScene({ state, preImage, target }: AAConfirmSceneProps) {
  return (
    <AAScene
      preImage={preImage}
      target={target}
      revealed={state.anglesRevealed}
      showMatchCount={3}
    />
  )
}

// ---------------------------------------------------------------------------
// AACapstonePairScene — capstone-final: navigates via state.capstonePairIndex
// ---------------------------------------------------------------------------

interface AACapstonePairSceneProps {
  state: StageState
  pairs: CapstonePair[]
}

export function AACapstonePairScene({ state, pairs }: AACapstonePairSceneProps) {
  const pair = pairs[state.capstonePairIndex]
  if (!pair) return null
  const hasSteps = state.sequenceSteps.length > 0
  return (
    <>
      <AAScene
        preImage={pair.preImage}
        target={pair.target}
        revealed={state.anglesRevealed}
        showMatchCount={3}
      />
      <SequencePreview
        steps={state.sequenceSteps}
        preImage={pair.preImage}
        visible={hasSteps}
      />
    </>
  )
}
