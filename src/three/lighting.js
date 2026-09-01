export const HERITAGE_LIGHTING = Object.freeze({
  exposure: 1.38,
  ambientIntensity: 2.1,
  hemisphereIntensity: 2,
  keyIntensity: 2.8,
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

  material.needsUpdate = true
  return material
}
