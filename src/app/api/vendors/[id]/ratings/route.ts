// [R3] Vendor rating aggregation API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendorId = id;

    // [R3.1] Fetch all ratings for this vendor
    const { data: ratings, error } = await supabase
      .from('vendor_ratings')
      .select(`
        vendor_overall_rating,
        vendor_quality_rating,
        vendor_communication_rating,
        project_success_rating,
        recommend_again,
        project_on_time,
        project_on_budget,
        created_date
      `)
      .eq('vendor_id', vendorId)
      .order('created_date', { ascending: false });

    if (error) {
      console.error('Error fetching vendor ratings:', error);
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }

    if (!ratings || ratings.length === 0) {
      return NextResponse.json({
        vendorId,
        totalRatings: 0,
        averageRating: null,
        recommendationRate: null,
        onTimeRate: null,
        onBudgetRate: null,
        recentRatings: []
      });
    }

    // [R3.2] Calculate aggregated metrics
    const totalRatings = ratings.length;
    
    // Calculate average overall rating
    const validOverallRatings = ratings
      .filter(r => r.vendor_overall_rating && r.vendor_overall_rating > 0)
      .map(r => r.vendor_overall_rating);
    
    const averageRating = validOverallRatings.length > 0 
      ? validOverallRatings.reduce((sum, rating) => sum + rating, 0) / validOverallRatings.length
      : null;

    // Calculate recommendation rate (percentage who would recommend again)
    const recommendAgainCount = ratings.filter(r => r.recommend_again === true).length;
    const recommendationRate = totalRatings > 0 ? (recommendAgainCount / totalRatings) * 100 : null;

    // Calculate on-time delivery rate
    const onTimeCount = ratings.filter(r => r.project_on_time === true).length;
    const onTimeRate = totalRatings > 0 ? (onTimeCount / totalRatings) * 100 : null;

    // Calculate on-budget rate
    const onBudgetCount = ratings.filter(r => r.project_on_budget === true).length;
    const onBudgetRate = totalRatings > 0 ? (onBudgetCount / totalRatings) * 100 : null;

    // [R3.3] Get recent ratings for trend analysis
    const recentRatings = ratings.slice(0, 5).map(rating => ({
      overall: rating.vendor_overall_rating,
      quality: rating.vendor_quality_rating,
      communication: rating.vendor_communication_rating,
      project: rating.project_success_rating,
      date: rating.created_date
    }));

    return NextResponse.json({
      vendorId,
      totalRatings,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null, // Round to 1 decimal
      recommendationRate: recommendationRate ? Math.round(recommendationRate) : null,
      onTimeRate: onTimeRate ? Math.round(onTimeRate) : null,
      onBudgetRate: onBudgetRate ? Math.round(onBudgetRate) : null,
      recentRatings
    });

  } catch (error) {
    console.error('Error in vendor ratings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}