// src/components/modules/pythagorean-theorem/scene/RevealAnimation.tsx
//
// Triggers a timed GSAP delay then dispatches COMPLETE_ROUND.
// The scene already handles the visual state transition (ghosted → visible)
// via squareStates derived from roundState. This component owns the timing.
//
// Phase 1 (visual-proof): 1.5s — hyp square fills in, area label appears
// Phase 2 (converse):     1.0s — equation flash
// Phase 3 (unknown-sides): 1.2s — unknown square + label reveal
// Phase 4 (coord-distance): 1.0s — distance label
//
// Future: thread AreaSquare mesh refs here for particle-style unit animation.

import { useEffect } from 'react'
import gsap from 'gsap'
import type { Dispatch } from 'react'
import type { PhaseId, RoundState, PythagoreanAction } from '../types'

const REVEAL_DURATIONS: Record<PhaseId, number> = {
  'visual-proof':   1.5,
  'converse':       1.0,
  'unknown-sides':  1.2,
  'coord-distance': 1.0,
}

interface RevealAnimationProps {
  phase: PhaseId
  roundState: RoundState
  dispatch: Dispatch<PythagoreanAction>
}

export function RevealAnimation({ phase, roundState, dispatch }: RevealAnimationProps) {
  useEffect(() => {
    if (roundState !== 'reveal') return
    const duration = REVEAL_DURATIONS[phase]
    // gsap.delayedCall is the idiomatic GSAP timed callback — reliably fires onComplete
    const timer = gsap.delayedCall(duration, () => dispatch({ type: 'COMPLETE_ROUND' }))
    return () => { timer.kill() }
  }, [roundState, phase, dispatch])

  return null
}
