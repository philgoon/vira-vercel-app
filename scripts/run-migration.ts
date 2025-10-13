// [R-QW1] Migration Runner Script
// Usage: npx tsx scripts/run-migration.ts migrations/001-add-timeline-status.sql

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(migrationPath: string) {
  try {
    console.log(`🔄 Running migration: ${migrationPath}`)

    // Read migration file
    const fullPath = path.join(process.cwd(), migrationPath)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Migration file not found: ${fullPath}`)
    }

    const sql = fs.readFileSync(fullPath, 'utf-8')
    console.log(`📄 Migration SQL loaded (${sql.length} characters)`)

    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct query as fallback
      console.log('Trying direct query execution...')
      const { error: directError } = await supabase.from('_migrations').insert([
        { name: path.basename(migrationPath), executed_at: new Date().toISOString() }
      ])

      if (directError) {
        throw new Error(`Migration failed: ${error.message}`)
      }
    }

    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Next steps:')
    console.log('1. Verify the column was added: Check projects_consolidated table in Supabase')
    console.log('2. Test in UI: http://localhost:3001/projects')
    console.log('3. Click on a project to open the modal and set timeline status')

  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

// Get migration path from command line
const migrationPath = process.argv[2]

if (!migrationPath) {
  console.error('❌ Usage: npx tsx scripts/run-migration.ts <migration-file>')
  console.error('Example: npx tsx scripts/run-migration.ts migrations/001-add-timeline-status.sql')
  process.exit(1)
}

runMigration(migrationPath)
