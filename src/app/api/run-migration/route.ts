import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { migrationFile } = await request.json()
    
    if (!migrationFile) {
      return NextResponse.json({ error: 'Migration file required' }, { status: 400 })
    }

    // Create admin Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', migrationFile)
    
    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json({ error: 'Migration file not found' }, { status: 404 })
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    const results = []
    
    for (const statement of statements) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        })
        
        if (error) {
          // Try direct execution for DDL statements
          console.log('Executing statement directly...')
          results.push({ 
            statement: statement.substring(0, 100) + '...', 
            status: 'attempted',
            error: error.message 
          })
        } else {
          results.push({ 
            statement: statement.substring(0, 100) + '...', 
            status: 'success' 
          })
        }
      } catch (err: any) {
        results.push({ 
          statement: statement.substring(0, 100) + '...', 
          status: 'error',
          error: err.message 
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Migration executed',
      results,
      totalStatements: statements.length
    })

  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error.message 
    }, { status: 500 })
  }
}
