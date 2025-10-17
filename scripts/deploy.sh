#!/bin/bash
# Deployment script

set -e

echo "🚀 Deploying v0-clone..."

# Get deployment target from argument or environment
TARGET=${1:-${DEPLOY_TARGET:-vercel}}

case $TARGET in
  vercel)
    echo "📦 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
      echo "Installing Vercel CLI..."
      pnpm add -g vercel
    fi
    
    # Deploy
    vercel --prod
    echo "✅ Deployed to Vercel"
    ;;
    
  fly)
    echo "🪰 Deploying to Fly.io..."
    
    # Check if Fly CLI is installed
    if ! command -v fly &> /dev/null; then
      echo "❌ Fly CLI not found. Install from: https://fly.io/docs/hands-on/install-flyctl/"
      exit 1
    fi
    
    # Deploy
    fly deploy
    echo "✅ Deployed to Fly.io"
    ;;
    
  render)
    echo "🎨 Deploying to Render..."
    
    # Check if render.yaml exists
    if [ ! -f "render.yaml" ]; then
      echo "❌ render.yaml not found. Create one in the deploy/ directory"
      exit 1
    fi
    
    echo "ℹ️  Render deploys automatically from Git."
    echo "   Push your changes to trigger a deployment."
    echo "   Or use the Render dashboard to deploy manually."
    ;;
    
  *)
    echo "❌ Unknown deployment target: $TARGET"
    echo "Usage: $0 [vercel|fly|render]"
    exit 1
    ;;
esac

echo "🎉 Deployment complete!"
