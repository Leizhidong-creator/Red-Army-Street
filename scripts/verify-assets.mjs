import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const expectedAssets = [
  'assets/map.jpg',
  'assets/modal-bg.png',
  'assets/models/red-army-gate.glb',
  'assets/models/tongshan-society.glb',
  'assets/models/post-office.glb',
  'assets/models/guandi-temple.glb',
  'assets/models/zhang-courtyard.glb',
]

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

export function verifyAssetTree(projectRoot, treeName) {
  const treeRoot = resolve(projectRoot, treeName)
  if (!existsSync(treeRoot)) {
    throw new Error(`Missing ${treeName} directory. Run the production build first.`)
  }

  const failures = []
  for (const relativePath of expectedAssets) {
    const path = resolve(treeRoot, relativePath)
    if (!existsSync(path)) {
      failures.push(`missing ${treeName}/${relativePath}`)
      continue
    }
    if (statSync(path).size < 100_000) {
      failures.push(`unexpectedly small ${treeName}/${relativePath}`)
    }
  }

  const files = walk(treeRoot)
  const glbFiles = files.filter((path) => path.toLowerCase().endsWith('.glb'))
  if (glbFiles.length !== 5) {
    failures.push(`expected 5 GLB files in ${treeName}, found ${glbFiles.length}`)
  }

  const leakedSources = files.filter((path) => /\.docx$/i.test(path) || /图片/.test(path))
  if (leakedSources.length > 0) {
    failures.push(`source material leaked into ${treeName}: ${leakedSources.join(', ')}`)
  }

  if (treeName === 'dist') {
    const indexPath = resolve(treeRoot, 'index.html')
    if (!existsSync(indexPath)) {
      failures.push('missing dist/index.html')
    } else if (!readFileSync(indexPath, 'utf8').includes('/Red-Army-Street/')) {
      failures.push('dist/index.html is not configured for the GitHub Pages repository base path')
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join('\n'))
  }

  return { treeName, assetCount: expectedAssets.length, glbCount: glbFiles.length }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const publicResult = verifyAssetTree(process.cwd(), 'public')
  const distResult = verifyAssetTree(process.cwd(), 'dist')
  console.log(
    `Asset verification passed: ${publicResult.assetCount} curated files, ${distResult.glbCount} GLB models, no source-photo or DOCX leakage.`,
  )
}
