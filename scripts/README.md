# Scripts

One-liner scripts for common development tasks.

## Available Scripts

### `dev.sh`
Start the development server with environment checks and migrations.

```bash
./scripts/dev.sh
```

**What it does:**
- Checks for `.env` file and creates from example if missing
- Validates required environment variables
- Runs database migrations
- Starts Next.js dev server with Turbopack

### `test.sh`
Run all tests including unit tests and Playwright tests.

```bash
./scripts/test.sh
```

**What it does:**
- Runs unit tests (if configured)
- Runs Playwright end-to-end tests
- Performs TypeScript type checking
- Reports test results

### `build.sh`
Build the application for production.

```bash
./scripts/build.sh
```

**What it does:**
- Cleans previous build artifacts
- Runs database migrations
- Performs TypeScript type checking
- Builds Next.js application for production
- Verifies build output

### `deploy.sh`
Deploy to a target environment.

```bash
./scripts/deploy.sh [target]
```

**Targets:**
- `vercel` (default) - Deploy to Vercel
- `fly` - Deploy to Fly.io
- `render` - Info for deploying to Render

**Examples:**
```bash
./scripts/deploy.sh vercel
./scripts/deploy.sh fly
./scripts/deploy.sh render
```

## Making Scripts Executable

Before running scripts, make them executable:

```bash
chmod +x scripts/*.sh
```

## Environment Variables

Scripts check for required environment variables:
- `V0_API_KEY` - Your v0 API key
- `AUTH_SECRET` - Secret for authentication
- `POSTGRES_URL` - Database connection string
- `DEPLOY_TARGET` - Default deployment target

See `.env.example` for all available variables.

## Usage from npm/pnpm

You can also add these to `package.json` scripts:

```json
{
  "scripts": {
    "dev": "./scripts/dev.sh",
    "test": "./scripts/test.sh",
    "build": "./scripts/build.sh",
    "deploy": "./scripts/deploy.sh"
  }
}
```

Then run with:
```bash
pnpm dev
pnpm test
pnpm build
pnpm deploy
```
