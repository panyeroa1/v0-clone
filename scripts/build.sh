#!/bin/bash
# Production build script

set -e

echo "🏗️  Building v0-clone for production..."

# Clean previous build
if [ -d ".next" ]; then
  echo "🧹 Cleaning previous build..."
  rm -rf .next
fi

# Run database migrations
echo "📊 Running database migrations..."
pnpm db:migrate || echo "⚠️  Database migration failed. Continuing anyway..."

# Type check
echo "🔍 Running type check..."
pnpm exec tsc --noEmit

# Build the application
echo "📦 Building Next.js application..."
pnpm build

# Verify build output
if [ ! -d ".next" ]; then
  echo "❌ Build failed - .next directory not found"
  exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build output: .next/"
echo "🚀 Run 'pnpm start' to start the production server"
