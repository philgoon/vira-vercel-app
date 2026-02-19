import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateProjectEmbedding, generateVendorEmbedding } from '@/lib/embeddings';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

export async function POST(request: Request) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const { target } = await request.json(); // 'projects' | 'vendors' | 'all'

    const results = {
      projects: { processed: 0, success: 0, errors: 0 },
      vendors: { processed: 0, success: 0, errors: 0 },
    };

    // Generate embeddings for projects
    if (target === 'projects' || target === 'all') {
      console.log('🔄 Generating embeddings for projects...');

      // Get projects with descriptions but no embeddings
      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select('project_id, project_title, project_description')
        .not('project_description', 'is', null)
        .is('description_embedding', null)
        .limit(50); // Process in batches

      if (projectsError) {
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }

      console.log(`Found ${projects?.length || 0} projects needing embeddings`);

      if (projects && projects.length > 0) {
        for (const project of projects) {
          results.projects.processed++;

          try {
            const embedding = await generateProjectEmbedding(
              project.project_title,
              project.project_description
            );

            const { error: updateError } = await supabaseAdmin
              .from('projects')
              .update({ description_embedding: embedding })
              .eq('project_id', project.project_id);

            if (updateError) {
              console.error(`Failed to update project ${project.project_id}:`, updateError);
              results.projects.errors++;
            } else {
              results.projects.success++;
              console.log(`✅ Generated embedding for project: ${project.project_title}`);
            }

            // Rate limiting: 100ms delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error processing project ${project.project_id}:`, error);
            results.projects.errors++;
          }
        }
      }
    }

    // Generate embeddings for vendors
    if (target === 'vendors' || target === 'all') {
      console.log('🔄 Generating embeddings for vendors...');

      // Get vendors with skills but no embeddings
      const { data: vendors, error: vendorsError } = await supabaseAdmin
        .from('vendors')
        .select('vendor_id, vendor_name, service_categories, skills')
        .not('skills', 'is', null)
        .is('skills_embedding', null)
        .limit(50); // Process in batches

      if (vendorsError) {
        throw new Error(`Failed to fetch vendors: ${vendorsError.message}`);
      }

      console.log(`Found ${vendors?.length || 0} vendors needing embeddings`);

      if (vendors && vendors.length > 0) {
        for (const vendor of vendors) {
          results.vendors.processed++;

          try {
            const serviceCategories = vendor.service_categories || [];
            const skills = vendor.skills || '';

            if (serviceCategories.length === 0 && !skills) {
              console.log(`⏭️  Skipping vendor ${vendor.vendor_name}: No skills/categories`);
              continue;
            }

            const embedding = await generateVendorEmbedding(serviceCategories, skills);

            const { error: updateError } = await supabaseAdmin
              .from('vendors')
              .update({ skills_embedding: embedding })
              .eq('vendor_id', vendor.vendor_id);

            if (updateError) {
              console.error(`Failed to update vendor ${vendor.vendor_id}:`, updateError);
              results.vendors.errors++;
            } else {
              results.vendors.success++;
              console.log(`✅ Generated embedding for vendor: ${vendor.vendor_name}`);
            }

            // Rate limiting: 100ms delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error processing vendor ${vendor.vendor_id}:`, error);
            results.vendors.errors++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Embedding generation complete',
      results,
    });
  } catch (error) {
    console.error('Error in generate-embeddings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    // Count projects with/without embeddings
    const { count: projectsTotal } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('project_description', 'is', null);

    const { count: projectsWithEmbeddings } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('description_embedding', 'is', null);

    // Count vendors with/without embeddings
    const { count: vendorsTotal } = await supabaseAdmin
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .not('skills', 'is', null);

    const { count: vendorsWithEmbeddings } = await supabaseAdmin
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .not('skills_embedding', 'is', null);

    return NextResponse.json({
      projects: {
        total: projectsTotal || 0,
        with_embeddings: projectsWithEmbeddings || 0,
        missing_embeddings: (projectsTotal || 0) - (projectsWithEmbeddings || 0),
      },
      vendors: {
        total: vendorsTotal || 0,
        with_embeddings: vendorsWithEmbeddings || 0,
        missing_embeddings: (vendorsTotal || 0) - (vendorsWithEmbeddings || 0),
      },
    });
  } catch (error) {
    console.error('Error checking embedding status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
