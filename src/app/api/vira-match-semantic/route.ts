import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/embeddings';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VendorMatch {
  vendor_id: string;
  vendor_name: string;
  service_categories: string[];
  skills: string;
  avg_overall_rating: number;
  availability_status: string;
  semantic_score: number;
  performance_score: number;
  availability_score: number;
  combined_score: number;
  match_confidence: number; // 0-100%
  match_reasoning: string;
  similar_projects: Array<{
    project_title: string;
    similarity: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { projectDescription, serviceCategory, projectScope } = await request.json();

    if (!projectDescription || !serviceCategory) {
      return NextResponse.json(
        { error: 'projectDescription and serviceCategory are required' },
        { status: 400 }
      );
    }

    console.log('🎯 Semantic ViRA Match Request:', {
      serviceCategory,
      descriptionLength: projectDescription.length,
      projectScope,
    });

    // Step 1: Generate embedding for the project description
    console.log('Step 1: Generating query embedding...');
    const queryEmbedding = await generateEmbedding(projectDescription);

    // Step 2: Use hybrid matching function
    console.log('Step 2: Finding matching vendors...');
    const { data: matches, error: matchError } = await supabaseAdmin.rpc(
      'match_vendors_hybrid',
      {
        query_embedding: queryEmbedding,
        service_category: serviceCategory !== 'all' ? serviceCategory : null,
        match_count: 10,
      }
    );

    if (matchError) {
      console.error('Match error:', matchError);
      return NextResponse.json(
        { error: `Failed to find matches: ${matchError.message}` },
        { status: 500 }
      );
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        matches: [],
        message: 'No matching vendors found',
        query_info: {
          used_semantic_search: true,
          category_filter: serviceCategory,
        },
      });
    }

    console.log(`Step 3: Found ${matches.length} potential matches`);

    // Step 3: Find similar past projects for each vendor
    const enrichedMatches: VendorMatch[] = [];

    for (const match of matches) {
      // Find similar projects this vendor has done
      const { data: similarProjects } = await supabaseAdmin.rpc(
        'match_similar_projects',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.6,
          match_count: 3,
        }
      );

      const vendorProjects = (similarProjects || [])
        .filter((p: any) => p.vendor_id === match.vendor_id)
        .map((p: any) => ({
          project_title: p.project_title,
          similarity: Math.round(p.similarity * 100),
        }));

      // Calculate match confidence (0-100%)
      const confidence = Math.round(match.combined_score * 100);

      enrichedMatches.push({
        ...match,
        match_confidence: confidence,
        match_reasoning: generateMatchReasoning(match, vendorProjects.length),
        similar_projects: vendorProjects,
      });
    }

    // Step 4: Generate AI recommendations for top 3 matches
    console.log('Step 4: Generating AI recommendations...');
    const top3Matches = enrichedMatches.slice(0, 3);
    
    const recommendations = await generateAIRecommendations(
      projectDescription,
      projectScope,
      top3Matches
    );

    return NextResponse.json({
      matches: enrichedMatches,
      recommendations,
      query_info: {
        used_semantic_search: true,
        category_filter: serviceCategory,
        total_matches: enrichedMatches.length,
      },
    });
  } catch (error) {
    console.error('Error in semantic ViRA Match:', error);
    return NextResponse.json(
      {
        error: 'Failed to process match request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate human-readable reasoning for why this vendor matches
 */
function generateMatchReasoning(
  match: any,
  similarProjectsCount: number
): string {
  const reasons: string[] = [];

  // Semantic similarity
  if (match.semantic_score > 0.8) {
    reasons.push('Excellent skill match for your requirements');
  } else if (match.semantic_score > 0.6) {
    reasons.push('Strong relevant experience');
  } else {
    reasons.push('Some relevant experience');
  }

  // Performance
  if (match.performance_score > 0.8) {
    reasons.push(`Outstanding track record (${(match.avg_overall_rating || 0).toFixed(1)}/10 rating)`);
  } else if (match.performance_score > 0.6) {
    reasons.push(`Solid performance history (${(match.avg_overall_rating || 0).toFixed(1)}/10 rating)`);
  }

  // Availability
  if (match.availability_status === 'Available') {
    reasons.push('Immediately available');
  } else if (match.availability_status === 'Limited') {
    reasons.push('Limited availability');
  }

  // Similar projects
  if (similarProjectsCount > 0) {
    reasons.push(`Has completed ${similarProjectsCount} similar project${similarProjectsCount > 1 ? 's' : ''}`);
  }

  return reasons.join(' • ');
}

/**
 * Generate AI-powered recommendations using GPT
 */
async function generateAIRecommendations(
  projectDescription: string,
  projectScope: string,
  topMatches: VendorMatch[]
): Promise<Array<{ vendor_name: string; reason: string }>> {
  if (topMatches.length === 0) {
    return [];
  }

  try {
    const vendorSummaries = topMatches.map((m, idx) => 
      `${idx + 1}. ${m.vendor_name}\n` +
      `   - Skills: ${m.skills || 'General services'}\n` +
      `   - Rating: ${(m.avg_overall_rating || 0).toFixed(1)}/10\n` +
      `   - Match Score: ${m.match_confidence}%\n` +
      `   - Similar Projects: ${m.similar_projects.length}`
    ).join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // TODO: Switch to gpt-5-mini when available
      messages: [
        {
          role: 'system',
          content: 'You are an expert vendor matchmaker. Provide concise, specific recommendations (100-150 words each) explaining why each vendor is a good fit for the project. Focus on their relevant experience, skills, and track record.',
        },
        {
          role: 'user',
          content: `Project: ${projectDescription}\n\nScope: ${projectScope}\n\nTop Vendors:\n${vendorSummaries}\n\nFor each vendor, explain in 100-150 words why they're a strong match for this specific project.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    // Parse AI response into recommendations per vendor
    const recommendations: Array<{ vendor_name: string; reason: string }> = [];
    
    topMatches.forEach((match) => {
      // Extract recommendation for this vendor from AI response
      const vendorSection = aiResponse.includes(match.vendor_name)
        ? aiResponse.split(match.vendor_name)[1]?.split('\n\n')[0]?.trim()
        : generateMatchReasoning(match, match.similar_projects.length);
      
      recommendations.push({
        vendor_name: match.vendor_name,
        reason: vendorSection || generateMatchReasoning(match, match.similar_projects.length),
      });
    });

    return recommendations;
  } catch (error) {
    console.error('Failed to generate AI recommendations:', error);
    // Fallback to rule-based reasoning
    return topMatches.map((match) => ({
      vendor_name: match.vendor_name,
      reason: generateMatchReasoning(match, match.similar_projects.length),
    }));
  }
}
