'use client';

import { useState, useEffect } from 'react';
import RatingSubmissionModal from '@/components/modals/RatingSubmissionModal';
import { Project } from '@/types';

interface RatingData {
  project_id: string;
  vendor_id: string;  // [R4.4] Required for rating insertion
  project_success_rating: number;
  quality_rating: number;
  communication_rating: number;
  positive_feedback: string;
  improvement_feedback: string;
  overall_rating: number;
  vendor_recommendation: boolean;  // [R4.4] Required for vendor recommendation
}

// [R4.4] Project type for rate-project page (submission workflow)
type ProjectForSubmission = Project & {
  rating_status: 'Incomplete' | 'Complete';  // [R1] Simplified binary status system
  vendor: {
    vendor_name: string;
    service_categories?: string;
  } | null;
  vendor_name?: string; // Support flattened vendor data from projects_with_vendor view
  client: {
    client_name: string;
  } | null;
};

// Helper function to safely get vendor name from different project structures
const getVendorName = (project: ProjectForSubmission): string => {
  // Try different possible vendor name locations
  if (project.vendor?.vendor_name) return project.vendor.vendor_name;
  if (project.vendor_name) return project.vendor_name;
  return 'No vendor assigned';
};

// Helper function to get brand colors based on rating status
const getStatusColors = (status: 'Incomplete' | 'Complete') => {  // [R1] Fixed type signature for binary system
  switch (status) {
    case 'Incomplete':
      return {
        primary: '#1A5276',      // Blue - Work in progress
        background: '#E8F4F8',   // Light blue background
        text: '#0F3A52'          // Dark blue text
      };
    case 'Complete':
      return {
        primary: '#6E6F71',      // Gray - Finished
        background: '#F1F1F1',   // Light gray background
        text: '#4A4B4D'          // Dark gray text
      };
  }
};

export default function RateProjectPage() {
  const [projects, setProjects] = useState<ProjectForSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState<string>('incomplete');


  // Modal states
  const [selectedProject, setSelectedProject] = useState<ProjectForSubmission | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  // [R4.4] Fetch projects that need rating submissions
  useEffect(() => {
    async function fetchProjectsForRating() {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        if (response.ok) {
          // [R4.4] Transform projects to include rating_status based on quantitative ratings completeness
          const projectsNeedingRating = (data.projects || [])
            .filter((project: Project) => {
              // Only include closed projects
              const status = project.status?.toLowerCase() || '';
              return status === 'closed' || status === 'completed' || status === 'complete' || status === 'finished' || status === 'done';
            })
            .map((project: Project) => {
              // Check if any of the 3 quantitative ratings are missing
              const hasIncompleteQuantitativeRatings =
                project.project_success_rating === null ||
                project.quality_rating === null ||
                project.communication_rating === null;

              // [R1] Simplified binary status: either Incomplete or Complete
              const rating_status: 'Incomplete' | 'Complete' = hasIncompleteQuantitativeRatings ? 'Incomplete' : 'Complete';

              return {
                ...project,
                rating_status
              };
            });

          setProjects(projectsNeedingRating);
        } else {
          throw new Error(data.error || 'Failed to fetch projects');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProjectsForRating();
  }, []);

  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'incomplete') return project.rating_status === 'Incomplete';
    if (selectedFilter === 'complete') return project.rating_status === 'Complete';
    return true; // [R1] Removed 'need-review' filter - no longer exists in binary system
  });

  // Sort projects with Incomplete first, then Complete
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // [R1] Simplified sorting: Incomplete projects first, then Complete
    if (a.rating_status === 'Incomplete' && b.rating_status !== 'Incomplete') return -1;
    if (a.rating_status !== 'Incomplete' && b.rating_status === 'Incomplete') return 1;

    // Secondary sort by client name for better organization
    const clientA = a.client?.client_name || '';
    const clientB = b.client?.client_name || '';
    return clientA.localeCompare(clientB);
  });

  // Handle project card click
  const handleProjectClick = (project: ProjectForSubmission) => {
    setSelectedProject(project);
    setIsSubmissionModalOpen(true);
  };

  // [R4.4] Handle rating submission using /api/rate-project endpoint
  const handleRatingSubmit = async (ratingData: RatingData) => {
    try {
      // [R4.4] Determine if this is a new rating (POST) or update (PUT)
      // Check if project already has any quantitative ratings
      const hasExistingRatings = selectedProject &&
        (selectedProject.project_success_rating !== null ||
          selectedProject.quality_rating !== null ||
          selectedProject.communication_rating !== null);

      const method = hasExistingRatings ? 'PUT' : 'POST';

      console.log('🔄 API Call Details:', {
        method,
        project_id: ratingData.project_id,
        vendor_id: ratingData.vendor_id,
        hasExistingRatings,
        endpoint: '/api/rate-project'
      });

      const response = await fetch('/api/rate-project', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error Response:', errorData);
        throw new Error(`Failed to submit rating: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Rating submitted successfully:', result);

      // Remove the rated project from the list
      setProjects(prev => prev.filter(p => p.project_id !== ratingData.project_id));

      // Close modal
      setIsSubmissionModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  };

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 'bold',
            color: '#1A5276'
          }}>Rate Projects</h1>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            Submit ratings for completed projects that need review
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1rem 1.5rem' }}>
          <div className="filter-group">
            <label className="filter-label">Filter by Status</label>
            <div className="filter-buttons">
              {[
                { label: 'Incomplete', value: 'incomplete' },
                { label: 'Complete', value: 'complete' },  // [R1] Removed "Needs Review" - no longer exists in binary system
                { label: 'All', value: 'all' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`filter-btn ${selectedFilter === filter.value ? 'active' : ''}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '2px solid #1A5276',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading projects...</p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#dc2626' }}>Error: {error}</p>
          </div>
        )}

        {!loading && !error && sortedProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <span style={{ fontSize: '1.5rem', color: '#9ca3af' }}>✓</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              All caught up!
            </h3>
            <p style={{ color: '#6b7280' }}>
              No projects need rating submissions at this time.
            </p>
          </div>
        )}

        {/* Project List - 2 Column Layout */}
        {!loading && !error && sortedProjects.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {sortedProjects.map((project) => (
              <div
                key={project.project_id}
                className="professional-card"
                onClick={() => handleProjectClick(project)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  minHeight: '5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Project Avatar */}
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: getStatusColors(project.rating_status).primary,
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>
                    {project.project_title.charAt(0)}
                  </span>
                </div>

                {/* Main Project Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {project.project_title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span style={{ fontWeight: '500', color: '#1A5276' }}>
                      {getVendorName(project)}
                    </span>

                    {/* Status Badge */}
                    <div style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: getStatusColors(project.rating_status).background,
                      color: getStatusColors(project.rating_status).text,
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {project.rating_status}
                    </div>
                  </div>
                </div>

                {/* Action Indicator */}
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '1rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && sortedProjects.length > 0 && (  // [R1] Use sortedProjects for accurate count
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''} need{sortedProjects.length === 1 ? 's' : ''} rating review
            </p>
          </div>
        )}
      </div>

      {/* Rating Submission Modal */}
      {selectedProject && (
        <RatingSubmissionModal
          project={selectedProject}
          isOpen={isSubmissionModalOpen}
          onClose={() => {
            setIsSubmissionModalOpen(false);
            setSelectedProject(null);
          }}
          onSubmit={handleRatingSubmit}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
