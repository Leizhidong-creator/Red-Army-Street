const toVector = (value) => ({ x: value.x, y: value.y, z: value.z })

export function computePresentation(bounds, { fovDegrees, aspect, padding = 1.22 }) {
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
    aspect <= 0
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
  const distance =
    Math.max(radius / Math.sin(verticalFov / 2), radius / Math.sin(horizontalFov / 2)) * padding
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
