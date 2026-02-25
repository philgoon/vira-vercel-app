// [EPIC-002] ViRA Match API — Claude Haiku 4.5 with pre-scoring
// Pre-scores all candidates numerically, sends top 5 to Haiku for reasoning.
// Target latency: 5-10s (down from 67s with GPT-5-mini)
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { anthropic } from '@/lib/ai';

interface VendorProfile {
  vendor_id: string;
  vendor_name: string;
  vendor_type?: string;
  service_categories?: string[];
  skills?: string;
  pricing_structure?: string;
  rate_cost?: string;
  availability_status?: string;
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
  preScore: number;
}

function computePreScore(perf: VendorPerformance, maxProjects: number): number {
  const rating = perf.avg_overall_rating ?? 0;
  const recPct = perf.recommendation_pct ?? 0;
  const projectWeight = maxProjects > 0 ? (perf.rated_projects ?? 0) / maxProjects : 0;
  return (rating / 10) * 40 + (recPct / 100) * 40 + projectWeight * 20;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceCategory, projectScope } = body;

    if (!serviceCategory || !projectScope) {
      return NextResponse.json(
        { error: 'Service category and project scope are required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch all active vendors, filter by category in JS
    const { data: allVendors, error: profilesError } = await supabaseAdmin
      .from('vendors')
      .select('vendor_id, vendor_name, vendor_type, service_categories, skills, pricing_structure, rate_cost, availability_status')
      .eq('status', 'active');

    if (profilesError) throw new Error(`Failed to fetch vendor profiles: ${profilesError.message}`);

    const vendorProfiles = (allVendors || []).filter(vendor => {
      if (vendor.service_categories && Array.isArray(vendor.service_categories)) {
        return vendor.service_categories.includes(serviceCategory);
      }
      return vendor.vendor_type?.toLowerCase().includes(serviceCategory.toLowerCase());
    });

    if (vendorProfiles.length === 0) {
      return NextResponse.json({
        matches: [],
        recommendations: [],
        query_info: { category_filter: serviceCategory, total_matches: 0, candidates_analyzed: 0 },
      });
    }

    const vendorIds = vendorProfiles.map(v => v.vendor_id);

    // Step 2: Concurrently fetch performance + history
    const [performanceResult, historyResult] = await Promise.all([
      supabaseAdmin.from('vendor_performance').select('*').in('vendor_id', vendorIds),
      supabaseAdmin
        .from('projects_with_vendor')
        .select('vendor_id, project_title, what_went_well, areas_for_improvement, project_overall_rating_calc')
        .in('vendor_id', vendorIds),
    ]);

    if (performanceResult.error) throw new Error(`Failed to fetch performance: ${performanceResult.error.message}`);
    if (historyResult.error) throw new Error(`Failed to fetch history: ${historyResult.error.message}`);

    const performances = performanceResult.data || [];
    const histories = historyResult.data || [];

    // Step 3: Enrich and pre-score all candidates
    const allEnriched: EnrichedVendor[] = vendorProfiles.map(profile => {
      const performance = performances.find(p => p.vendor_id === profile.vendor_id) || {};
      const history = histories.filter(h => h.vendor_id === profile.vendor_id);
      return {
        profile: {
          vendor_id: profile.vendor_id,
          vendor_name: profile.vendor_name,
          vendor_type: profile.vendor_type,
          service_categories: profile.service_categories,
          skills: profile.skills,
          pricing_structure: profile.pricing_structure,
          rate_cost: profile.rate_cost,
          availability_status: profile.availability_status,
        },
        performance: {
          avg_success: performance.avg_success,
          avg_quality: performance.avg_quality,
          avg_communication: performance.avg_communication,
          avg_overall_rating: performance.avg_overall_rating,
          recommendation_pct: performance.recommendation_pct,
          rated_projects: performance.rated_projects,
        },
        history: history.map(h => ({
          project_title: h.project_title,
          what_went_well: h.what_went_well,
          areas_for_improvement: h.areas_for_improvement,
          project_overall_rating_calc: h.project_overall_rating_calc,
        })),
        preScore: 0,
      };
    });

    const maxProjects = Math.max(...allEnriched.map(v => v.performance.rated_projects ?? 0), 1);
    allEnriched.forEach(v => {
      v.preScore = computePreScore(v.performance, maxProjects);
    });

    // Step 4: Send top 5 candidates to Haiku for reasoning
    const topCandidates = [...allEnriched].sort((a, b) => b.preScore - a.preScore).slice(0, 5);

    const prompt = `You are ViRA (Vendor Intelligence & Recommendation Assistant). Analyze these vendor candidates for a project and return ranked recommendations.

PROJECT:
- Service Category: ${serviceCategory}
- Scope: "${projectScope}"

VENDOR CANDIDATES:
${topCandidates.map(vendor => `
VENDOR: ${vendor.profile.vendor_name}
- Services: ${vendor.profile.service_categories?.join(', ') || vendor.profile.vendor_type || 'Not specified'}
- Skills: ${vendor.profile.skills || 'Not specified'}
- Pricing: ${vendor.profile.pricing_structure || 'Not specified'} | Rate: ${vendor.profile.rate_cost || 'Contact for pricing'}
- Rated Projects: ${vendor.performance.rated_projects ?? 'N/A'} | Avg Rating: ${vendor.performance.avg_overall_rating?.toFixed(1) ?? 'N/A'}/10 | Recommend Rate: ${vendor.performance.recommendation_pct?.toFixed(0) ?? 'N/A'}%
- Quality: ${vendor.performance.avg_quality?.toFixed(1) ?? 'N/A'}/10 | Communication: ${vendor.performance.avg_communication?.toFixed(1) ?? 'N/A'}/10
- Recent Projects:
${vendor.history.slice(0, 2).map(h => `  * "${h.project_title}" (${h.project_overall_rating_calc?.toFixed(1) ?? 'N/A'}/10): Went well: "${h.what_went_well || 'N/A'}" | Improve: "${h.areas_for_improvement || 'N/A'}"`).join('\n') || '  * No history available'}
`).join('\n---\n')}

Return a JSON array of all ${topCandidates.length} vendors ranked by ViRA score. Scoring weights: Project Fit 40%, Performance & Reliability 40%, Qualitative Match 20%.

Return ONLY valid JSON, no other text:
[
  {
    "vendorName": "exact name",
    "viraScore": 0-100,
    "reason": "150-200 word explanation referencing specific data",
    "keyStrengths": ["strength 1", "strength 2", "strength 3"],
    "considerations": "any concerns or caveats",
    "pricingStructure": "pricing structure or Not specified",
    "rateCost": "rate info or Contact for pricing",
    "totalProjects": 0,
    "clientNames": [],
    "category": "${serviceCategory}"
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : '';

    let recommendations: any[] = [];
    try {
      // Try direct parse first, then fall back to regex extraction
      const trimmed = aiResponse.trim();
      if (trimmed.startsWith('[')) {
        recommendations = JSON.parse(trimmed);
      } else {
        const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('JSON parse failed:', parseError, '\nResponse:', aiResponse.substring(0, 500));
      recommendations = [];
    }

    if (!Array.isArray(recommendations)) recommendations = [];

    const topCandidateIds = new Set(topCandidates.map(v => v.profile.vendor_id));

    const matches = recommendations.map((rec: any) => {
      const enriched = allEnriched.find(v => v.profile.vendor_name === rec.vendorName);
      return {
        vendorName: rec.vendorName,
        vendor_id: enriched?.profile.vendor_id,
        availability_status: enriched?.profile.availability_status,
        category: serviceCategory,
        service_categories: [serviceCategory],
        skills: enriched?.profile.skills,
        avg_overall_rating: enriched?.performance.avg_overall_rating,
        viraScore: rec.viraScore,
        reason: rec.reason,
        keyStrengths: rec.keyStrengths,
        considerations: rec.considerations,
        pricingStructure: rec.pricingStructure,
        rateCost: rec.rateCost,
        totalProjects: rec.totalProjects,
        clientNames: rec.clientNames,
      };
    });

    // Remaining vendors not sent to AI — shown with pre-score only
    const remainingVendors = allEnriched
      .filter(v => !topCandidateIds.has(v.profile.vendor_id))
      .sort((a, b) => b.preScore - a.preScore)
      .map(v => ({
        vendorName: v.profile.vendor_name,
        vendor_id: v.profile.vendor_id,
        category: serviceCategory,
        preScore: Math.round(v.preScore),
        totalProjects: v.performance.rated_projects ?? 0,
        avgRating: v.performance.avg_overall_rating ?? null,
        recommendationPct: v.performance.recommendation_pct ?? null,
        pricingStructure: v.profile.pricing_structure ?? null,
        rateCost: v.profile.rate_cost ?? null,
      }));

    return NextResponse.json({
      matches,
      recommendations,
      remainingVendors,
      query_info: {
        category_filter: serviceCategory,
        total_matches: recommendations.length,
        candidates_analyzed: allEnriched.length,
        sent_to_ai: topCandidates.length,
      },
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
