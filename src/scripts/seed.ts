/*
[R5.1] This script seeds the Vercel Postgres database with vendor data from a CSV file.
It connects to the database, creates a 'vendors' table, and inserts the data.
*/

import { Pool } from 'pg';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// [R5.2] Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seedVendors() {
  const client = await pool.connect();
  console.log('Connected to the database.');

  try {
    await client.query('BEGIN');

    // [R5.4] Create the vendors table.
    await client.query(`
      DROP TABLE IF EXISTS vendors;
      CREATE TABLE vendors (
        "Vendor ID" TEXT PRIMARY KEY,
        "Name/Company Name" TEXT,
        "Type" TEXT,
        "Status" TEXT,
        "Primary Contact" TEXT,
        "Email" TEXT,
        "Time Zone" TEXT,
        "Contact Preference" TEXT,
        "Onboarding Date" DATE,
        "Overall Rating" REAL,
        "Industry" TEXT,
        "Service Category" TEXT,
        "Skills" TEXT[],
        "Portfolio URL" TEXT,
        "Sample Work URLs" TEXT[],
        "Pricing Structure" TEXT,
        "Rate/Cost" TEXT,
        "Availability" TEXT
      );
    `);
    console.log('"vendors" table created successfully.');

    const csvFilePath = path.resolve(process.cwd(), 'vendors.csv');
    const parser = fs.createReadStream(csvFilePath).pipe(parse({ columns: true }));

    // [R5.5] Prepare the INSERT statement.
    const insertQuery = `
      INSERT INTO vendors (
        "Vendor ID", "Name/Company Name", "Type", "Status", "Primary Contact", "Email", 
        "Time Zone", "Contact Preference", "Onboarding Date", "Overall Rating", "Industry", 
        "Service Category", "Skills", "Portfolio URL", "Sample Work URLs", 
        "Pricing Structure", "Rate/Cost", "Availability"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `;

    let count = 0;
    for await (const record of parser) {
      const skills = record.Skills ? record.Skills.split(',').map((s: string) => s.trim()) : [];
      const sampleUrls = record['Sample Work URLs'] ? record['Sample Work URLs'].split(',').map((s: string) => s.trim()) : [];
      const onboardingDate = record['Onboarding Date'] ? new Date(record['Onboarding Date']).toISOString().split('T')[0] : null;

      const values = [
        record['Vendor ID'],
        record['Name/Company Name'],
        record.Type,
        record.Status,
        record['Primary Contact'],
        record.Email,
        record['Time Zone'],
        record['Contact Preference'],
        onboardingDate,
        parseFloat(record['Overall Rating']) || null,
        record.Industry,
        record['Service Category'],
        skills,
        record['Portfolio URL'],
        sampleUrls,
        record['Pricing Structure'],
        record['Rate/Cost'],
        record.Availability,
      ];

      await client.query(insertQuery, values);
      count++;
    }

    await client.query('COMMIT');
    console.log('Seeded ' + count + ' vendors successfully.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding vendors:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

seedVendors().catch((err) => {
  console.error('An error occurred during the seeding process:', err);
});
