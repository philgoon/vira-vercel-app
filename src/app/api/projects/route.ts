// [R5.2] Enhanced projects API route with workflow status transitions
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('projects')
      .select('*')
      .order('expected_deadline', { ascending: true });

    // Apply filters if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects });
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

// [R5.2] New PUT method for workflow status transitions
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { project_id, status } = body;

    // [R5.2] Validate required fields
    if (!project_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: project_id and status' }, 
        { status: 400 }
      );
    }

    // [R5.2] Validate status transition (only allow specific workflow transitions)
    const validTransitions = ['active', 'completed', 'archived'];
    if (!validTransitions.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validTransitions.join(', ')}` }, 
        { status: 400 }
      );
    }

    // [R5.2] Get current project to validate transition
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('status')
      .eq('project_id', project_id)
      .single();

    if (fetchError || !currentProject) {
      console.error('Project lookup error:', fetchError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // [R5.2] Validate workflow transition logic
    const currentStatus = currentProject.status;
    const validWorkflowTransitions = {
      'active': ['completed'],
      'completed': ['archived'], // This happens via rate-project API
      'archived': ['archived'] // Allow re-archiving (no-op)
    };

    if (currentStatus !== status && 
        (!validWorkflowTransitions[currentStatus] || 
         !validWorkflowTransitions[currentStatus].includes(status))) {
      return NextResponse.json(
        { error: `Invalid transition from '${currentStatus}' to '${status}'` }, 
        { status: 400 }
      );
    }

    // [R5.2] Update project status
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', project_id)
      .select()
      .single();

    if (updateError) {
      console.error('Project update error:', updateError);
      return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 });
    }

    return NextResponse.json({ 
      project: updatedProject,
      message: `Project status updated from '${currentStatus}' to '${status}'`
    });

  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
