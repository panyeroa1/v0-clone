import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config()

interface TableColumn {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  is_primary: boolean
}

interface ForeignKey {
  constraint_name: string
  table_name: string
  column_name: string
  foreign_table_name: string
  foreign_column_name: string
}

/**
 * Generate ER diagram in Mermaid format
 */
async function generateERDiagram(outputFormat: 'mermaid' | 'markdown' = 'mermaid') {
  if (!process.env.POSTGRES_URL) {
    console.log('❌ POSTGRES_URL is not defined')
    process.exit(1)
  }

  console.log('📊 Generating ER diagram...')

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 })
  const db = drizzle(connection)

  try {
    // Get table and column information
    const columns = await db.execute<TableColumn>(sql`
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE 
          WHEN pk.column_name IS NOT NULL THEN true 
          ELSE false 
        END as is_primary
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
      ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
      WHERE c.table_schema = 'public'
        AND c.table_name NOT LIKE 'drizzle%'
      ORDER BY c.table_name, c.ordinal_position
    `)

    // Get foreign keys
    const foreignKeys = await db.execute<ForeignKey>(sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `)

    // Group columns by table
    const tables = new Map<string, TableColumn[]>()
    columns.forEach(col => {
      if (!tables.has(col.table_name)) {
        tables.set(col.table_name, [])
      }
      tables.get(col.table_name)!.push(col)
    })

    // Generate Mermaid diagram
    let diagram = '```mermaid\nerDiagram\n'

    // Add tables and columns
    tables.forEach((cols, tableName) => {
      diagram += `    ${tableName} {\n`
      cols.forEach(col => {
        const pk = col.is_primary ? 'PK' : ''
        const nullable = col.is_nullable === 'YES' ? '' : 'NOT NULL'
        diagram += `        ${col.data_type} ${col.column_name} ${pk} ${nullable}\n`
      })
      diagram += '    }\n'
    })

    // Add relationships
    foreignKeys.forEach(fk => {
      // Relationship notation: ||--o{ means one-to-many
      diagram += `    ${fk.foreign_table_name} ||--o{ ${fk.table_name} : "has"\n`
    })

    diagram += '```\n'

    // Save to file
    const outputDir = path.join(process.cwd(), 'docs')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, 'er-diagram.md')
    
    const fullOutput = `# Database ER Diagram

Generated on: ${new Date().toISOString()}

${diagram}

## Tables

${Array.from(tables.entries()).map(([tableName, cols]) => {
  return `### ${tableName}\n\n${cols.map(col => {
    const pk = col.is_primary ? '🔑 ' : ''
    const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)'
    return `- ${pk}**${col.column_name}**: ${col.data_type} ${nullable}`
  }).join('\n')}`
}).join('\n\n')}

## Relationships

${foreignKeys.map(fk => 
  `- **${fk.table_name}.${fk.column_name}** references **${fk.foreign_table_name}.${fk.foreign_column_name}**`
).join('\n')}
`

    fs.writeFileSync(outputPath, fullOutput)
    
    console.log(`✅ ER diagram generated: ${outputPath}`)
    console.log('\nPreview:')
    console.log(diagram)

  } catch (error) {
    console.error('❌ ER diagram generation failed')
    console.error(error)
    process.exit(1)
  } finally {
    await connection.end()
  }

  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  const format = process.argv[2] as 'mermaid' | 'markdown' || 'mermaid'
  generateERDiagram(format)
}

export { generateERDiagram }
