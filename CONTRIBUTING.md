# Contributing to v0-clone

Thank you for your interest in contributing to v0-clone! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Making Changes](#making-changes)
4. [Testing](#testing)
5. [Submitting Changes](#submitting-changes)
6. [Code Style](#code-style)
7. [Using the Agent System](#using-the-agent-system)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- v0 API key (get from [v0.dev](https://v0.dev/chat/settings/keys))
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/v0-clone.git
   cd v0-clone
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/panyeroa1/v0-clone.git
   ```

## Development Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Set up database**:
   ```bash
   pnpm db:migrate
   pnpm db:seed  # Optional: add test data
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   # or
   ./scripts/dev.sh
   ```

5. **Verify setup**:
   - Open http://localhost:3000
   - Check that the app loads
   - Test basic functionality

## Making Changes

### Branch Naming

Create a descriptive branch for your changes:

```bash
git checkout -b feature/add-user-profile
git checkout -b fix/chat-loading-bug
git checkout -b docs/update-readme
```

Branch prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(chat): add message editing capability

fix(auth): resolve session timeout issue

docs(readme): update deployment instructions
```

### Code Organization

- **Components**: Place in `components/` with descriptive names
- **API Routes**: Follow Next.js conventions in `app/api/`
- **Database**: Schema changes go through migrations
- **Utilities**: Add to `lib/` with appropriate modules
- **Tests**: Co-locate with code or in `playwright/tests/`

## Testing

### Before Submitting

Run all checks:

```bash
# Type checking
pnpm exec tsc --noEmit

# Tests (if available)
./scripts/test.sh

# Build verification
./scripts/build.sh
```

### Writing Tests

#### Playwright E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/')
  // Test logic
  await expect(page).toHaveTitle(/expected title/)
})
```

#### Database Tests

Test migrations and seeds:
```bash
# Test migrations
pnpm db:migrate

# Verify schema
pnpm db:drift-check

# Test seeding
NODE_ENV=test pnpm db:seed
```

## Submitting Changes

### Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature
   ```

3. **Create Pull Request**:
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Link any related issues
   - Add screenshots for UI changes

4. **PR Checklist**:
   - [ ] Code follows project style
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No TypeScript errors
   - [ ] Build succeeds
   - [ ] Self-reviewed code
   - [ ] Added descriptive PR title
   - [ ] Screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type
- Use const assertions where appropriate

```typescript
// Good
interface User {
  id: string
  email: string
  createdAt: Date
}

function getUser(id: string): Promise<User> {
  // ...
}

// Avoid
function getUser(id: any): any {
  // ...
}
```

### React Components

- Use functional components
- Implement proper TypeScript types for props
- Use hooks appropriately
- Keep components focused and small

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {label}
    </button>
  )
}
```

### CSS/Tailwind

- Use Tailwind CSS utilities
- Follow responsive design principles
- Maintain consistent spacing
- Use design tokens

```tsx
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6">
  <div className="flex-1">Content</div>
</div>
```

### Database

- Use Drizzle ORM schema definitions
- Always create migrations for schema changes
- Never modify committed migrations
- Use transactions for related operations

```typescript
// Good - using ORM
await db.insert(users).values({ email, password })

// Avoid - raw SQL for schema changes
await db.execute(sql`ALTER TABLE users ADD COLUMN...`)
```

## Using the Agent System

For complex changes, leverage the agent system:

### 1. Plan with Planner

Create tasks in `task.md`:
```markdown
## Task: Add User Profile Feature
**Priority**: High
**Status**: Not Started
**Description**: Implement user profile viewing and editing
```

### 2. Implement with Coder

Write the code following agent guidelines in `/agents/coder.md`

### 3. Test with Runner

Run tests and validation:
```bash
./scripts/test.sh
```

### 4. Review with Critic

Review code quality, security, and best practices

### 5. Fix with Fixer

Apply any necessary fixes from review

### 6. Document Progress

Update `task.md` with progress and completion

## Database Contributions

### Schema Changes

1. **Modify schema**:
   ```typescript
   // lib/db/schema.ts
   export const newTable = pgTable('new_table', {
     id: uuid('id').primaryKey().defaultRandom(),
     // ... fields
   })
   ```

2. **Generate migration**:
   ```bash
   pnpm db:generate
   ```

3. **Review SQL**:
   Check generated migration in `lib/db/migrations/`

4. **Test locally**:
   ```bash
   pnpm db:migrate
   pnpm db:drift-check
   ```

5. **Update documentation**:
   - Update `lib/db/README.md`
   - Update `ARCHITECTURE.md` if significant

### Seeding

Add seed data to `lib/db/seed.ts`:

```typescript
async function seedMyData(db: ReturnType<typeof drizzle>) {
  await db.insert(myTable).values([
    { field: 'value' }
  ])
}
```

## Documentation

### When to Update Docs

- Adding new features
- Changing APIs
- Modifying configuration
- Adding new scripts or tools
- Changing deployment process

### Documentation Locations

- `README.md` - Project overview, quick start
- `ARCHITECTURE.md` - Technical architecture
- `CONTRIBUTING.md` - This file
- `/agents/README.md` - Agent system guide
- `/lib/db/README.md` - Database documentation
- `/deploy/README.md` - Deployment instructions
- `/playwright/README.md` - Testing documentation

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: File an issue with reproduction steps
- **Security**: Email security@example.com (private disclosure)
- **Features**: Open an issue to discuss before implementing

## Code Review Process

### As a Contributor

- Respond to feedback promptly
- Be open to suggestions
- Make requested changes
- Keep PR scope focused

### As a Reviewer

- Be constructive and respectful
- Focus on code quality and maintainability
- Provide specific, actionable feedback
- Approve when ready

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to v0-clone! 🚀
