// [R2.1] src/scripts/schema.ts: Defines and creates the 'vendors' table.
import { sql } from '@vercel/postgres';

async function createVendorsTable() {
  console.log('Attempting to create vendors table...');
  try {
    // [R2.1] Use standard SQL for table creation to ensure compatibility and simplicity.
    const result = await sql`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        services_offered TEXT,
        key_strengths TEXT,
        budget_min INT,
        budget_max INT,
        locations_served TEXT,
        contact_info TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Successfully created vendors table:', result);
  } catch (error) {
    console.error('Error creating vendors table:', error);
    // [REH] Propagate error to ensure script failure is recognized.
    throw error;
  }
}

// [SF] Execute the function directly for a simple, single-purpose script.
createVendorsTable();
