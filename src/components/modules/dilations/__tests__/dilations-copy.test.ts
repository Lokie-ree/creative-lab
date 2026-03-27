import { describe, it, expect } from 'vitest'
import {
  PHASE_LABELS,
  PHASE_INTROS,
  ROUND_PROMPTS,
  EARNED_REVEALS,
} from '../dilations-copy'
import type { PhaseId, RoundId } from '../utils/types'

const ALL_PHASES: PhaseId[] = ['scale-factor', 'coordinate', 'similarity', 'aa-capstone']

describe('PHASE_LABELS', () => {
  it('has an entry for every PhaseId', () => {
    ALL_PHASES.forEach(p => {
      expect(PHASE_LABELS[p]).toBeDefined()
      expect(typeof PHASE_LABELS[p]).toBe('string')
    })
  })

  it('shows the phase number in the label', () => {
    expect(PHASE_LABELS['scale-factor']).toContain('1')
    expect(PHASE_LABELS['coordinate']).toContain('2')
    expect(PHASE_LABELS['similarity']).toContain('3')
    expect(PHASE_LABELS['aa-capstone']).toContain('4')
  })
})

describe('PHASE_INTROS', () => {
  it('has an entry for every PhaseId', () => {
    ALL_PHASES.forEach(p => {
      expect(Object.prototype.hasOwnProperty.call(PHASE_INTROS, p)).toBe(true)
    })
  })

  it('scale-factor intro is empty string (no entry pause on first load)', () => {
    expect(PHASE_INTROS['scale-factor']).toBe('')
  })

  it('other phases have non-empty intro copy', () => {
    expect(PHASE_INTROS['coordinate'].length).toBeGreaterThan(0)
    expect(PHASE_INTROS['similarity'].length).toBeGreaterThan(0)
    expect(PHASE_INTROS['aa-capstone'].length).toBeGreaterThan(0)
  })
})

describe('ROUND_PROMPTS', () => {
  it('has entries for all Phase 1 rounds', () => {
    const phase1Rounds: RoundId[] = ['dilate-k2', 'dilate-k2-properties', 'dilate-k3', 'dilate-k-half', 'dilate-summary']
    phase1Rounds.forEach(r => {
      expect(ROUND_PROMPTS[r]).toBeDefined()
      expect(typeof ROUND_PROMPTS[r]).toBe('string')
    })
  })
})

describe('EARNED_REVEALS', () => {
  const phase1Rounds: RoundId[] = [
    'dilate-k2', 'dilate-k2-properties', 'dilate-k3', 'dilate-k-half', 'dilate-summary',
  ]
  it('has an entry for every Phase 1 round', () => {
    for (const id of phase1Rounds) {
      expect(EARNED_REVEALS[id]).toBeDefined()
      expect(typeof EARNED_REVEALS[id]?.text).toBe('string')
    }
  })
  it('notation entries that exist are non-empty strings', () => {
    for (const entry of Object.values(EARNED_REVEALS)) {
      if (entry?.notation) expect(entry.notation.length).toBeGreaterThan(0)
    }
  })
})
