'use client';

import { useState, useEffect } from 'react';
import RatingViewModal from '@/components/modals/RatingViewModal';
import RatingSubmissionModal from '@/components/modals/RatingSubmissionModal';
import { Project } from '@/types';

interface RatingData {
  project_id: string;
  project_success_rating: number;
  quality_rating: number;
  communication_rating: number;
  positive_feedback: string;
  improvement_feedback: string;
  overall_rating: number;
}

// This is now the single source of truth for the shape of our data
type ProjectWithRating = Project & {
  rating: {
    rating_id: number;
    project_success_rating: number;
    vendor_quality_rating: number;
    vendor_communication_rating: number;
    what_went_well?: string;
    areas_for_improvement?: string;
    vendor_overall_rating: number;
    rating_date: string;
  } | null;
  rating_status: 'Complete' | 'Incomplete' | 'Needs Review';
  vendor: {
    vendor_name: string;
    service_categories?: string;
  } | null;
  client: {
    client_name: string;
  } | null;
};

export default function RatingsPage() {
  const [projects, setProjects] = useState<ProjectWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState<string>('Needs Review');

  // Modal states
  const [selectedProject, setSelectedProject] = useState<ProjectWithRating | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  // Fetch all projects with their ratings
  useEffect(() => {
    async function fetchProjectsWithRatings() {
      try {
        const response = await fetch('/api/ratings');
        const data = await response.json();
        if (response.ok) {
          setProjects(data);
        } else {
          throw new Error(data.error || 'Failed to fetch projects');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProjectsWithRatings();
  }, []);

  // Filter and sort projects based on selected filter
  const filteredProjects = projects
    .filter(project => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Needs Review') return project.rating_status === 'Needs Review';
      if (selectedFilter === 'Incomplete') return project.rating_status === 'Incomplete';
      if (selectedFilter === 'Complete') return project.rating_status === 'Complete';
      return true;
    })
    .sort((a, b) => {
      // Sort "Needs Review" projects first, then "Rated" projects
      if (a.rating_status === 'Needs Review' && b.rating_status !== 'Needs Review') return -1;
      if (a.rating_status !== 'Needs Review' && b.rating_status === 'Needs Review') return 1;
      return 0;
    });

  // Handle project card click
  const handleProjectClick = (project: ProjectWithRating) => {
    setSelectedProject(project);
    if (project.rating_status === 'Complete') {
      setIsViewModalOpen(true);
    } else {
      setIsSubmissionModalOpen(true);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (ratingData: RatingData) => {
    try {
      const response = await fetch('/api/rate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      // Refresh the projects list
      window.location.reload();
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
          }}>Project Ratings</h1>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            Review completed ratings and submit new project reviews
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1rem 1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Filter by Status
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['All', 'Needs Review', 'Incomplete', 'Complete'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: selectedFilter === filter ? '#1A5276' : '#d1d5db',
                    backgroundColor: selectedFilter === filter ? '#1A5276' : 'white',
                    color: selectedFilter === filter ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {filter}
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

        {!loading && !error && filteredProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b7280' }}>No projects found matching your criteria.</p>
          </div>
        )}

        {/* Project List - 2 Column Layout */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {filteredProjects.map((project) => (
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
                  backgroundColor: project.rating_status === 'Complete' ? '#1A5276' :
                    project.rating_status === 'Incomplete' ? '#F59E0B' : '#EF4444',
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
                      {project.project_overall_rating_calc || 'N/A'}
                    </span>

                    {/* Status Badge */}
                    <div style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: project.rating_status === 'Complete' ? '#dcfce7' :
                        project.rating_status === 'Incomplete' ? '#fef9c3' : '#fef2f2',
                      color: project.rating_status === 'Complete' ? '#166534' :
                        project.rating_status === 'Incomplete' ? '#92400e' : '#dc2626',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {project.rating_status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {filteredProjects.length} projects
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedProject && selectedProject.rating && (
        <RatingViewModal
          project={selectedProject}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedProject(null);
          }}
        />
      )}

      {selectedProject && (selectedProject.rating_status === 'Needs Review' || selectedProject.rating_status === 'Incomplete') && (
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
