// [R3] API endpoint to create the vendor_ratings table
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Create the vendor_ratings table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vendor_ratings (
          rating_id TEXT PRIMARY KEY,
          vendor_id TEXT,
          project_id TEXT,
          client_name TEXT,
          rater_email TEXT,
          project_success_rating INTEGER,
          project_on_time BOOLEAN,
          project_on_budget BOOLEAN,
          vendor_overall_rating INTEGER,
          vendor_quality_rating INTEGER,
          vendor_communication_rating INTEGER,
          what_went_well TEXT,
          areas_for_improvement TEXT,
          recommend_again BOOLEAN,
          feedback TEXT,
          strengths TEXT,
          weaknesses TEXT,
          created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      return NextResponse.json({ 
        error: 'Failed to create table',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'vendor_ratings table created successfully',
      data
    });

  } catch (error) {
    console.error('Failed to create table:', error);
    return NextResponse.json({ 
      error: 'Failed to create table',
      details: error
    }, { status: 500 });
  }
}