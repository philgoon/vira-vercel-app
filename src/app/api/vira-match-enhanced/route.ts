// [R7.0] Final Refactored ViRA Match API - Uses a 3-source data enrichment strategy
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { genAI } from '@/lib/ai';

// Define comprehensive interfaces for our data structures
interface VendorProfile {
  vendor_id: string;
  vendor_name: string;
  vendor_type?: string;
  skills?: string;
  pricing_structure?: string;
}

interface VendorPerformance {
  avg_success?: number;
  avg_quality?: number;
  avg_communication?: number;
  avg_overall_rating?: number;
  recommendation_pct?: number;
  rated_projects?: number;
}

interface ProjectHistory {
  project_title: string;
  what_went_well?: string;
  areas_for_improvement?: string;
  project_overall_rating_calc?: number;
}

interface EnrichedVendor {
  profile: VendorProfile;
  performance: VendorPerformance;
  history: ProjectHistory[];
}

export async function POST(request: Request) {
  try {
    console.log('=== ViRA Final Refactored Match API Called ===');

    const body = await request.json();
    const { serviceCategory, projectScope } = body;

    if (!serviceCategory || !projectScope) {
      return NextResponse.json({ error: 'Service category and project scope are required' }, { status: 400 });
    }

    // Step 1: Get Base Candidate Profiles from 'vendors' table
    console.log(`Step 1: Fetching candidate profiles for category: ${serviceCategory}`);
    const { data: vendorProfiles, error: profilesError } = await supabase
      .from('vendors')
      .select('vendor_id, vendor_name, vendor_type, skills, pricing_structure')
      .eq('status', 'active')
      .ilike('vendor_type', `%${serviceCategory}%`);

    if (profilesError) throw new Error(`Failed to fetch vendor profiles: ${profilesError.message}`);
    if (!vendorProfiles || vendorProfiles.length === 0) {
      return NextResponse.json({ recommendations: [], message: `No active vendors found for service category: ${serviceCategory}` });
    }
    console.log(`Found ${vendorProfiles.length} candidate profiles.`);

    const vendorIds = vendorProfiles.map(v => v.vendor_id);

    // Step 2: Concurrently fetch performance summaries and project histories
    console.log('Step 2: Fetching performance summaries and project histories...');
    const [performanceResult, historyResult] = await Promise.all([
      supabase.from('vendor_performance').select('*').in('vendor_id', vendorIds),
      supabase.from('projects_with_vendor').select('vendor_id, project_title, what_went_well, areas_for_improvement, project_overall_rating_calc').in('vendor_id', vendorIds)
    ]);

    if (performanceResult.error) throw new Error(`Failed to fetch vendor performance: ${performanceResult.error.message}`);
    if (historyResult.error) throw new Error(`Failed to fetch project history: ${historyResult.error.message}`);

    const performances = performanceResult.data;
    const histories = historyResult.data;

    // Step 3: Consolidate data into a master profile for each vendor
    console.log('Step 3: Consolidating data into master profiles...');
    const enrichedVendors: EnrichedVendor[] = vendorProfiles.map(profile => {
      const performance = performances.find(p => p.vendor_id === profile.vendor_id) || {};
      const history = histories.filter(h => h.vendor_id === profile.vendor_id);

      return {
        profile: {
          vendor_id: profile.vendor_id,
          vendor_name: profile.vendor_name,
          vendor_type: profile.vendor_type,
          skills: profile.skills,
          pricing_structure: profile.pricing_structure
        },
        performance: {
          avg_success: performance.avg_success,
          avg_quality: performance.avg_quality,
          avg_communication: performance.avg_communication,
          avg_overall_rating: performance.avg_overall_rating,
          recommendation_pct: performance.recommendation_pct,
          rated_projects: performance.rated_projects
        },
        history: history.map(h => ({
          project_title: h.project_title,
          what_went_well: h.what_went_well,
          areas_for_improvement: h.areas_for_improvement,
          project_overall_rating_calc: h.project_overall_rating_calc
        }))
      };
    });

    // Step 4: Build the ultimate high-context AI prompt
    console.log('Step 4: Building high-context prompt for Gemini AI...');
    const prompt = `
You are ViRA (Vendor Intelligence & Recommendation Assistant), an expert AI system that analyzes comprehensive vendor data to provide strategic recommendations.

PROJECT REQUIREMENTS:
- Service Category: ${serviceCategory}
- Project Scope: "${projectScope}"

VENDOR CANDIDATES WITH FULL CONTEXT:
---
${enrichedVendors.map(vendor => `
VENDOR: ${vendor.profile.vendor_name}

DESCRIPTIVE PROFILE:
- Primary Service Category: ${vendor.profile.vendor_type || 'Not specified'}
- Key Skills: ${vendor.profile.skills || 'Not specified'}
- Typical Pricing: ${vendor.profile.pricing_structure || 'Not specified'}

PERFORMANCE SUMMARY:
- Total Rated Projects: ${vendor.performance.rated_projects ?? 'N/A'}
- Average Overall Rating: ${vendor.performance.avg_overall_rating?.toFixed(1) ?? 'N/A'}/10
- Client Recommendation Rate: ${vendor.performance.recommendation_pct?.toFixed(0) ?? 'N/A'}%
- Avg Quality: ${vendor.performance.avg_quality?.toFixed(1) ?? 'N/A'}/10 | Avg Communication: ${vendor.performance.avg_communication?.toFixed(1) ?? 'N/A'}/10

DETAILED PROJECT HISTORY (Sample):
${vendor.history.slice(0, 3).map(h => `
  - Project: "${h.project_title}" (Rating: ${h.project_overall_rating_calc?.toFixed(1) ?? 'N/A'})
    - What Went Well: "${h.what_went_well || 'N/A'}"
    - Areas for Improvement: "${h.areas_for_improvement || 'N/A'}"
`).join('') || '  - No detailed project history available.'}
`).join('\n---\n')}

ANALYSIS REQUIREMENTS:
1.  **Project Fit (40%):** How well do the vendor's skills and described services match the project scope?
2.  **Performance & Reliability (40%):** Analyze their quantitative history. Are they consistent? Do they have a high recommendation rate and strong overall ratings?
3.  **Qualitative Match (20%):** Read the "What Went Well" and "Areas for Improvement" sections. Does their past feedback suggest they would be a good cultural and process fit for this specific project?
4.  **Final Score:** Assign a comprehensive ViRA Score (0-100) based on your integrated analysis.

CRITICAL: You must return ONLY a valid JSON array, no explanatory text before or after.

OUTPUT FORMAT (JSON array of top 3-5 vendors):
- vendorName: string (exact vendor name)
- viraScore: number (0-100)
- reason: string (150-200 words explaining the score, referencing specifics from their profile, performance, and history)
- keyStrengths: array of 2-3 specific strengths, derived from the data
- considerations: string (any important considerations or potential concerns based on the data)

EXAMPLE:
[
  {
    "vendorName": "Example Vendor Inc.",
    "viraScore": 92,
    "reason": "This vendor is an exceptional match due to their deep expertise in [Skill], reflected in their project history. Their average overall rating of 9.1/10 across 25 projects shows consistent high performance. Positive feedback on projects like 'X' and 'Y' specifically mention their proactive communication, which aligns well with the stated project needs.",
    "keyStrengths": ["High Client Satisfaction (9.1 avg rating)", "Proven On-time Delivery", "Specific expertise in [Skill]"],
    "considerations": "Their pricing structure is premium, which should be aligned with the project budget."
  }
]
    `;

    // Step 5: Call Gemini API and process the response
    console.log('Step 5: Calling Gemini and processing response...');
    let recommendations;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const geminiResponse = await result.response.text();
      const jsonMatch = geminiResponse.match(/\[\s*{[\s\S]*}\s*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in AI response");
      recommendations = JSON.parse(jsonMatch[0]);
    } catch (aiError) {
      console.error('AI processing failed:', aiError);
      // Fallback logic can be implemented here if needed
      recommendations = [];
    }

    // Final validation of the AI response
    if (!Array.isArray(recommendations)) {
      console.error("AI response was not a valid array, returning empty.");
      recommendations = [];
    }

    console.log(`Returning ${recommendations.length} recommendations.`);
    return NextResponse.json({
      recommendations,
      searchCriteria: { serviceCategory, projectScope },
      candidatesAnalyzed: enrichedVendors.length,
    });

  } catch (error) {
    console.error('ViRA Match API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'An error occurred while generating recommendations.', details: errorMessage },
      { status: 500 }
    );
  }
}
