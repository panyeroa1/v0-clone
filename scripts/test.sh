#!/bin/bash
# Test runner script

set -e

echo "🧪 Running tests for v0-clone..."

# Check if test command exists in package.json
if grep -q '"test"' package.json; then
  echo "📝 Running unit tests..."
  pnpm test
else
  echo "⚠️  No test script found in package.json"
fi

# Run Playwright tests if available
if [ -d "playwright" ]; then
  echo "🎭 Running Playwright tests..."
  
  # Install Playwright browsers if needed
  if ! command -v playwright &> /dev/null; then
    echo "📦 Installing Playwright..."
    pnpm add -D @playwright/test
    pnpm exec playwright install
  fi
  
  # Run Playwright tests
  if [ -d "playwright/tests" ] && [ "$(ls -A playwright/tests)" ]; then
    pnpm exec playwright test
  else
    echo "⚠️  No Playwright tests found"
  fi
else
  echo "⚠️  Playwright directory not found"
fi

# Run type checking
echo "🔍 Running TypeScript type checking..."
pnpm exec tsc --noEmit || echo "⚠️  Type checking found issues"

echo "✅ All tests completed!"
