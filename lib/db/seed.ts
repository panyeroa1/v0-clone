import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { hash } from 'bcrypt-ts'
import { users, chat_ownerships, anonymous_chat_logs } from './schema'
import { config } from 'dotenv'

// Load environment variables
config()

/**
 * Database seeding script
 * Creates initial data for development and testing
 */

const SEED_ENVIRONMENTS = ['development', 'test', 'local'] as const
type SeedEnvironment = typeof SEED_ENVIRONMENTS[number]

function getSeedEnvironment(): SeedEnvironment {
  const env = process.env.NODE_ENV || 'development'
  return SEED_ENVIRONMENTS.includes(env as SeedEnvironment) 
    ? (env as SeedEnvironment) 
    : 'development'
}

async function seedUsers(db: ReturnType<typeof drizzle>) {
  console.log('🌱 Seeding users...')
  
  // Create test users
  const testUsers = [
    {
      email: 'test@example.com',
      password: await hash('password123', 10),
    },
    {
      email: 'demo@example.com',
      password: await hash('demo123', 10),
    },
    {
      email: 'guest@example.com',
      password: null, // Guest user
    },
  ]
  
  for (const user of testUsers) {
    try {
      await db.insert(users).values(user).onConflictDoNothing()
      console.log(`  ✓ Created user: ${user.email}`)
    } catch (error) {
      console.log(`  ⚠️  User ${user.email} may already exist`)
    }
  }
}

async function seedDevelopmentData(db: ReturnType<typeof drizzle>) {
  console.log('🌱 Seeding development data...')
  
  // Additional development-specific data can go here
  // For example, sample chat ownerships, test data, etc.
  
  console.log('  ✓ Development data seeded')
}

async function seedTestData(db: ReturnType<typeof drizzle>) {
  console.log('🌱 Seeding test data...')
  
  // Test-specific data
  // This data is optimized for running tests
  
  console.log('  ✓ Test data seeded')
}

async function runSeed() {
  if (!process.env.POSTGRES_URL) {
    console.log('❌ POSTGRES_URL is not defined, skipping seed')
    process.exit(1)
  }
  
  const environment = getSeedEnvironment()
  console.log(`🌱 Starting database seed for ${environment} environment...`)
  
  const connection = postgres(process.env.POSTGRES_URL, { max: 1 })
  const db = drizzle(connection)
  
  const start = Date.now()
  
  try {
    // Seed base data (runs in all environments)
    await seedUsers(db)
    
    // Seed environment-specific data
    if (environment === 'development' || environment === 'local') {
      await seedDevelopmentData(db)
    } else if (environment === 'test') {
      await seedTestData(db)
    }
    
    const end = Date.now()
    console.log(`✅ Database seeding completed in ${end - start}ms`)
  } catch (error) {
    console.error('❌ Database seeding failed')
    console.error(error)
    process.exit(1)
  } finally {
    await connection.end()
  }
  
  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  runSeed()
}

export { runSeed, seedUsers, seedDevelopmentData, seedTestData }
