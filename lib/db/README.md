# Database Management

This directory contains all database-related code including schema, migrations, seeding, and utilities.

## Structure

```
lib/db/
├── schema.ts              # Database schema definitions (Drizzle ORM)
├── migrate.ts             # Migration runner
├── seed.ts                # Database seeding script
├── drift-check.ts         # Schema drift detection
├── generate-er-diagram.ts # ER diagram generator
├── connection.ts          # Database connection utilities
├── queries.ts             # Common database queries
├── utils.ts               # Database utility functions
└── migrations/            # Generated migration files
```

## Commands

### Generate Migrations
Generate a new migration from schema changes:
```bash
pnpm db:generate
```

This reads `schema.ts` and creates a new migration file in `migrations/`.

### Run Migrations
Apply pending migrations to the database:
```bash
pnpm db:migrate
```

Migrations run automatically during the build process.

### Seed Database
Populate the database with initial or test data:
```bash
pnpm db:seed
```

Seeds different data based on `NODE_ENV`:
- `development` / `local`: Development data with test users
- `test`: Minimal test data
- `production`: No seeding (skip in production)

### Check for Drift
Detect differences between code schema and database:
```bash
pnpm db:drift-check
```

This will:
- List all tables and columns in the database
- Compare with schema definitions in code
- Report missing or extra tables
- Show recent migrations

### Generate ER Diagram
Create a visual representation of the database schema:
```bash
pnpm db:er-diagram
```

Generates a Mermaid ER diagram in `docs/er-diagram.md`.

### Database Studio
Open Drizzle Studio for visual database management:
```bash
pnpm db:studio
```

Opens a web interface at `https://local.drizzle.studio`.

### Push Schema (Development Only)
Push schema changes directly without migrations:
```bash
pnpm db:push
```

⚠️ **Warning**: This should only be used in development. Always use migrations in production.

## Schema Definition

The schema is defined using Drizzle ORM in `schema.ts`:

```typescript
import { pgTable, varchar, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
})
```

### Current Tables

1. **users** - User accounts
   - `id` (uuid, primary key)
   - `email` (varchar)
   - `password` (varchar, nullable for guest users)
   - `created_at` (timestamp)

2. **chat_ownerships** - Maps v0 chats to users
   - `id` (uuid, primary key)
   - `v0_chat_id` (varchar, unique)
   - `user_id` (uuid, foreign key to users)
   - `created_at` (timestamp)

3. **anonymous_chat_logs** - Rate limiting for anonymous users
   - `id` (uuid, primary key)
   - `ip_address` (varchar)
   - `v0_chat_id` (varchar)
   - `created_at` (timestamp)

## Migration Workflow

1. **Modify Schema**: Edit `schema.ts` with your changes
2. **Generate Migration**: Run `pnpm db:generate`
3. **Review SQL**: Check the generated SQL in `migrations/`
4. **Test Locally**: Apply with `pnpm db:migrate`
5. **Commit**: Include migration files in git
6. **Deploy**: Migrations run automatically on build

## Seeding

Seeds are defined in `seed.ts` and include:

### Base Data (All Environments)
- Test users with known credentials
- Guest user accounts

### Development Data
- Additional sample data for local development
- Demo chat ownerships

### Test Data
- Minimal data optimized for testing
- Predictable IDs and values

### Custom Seeds
Add your own seed functions:

```typescript
async function seedMyData(db: ReturnType<typeof drizzle>) {
  await db.insert(myTable).values([
    { /* data */ }
  ])
}
```

## Drift Detection

Drift occurs when:
- Manual database changes are made
- Migrations are not applied
- Schema code changes without migrations
- Multiple database instances are out of sync

Run drift check regularly, especially:
- Before deployments
- After pulling code changes
- When debugging database issues

## ER Diagram

The ER diagram shows:
- All tables and their columns
- Data types and constraints
- Foreign key relationships
- Primary keys

Regenerate after schema changes to keep documentation up to date.

## Best Practices

### Migrations
- ✅ Always use migrations for schema changes
- ✅ Review generated SQL before applying
- ✅ Test migrations on development data first
- ✅ Make migrations reversible when possible
- ❌ Never modify committed migration files
- ❌ Don't use `db:push` in production

### Seeding
- ✅ Use seeds for development and test data
- ✅ Keep seeds idempotent (safe to run multiple times)
- ✅ Use environment checks for different data
- ❌ Don't seed production databases
- ❌ Don't include sensitive data in seeds

### Schema
- ✅ Use TypeScript types from schema
- ✅ Add indexes for frequently queried columns
- ✅ Use foreign keys to maintain referential integrity
- ✅ Document complex schema decisions
- ❌ Don't bypass ORM for schema changes

## Troubleshooting

### Migration Fails
1. Check database connectivity
2. Review migration SQL for errors
3. Verify database permissions
4. Check for conflicting changes

### Drift Detected
1. Run `pnpm db:drift-check` to see details
2. Generate missing migrations
3. Apply migrations
4. Re-run drift check to verify

### Seeding Errors
1. Check database connectivity
2. Verify data doesn't already exist
3. Check for constraint violations
4. Review error messages in console

### Connection Issues
1. Verify `POSTGRES_URL` is set
2. Check database is running
3. Verify credentials
4. Check network/firewall settings

## Environment Variables

Required:
- `POSTGRES_URL` - PostgreSQL connection string

Format:
```
postgresql://user:password@host:port/database
```

Example:
```
postgresql://postgres:postgres@localhost:5432/v0_clone
```

For Vercel Postgres:
```
postgres://user:pass@region-project.postgres.vercel-storage.com/verceldb?sslmode=require
```
