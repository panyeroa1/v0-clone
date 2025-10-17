# Playwright Sandbox

This directory contains Playwright-based automation and testing infrastructure for computer-use style interactions.

## Overview

The Playwright sandbox enables:
- Headless browser automation
- UI interaction testing (click, scroll, type)
- Screenshot capture for verification
- Trace recording for debugging
- Permissions-gated operations

## Features

### Browser Automation
- Open editor preview in headless browser
- Interact with UI elements (click, scroll, type)
- Take snapshots at any point
- Record traces for debugging

### Permissions Gate
Operations require explicit permissions for:
- File system writes
- Network access
- Deploy operations
- Database modifications

### Trace Storage
All runs are saved to `/runs/YYYYMMDD_HHMMSS/` with:
- Playwright traces
- Screenshots
- Console logs
- Network requests
- Performance metrics

## Structure

```
/playwright/
  /helpers/          # Utility functions
  /fixtures/         # Test fixtures and data
  /config/           # Playwright configuration
  playwright.config.ts
  README.md
```

## Usage

### Basic Example
```typescript
import { chromium } from 'playwright'
import { captureTrace } from './helpers/trace'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()

// Start tracing
await context.tracing.start({ screenshots: true, snapshots: true })

// Navigate and interact
await page.goto('http://localhost:3000')
await page.click('button[aria-label="Create"]')
await page.fill('input[name="prompt"]', 'Build a todo app')

// Take screenshot
await page.screenshot({ path: 'screenshot.png' })

// Stop tracing and save
await context.tracing.stop({ path: 'trace.zip' })

await browser.close()
```

## Helpers

See `/helpers/` directory for utility functions:
- `browser.ts` - Browser setup and management
- `trace.ts` - Trace recording and storage
- `snapshot.ts` - Screenshot capture
- `permissions.ts` - Permission checking
- `storage.ts` - Run artifact storage

## Configuration

Edit `playwright.config.ts` to customize:
- Browser types (chromium, firefox, webkit)
- Viewport sizes
- Timeout settings
- Trace retention
- Screenshot settings
