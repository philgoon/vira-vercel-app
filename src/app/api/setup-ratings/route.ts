// [R3] Simple API to insert sample rating data (manual approach)
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Insert sample ratings data directly
    const sampleRatings = [
      {
        rating_id: 'RATING-1',
        vendor_id: 'VEN-0007',
        project_id: 'PROJ-sample-1',
        client_name: 'CG Team',
        rater_email: 'test@example.com',
        project_success_rating: 9,
        project_on_time: true,
        project_on_budget: true,
        vendor_overall_rating: 8,
        vendor_quality_rating: 10,
        vendor_communication_rating: 7,
        recommend_again: true,
        feedback: 'Great quality work, very responsive',
        created_date: new Date().toISOString()
      },
      {
        rating_id: 'RATING-2',
        vendor_id: 'VEN-0030',
        project_id: 'PROJ-sample-2',
        client_name: 'TBA Canada',
        rater_email: 'test@example.com',
        project_success_rating: 10,
        project_on_time: true,
        project_on_budget: true,
        vendor_overall_rating: 10,
        vendor_quality_rating: 10,
        vendor_communication_rating: 10,
        recommend_again: true,
        feedback: 'Excellent vendor, highly recommended',
        created_date: new Date().toISOString()
      },
      {
        rating_id: 'RATING-3',
        vendor_id: 'VEN-0005',
        project_id: 'PROJ-sample-3',
        client_name: 'SGW Law',
        rater_email: 'test@example.com',
        project_success_rating: 8,
        project_on_time: false,
        project_on_budget: true,
        vendor_overall_rating: 7,
        vendor_quality_rating: 9,
        vendor_communication_rating: 6,
        recommend_again: true,
        feedback: 'Good quality but sometimes late on delivery',
        created_date: new Date().toISOString()
      },
      {
        rating_id: 'RATING-4',
        vendor_id: 'VEN-0007',
        project_id: 'PROJ-sample-4',
        client_name: 'CG Team',
        rater_email: 'test@example.com',
        project_success_rating: 8,
        project_on_time: true,
        project_on_budget: true,
        vendor_overall_rating: 9,
        vendor_quality_rating: 9,
        vendor_communication_rating: 8,
        recommend_again: true,
        feedback: 'Consistent quality and reliable',
        created_date: new Date().toISOString()
      },
      {
        rating_id: 'RATING-5',
        vendor_id: 'VEN-0030',
        project_id: 'PROJ-sample-5',
        client_name: 'TBA Canada',
        rater_email: 'test@example.com',
        project_success_rating: 9,
        project_on_time: true,
        project_on_budget: true,
        vendor_overall_rating: 9,
        vendor_quality_rating: 9,
        vendor_communication_rating: 9,
        recommend_again: true,
        feedback: 'Another great project completion',
        created_date: new Date().toISOString()
      }
    ];

    // Insert the ratings
    const { data, error } = await supabaseAdmin
      .from('vendor_ratings')
      .insert(sampleRatings);

    if (error) {
      console.error('Error inserting ratings:', error);
      return NextResponse.json({ 
        error: 'Failed to insert ratings',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Sample ratings inserted successfully',
      count: sampleRatings.length
    });

  } catch (error) {
    console.error('Failed to setup ratings:', error);
    return NextResponse.json({ 
      error: 'Failed to setup ratings',
      details: error
    }, { status: 500 });
  }
}