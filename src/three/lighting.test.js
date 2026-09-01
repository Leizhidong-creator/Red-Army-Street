import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { HERITAGE_LIGHTING, prepareHeritageMaterial } from './lighting'

describe('heritage model lighting', () => {
  it('keeps shadowed facades bright enough for inspection', () => {
    expect(HERITAGE_LIGHTING.exposure).toBeGreaterThanOrEqual(1.2)
    expect(HERITAGE_LIGHTING.ambientIntensity).toBeGreaterThanOrEqual(1)
    expect(HERITAGE_LIGHTING.fillIntensity).toBeGreaterThanOrEqual(1.5)
  })

  it('preserves texture detail in deep shadow without flattening the material', () => {
    const texture = new THREE.Texture()
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 1 })

    prepareHeritageMaterial(material)

    expect(material.emissiveMap).toBe(texture)
    expect(material.emissiveIntensity).toBeGreaterThanOrEqual(0.2)
    expect(material.roughness).toBeLessThanOrEqual(0.82)
  })
})
