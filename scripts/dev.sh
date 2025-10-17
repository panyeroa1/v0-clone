#!/bin/bash
# Development server startup script

set -e

echo "🚀 Starting v0-clone development server..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  Warning: .env file not found. Creating from example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please configure it with your settings."
  else
    echo "❌ .env.example not found. Please create .env manually."
    exit 1
  fi
fi

# Check for required environment variables
if [ -z "$V0_API_KEY" ]; then
  echo "⚠️  Warning: V0_API_KEY not set. You'll need this to use the v0 API."
fi

if [ -z "$AUTH_SECRET" ]; then
  echo "⚠️  Warning: AUTH_SECRET not set. Generating one..."
  export AUTH_SECRET=$(openssl rand -base64 32)
  echo "Generated AUTH_SECRET (add to .env): $AUTH_SECRET"
fi

# Run database migrations
echo "📊 Running database migrations..."
pnpm db:migrate || echo "⚠️  Database migration failed. Continuing anyway..."

# Start development server
echo "🌐 Starting Next.js dev server with Turbopack..."
pnpm dev
