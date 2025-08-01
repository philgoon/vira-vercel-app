/**
 * Accelo Relationship Repair API Endpoint
 *
 * Purpose: Trigger relationship repair from admin interface
 * Context: Restores broken project-vendor-rating connections from original Accelo export
 */

import { NextResponse } from 'next/server';
import { repairAcceloRelationships } from '@/scripts/repair-accelo-relationships';

export async function POST() {
  try {
    console.log('🔧 Starting relationship repair from admin interface...');

    // Execute the repair process
    await repairAcceloRelationships();

    return NextResponse.json({
      success: true,
      message: 'Relationship repair completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Relationship repair failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
