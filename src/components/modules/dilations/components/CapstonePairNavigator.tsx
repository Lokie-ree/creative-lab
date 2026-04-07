// src/components/modules/dilations/components/CapstonePairNavigator.tsx
//
// HTML capstone controls (outside Canvas):
//   - Pair progress indicator (PAIR N / 3 + LED dots)
//   - SequenceBuilder (reused from Phase 3)
//   - NOT SIMILAR button (unlocks after anglesRevealed + no angle matches)
//   - NEXT PAIR / FINISH button

import { useState, useEffect, useMemo } from 'react'
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { SequenceBuilder } from './SequenceBuilder'
import type { TransformStep } from '../utils/types'
import { triangleAngles, composeTriangle, trianglesMatch } from '../utils/math'
import { computeMatchColors } from './AngleLabels'
import type { CapstonePair } from '../utils/aaTasks'
import { PREDICTION_TOLERANCE } from '../utils/constants'

interface CapstonePairNavigatorProps {
  state: StageState
  dispatch: Dispatch<StageAction>
  pairs: CapstonePair[]
  onRevealAngles: () => void
  onAllComplete: () => void
}

export function CapstonePairNavigator({
  state,
  dispatch,
  pairs,
  onRevealAngles,
  onAllComplete,
}: CapstonePairNavigatorProps) {
  const { capstonePairIndex, capstonePairResults, anglesRevealed, sequenceSteps } = state
  const currentPair = pairs[capstonePairIndex]
  const [similarityFeedback, setSimilarityFeedback] = useState<'idle' | 'match' | 'miss'>('idle')

  useEffect(() => {
    setSimilarityFeedback('idle')
  }, [capstonePairIndex])

  // Compute whether angles match (NOT SIMILAR button unlocks only when all ghost)
  const hasAngleMatches = useMemo(() => {
    if (!currentPair || !anglesRevealed) return true
    const preA = triangleAngles(currentPair.preImage) as [number, number, number]
    const tgtA = triangleAngles(currentPair.target) as [number, number, number]
    const [preColors] = computeMatchColors(preA, tgtA, 3)
    return preColors.some(c => c !== '#7a746a')
  }, [currentPair, anglesRevealed])

  const notSimilarDisabled = !anglesRevealed || hasAngleMatches

  const currentResult = capstonePairResults[capstonePairIndex]
  const pairDone = currentResult !== 'pending'
  const allDone = capstonePairIndex >= pairs.length

  function handleAddStep(step: TransformStep) {
    dispatch({ type: 'ADD_SEQUENCE_STEP', step })
  }
  function handleUpdateStep(index: number, step: TransformStep) {
    dispatch({ type: 'UPDATE_SEQUENCE_STEP', index, step })
    setSimilarityFeedback('idle')
  }
  function handleRemoveStep(index: number) {
    dispatch({ type: 'REMOVE_SEQUENCE_STEP', index })
    setSimilarityFeedback('idle')
  }
  function handleResetSequence() {
    dispatch({ type: 'RESET_SEQUENCE' })
    setSimilarityFeedback('idle')
  }

  function handleCheck() {
    if (!currentPair) return
    const composed = composeTriangle(sequenceSteps, currentPair.preImage)
    if (trianglesMatch(composed, currentPair.target, PREDICTION_TOLERANCE)) {
      setSimilarityFeedback('match')
      dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'similar' })
    } else {
      setSimilarityFeedback('miss')
    }
  }

  function handleNext() {
    if (capstonePairIndex + 1 >= pairs.length) {
      onAllComplete()
    }
    dispatch({ type: 'RESET_SEQUENCE' })
    setSimilarityFeedback('idle')
  }

  if (!currentPair || allDone) return null

  return (
    <div className="flex flex-col bg-(--lab-bg)">
      {/* Pair progress header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-(--lab-border)">
        <span className="lab-silk lab-display-font text-[8px] tracking-[0.15em] text-(--lab-text-muted)">
          PAIR {capstonePairIndex + 1} / {pairs.length}
        </span>
        <div className="flex items-center gap-1.5">
          {pairs.map((_, i) => {
            const res = capstonePairResults[i]
            return (
              <span
                key={i}
                className={[
                  'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                  res === 'similar' || res === 'not-similar'
                    ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
                    : i === capstonePairIndex
                      ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
                      : 'bg-transparent border-(--lab-ghost)/40',
                ].join(' ')}
              />
            )
          })}
        </div>

        {!anglesRevealed && (
          <button
            type="button"
            onClick={onRevealAngles}
            className="ml-auto min-h-[36px] px-2.5 border border-(--lab-earned) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-earned) hover:opacity-80 focus:outline-none transition-opacity duration-150"
          >
            REVEAL MATCHES
          </button>
        )}
      </div>

      {/* Sequence builder */}
      {!pairDone && (
        <SequenceBuilder
          key={capstonePairIndex}
          steps={sequenceSteps}
          maxSteps={currentPair.maxSteps}
          kLocked={true}
          lockedK={2}
          feedbackState={similarityFeedback}
          onAddStep={handleAddStep}
          onUpdateStep={handleUpdateStep}
          onRemoveStep={handleRemoveStep}
          onCheckSequence={handleCheck}
          onNext={handleNext}
          onReset={handleResetSequence}
        />
      )}

      {/* NOT SIMILAR button */}
      {!pairDone && similarityFeedback !== 'match' && (
        <div className="flex items-center px-2.5 py-1.5 border-t border-(--lab-border)">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'not-similar' })
            }}
            disabled={notSimilarDisabled}
            className="min-h-[44px] px-3 border border-(--lab-ghost) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-text-muted) hover:border-(--lab-text) hover:text-(--lab-text) disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none transition-colors duration-150"
          >
            NOT SIMILAR
          </button>
          {!anglesRevealed && (
            <span className="ml-2 lab-display-font text-[10px] text-(--lab-text-muted)">
              Reveal angles first
            </span>
          )}
        </div>
      )}

      {/* Pair result + NEXT PAIR after completion */}
      {pairDone && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-(--lab-border)">
          <span className="lab-silk lab-display-font text-[9px] text-(--lab-accent)">
            {currentResult === 'similar' ? 'Sequence verified ✓' : 'Not similar ✓'}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-3 bg-(--lab-accent) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-bg) hover:opacity-80 focus:outline-none transition-opacity duration-150"
          >
            {capstonePairIndex + 1 >= pairs.length ? 'FINISH' : 'NEXT PAIR'}
          </button>
        </div>
      )}
    </div>
  )
}
