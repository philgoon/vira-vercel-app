import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    console.log('=== ANALYZE CATEGORIES DEBUG ===');

    // Get distinct project types with counts
    const { data: projectTypes, error: projectError } = await supabase
      .from('projects')
      .select('project_type')
      .not('project_type', 'is', null);

    if (projectError) {
      console.error('Error fetching project types:', projectError);
      return NextResponse.json({ error: 'Failed to fetch project types' }, { status: 500 });
    }

    // Get distinct vendor service categories with counts
    const { data: vendorCategories, error: vendorError } = await supabase
      .from('vendors')
      .select('service_categories')
      .not('service_categories', 'is', null);

    if (vendorError) {
      console.error('Error fetching vendor categories:', vendorError);
      return NextResponse.json({ error: 'Failed to fetch vendor categories' }, { status: 500 });
    }

    // Process project types with counts
    const projectTypeCounts: Record<string, number> = {};
    projectTypes?.forEach(project => {
      if (project.project_type) {
        projectTypeCounts[project.project_type] = (projectTypeCounts[project.project_type] || 0) + 1;
      }
    });

    // Process vendor service categories (handle arrays and comma-separated values)
    const vendorCategoryCounts: Record<string, number> = {};
    vendorCategories?.forEach(vendor => {
      if (vendor.service_categories) {
        let categories: string[] = [];

        // Handle if it's already an array or if it's a string
        if (Array.isArray(vendor.service_categories)) {
          categories = vendor.service_categories;
        } else if (typeof vendor.service_categories === 'string') {
          // Try parsing as JSON first, then fallback to comma-split
          try {
            categories = JSON.parse(vendor.service_categories);
          } catch {
            categories = vendor.service_categories.split(',').map(cat => cat.trim());
          }
        }

        categories.forEach(category => {
          if (category && category.trim()) {
            const cleanCategory = category.trim();
            vendorCategoryCounts[cleanCategory] = (vendorCategoryCounts[cleanCategory] || 0) + 1;
          }
        });
      }
    });

    // Generate alignment suggestions based on semantic similarity
    const alignmentSuggestions: Array<{
      projectType: string;
      suggestedVendorCategory: string;
      confidence: 'high' | 'medium' | 'low';
      reasoning: string;
    }> = [];

    // Simple semantic matching rules (can be enhanced with AI/ML later)
    const semanticMappings: Record<string, { categories: string[]; confidence: 'high' | 'medium' | 'low' }> = {
      'web_development': {
        categories: ['web development', 'website development', 'frontend development', 'backend development', 'full stack development'],
        confidence: 'high'
      },
      'mobile_app': {
        categories: ['mobile development', 'app development', 'ios development', 'android development'],
        confidence: 'high'
      },
      'data_analytics': {
        categories: ['data analysis', 'analytics', 'business intelligence', 'data science'],
        confidence: 'high'
      },
      'digital_marketing': {
        categories: ['marketing', 'digital marketing', 'social media marketing', 'seo', 'advertising'],
        confidence: 'high'
      },
      'consulting': {
        categories: ['business consulting', 'strategy consulting', 'management consulting'],
        confidence: 'medium'
      }
    };

    Object.entries(projectTypeCounts).forEach(([projectType]) => {
      const mapping = semanticMappings[projectType.toLowerCase()];
      if (mapping) {
        const matchingCategories = mapping.categories.filter(cat =>
          Object.keys(vendorCategoryCounts).some(vendorCat =>
            vendorCat.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(vendorCat.toLowerCase())
          )
        );

        if (matchingCategories.length > 0) {
          alignmentSuggestions.push({
            projectType,
            suggestedVendorCategory: matchingCategories[0],
            confidence: mapping.confidence,
            reasoning: `Semantic match based on ${matchingCategories.length} category overlap(s)`
          });
        }
      }
    });

    // Calculate alignment metrics
    const totalProjectTypes = Object.keys(projectTypeCounts).length;
    const totalVendorCategories = Object.keys(vendorCategoryCounts).length;
    const alignedTypes = alignmentSuggestions.length;
    const alignmentPercentage = totalProjectTypes > 0 ? Math.round((alignedTypes / totalProjectTypes) * 100) : 0;

    const analysis = {
      summary: {
        totalProjectTypes,
        totalVendorCategories,
        alignedTypes,
        alignmentPercentage,
        businessImpact: alignmentPercentage > 70 ? 'high' : alignmentPercentage > 40 ? 'medium' : 'low'
      },
      projectTypes: Object.entries(projectTypeCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({ type, count })),
      vendorCategories: Object.entries(vendorCategoryCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([category, count]) => ({ category, count })),
      alignmentSuggestions: alignmentSuggestions.sort((a, b) => {
        // Sort by confidence (high > medium > low) then by project type
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      }),
      recommendations: {
        immediate: alignmentPercentage < 50 ?
          'Create unified taxonomy to improve vendor-project matching' :
          'Fine-tune existing alignments for optimal automation',
        strategic: 'Implement automated vendor recommendation based on project type alignment',
        businessValue: `${alignmentPercentage}% taxonomy alignment enables ${alignedTypes} automated vendor matches`
      }
    };

    console.log('Category analysis completed:', {
      projectTypeCount: totalProjectTypes,
      vendorCategoryCount: totalVendorCategories,
      alignmentPercentage
    });

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Error in analyze-categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
