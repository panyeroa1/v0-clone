import { Page, Locator } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'

export interface SnapshotOptions {
  fullPage?: boolean
  quality?: number
  element?: Locator
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Take a screenshot and save to run directory
 */
export async function takeScreenshot(
  page: Page,
  runDir: string,
  name: string,
  options: SnapshotOptions = {}
): Promise<string> {
  const { fullPage = false, quality = 90, element, clip } = options
  
  const screenshotDir = path.join(runDir, 'screenshots')
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true })
  }
  
  const screenshotPath = path.join(screenshotDir, `${name}.png`)
  
  if (element) {
    await element.screenshot({ path: screenshotPath, quality })
  } else {
    await page.screenshot({
      path: screenshotPath,
      fullPage,
      quality,
      ...(clip && { clip }),
    })
  }
  
  return screenshotPath
}

/**
 * Take multiple screenshots at different viewport sizes
 */
export async function takeResponsiveScreenshots(
  page: Page,
  runDir: string,
  name: string,
  viewports: Array<{ width: number; height: number; name: string }> = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' },
  ]
): Promise<string[]> {
  const screenshots: string[] = []
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const screenshotPath = await takeScreenshot(
      page,
      runDir,
      `${name}_${viewport.name}`,
      { fullPage: true }
    )
    screenshots.push(screenshotPath)
  }
  
  return screenshots
}

/**
 * Capture HTML snapshot for debugging
 */
export async function captureHTMLSnapshot(
  page: Page,
  runDir: string,
  name: string
): Promise<string> {
  const snapshotDir = path.join(runDir, 'snapshots')
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true })
  }
  
  const html = await page.content()
  const snapshotPath = path.join(snapshotDir, `${name}.html`)
  fs.writeFileSync(snapshotPath, html)
  
  return snapshotPath
}

/**
 * Capture page state including HTML, screenshot, and console logs
 */
export async function capturePageState(
  page: Page,
  runDir: string,
  name: string
): Promise<{
  screenshot: string
  html: string
  url: string
  title: string
}> {
  const screenshot = await takeScreenshot(page, runDir, name)
  const html = await captureHTMLSnapshot(page, runDir, name)
  const url = page.url()
  const title = await page.title()
  
  return {
    screenshot,
    html,
    url,
    title,
  }
}
