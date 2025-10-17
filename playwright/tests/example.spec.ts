import { test, expect } from '@playwright/test'

/**
 * Example Playwright test demonstrating the test infrastructure
 * 
 * This test can be run with: pnpm exec playwright test
 */

test.describe('v0-clone Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Check that the page loaded
    await expect(page).toHaveTitle(/v0/)
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/homepage.png' })
  })

  test('should have a prompt input', async ({ page }) => {
    await page.goto('/')
    
    // Look for input field (adjust selector based on actual implementation)
    const input = page.locator('input[type="text"], textarea').first()
    await expect(input).toBeVisible()
  })
})

test.describe('Chat Interface', () => {
  test('should allow creating a new chat', async ({ page }) => {
    await page.goto('/')
    
    // Find the create button or input
    // This is a placeholder - adjust based on actual implementation
    const createButton = page.locator('button:has-text("Create"), button:has-text("New")')
    
    if (await createButton.isVisible()) {
      await createButton.click()
      
      // Verify we're on a new chat page
      await expect(page).toHaveURL(/\/chats\//)
    }
  })
})

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ]

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')
      
      // Check page loads
      await expect(page.locator('body')).toBeVisible()
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/homepage-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      })
    })
  }
})
