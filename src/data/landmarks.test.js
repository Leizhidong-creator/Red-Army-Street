import { describe, expect, it } from 'vitest'
import { landmarks } from './landmarks'

describe('landmarks', () => {
  it('contains exactly the five modeled heritage sites', () => {
    expect(landmarks.map((landmark) => landmark.name)).toEqual([
      '红军门',
      '同善社',
      '邮政代办所',
      '关帝庙',
      '张家大院',
    ])
    expect(new Set(landmarks.map((landmark) => landmark.id)).size).toBe(5)
  })

  it('keeps every hotspot within the source map', () => {
    for (const landmark of landmarks) {
      expect(landmark.position.x).toBeGreaterThanOrEqual(0)
      expect(landmark.position.x).toBeLessThanOrEqual(100)
      expect(landmark.position.y).toBeGreaterThanOrEqual(0)
      expect(landmark.position.y).toBeLessThanOrEqual(100)
    }
  })

  it('provides a local GLB and complete interpretive copy for every site', () => {
    for (const landmark of landmarks) {
      expect(landmark.model).toMatch(/^assets\/models\/[a-z-]+\.glb$/)
      expect(landmark.eyebrow.length).toBeGreaterThan(3)
      expect(landmark.lead.length).toBeGreaterThan(12)
      expect(landmark.story.length).toBeGreaterThan(35)
    }
  })
})
