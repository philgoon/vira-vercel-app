// [R5.2] Enhanced projects API route with workflow status transitions
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    const vendorCategory = searchParams.get('vendor_category');

    let query = supabase
      .from('projects')
      .select(`
        *,
        vendors:assigned_vendor_id (
          vendor_id,
          vendor_name,
          service_categories
        )
      `)
      .order('expected_deadline', { ascending: true });

    // Apply filters if provided
    if (id) {
      query = query.eq('project_id', id);
    } else if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Client-side filtering for vendor category if specified
    let filteredProjects = projects || [];
    if (vendorCategory && vendorCategory !== 'all') {
      filteredProjects = projects?.filter(project => {
        const vendor = project.vendors;
        if (!vendor) return false;
        
        const categories = Array.isArray(vendor.service_categories) 
          ? vendor.service_categories 
          : [vendor.service_categories].filter(Boolean);
        
        return categories.some((cat: any) => 
          cat && typeof cat === 'string' && 
          cat.toLowerCase().includes(vendorCategory.toLowerCase())
        );
      }) || [];
    }

    return NextResponse.json({ projects: filteredProjects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// [R5.2] Enhanced PUT method for both status transitions and full project updates
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { project_id, ...updateData } = body;

    // Validate required fields
    if (!project_id) {
      return NextResponse.json(
        { error: 'Missing required field: project_id' }, 
        { status: 400 }
      );
    }

    // Check if this is a status-only update (legacy support)
    const isStatusOnlyUpdate = Object.keys(updateData).length === 1 && 'status' in updateData;

    if (isStatusOnlyUpdate) {
      // [R5.2] Handle status-only updates with workflow validation
      const { status } = updateData;
      
      // Validate status transition (only allow specific workflow transitions)
      const validTransitions = ['active', 'completed', 'archived', 'on_hold', 'cancelled'];
      if (!validTransitions.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validTransitions.join(', ')}` }, 
          { status: 400 }
        );
      }

      // Get current project to validate transition
      const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select('status')
        .eq('project_id', project_id)
        .single();

      if (fetchError || !currentProject) {
        console.error('Project lookup error:', fetchError);
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Validate workflow transition logic
      const currentStatus = currentProject.status as string;
      const validWorkflowTransitions: Record<string, string[]> = {
        'active': ['completed', 'on_hold', 'cancelled'],
        'completed': ['archived', 'active'], // Allow reopening
        'archived': ['archived', 'active'], // Allow reactivating
        'on_hold': ['active', 'cancelled'],
        'cancelled': ['active'] // Allow restarting
      };

      if (currentStatus !== status && 
          (!validWorkflowTransitions[currentStatus] || 
           !validWorkflowTransitions[currentStatus].includes(status))) {
        return NextResponse.json(
          { error: `Invalid transition from '${currentStatus}' to '${status}'` }, 
          { status: 400 }
        );
      }
    }

    // Update project with all provided fields
    const updatePayload = {
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    console.log('Updating project with payload:', updatePayload)
    
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('project_id', project_id)
      .select()
      .single();

    if (updateError) {
      console.error('Project update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update project',
        details: updateError,
        payload: updatePayload 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      project: updatedProject,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
