import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright'

export type BrowserType = 'chromium' | 'firefox' | 'webkit'

export interface BrowserSetupOptions {
  type?: BrowserType
  headless?: boolean
  viewport?: { width: number; height: number }
  recordVideo?: boolean
  recordTrace?: boolean
}

/**
 * Launch a browser instance with configured options
 */
export async function launchBrowser(options: BrowserSetupOptions = {}): Promise<Browser> {
  const {
    type = 'chromium',
    headless = true,
  } = options

  const browserType = type === 'firefox' ? firefox : type === 'webkit' ? webkit : chromium

  const browser = await browserType.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  })

  return browser
}

/**
 * Create a new browser context with tracing and recording options
 */
export async function createContext(
  browser: Browser,
  options: BrowserSetupOptions = {}
): Promise<BrowserContext> {
  const {
    viewport = { width: 1280, height: 720 },
    recordVideo = false,
    recordTrace = false,
  } = options

  const context = await browser.newContext({
    viewport,
    ...(recordVideo && {
      recordVideo: {
        dir: 'test-results/videos',
        size: viewport,
      },
    }),
  })

  if (recordTrace) {
    await context.tracing.start({ screenshots: true, snapshots: true })
  }

  return context
}

/**
 * Create a new page with common setup
 */
export async function createPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage()

  // Set up console message capture
  page.on('console', (msg) => {
    const type = msg.type()
    if (type === 'error' || type === 'warning') {
      console.log(`[Browser ${type}]:`, msg.text())
    }
  })

  // Capture page errors
  page.on('pageerror', (error) => {
    console.error('[Page Error]:', error)
  })

  return page
}

/**
 * Close browser and save any recordings
 */
export async function closeBrowser(
  browser: Browser,
  context?: BrowserContext,
  saveTrace?: string
): Promise<void> {
  if (context && saveTrace) {
    await context.tracing.stop({ path: saveTrace })
  }

  if (context) {
    await context.close()
  }

  await browser.close()
}
