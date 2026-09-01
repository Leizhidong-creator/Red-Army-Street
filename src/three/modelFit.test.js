import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { computePresentation, INITIAL_VIEW_DIRECTION } from './modelFit'

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

  it('starts near the facade view so wide architecture reads at presentation scale', () => {
    expect(INITIAL_VIEW_DIRECTION.z / Math.abs(INITIAL_VIEW_DIRECTION.x)).toBeGreaterThanOrEqual(3)
  })

  it('fills the frame with wide buildings without crossing the viewport edge', () => {
    const wideBounds = {
      min: { x: -6, y: 0, z: -1.2 },
      max: { x: 6, y: 3.8, z: 1.2 },
    }
    const fovDegrees = 38
    const aspect = 1.2
    const result = computePresentation(wideBounds, { fovDegrees, aspect })
    const direction = new THREE.Vector3(
      INITIAL_VIEW_DIRECTION.x,
      INITIAL_VIEW_DIRECTION.y,
      INITIAL_VIEW_DIRECTION.z,
    ).normalize()
    const forward = direction.clone().negate()
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
    const up = new THREE.Vector3().crossVectors(right, forward).normalize()
    const verticalTangent = Math.tan((fovDegrees * Math.PI) / 360)
    const horizontalTangent = verticalTangent * aspect
    let maximumFrameUse = 0
    let maximumHorizontalUse = 0

    for (const x of [-result.size.x / 2, result.size.x / 2]) {
      for (const y of [0, result.size.y]) {
        for (const z of [-result.size.z / 2, result.size.z / 2]) {
          const relative = new THREE.Vector3(x, y - result.target.y, z)
          const depth = result.distance - relative.dot(direction)
          const horizontalUse = Math.abs(relative.dot(right)) / (depth * horizontalTangent)
          maximumHorizontalUse = Math.max(maximumHorizontalUse, horizontalUse)
          maximumFrameUse = Math.max(
            maximumFrameUse,
            horizontalUse,
            Math.abs(relative.dot(up)) / (depth * verticalTangent),
          )
        }
      }
    }

    expect(maximumHorizontalUse).toBeGreaterThanOrEqual(0.84)
    expect(maximumFrameUse).toBeGreaterThanOrEqual(0.96)
    expect(maximumFrameUse).toBeLessThanOrEqual(0.985)
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
