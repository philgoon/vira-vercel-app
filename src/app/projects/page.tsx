// [EPIC-002] Projects — card grid matching vendor roster layout
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Project, ProjectsApiResponse } from '@/types';
import ProjectModal from '../../components/modals/ProjectModal';

function ratingColor(score: number | null | undefined): string {
  if (!score) return 'var(--stm-muted-foreground)';
  if (score >= 8.5) return 'var(--stm-success)';
  if (score >= 7)   return 'var(--stm-primary)';
  if (score >= 5.5) return 'var(--stm-warning)';
  return 'var(--stm-error)';
}

const TIMELINE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Early:     { bg: 'color-mix(in srgb, var(--stm-success) 10%, transparent)', color: 'var(--stm-success)', border: 'color-mix(in srgb, var(--stm-success) 25%, transparent)' },
  'On-Time': { bg: 'color-mix(in srgb, var(--stm-primary) 10%, transparent)', color: 'var(--stm-primary)', border: 'color-mix(in srgb, var(--stm-primary) 25%, transparent)' },
  Late:      { bg: 'color-mix(in srgb, var(--stm-error) 10%, transparent)', color: 'var(--stm-error)', border: 'color-mix(in srgb, var(--stm-error) 25%, transparent)' },
};

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [filterTab, setFilterTab] = useState<'vendor' | 'client'>('vendor');

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch projects'))
      .then((data: ProjectsApiResponse) => setAllProjects(data.projects || []))
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const allVendors = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => { if (p.vendor_name) set.add(p.vendor_name); });
    return [...set].sort();
  }, [allProjects]);

  const allClients = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => { if (p.client_name) set.add(p.client_name); });
    return [...set].sort();
  }, [allProjects]);

  const projects = useMemo(() => {
    let list = allProjects;
    if (selectedVendor) list = list.filter(p => p.vendor_name === selectedVendor);
    if (selectedClient) list = list.filter(p => p.client_name === selectedClient);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.project_title.toLowerCase().includes(q) ||
        p.vendor_name?.toLowerCase().includes(q) ||
        p.client_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProjects, selectedVendor, selectedClient, search]);

  const handleSaveProject = async (updatedProject: Partial<Project>) => {
    if (!selectedProject) return;
    const response = await fetch('/api/admin/update-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: 'projects', idField: 'project_id', idValue: selectedProject.project_id, updates: updatedProject }),
    });
    if (!response.ok) {
      const d = await response.json();
      throw new Error(d.error || 'Failed to save project');
    }
    setAllProjects(prev => prev.map(p => p.project_id === selectedProject.project_id ? { ...p, ...updatedProject } : p));
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    const response = await fetch('/api/admin/delete-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: 'projects', idField: 'project_id', idValue: projectId }),
    });
    if (!response.ok) {
      const d = await response.json();
      throw new Error(d.error || 'Failed to delete project');
    }
    setAllProjects(prev => prev.filter(p => p.project_id !== projectId));
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const hasFilters = !!selectedVendor || !!selectedClient;

  return (
    <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--stm-space-5)' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em', fontFamily: 'var(--stm-font-body)' }}>
            Projects
          </div>
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', marginTop: '4px', fontFamily: 'var(--stm-font-body)' }}>
            {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}${hasFilters ? ' matching filters' : ' across all clients'}`}
          </div>
        </div>
      </div>

      {/* Search + Filter Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: 'var(--stm-space-6)' }}>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--stm-muted-foreground)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', fontFamily: 'var(--stm-font-body)',
              fontSize: '12px', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)',
              backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', outline: 'none',
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setFilterTab('vendor')}
            style={{
              padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
              border: `1px solid ${filterTab === 'vendor' ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
              borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
              backgroundColor: filterTab === 'vendor' ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
              color: filterTab === 'vendor' ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
            }}
          >
            Vendor {selectedVendor ? '·' : ''}
          </button>
          <button
            onClick={() => setFilterTab('client')}
            style={{
              padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
              border: `1px solid ${filterTab === 'client' ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
              borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
              backgroundColor: filterTab === 'client' ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
              color: filterTab === 'client' ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
            }}
          >
            Client {selectedClient ? '·' : ''}
          </button>
          {hasFilters && (
            <button
              onClick={() => { setSelectedVendor(''); setSelectedClient(''); }}
              style={{
                padding: '4px 10px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
                border: '1px solid color-mix(in srgb, var(--stm-error) 30%, transparent)',
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
                backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)',
                color: 'var(--stm-error)',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Vendor Pills */}
        {filterTab === 'vendor' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              onClick={() => setSelectedVendor('')}
              style={{
                padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
                border: `1px solid ${selectedVendor === '' ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
                backgroundColor: selectedVendor === '' ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
                color: selectedVendor === '' ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
              }}
            >All</button>
            {allVendors.map(v => (
              <button key={v} onClick={() => setSelectedVendor(v === selectedVendor ? '' : v)} style={{
                padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
                border: `1px solid ${selectedVendor === v ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
                backgroundColor: selectedVendor === v ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
                color: selectedVendor === v ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
              }}>{v}</button>
            ))}
          </div>
        )}

        {/* Client Pills */}
        {filterTab === 'client' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              onClick={() => setSelectedClient('')}
              style={{
                padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
                border: `1px solid ${selectedClient === '' ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
                backgroundColor: selectedClient === '' ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
                color: selectedClient === '' ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
              }}
            >All</button>
            {allClients.map(c => (
              <button key={c} onClick={() => setSelectedClient(c === selectedClient ? '' : c)} style={{
                padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
                border: `1px solid ${selectedClient === c ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.14s',
                backgroundColor: selectedClient === c ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
                color: selectedClient === c ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
              }}>{c}</button>
            ))}
          </div>
        )}
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
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading projects...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)', borderRadius: 'var(--stm-radius-lg)', color: 'var(--stm-error)', fontSize: '13px', fontFamily: 'var(--stm-font-body)' }}>
          {error}
        </div>
      )}

      {/* Project Grid */}
      {!loading && !error && projects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {projects.map((project, idx) => {
            const rating = project.project_overall_rating_calc ? Number(project.project_overall_rating_calc) : null;
            const timelineStyle = project.timeline_status ? TIMELINE_STYLE[project.timeline_status] : null;
            const hasFeedback = !!(project.what_went_well || project.areas_for_improvement);

            return (
              <div
                key={project.project_id}
                onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
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
                  const bar = el.querySelector('.pc-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--stm-border)';
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                  const bar = el.querySelector('.pc-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '0';
                }}
              >
                {/* Left accent bar on hover */}
                <div
                  className="pc-accent-bar"
                  style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, width: '3px',
                    background: 'linear-gradient(180deg, var(--stm-primary), var(--stm-accent))',
                    opacity: 0, transition: 'opacity 0.18s', borderRadius: '3px 0 0 3px',
                  }}
                />

                {/* Top: initial circle + title + client */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--stm-foreground)', marginBottom: '2px', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.project_title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.client_name || 'No client'}
                    </div>
                  </div>
                  {/* Initial circle */}
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

                {/* Badges row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                  {project.vendor_name && (
                    <div style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                      fontFamily: 'var(--stm-font-body)',
                      backgroundColor: 'var(--stm-muted)', color: 'var(--stm-muted-foreground)',
                      border: '1px solid var(--stm-border)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px',
                    }}>
                      {project.vendor_name}
                    </div>
                  )}
                  {timelineStyle && (
                    <div style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                      fontFamily: 'var(--stm-font-body)',
                      backgroundColor: timelineStyle.bg, color: timelineStyle.color,
                      border: `1px solid ${timelineStyle.border}`,
                    }}>
                      {project.timeline_status}
                    </div>
                  )}
                  {hasFeedback && (
                    <div style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                      fontFamily: 'var(--stm-font-body)',
                      backgroundColor: 'color-mix(in srgb, var(--stm-accent) 10%, transparent)',
                      color: 'var(--stm-accent)',
                      border: '1px solid color-mix(in srgb, var(--stm-accent) 25%, transparent)',
                    }}>
                      Feedback
                    </div>
                  )}
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
                  <div style={{ textAlign: 'right' }}>
                    {project.recommend_again != null && (
                      <div style={{ fontSize: '11px', fontWeight: '600', fontFamily: 'var(--stm-font-body)', color: project.recommend_again ? 'var(--stm-success)' : 'var(--stm-error)' }}>
                        {project.recommend_again ? 'Recommended' : 'Not Recommended'}
                      </div>
                    )}
                    <div style={{ fontSize: '10px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {project.status || 'active'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', fontSize: '13px' }}>
          No projects match your filters.
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
          onSave={selectedProject.status === 'closed' ? undefined : handleSaveProject}
          onDelete={selectedProject.status === 'closed' ? undefined : handleDeleteProject}
        />
      )}
    </div>
  );
}
