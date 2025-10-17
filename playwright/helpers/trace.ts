import { BrowserContext } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Generate a timestamped run directory path
 */
export function getRunDirectory(): string {
  const now = new Date()
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '_')
  
  return path.join(process.cwd(), 'runs', timestamp)
}

/**
 * Ensure run directory exists
 */
export function ensureRunDirectory(runDir: string): void {
  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true })
  }
  
  // Create subdirectories
  const subdirs = ['logs', 'traces', 'screenshots', 'artifacts']
  subdirs.forEach(subdir => {
    const subdirPath = path.join(runDir, subdir)
    if (!fs.existsSync(subdirPath)) {
      fs.mkdirSync(subdirPath, { recursive: true })
    }
  })
}

/**
 * Start capturing a trace for the current context
 */
export async function startTrace(context: BrowserContext): Promise<void> {
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  })
}

/**
 * Stop trace and save to run directory
 */
export async function stopTrace(
  context: BrowserContext,
  runDir: string,
  name: string = 'trace'
): Promise<string> {
  const tracePath = path.join(runDir, 'traces', `${name}.zip`)
  await context.tracing.stop({ path: tracePath })
  return tracePath
}

/**
 * Capture a trace for a specific operation
 */
export async function captureTrace<T>(
  context: BrowserContext,
  runDir: string,
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  await startTrace(context)
  
  try {
    const result = await operation()
    await stopTrace(context, runDir, name)
    return result
  } catch (error) {
    // Still save trace on error
    await stopTrace(context, runDir, `${name}_error`)
    throw error
  }
}

/**
 * Save metadata about the run
 */
export function saveRunMetadata(
  runDir: string,
  metadata: Record<string, any>
): void {
  const metadataPath = path.join(runDir, 'metadata.json')
  const data = {
    ...metadata,
    timestamp: new Date().toISOString(),
    directory: runDir,
  }
  
  fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2))
}
