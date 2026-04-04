import { promises as fs } from 'node:fs'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const HTML_EXT = '.html'

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  }
  catch {
    return false
  }
}

async function listHtmlFiles(dirPath, collected = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      await listHtmlFiles(fullPath, collected)
      continue
    }

    if (entry.isFile() && entry.name.endsWith(HTML_EXT))
      collected.push(fullPath)
  }

  return collected
}

async function ensureCleanUrlIndexes() {
  if (!await pathExists(DIST_DIR)) {
    console.warn('[clean-url] dist directory not found, skip generating index fallbacks.')
    return
  }

  const htmlFiles = await listHtmlFiles(DIST_DIR)
  let createdCount = 0

  for (const filePath of htmlFiles) {
    const relativePath = path.relative(DIST_DIR, filePath)
    const normalizedRelativePath = relativePath.replace(/\\/g, '/')

    if (normalizedRelativePath === 'index.html' || normalizedRelativePath.endsWith('/index.html'))
      continue

    const cleanRelativePath = normalizedRelativePath.slice(0, -HTML_EXT.length)
    const fallbackIndexPath = path.join(DIST_DIR, cleanRelativePath, 'index.html')

    if (await pathExists(fallbackIndexPath))
      continue

    await fs.mkdir(path.dirname(fallbackIndexPath), { recursive: true })
    await fs.copyFile(filePath, fallbackIndexPath)
    createdCount += 1
  }

  console.log(`[clean-url] created ${createdCount} clean-url index fallback file(s).`)
}

ensureCleanUrlIndexes().catch((error) => {
  console.error('[clean-url] failed to generate clean-url index fallbacks.')
  console.error(error)
  process.exitCode = 1
})
