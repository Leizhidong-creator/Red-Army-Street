import { describe, expect, it } from 'vitest'
import { verifyAssetTree } from './verify-assets.mjs'

describe('deployment asset verification', () => {
  it('accepts the curated public runtime assets', () => {
    expect(() => verifyAssetTree(process.cwd(), 'public')).not.toThrow()
  })

  it('accepts the production build without source documents or reference photos', () => {
    expect(() => verifyAssetTree(process.cwd(), 'dist')).not.toThrow()
  })
})
