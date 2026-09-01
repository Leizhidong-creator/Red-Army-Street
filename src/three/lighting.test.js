import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { HERITAGE_LIGHTING, prepareHeritageMaterial, prepareHeritageMesh } from './lighting'

describe('heritage model lighting', () => {
  it('keeps shadowed facades bright enough for inspection', () => {
    expect(HERITAGE_LIGHTING.exposure).toBeGreaterThanOrEqual(1.2)
    expect(HERITAGE_LIGHTING.ambientIntensity).toBeGreaterThanOrEqual(1)
    expect(HERITAGE_LIGHTING.fillIntensity).toBeGreaterThanOrEqual(1.5)
  })

  it('keeps overhead light below the facade fill to preserve pale roof detail', () => {
    expect(HERITAGE_LIGHTING.keyIntensity).toBeLessThan(HERITAGE_LIGHTING.fillIntensity)
    expect(HERITAGE_LIGHTING.hemisphereIntensity).toBeLessThan(
      HERITAGE_LIGHTING.ambientIntensity,
    )
  })

  it('preserves texture detail in deep shadow without flattening the material', () => {
    const texture = new THREE.Texture()
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 1 })

    prepareHeritageMaterial(material)

    expect(material.emissiveMap).toBe(texture)
    expect(material.emissiveIntensity).toBeGreaterThanOrEqual(0.2)
    expect(material.roughness).toBeLessThanOrEqual(0.82)
  })

  it('attenuates only upward-facing surfaces that represent pale roofs', () => {
    const material = new THREE.MeshStandardMaterial()
    const shader = {
      vertexShader: '#include <beginnormal_vertex>',
      fragmentShader: '#include <output_fragment>',
    }

    prepareHeritageMaterial(material)
    material.onBeforeCompile(shader)

    expect(shader.vertexShader).toContain('heritageModelNormal')
    expect(shader.fragmentShader).toContain('heritageRoofMask')
    expect(shader.fragmentShader).toContain('0.28')
  })

  it('assigns a muted material only to upper upward-facing mesh faces', () => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([-1, 2, 0, 0, 2, 1, 1, 2, 0, -1, 0, 0, 1, 0, 0, 0, 0, 1], 3),
    )
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial())

    prepareHeritageMesh(mesh)

    expect(mesh.material).toHaveLength(2)
    expect(mesh.geometry.groups).toHaveLength(2)
    expect(mesh.material[1].color.r).toBeLessThan(mesh.material[0].color.r)
  })
})
