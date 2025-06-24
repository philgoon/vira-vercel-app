// [R5.1] Enhanced ViRA Match API - CRUD-based vendor matching with ratings data
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { genAI } from '@/lib/ai';

// [R5.1] Interface for vendor with enriched ratings data
interface EnrichedVendor {
  vendor_id: number;
  vendor_name: string;
  service_categories: string;
  specialties?: string;
  location?: string;
  pricing_notes?: string;
  contact_name?: string;
  contact_email?: string;
  ratings_analytics: {
    total_ratings: number;
    avg_project_success: number;
    avg_overall_rating: number;
    avg_quality_rating: number;
    avg_communication: number;
    on_time_percentage: number;
    on_budget_percentage: number;
    recommendation_rate: number;
    recent_feedback: string[];
  };
}

export async function POST(request: Request) {
  try {
    console.log('=== ViRA Enhanced Match API Called ===');
    
    // [R5.1] Parse enhanced request with simplified inputs
    const body = await request.json();
    console.log('Request body:', body);
    
    const { serviceCategory, projectScope } = body;

    if (!serviceCategory || !projectScope) {
      console.log('Missing required fields:', { serviceCategory, projectScope });
      return NextResponse.json(
        { error: 'Service category and project scope are required' }, 
        { status: 400 }
      );
    }

    // [R5.2] Step 1: CRUD query to find vendor candidates by service category
    console.log('Querying vendors with service category:', serviceCategory);
    
    const { data: candidates, error: vendorError } = await supabase
      .from('vendors')
      .select(`
        vendor_id,
        vendor_name,
        service_categories,
        specialties,
        location,
        pricing_notes,
        contact_name,
        contact_email,
        status
      `)
      .eq('status', 'Active');
      // Note: Removed .ilike filter since service_categories is an array

    console.log('Vendor query result:', { candidates: candidates?.length, error: vendorError });

    if (vendorError) {
      console.error('Vendor query error:', vendorError);
      return NextResponse.json(
        { error: 'Failed to fetch vendor candidates' }, 
        { status: 500 }
      );
    }

    if (!candidates || candidates.length === 0) {
      console.log('No vendors found');
      return NextResponse.json({
        recommendations: [],
        message: `No active vendors found`
      });
    }

    // Filter candidates by service category (since it's an array)
    const filteredCandidates = candidates.filter(vendor => {
      if (Array.isArray(vendor.service_categories)) {
        return vendor.service_categories.includes(serviceCategory);
      }
      return vendor.service_categories === serviceCategory;
    });

    console.log('Filtered candidates:', filteredCandidates.length);

    if (filteredCandidates.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: `No active vendors found for service category: ${serviceCategory}`
      });
    }

    // [R5.3] Step 2: Fetch and aggregate ratings data for each candidate
    console.log('Fetching ratings for candidates...');
    
    const enrichedVendors: EnrichedVendor[] = await Promise.all(
      filteredCandidates.map(async (vendor) => {
        const { data: ratings, error: ratingsError } = await supabase
          .from('ratings')
          .select(`
            project_success_rating,
            vendor_overall_rating,
            vendor_quality_rating,
            vendor_communication_rating,
            project_on_time,
            project_on_budget,
            recommend_again,
            what_went_well,
            areas_for_improvement
          `)
          .eq('vendor_id', vendor.vendor_id);

        if (ratingsError) {
          console.warn(`Ratings error for vendor ${vendor.vendor_id}:`, ratingsError);
        }

        // [R5.3] Calculate ratings analytics
        const analytics = {
          total_ratings: 0,
          avg_project_success: 0,
          avg_overall_rating: 0,
          avg_quality_rating: 0,
          avg_communication: 0,
          on_time_percentage: 0,
          on_budget_percentage: 0,
          recommendation_rate: 0,
          recent_feedback: [] as string[]
        };

        if (ratings && ratings.length > 0) {
          const validRatings = ratings.filter(r => r.project_success_rating && r.vendor_overall_rating);
          
          if (validRatings.length > 0) {
            analytics.total_ratings = validRatings.length;
            
            // Calculate averages
            analytics.avg_project_success = validRatings.reduce((sum, r) => sum + r.project_success_rating, 0) / validRatings.length;
            analytics.avg_overall_rating = validRatings.reduce((sum, r) => sum + r.vendor_overall_rating, 0) / validRatings.length;
            
            const qualityRatings = validRatings.filter(r => r.vendor_quality_rating);
            if (qualityRatings.length > 0) {
              analytics.avg_quality_rating = qualityRatings.reduce((sum, r) => sum + r.vendor_quality_rating, 0) / qualityRatings.length;
            }
            
            const commRatings = validRatings.filter(r => r.vendor_communication_rating);
            if (commRatings.length > 0) {
              analytics.avg_communication = commRatings.reduce((sum, r) => sum + r.vendor_communication_rating, 0) / commRatings.length;
            }
            
            // Calculate percentages
            analytics.on_time_percentage = (validRatings.filter(r => r.project_on_time).length / validRatings.length) * 100;
            analytics.on_budget_percentage = (validRatings.filter(r => r.project_on_budget).length / validRatings.length) * 100;
            analytics.recommendation_rate = (validRatings.filter(r => r.recommend_again).length / validRatings.length) * 100;
            
            // Collect recent positive feedback
            analytics.recent_feedback = validRatings
              .map(r => r.what_went_well)
              .filter(feedback => feedback && feedback.trim() !== '')
              .slice(0, 3);
          }
        }

        return {
          ...vendor,
          ratings_analytics: analytics
        };
      })
    );

    // [R5.4] Step 3: Send enriched data to Gemini AI for intelligent ranking
    console.log('Sending data to Gemini AI...');
    
    const prompt = `
You are ViRA (Vendor Intelligence & Recommendation Assistant), an expert AI system that analyzes vendor data to provide strategic recommendations.

PROJECT REQUIREMENTS:
- Service Category: ${serviceCategory}
- Project Scope: ${projectScope}

VENDOR CANDIDATES WITH PERFORMANCE DATA:
${enrichedVendors.map(vendor => `
VENDOR: ${vendor.vendor_name}
- Service Categories: ${vendor.service_categories || 'Not specified'}
- Specialties: ${vendor.specialties || 'Not specified'}
- Location: ${vendor.location || 'Not specified'}
- Pricing: ${vendor.pricing_notes || 'Not specified'}
- Contact: ${vendor.contact_name || 'Not available'} (${vendor.contact_email || 'No email'})

PERFORMANCE ANALYTICS:
- Total Projects Rated: ${vendor.ratings_analytics.total_ratings}
- Average Project Success: ${vendor.ratings_analytics.avg_project_success.toFixed(1)}/10
- Average Overall Rating: ${vendor.ratings_analytics.avg_overall_rating.toFixed(1)}/10
- Average Quality Rating: ${vendor.ratings_analytics.avg_quality_rating > 0 ? vendor.ratings_analytics.avg_quality_rating.toFixed(1) + '/10' : 'No data'}
- Average Communication: ${vendor.ratings_analytics.avg_communication > 0 ? vendor.ratings_analytics.avg_communication.toFixed(1) + '/10' : 'No data'}
- On-Time Delivery: ${vendor.ratings_analytics.on_time_percentage.toFixed(0)}%
- On-Budget Delivery: ${vendor.ratings_analytics.on_budget_percentage.toFixed(0)}%
- Client Recommendation Rate: ${vendor.ratings_analytics.recommendation_rate.toFixed(0)}%
- Recent Client Feedback: ${vendor.ratings_analytics.recent_feedback.length > 0 ? vendor.ratings_analytics.recent_feedback.join(' | ') : 'No feedback available'}
`).join('\n---\n')}

ANALYSIS REQUIREMENTS:
1. Evaluate each vendor's fit for the specific project scope and service category
2. Consider their performance history, reliability metrics, and client satisfaction
3. Weigh specialties and experience relevant to the project requirements
4. Factor in communication quality and project delivery track record
5. Assign a comprehensive ViRA Score (0-100% scale) based on:
   - Service category match (25%)
   - Project scope alignment (25%)
   - Performance history (30%)
   - Client satisfaction metrics (20%)

CRITICAL: You must return ONLY a valid JSON array, no explanatory text before or after.

OUTPUT FORMAT:
Return ONLY a valid JSON array of the top 3-5 vendors ranked by ViRA Score. Each vendor must include:
- vendorName: string (exact vendor name)
- viraScore: number (0-100, representing percentage match)
- reason: string (150-200 words explaining the score and recommendation)
- keyStrengths: array of 2-3 specific strengths
- considerations: string (any important considerations or potential concerns)

EXAMPLE FORMAT:
[
  {
    "vendorName": "Example Vendor Inc.",
    "viraScore": 87,
    "reason": "Comprehensive analysis explaining why this vendor scores highly...",
    "keyStrengths": ["Strong track record", "Excellent communication", "On-time delivery"],
    "considerations": "Higher pricing may require budget consideration"
  }
]

IMPORTANT: Return ONLY the JSON array above, no additional text or explanation.
    `;

    // [R5.4] Call Gemini API with enhanced prompt
    let geminiResponse;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      geminiResponse = await result.response.text();
      console.log('Gemini API response received');
    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError);
      // Fallback without AI analysis
      geminiResponse = null;
    }

    // [R5.5] Parse and validate AI response
    let recommendations;
    
    if (geminiResponse) {
      // Extract JSON from response (handle cases where AI adds explanatory text)
      let jsonString = geminiResponse.replace(/```json|```/g, '').trim();
      
      // Find JSON array in the response if it's mixed with text
      const jsonMatch = jsonString.match(/\[\s*{[\s\S]*}\s*\]/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      try {
        recommendations = JSON.parse(jsonString);
        
        // Validate the response structure
        if (!Array.isArray(recommendations)) {
          throw new Error('Response is not an array');
        }
        
        // Ensure all required fields are present
        recommendations = recommendations.filter(rec => 
          rec.vendorName && 
          typeof rec.viraScore === 'number' && 
          rec.reason && 
          Array.isArray(rec.keyStrengths)
        );
        
      } catch (parseError) {
        console.error('Failed to parse enhanced AI response:', parseError);
        console.error('Extracted JSON string:', jsonString);
        recommendations = null;
      }
    } else {
      recommendations = null;
    }
    
    // [R5.5] Fallback if AI parsing failed
    if (!recommendations || recommendations.length === 0) {
      console.log('Using fallback recommendations');
      recommendations = enrichedVendors
        .sort((a, b) => {
          // Sort by a combination of rating quality and quantity (0-100% scale)
          const scoreA = (a.ratings_analytics.avg_overall_rating * 6) + 
                        (a.ratings_analytics.recommendation_rate * 0.4) + 
                        Math.min(a.ratings_analytics.total_ratings * 5, 20);
          const scoreB = (b.ratings_analytics.avg_overall_rating * 6) + 
                        (b.ratings_analytics.recommendation_rate * 0.4) + 
                        Math.min(b.ratings_analytics.total_ratings * 5, 20);
          return scoreB - scoreA;
        })
        .slice(0, 5)
        .map(vendor => ({
          vendorName: vendor.vendor_name,
          viraScore: Math.min(100, Math.max(10, 
            (vendor.ratings_analytics.avg_overall_rating * 6) + 
            (vendor.ratings_analytics.recommendation_rate * 0.4) + 
            Math.min(vendor.ratings_analytics.total_ratings * 5, 20)
          )),
          reason: `${vendor.vendor_name} specializes in ${vendor.service_categories} with ${vendor.ratings_analytics.total_ratings} client ratings averaging ${vendor.ratings_analytics.avg_overall_rating.toFixed(1)}/10. They maintain ${vendor.ratings_analytics.on_time_percentage.toFixed(0)}% on-time delivery and ${vendor.ratings_analytics.recommendation_rate.toFixed(0)}% client recommendation rate.`,
          keyStrengths: [
            vendor.ratings_analytics.avg_overall_rating > 7 ? 'High client satisfaction' : 'Established track record',
            vendor.ratings_analytics.on_time_percentage > 80 ? 'Reliable delivery' : 'Professional service',
            vendor.specialties ? 'Specialized expertise' : 'Comprehensive capabilities'
          ],
          considerations: vendor.ratings_analytics.total_ratings < 3 ? 
            'Limited rating history - consider as emerging vendor' : 
            'Well-established vendor with proven track record'
        }));
    }

    // [R5.6] Return enhanced recommendations
    console.log('Returning recommendations:', recommendations.length);
    
    return NextResponse.json({ 
      recommendations,
      searchCriteria: {
        serviceCategory,
        projectScope
      },
      candidatesAnalyzed: enrichedVendors.length,
      totalRatingsConsidered: enrichedVendors.reduce((sum, v) => sum + v.ratings_analytics.total_ratings, 0)
    });

  } catch (error) {
    console.error('Enhanced ViRA Match API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating enhanced recommendations.' },
      { status: 500 }
    );
  }
}
