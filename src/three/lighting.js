export const HERITAGE_LIGHTING = Object.freeze({
  exposure: 1.38,
  ambientIntensity: 2.1,
  hemisphereIntensity: 1.4,
  keyIntensity: 1.65,
  fillIntensity: 2.35,
})

export function prepareHeritageMaterial(material) {
  if (!material?.isMeshStandardMaterial && !material?.isMeshPhysicalMaterial) return material

  material.roughness = Math.min(material.roughness, 0.82)

  if (material.map) {
    material.emissive.set(0xffffff)
    material.emissiveMap = material.map
    material.emissiveIntensity = 0.28
  } else {
    material.emissive.copy(material.color)
    material.emissiveIntensity = 0.14
  }

  const previousOnBeforeCompile = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    previousOnBeforeCompile?.call(material, shader, renderer)
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 heritageModelNormal;`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
        heritageModelNormal = normalize(objectNormal);`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 heritageModelNormal;`,
      )
      .replace(
        '#include <output_fragment>',
        `float heritageRoofMask = smoothstep(0.08, 0.55, heritageModelNormal.y);
        outgoingLight *= mix(vec3(1.0), vec3(0.28, 0.27, 0.24), heritageRoofMask);
        #include <output_fragment>`,
      )
  }
  material.customProgramCacheKey = () => 'heritage-roof-attenuation-v1'

  material.needsUpdate = true
  return material
}

export function prepareHeritageMesh(mesh) {
  if (!mesh?.isMesh || !mesh.geometry || !mesh.material || Array.isArray(mesh.material)) {
    return mesh
  }

  const geometry = mesh.geometry.clone()
  if (!geometry.attributes?.normal && geometry.computeVertexNormals) {
    geometry.computeVertexNormals()
  }
  const position = geometry.attributes?.position
  const normal = geometry.attributes?.normal
  if (!position || !normal) return mesh

  let minY = Infinity
  let maxY = -Infinity
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const y = position.getY(vertex)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  const height = maxY - minY
  if (!Number.isFinite(height) || height <= 0) return mesh

  const index = geometry.index
  const vertexAt = (offset) => (index ? index.getX(offset) : offset)
  const ranges = []
  let rangeType = null
  let rangeStart = 0
  let rangeCount = 0

  const pushRange = () => {
    if (rangeType !== null && rangeCount > 0) {
      ranges.push({ start: rangeStart, count: rangeCount, materialIndex: rangeType ? 1 : 0 })
    }
  }

  const triangleCount = index ? index.count / 3 : position.count / 3
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const offset = triangle * 3
    const vertices = [vertexAt(offset), vertexAt(offset + 1), vertexAt(offset + 2)]
    const centerY = vertices.reduce((sum, vertex) => sum + position.getY(vertex), 0) / 3
    const normalY =
      vertices.reduce((sum, vertex) => sum + normal.getY(vertex), 0) / 3
    const isRoof = centerY > minY + height * 0.56 && normalY > 0.08
    if (isRoof !== rangeType) {
      pushRange()
      rangeType = isRoof
      rangeStart = offset
      rangeCount = 0
    }
    rangeCount += 3
  }
  pushRange()

  if (!ranges.some((range) => range.materialIndex === 1)) return mesh

  geometry.clearGroups()
  for (const range of ranges) {
    geometry.addGroup(range.start, range.count, range.materialIndex)
  }

  const roofMaterial = mesh.material.clone()
  roofMaterial.color.setRGB(0.72, 0.68, 0.6)
  roofMaterial.emissiveIntensity = Math.min(roofMaterial.emissiveIntensity ?? 0, 0.05)
  roofMaterial.needsUpdate = true

  mesh.geometry = geometry
  mesh.material = [mesh.material, roofMaterial]
  return mesh
}
