# Deployment Templates

This directory contains deployment configuration templates for various hosting platforms.

## Available Platforms

### Vercel (Recommended)
- **File**: `vercel.json`
- **Best for**: Next.js applications, automatic deployments
- **Features**: Edge functions, automatic SSL, preview deployments
- **Setup**: Click the "Deploy to Vercel" button in the main README or use Vercel CLI

**Quick Deploy:**
```bash
vercel --prod
```

**Environment Variables:**
- `V0_API_KEY` - Your v0 API key
- `AUTH_SECRET` - Session encryption secret
- `POSTGRES_URL` - Database connection string

### Fly.io
- **File**: `fly.toml`
- **Best for**: Docker-based deployments, global distribution
- **Features**: Multiple regions, auto-scaling, persistent storage
- **Setup**: Install Fly CLI and follow deployment steps

**Quick Deploy:**
```bash
fly launch --copy-config
fly secrets set V0_API_KEY=xxx AUTH_SECRET=xxx POSTGRES_URL=xxx
fly deploy
```

### Render
- **File**: `render.yaml`
- **Best for**: Automatic deployments from Git, managed PostgreSQL
- **Features**: Auto-deploy from Git, managed databases, SSL
- **Setup**: Connect GitHub repo in Render dashboard

**Quick Deploy:**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Create new Blueprint
3. Connect your repository
4. Select `deploy/render.yaml`
5. Apply and deploy

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are configured
- [ ] Database is set up and accessible
- [ ] Migrations are ready to run
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] `.env` variables are added to platform

## Database Setup

All platforms require a PostgreSQL database:

### Vercel
Use Vercel Postgres or connect external database:
```bash
vercel postgres create
```

### Fly.io
Create a Postgres cluster:
```bash
fly postgres create
fly postgres attach
```

### Render
Database is auto-created via `render.yaml` blueprint.

## Running Migrations

After deployment, run migrations:

**Vercel:**
Migrations run automatically in build step (see `package.json` build script)

**Fly.io:**
```bash
fly ssh console
pnpm db:migrate
```

**Render:**
Use Render shell or run in dashboard:
```bash
pnpm db:migrate
```

## Health Checks

All platforms are configured with health check endpoints:
- Path: `/api/health`
- Expected: 200 OK response

Create this endpoint in `app/api/health/route.ts` if it doesn't exist.

## Custom Domains

### Vercel
```bash
vercel domains add yourdomain.com
```

### Fly.io
```bash
fly certs add yourdomain.com
```

### Render
Add custom domain in dashboard → Settings → Custom Domains

## Troubleshooting

### Build Failures
- Check environment variables are set
- Verify database connection string
- Check build logs for errors

### Runtime Errors
- Check application logs
- Verify all secrets are set
- Test database connectivity
- Check memory/CPU limits

### Database Connection Issues
- Verify POSTGRES_URL format
- Check firewall/network settings
- Ensure database is running
- Test connection locally first

## Support

- Vercel: https://vercel.com/docs
- Fly.io: https://fly.io/docs
- Render: https://render.com/docs
