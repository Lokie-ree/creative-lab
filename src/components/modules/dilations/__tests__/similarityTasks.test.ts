import { describe, it, expect } from 'vitest'
import { SIMILARITY_TASKS } from '../utils/similarityTasks'
import { composeTriangle, trianglesMatch } from '../utils/math'
import { PREDICTION_TOLERANCE } from '../utils/constants'
import type { TransformStep } from '../utils/types'

describe('similarityTasks — target reachability', () => {
  it('similarity-guided: Translate(1,1) → Dilate(2) reaches target', () => {
    const task = SIMILARITY_TASKS[0]
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 1, dy: 1 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-rigid-dilation: Reflect(y) → Translate(4,0) → Dilate(2) reaches target', () => {
    const task = SIMILARITY_TASKS[1]
    const steps: TransformStep[] = [
      { type: 'reflect', params: { axis: 'y' } },
      { type: 'translate', params: { dx: 4, dy: 0 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-inverse: Rotate(90°CCW) → Translate(5,2) → Dilate(2) reaches target', () => {
    const task = SIMILARITY_TASKS[2]
    const steps: TransformStep[] = [
      { type: 'rotate', params: { angleDeg: 90 } },
      { type: 'translate', params: { dx: 5, dy: 2 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-inverse: alternative path Dilate(2) → Rotate(90°CCW) → Translate(10,4) also reaches target', () => {
    const task = SIMILARITY_TASKS[2]
    const steps: TransformStep[] = [
      { type: 'dilate', params: { k: 2 } },
      { type: 'rotate', params: { angleDeg: 90 } },
      { type: 'translate', params: { dx: 10, dy: 4 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(true)
  })

  it('similarity-guided: Translate alone (no dilate) does NOT reach target', () => {
    const task = SIMILARITY_TASKS[0]
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 3, dy: 3 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(false)
  })

  it('similarity-rigid-dilation: Translate + Dilate (no reflect) does NOT reach target', () => {
    const task = SIMILARITY_TASKS[1]
    const steps: TransformStep[] = [
      { type: 'translate', params: { dx: 2, dy: 0 } },
      { type: 'dilate', params: { k: 2 } },
    ]
    const result = composeTriangle(steps, task.preImage)
    expect(trianglesMatch(result, task.target, PREDICTION_TOLERANCE)).toBe(false)
  })

  it('all tasks use the canonical pre-image', () => {
    for (const task of SIMILARITY_TASKS) {
      expect(task.preImage).toEqual({ a: { x: 1, y: 1 }, b: { x: 4, y: 2 }, c: { x: 2, y: 4 } })
    }
  })

  it('all targets have integer coordinates within viewport [-2, 14]', () => {
    for (const task of SIMILARITY_TASKS) {
      for (const v of [task.target.a, task.target.b, task.target.c]) {
        expect(Number.isInteger(v.x)).toBe(true)
        expect(Number.isInteger(v.y)).toBe(true)
        expect(v.x).toBeGreaterThanOrEqual(-2)
        expect(v.x).toBeLessThanOrEqual(14)
        expect(v.y).toBeGreaterThanOrEqual(-2)
        expect(v.y).toBeLessThanOrEqual(14)
      }
    }
  })
})
