import * as fs from 'fs'
import * as path from 'path'
import * as zlib from 'zlib'

/**
 * Save an artifact to the run directory
 */
export function saveArtifact(
  runDir: string,
  filename: string,
  content: string | Buffer
): string {
  const artifactsDir = path.join(runDir, 'artifacts')
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true })
  }
  
  const artifactPath = path.join(artifactsDir, filename)
  fs.writeFileSync(artifactPath, content)
  
  return artifactPath
}

/**
 * Save and compress an artifact
 */
export function saveCompressedArtifact(
  runDir: string,
  filename: string,
  content: string | Buffer
): string {
  const artifactsDir = path.join(runDir, 'artifacts')
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true })
  }
  
  const compressed = zlib.gzipSync(content)
  const artifactPath = path.join(artifactsDir, `${filename}.gz`)
  fs.writeFileSync(artifactPath, compressed)
  
  return artifactPath
}

/**
 * Save logs to the run directory
 */
export function saveLogs(
  runDir: string,
  logType: string,
  logs: string[]
): string {
  const logsDir = path.join(runDir, 'logs')
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }
  
  const logPath = path.join(logsDir, `${logType}.log`)
  const logContent = logs.join('\n')
  fs.writeFileSync(logPath, logContent)
  
  return logPath
}

/**
 * Append to an existing log file
 */
export function appendLog(
  runDir: string,
  logType: string,
  message: string
): void {
  const logsDir = path.join(runDir, 'logs')
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }
  
  const logPath = path.join(logsDir, `${logType}.log`)
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${message}\n`
  
  fs.appendFileSync(logPath, logEntry)
}

/**
 * Create a manifest file for the run
 */
export function createManifest(
  runDir: string,
  manifest: {
    runId: string
    startTime: string
    endTime?: string
    status: 'running' | 'completed' | 'failed'
    artifacts: string[]
    logs: string[]
    screenshots: string[]
    traces: string[]
  }
): string {
  const manifestPath = path.join(runDir, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  
  return manifestPath
}

/**
 * List all runs
 */
export function listRuns(): Array<{
  directory: string
  timestamp: string
  manifest?: any
}> {
  const runsDir = path.join(process.cwd(), 'runs')
  
  if (!fs.existsSync(runsDir)) {
    return []
  }
  
  const runDirs = fs.readdirSync(runsDir)
    .filter(name => fs.statSync(path.join(runsDir, name)).isDirectory())
    .map(name => {
      const runDir = path.join(runsDir, name)
      const manifestPath = path.join(runDir, 'manifest.json')
      
      let manifest
      if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      }
      
      return {
        directory: runDir,
        timestamp: name,
        manifest,
      }
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  
  return runDirs
}

/**
 * Clean up old runs (keep last N runs)
 */
export function cleanupOldRuns(keepLast: number = 10): void {
  const runs = listRuns()
  
  if (runs.length <= keepLast) {
    return
  }
  
  const runsToDelete = runs.slice(keepLast)
  
  runsToDelete.forEach(run => {
    fs.rmSync(run.directory, { recursive: true, force: true })
  })
  
  console.log(`Cleaned up ${runsToDelete.length} old run(s)`)
}
