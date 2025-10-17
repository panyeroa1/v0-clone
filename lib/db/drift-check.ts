import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'
import { config } from 'dotenv'
import * as schema from './schema'

// Load environment variables
config()

interface TableInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface ForeignKeyInfo {
  constraint_name: string
  table_name: string
  column_name: string
  foreign_table_name: string
  foreign_column_name: string
}

/**
 * Check for schema drift between code and database
 */
async function checkDrift() {
  if (!process.env.POSTGRES_URL) {
    console.log('❌ POSTGRES_URL is not defined')
    process.exit(1)
  }

  console.log('🔍 Checking for schema drift...')

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 })
  const db = drizzle(connection)

  try {
    // Get all tables from the database
    const tables = await db.execute<{ table_name: string }>(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log(`\n📊 Found ${tables.length} table(s) in database:`)
    tables.forEach(t => console.log(`  - ${t.table_name}`))

    // Get columns for each table
    const columns = await db.execute<TableInfo>(sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `)

    console.log(`\n📋 Database schema details:`)
    
    const tableColumns = new Map<string, TableInfo[]>()
    columns.forEach(col => {
      if (!tableColumns.has(col.table_name)) {
        tableColumns.set(col.table_name, [])
      }
      tableColumns.get(col.table_name)!.push(col)
    })

    tableColumns.forEach((cols, tableName) => {
      console.log(`\n  Table: ${tableName}`)
      cols.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
        console.log(`    - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
      })
    })

    // Get foreign keys
    const foreignKeys = await db.execute<ForeignKeyInfo>(sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `)

    if (foreignKeys.length > 0) {
      console.log(`\n🔗 Foreign Key Relationships:`)
      foreignKeys.forEach(fk => {
        console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`)
      })
    }

    // Check for pending migrations
    const migrations = await db.execute<{ id: number; hash: string; created_at: string }>(sql`
      SELECT id, hash, created_at 
      FROM drizzle.__drizzle_migrations 
      ORDER BY created_at DESC 
      LIMIT 5
    `).catch(() => [])

    if (migrations.length > 0) {
      console.log(`\n📝 Recent migrations:`)
      migrations.forEach(m => {
        console.log(`  ${m.id}: ${m.hash} (${new Date(m.created_at).toLocaleString()})`)
      })
    }

    // Compare with schema in code
    const schemaKeys = Object.keys(schema)
    const expectedTables = schemaKeys.filter(key => 
      !key.startsWith('_') && typeof schema[key as keyof typeof schema] === 'object'
    )

    console.log(`\n📦 Expected tables from code schema:`)
    expectedTables.forEach(t => console.log(`  - ${t}`))

    // Check for drift
    const dbTableNames = new Set(tables.map(t => t.table_name))
    const codeTableNames = new Set(expectedTables)

    const missingInDb = expectedTables.filter(t => !dbTableNames.has(t))
    const extraInDb = tables.map(t => t.table_name).filter(t => 
      !codeTableNames.has(t) && !t.startsWith('drizzle')
    )

    if (missingInDb.length > 0) {
      console.log(`\n⚠️  Tables missing in database:`)
      missingInDb.forEach(t => console.log(`  - ${t}`))
    }

    if (extraInDb.length > 0) {
      console.log(`\n⚠️  Extra tables in database (not in code):`)
      extraInDb.forEach(t => console.log(`  - ${t}`))
    }

    if (missingInDb.length === 0 && extraInDb.length === 0) {
      console.log(`\n✅ No schema drift detected`)
    } else {
      console.log(`\n⚠️  Schema drift detected - consider running migrations`)
    }

  } catch (error) {
    console.error('❌ Drift check failed')
    console.error(error)
    process.exit(1)
  } finally {
    await connection.end()
  }

  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  checkDrift()
}

export { checkDrift }
