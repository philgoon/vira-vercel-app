import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [R1] Admin API for deleting database records with proper cascading
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const id = searchParams.get('id');

    if (!table || !id) {
      return NextResponse.json({ error: 'Table and ID parameters required' }, { status: 400 });
    }

    let tableName: string;

    switch (table) {
      case 'vendors':
        tableName = 'vendors';
        // Check for dependencies before deletion
        const { data: vendorRatings } = await supabase
          .from('vendor_ratings')
          .select('id')
          .eq('vendor_id', id);

        if (vendorRatings && vendorRatings.length > 0) {
          return NextResponse.json({
            error: 'Cannot delete vendor with existing ratings',
            details: `Vendor has ${vendorRatings.length} rating(s). Delete ratings first.`
          }, { status: 400 });
        }
        break;

      case 'clients':
        tableName = 'clients';
        // Check for dependencies before deletion
        const { data: clientProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', id);

        if (clientProjects && clientProjects.length > 0) {
          return NextResponse.json({
            error: 'Cannot delete client with existing projects',
            details: `Client has ${clientProjects.length} project(s). Delete projects first.`
          }, { status: 400 });
        }
        break;

      case 'projects':
        tableName = 'projects';
        // Check for dependencies before deletion
        const { data: projectRatings } = await supabase
          .from('vendor_ratings')
          .select('id')
          .eq('project_id', id);

        if (projectRatings && projectRatings.length > 0) {
          return NextResponse.json({
            error: 'Cannot delete project with existing ratings',
            details: `Project has ${projectRatings.length} rating(s). Delete ratings first.`
          }, { status: 400 });
        }
        break;

      case 'ratings':
        tableName = 'vendor_ratings';
        break;

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data: deletedData, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database delete error:', error);
      return NextResponse.json({
        error: 'Database delete failed',
        details: error.message
      }, { status: 500 });
    }

    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({
        error: 'Record not found or already deleted'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deletedData[0],
      message: `${table} record deleted successfully`
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
