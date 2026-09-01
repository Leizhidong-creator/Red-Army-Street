const toVector = (value) => ({ x: value.x, y: value.y, z: value.z })

export const INITIAL_VIEW_DIRECTION = Object.freeze({ x: 0.05, y: 0.18, z: 1.5 })

const dot = (left, right) => left.x * right.x + left.y * right.y + left.z * right.z

const normalize = (value) => {
  const length = Math.hypot(value.x, value.y, value.z)
  return { x: value.x / length, y: value.y / length, z: value.z / length }
}

const cross = (left, right) => ({
  x: left.y * right.z - left.z * right.y,
  y: left.z * right.x - left.x * right.z,
  z: left.x * right.y - left.y * right.x,
})

export function computePresentation(bounds, { fovDegrees, aspect, padding = 1.02 }) {
  const min = toVector(bounds.min)
  const max = toVector(bounds.max)
  const values = [min.x, min.y, min.z, max.x, max.y, max.z, fovDegrees, aspect, padding]
  const size = {
    x: max.x - min.x,
    y: max.y - min.y,
    z: max.z - min.z,
  }

  if (
    values.some((value) => !Number.isFinite(value)) ||
    size.x <= 0 ||
    size.y <= 0 ||
    size.z <= 0 ||
    fovDegrees <= 0 ||
    fovDegrees >= 179 ||
    aspect <= 0 ||
    padding <= 0
  ) {
    throw new Error('Model bounds and camera values must be finite, non-zero values.')
  }

  const center = {
    x: (min.x + max.x) / 2,
    y: (min.y + max.y) / 2,
    z: (min.z + max.z) / 2,
  }
  const radius = Math.hypot(size.x, size.y, size.z) / 2
  const verticalFov = (fovDegrees * Math.PI) / 180
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect)
  const verticalTangent = Math.tan(verticalFov / 2)
  const horizontalTangent = Math.tan(horizontalFov / 2)
  const direction = normalize(INITIAL_VIEW_DIRECTION)
  const forward = { x: -direction.x, y: -direction.y, z: -direction.z }
  const right = normalize(cross(forward, { x: 0, y: 1, z: 0 }))
  const cameraUp = normalize(cross(right, forward))
  let distance = 0

  for (const x of [-size.x / 2, size.x / 2]) {
    for (const y of [0, size.y]) {
      for (const z of [-size.z / 2, size.z / 2]) {
        const relative = { x, y: y - size.y * 0.38, z }
        const horizontalDistance = (Math.abs(dot(relative, right)) * padding) / horizontalTangent
        const verticalDistance = (Math.abs(dot(relative, cameraUp)) * padding) / verticalTangent
        distance = Math.max(
          distance,
          dot(relative, direction) + Math.max(horizontalDistance, verticalDistance),
        )
      }
    }
  }

  const maxDistance = distance * 3.4

  return {
    offset: { x: -center.x, y: -min.y, z: -center.z },
    target: { x: 0, y: size.y * 0.38, z: 0 },
    size,
    radius,
    distance,
    minDistance: Math.max(radius * 0.7, distance * 0.32),
    maxDistance,
    near: Math.max(distance / 120, 0.001),
    far: Math.max(distance * 18, maxDistance * 2),
  }
}
