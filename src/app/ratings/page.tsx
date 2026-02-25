// [EPIC-002] Ratings — card grid matching vendor roster layout
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  vendor: { vendor_name: string; service_categories?: string } | null;
  client: { client_name: string } | null;
};

function ratingColor(score: number | null | undefined): string {
  if (!score) return 'var(--stm-muted-foreground)';
  if (score >= 8.5) return 'var(--stm-success)';
  if (score >= 7)   return 'var(--stm-primary)';
  if (score >= 5.5) return 'var(--stm-warning)';
  return 'var(--stm-error)';
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; pulse: boolean }> = {
  'Needs Review': { bg: 'color-mix(in srgb, var(--stm-error) 10%, transparent)', color: 'var(--stm-error)', border: 'color-mix(in srgb, var(--stm-error) 25%, transparent)', pulse: true },
  Incomplete:     { bg: 'color-mix(in srgb, var(--stm-warning) 10%, transparent)', color: 'var(--stm-warning)', border: 'color-mix(in srgb, var(--stm-warning) 25%, transparent)', pulse: false },
  Complete:       { bg: 'color-mix(in srgb, var(--stm-success) 10%, transparent)', color: 'var(--stm-success)', border: 'color-mix(in srgb, var(--stm-success) 25%, transparent)', pulse: false },
};

const FILTERS = ['All', 'Needs Review', 'Incomplete', 'Complete'];

export default function RatingsPage() {
  const [projects, setProjects] = useState<ProjectWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('Needs Review');
  const [selectedProject, setSelectedProject] = useState<ProjectWithRating | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/ratings')
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setProjects(data);
        else throw new Error(data.error || 'Failed to fetch ratings');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    'Needs Review': projects.filter(p => p.rating_status === 'Needs Review').length,
    Incomplete:     projects.filter(p => p.rating_status === 'Incomplete').length,
    Complete:       projects.filter(p => p.rating_status === 'Complete').length,
  }), [projects]);

  const filteredProjects = useMemo(() => {
    const list = selectedFilter === 'All'
      ? projects
      : projects.filter(p => p.rating_status === selectedFilter);
    return [...list].sort((a, b) => {
      if (a.rating_status === 'Needs Review' && b.rating_status !== 'Needs Review') return -1;
      if (a.rating_status !== 'Needs Review' && b.rating_status === 'Needs Review') return 1;
      return 0;
    });
  }, [projects, selectedFilter]);

  const handleProjectClick = (project: ProjectWithRating) => {
    setSelectedProject(project);
    if (project.rating_status === 'Complete') setIsViewModalOpen(true);
    else setIsSubmissionModalOpen(true);
  };

  const handleRatingSubmit = async (ratingData: RatingData) => {
    const response = await fetch('/api/rate-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ratingData),
    });
    if (!response.ok) throw new Error('Failed to submit rating');
    window.location.reload();
  };

  return (
    <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--stm-space-5)' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em', fontFamily: 'var(--stm-font-body)' }}>
            Project Ratings
          </div>
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', marginTop: '4px', fontFamily: 'var(--stm-font-body)' }}>
            {loading ? 'Loading...' : `${counts['Needs Review']} need review · ${counts['Incomplete']} incomplete · ${counts['Complete']} complete`}
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--stm-space-6)' }}>
        {FILTERS.map(f => {
          const isActive = selectedFilter === f;
          const count = f === 'All' ? projects.length : counts[f as keyof typeof counts];
          return (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              style={{
                padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
                border: `1px solid ${isActive ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
                backgroundColor: isActive ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
                color: isActive ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
              }}
            >
              {f}{count != null ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading ratings...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)', borderRadius: 'var(--stm-radius-lg)', color: 'var(--stm-error)', fontSize: '13px', fontFamily: 'var(--stm-font-body)' }}>
          {error}
        </div>
      )}

      {/* Card Grid */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {filteredProjects.map((project, idx) => {
            const rating = project.project_overall_rating_calc ? Number(project.project_overall_rating_calc) : null;
            const statusStyle = STATUS_STYLE[project.rating_status] ?? STATUS_STYLE['Incomplete'];
            const vendorName = project.vendor_name || project.vendor?.vendor_name;

            return (
              <div
                key={project.project_id}
                onClick={() => handleProjectClick(project)}
                style={{
                  backgroundColor: 'var(--stm-card)',
                  border: '1px solid var(--stm-border)',
                  borderRadius: 'var(--stm-radius-lg)',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 3,
                  animationDelay: `${idx * 0.03}s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--stm-primary)';
                  el.style.boxShadow = '0 6px 24px rgba(26,82,118,0.12)';
                  el.style.transform = 'translateY(-2px)';
                  const bar = el.querySelector('.rt-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--stm-border)';
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                  const bar = el.querySelector('.rt-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '0';
                }}
              >
                {/* Accent bar */}
                <div className="rt-accent-bar" style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0, width: '3px',
                  background: 'linear-gradient(180deg, var(--stm-primary), var(--stm-accent))',
                  opacity: 0, transition: 'opacity 0.18s', borderRadius: '3px 0 0 3px',
                }} />

                {/* Top: title + initial */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--stm-foreground)', marginBottom: '2px', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.project_title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.client_name || project.client?.client_name || 'No client'}
                    </div>
                  </div>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--stm-muted)',
                    fontSize: '16px', fontWeight: '800', color: 'var(--stm-primary)',
                    fontFamily: 'var(--stm-font-body)', opacity: 0.85,
                  }}>
                    {project.project_title.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 8px', borderRadius: '20px', marginBottom: '10px',
                  fontSize: '11px', fontWeight: '600', fontFamily: 'var(--stm-font-body)',
                  backgroundColor: statusStyle.bg, color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: 'currentColor',
                    boxShadow: statusStyle.pulse ? '0 0 5px currentColor' : 'none',
                  }} />
                  {project.rating_status}
                </div>

                {/* Score row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--stm-border)' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: ratingColor(rating), lineHeight: 1, fontFamily: 'var(--stm-font-body)' }}>
                      {rating ? rating.toFixed(1) : '—'}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--stm-muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px', fontFamily: 'var(--stm-font-body)' }}>
                      Rating
                    </div>
                  </div>
                  {vendorName && (
                    <div style={{ textAlign: 'right', maxWidth: '120px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {vendorName}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--stm-border)', fontFamily: 'var(--stm-font-body)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Vendor
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', fontSize: '13px' }}>
          No projects match this filter.
        </div>
      )}

      {/* Modals */}
      {selectedProject && selectedProject.rating && (
        <RatingViewModal
          project={selectedProject}
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedProject(null); }}
        />
      )}

      {selectedProject && (selectedProject.rating_status === 'Needs Review' || selectedProject.rating_status === 'Incomplete') && (
        <RatingSubmissionModal
          project={selectedProject}
          isOpen={isSubmissionModalOpen}
          onClose={() => { setIsSubmissionModalOpen(false); setSelectedProject(null); }}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}
