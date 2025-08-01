// [R5.4] Enhanced Rate Project API with create and update support
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // [R4.2] Validate required fields - Updated for new 3-field + structured feedback model
    const requiredFields = [
      'project_id',
      'vendor_id',
      'rater_email',
      'project_success_rating',
      'quality_rating',
      'communication_rating'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // [R4.2] Get client_id from project data using correct field name
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('project_id', body.project_id) // Use project_id which is the actual primary key
      .single();

    if (projectError || !projectData) {
      console.error('Project lookup error:', projectError);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // [R4.2] Prepare rating data for insertion - Fixed to match actual database schema
    const ratingData = {
      rating_id: `RAT-${Date.now()}`, // Generate unique rating ID
      project_id: body.project_id,
      vendor_id: body.vendor_id,
      client_id: projectData.client_id,
      rater_email: body.rater_email,
      rating_date: new Date().toISOString().split('T')[0], // Date format
      project_success_rating: body.project_success_rating,
      project_on_time: true, // Default - can be updated via admin
      project_on_budget: true, // Default - can be updated via admin
      vendor_overall_rating: body.overall_rating || 5, // Default 5 if not provided
      vendor_quality_rating: body.quality_rating,
      vendor_communication_rating: body.communication_rating,
      what_went_well: body.positive_feedback || null,
      areas_for_improvement: body.improvement_feedback || null,
      recommend_again: null, // Can be updated via admin
      created_date: new Date().toISOString().split('T')[0],
    };

    // [R4.2] Insert rating into database using correct table name
    const { data: rating, error: ratingError } = await supabase
      .from('ratings')
      .insert([ratingData])
      .select()
      .single();

    if (ratingError) {
      console.error('Rating insertion error:', ratingError);
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      );
    }

    // [R4.2] Archive the project after successful rating
    const { error: archiveError } = await supabase
      .from('projects')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('project_id', body.project_id); // Use project_id which is the actual primary key

    if (archiveError) {
      console.error('Project archiving error:', archiveError);
      // Don't fail the request if archiving fails, rating was successful
      console.warn('Rating saved but project archiving failed');
    }

    return NextResponse.json({
      success: true,
      rating,
      message: 'Rating submitted successfully and project archived'
    }, { status: 201 });

  } catch (error) {
    console.error('Rate project API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// [R5.4] New PUT method for updating existing ratings
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // [R5.4] Validate required fields for update - Updated for new 3-field + structured feedback model
    const requiredFields = [
      'project_id',
      'vendor_id',
      'rater_email',
      'project_success_rating',
      'quality_rating',
      'communication_rating'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // [R5.4] Find existing rating for this project
    const { data: existingRating, error: findError } = await supabase
      .from('ratings')
      .select('rating_id')
      .eq('project_id', body.project_id)
      .single();

    if (findError || !existingRating) {
      console.error('Existing rating lookup error:', findError);
      return NextResponse.json(
        { error: 'Rating not found for this project' },
        { status: 404 }
      );
    }

    // [R5.4] Prepare updated rating data - Fixed to match actual database schema
    const updatedRatingData = {
      rater_email: body.rater_email,
      project_success_rating: body.project_success_rating,
      vendor_overall_rating: body.overall_rating || null,
      vendor_quality_rating: body.quality_rating,
      vendor_communication_rating: body.communication_rating,
      what_went_well: body.positive_feedback || null,
      areas_for_improvement: body.improvement_feedback || null,
      updated_at: new Date().toISOString(),
    };

    // [R5.4] Update rating in database
    const { data: updatedRating, error: updateError } = await supabase
      .from('ratings')
      .update(updatedRatingData)
      .eq('rating_id', existingRating.rating_id)
      .select()
      .single();

    if (updateError) {
      console.error('Rating update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rating: updatedRating,
      message: 'Rating updated successfully'
    });

  } catch (error) {
    console.error('Update rating API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

