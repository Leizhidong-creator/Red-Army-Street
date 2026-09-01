import { describe, expect, it } from 'vitest'
import { verifyAssetTree } from './verify-assets.mjs'

describe('deployment asset verification', () => {
  it('accepts the curated public runtime assets', () => {
    expect(() => verifyAssetTree(process.cwd(), 'public')).not.toThrow()
  })
})
