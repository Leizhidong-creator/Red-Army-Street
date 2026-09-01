import { describe, expect, it } from 'vitest'
import { computePresentation } from './modelFit'

const bounds = {
  min: { x: -2, y: -1, z: -3 },
  max: { x: 4, y: 5, z: 1 },
}

describe('computePresentation', () => {
  it('centers the model on X/Z and grounds its minimum Y', () => {
    const result = computePresentation(bounds, { fovDegrees: 38, aspect: 16 / 9 })

    expect(result.offset).toEqual({ x: -1, y: 1, z: 1 })
    expect(result.target).toEqual({ x: 0, y: 2.2800000000000002, z: 0 })
  })

  it('produces finite camera limits with the full model inside the default frame', () => {
    const result = computePresentation(bounds, { fovDegrees: 38, aspect: 16 / 9 })

    expect(Number.isFinite(result.distance)).toBe(true)
    expect(result.distance).toBeGreaterThan(result.radius)
    expect(result.minDistance).toBeLessThan(result.distance)
    expect(result.maxDistance).toBeGreaterThan(result.distance)
    expect(result.near).toBeGreaterThan(0)
    expect(result.far).toBeGreaterThan(result.maxDistance)
  })

  it('moves farther back for a narrow portrait viewport', () => {
    const landscape = computePresentation(bounds, { fovDegrees: 38, aspect: 16 / 9 })
    const portrait = computePresentation(bounds, { fovDegrees: 38, aspect: 9 / 16 })

    expect(portrait.distance).toBeGreaterThan(landscape.distance)
  })

  it('rejects empty or non-finite geometry bounds', () => {
    expect(() =>
      computePresentation(
        { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } },
        { fovDegrees: 38, aspect: 1 },
      ),
    ).toThrow(/finite, non-zero/)
  })
})
