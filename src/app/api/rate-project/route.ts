// src/app/api/rate-project/route.ts

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Define the expected shape of the request body for type safety
interface RatingRequestBody {
  project_success_rating: number;
  quality_rating: number;
  communication_rating: number;
  positive_feedback?: string;
  improvement_feedback?: string;
  vendor_recommendation: boolean;
  timeline_status?: 'Early' | 'On-Time' | 'Late' | null; // [R-QW1] Timeline status from rating form
}

// Shared function to prepare data for the 'projects' table
const prepareProjectUpdateData = (body: RatingRequestBody) => {
  return {
    // Quantitative Ratings
    project_success_rating: body.project_success_rating,
    quality_rating: body.quality_rating,
    communication_rating: body.communication_rating,

    // Qualitative Feedback
    what_went_well: body.positive_feedback || null,
    areas_for_improvement: body.improvement_feedback || null,

    // Recommendation
    recommend_again: body.vendor_recommendation,

    // [R-QW1] Timeline Status
    timeline_status: body.timeline_status || null,

    // Timestamps
    updated_at: new Date().toISOString(),
  };
};


/**
 * Handles the initial submission of a rating for a project.
 * This should be used when a project is being rated for the first time.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/rate-project - Received body:', body);

    const updateData = {
      ...prepareProjectUpdateData(body),
      rating_date: new Date().toISOString(), // Set the rating date on initial submission
      // [R-QW1] Don't change status - keep it as 'closed' or whatever it currently is
      // The database has a status enum constraint, and 'rated' is not a valid value
    };

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('project_id', body.project_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project with new rating (POST):', error);
      return NextResponse.json({ error: 'Failed to save rating to project.', details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      project: data,
      message: 'Rating submitted successfully and project updated.'
    }, { status: 200 });

  } catch (error) {
    console.error('Rate project API error (POST):', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles updating an existing rating for a project.
 * This should be used when a user modifies a rating that was already submitted.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('PUT /api/rate-project - Received body:', body);

    const updateData = prepareProjectUpdateData(body);

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('project_id', body.project_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project rating (PUT):', error);
      // Check if the record was not found, which could be a legitimate 404
      if (error.code === 'PGRST116') { // PostgREST code for "Not found"
        return NextResponse.json({ error: 'Project not found to update.' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update project rating.', details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      project: data,
      message: 'Rating updated successfully.'
    }, { status: 200 });

  } catch (error) {
    console.error('Update rating API error (PUT):', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
