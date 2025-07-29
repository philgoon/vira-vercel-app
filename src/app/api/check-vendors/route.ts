import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Get all vendor names from database
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('name, vendor_name')
    .order('name')
  
  if (error) {
    return NextResponse.json({ error: error.message })
  }
  
  // Read vendor names from CSV
  const csvVendors = [
    "Adaeze Nwakaeze",
    "Alaiya Benjamin", 
    "Alex Silady",
    "Allison Kirschbaum",
    "Beckie Hawk",
    "Brad Riddell",
    "Carolyn Wynnack",
    "Cristina Kocsis",
    "Jennifer Brown"
  ]
  
  const dbVendorNames = vendors?.map(v => v.name) || []
  
  const analysis = csvVendors.map(csvName => ({
    csvName,
    existsInDb: dbVendorNames.some(dbName => dbName === csvName),
    similarInDb: dbVendorNames.filter(dbName => 
      dbName.toLowerCase().includes(csvName.toLowerCase().split(' ')[0])
    )
  }))
  
  return NextResponse.json({
    totalDbVendors: dbVendorNames.length,
    csvVendorsChecked: csvVendors.length,
    analysis
  })
}