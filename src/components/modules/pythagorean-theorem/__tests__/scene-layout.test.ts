import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePythagoreanLayout, Z } from '../scene/scene-layout'
import type { PhaseId } from '../types'

describe('usePythagoreanLayout — worldSize', () => {
  it('visual-proof uses worldSize 28', () => {
    const { result } = renderHook(() => usePythagoreanLayout('visual-proof'))
    expect(result.current.worldSize).toBe(28)
  })

  it('converse uses worldSize 28', () => {
    const { result } = renderHook(() => usePythagoreanLayout('converse'))
    expect(result.current.worldSize).toBe(28)
  })

  it('unknown-sides uses worldSize 28', () => {
    const { result } = renderHook(() => usePythagoreanLayout('unknown-sides'))
    expect(result.current.worldSize).toBe(28)
  })

  it('coord-distance uses worldSize 16', () => {
    const { result } = renderHook(() => usePythagoreanLayout('coord-distance'))
    expect(result.current.worldSize).toBe(16)
  })
})

describe('usePythagoreanLayout — center', () => {
  const geometryPhases: PhaseId[] = ['visual-proof', 'converse', 'unknown-sides']

  it.each(geometryPhases)('%s center is (3, 5)', (phase) => {
    const { result } = renderHook(() => usePythagoreanLayout(phase))
    expect(result.current.center).toEqual({ x: 3, y: 5 })
  })

  it('coord-distance center is (6, 6)', () => {
    const { result } = renderHook(() => usePythagoreanLayout('coord-distance'))
    expect(result.current.center).toEqual({ x: 6, y: 6 })
  })
})

describe('usePythagoreanLayout — coord-distance worldSize is smaller than geometry phases', () => {
  it('coord worldSize < geometry worldSize', () => {
    const { result: coordResult } = renderHook(() => usePythagoreanLayout('coord-distance'))
    const { result: geomResult  } = renderHook(() => usePythagoreanLayout('visual-proof'))
    expect(coordResult.current.worldSize).toBeLessThan(geomResult.current.worldSize)
  })
})

describe('Z layer constants', () => {
  it('grid is lowest z layer', () => {
    expect(Z.GRID).toBe(0.00)
  })

  it('layers are strictly increasing', () => {
    const layers = [
      Z.GRID,
      Z.TRIANGLE_FILL,
      Z.TRIANGLE_OUTLINE,
      Z.SQUARE_FILL,
      Z.SQUARE_OUTLINE,
      Z.AREA_LABEL,
      Z.COORD_DOT,
      Z.DISTANCE_LABEL,
    ]
    for (let i = 1; i < layers.length; i++) {
      expect(layers[i]).toBeGreaterThan(layers[i - 1])
    }
  })

  it('distance label is topmost layer', () => {
    const allZ = Object.values(Z)
    expect(Z.DISTANCE_LABEL).toBe(Math.max(...allZ))
  })
})
