// [R5.3] Updated projects page with workflow-based action buttons
'use client';

import { useState, useEffect } from 'react';
import { Plus, Building, Filter, Upload } from 'lucide-react';
import { Project, ProjectsApiResponse } from '@/types';
import ProjectModal from '../../components/modals/ProjectModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // [R4] Enhanced filtering states - vendor and client filtering
  const [allVendorNames, setAllVendorNames] = useState<string[]>([]);
  const [selectedVendorNames, setSelectedVendorNames] = useState<string[]>([]);
  const [allClientNames, setAllClientNames] = useState<string[]>([]);
  const [selectedClientNames, setSelectedClientNames] = useState<string[]>([]);
  const [activeFilterTab, setActiveFilterTab] = useState<'vendors' | 'clients'>('vendors');

  // [R7.5] Fetch projects from Supabase API with enhanced filtering
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');

        const data: ProjectsApiResponse = await response.json();
        let projectList = data.projects || [];

        // Client-side filtering for vendor names
        if (selectedVendorNames.length > 0) {
          projectList = projectList.filter(project => {
            const vendorName = project.vendor_name;
            return vendorName && selectedVendorNames.some(selectedName =>
              vendorName.toLowerCase().includes(selectedName.toLowerCase())
            );
          });
        }

        // [R4] Client-side filtering for client names
        if (selectedClientNames.length > 0) {
          projectList = projectList.filter(project => {
            const clientName = project.client_name;
            return clientName && selectedClientNames.some(selectedName =>
              clientName.toLowerCase().includes(selectedName.toLowerCase())
            );
          });
        }

        setProjects(projectList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [selectedVendorNames, selectedClientNames]);

  // [R5.3] Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // [R4] Fetch all vendor and client names from projects on component mount
  useEffect(() => {
    async function fetchAllFilterOptions() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data: ProjectsApiResponse = await response.json();
          const allProjects = data.projects || [];

          // Extract vendor names
          const vendorNameSet = new Set<string>();
          const clientNameSet = new Set<string>();

          allProjects.forEach(project => {
            if (project.vendor_name && typeof project.vendor_name === 'string' && project.vendor_name.trim()) {
              vendorNameSet.add(project.vendor_name.trim());
            }
            if (project.client_name && typeof project.client_name === 'string' && project.client_name.trim()) {
              clientNameSet.add(project.client_name.trim());
            }
          });

          setAllVendorNames(Array.from(vendorNameSet).sort());
          setAllClientNames(Array.from(clientNameSet).sort());
        }
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    }

    fetchAllFilterOptions();
  }, []);

  // Toggle vendor name selection
  const toggleVendorName = (vendorName: string) => {
    setSelectedVendorNames(prev =>
      prev.includes(vendorName)
        ? prev.filter(name => name !== vendorName)
        : [...prev, vendorName]
    );
  };

  // [R4] Toggle client name selection
  const toggleClientName = (clientName: string) => {
    setSelectedClientNames(prev =>
      prev.includes(clientName)
        ? prev.filter(name => name !== clientName)
        : [...prev, clientName]
    );
  };

  // [R4] Clear all filters
  const clearAllFilters = () => {
    setSelectedVendorNames([]);
    setSelectedClientNames([]);
  };

  const handleSaveProject = async (updatedProject: Partial<Project>) => {
    if (!selectedProject) return;

    try {
      const response = await fetch('/api/admin/update-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'projects',
          idField: 'project_id',
          idValue: selectedProject.project_id,
          updates: updatedProject
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }

      // Optimistic update
      setProjects(prev => prev.map(p => p.project_id === selectedProject.project_id ? { ...p, ...updatedProject } : p));
      setIsModalOpen(false);
      setSelectedProject(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch('/api/admin/delete-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'projects',
          idField: 'project_id',
          idValue: projectId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      // Optimistic update
      setProjects(prev => prev.filter(p => p.project_id !== projectId));
      setIsModalOpen(false);
      setSelectedProject(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // [R4] Calculate filter summary
  const hasActiveFilters = selectedVendorNames.length > 0 || selectedClientNames.length > 0;
  const filterCount = selectedVendorNames.length + selectedClientNames.length;

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 'bold',
                color: '#1A5276'
              }}>Projects</h1>
              <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                View completed project details, ratings, and work samples
              </p>
            </div>
            <button className="btn-primary" style={{ fontSize: '0.875rem' }}>
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add New Project
            </button>
            <button
              className="btn-primary"
              style={{ fontSize: '0.875rem' }}
            >
              <Upload style={{ width: '1rem', height: '1rem' }} />
              Import CSV
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1rem 1.5rem' }}>
          {/* Filter Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                Filter Projects
              </h3>
              {hasActiveFilters && (
                <span style={{
                  backgroundColor: '#1A5276',
                  color: 'white',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {filterCount} active
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setActiveFilterTab('vendors')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: activeFilterTab === 'vendors' ? '#1A5276' : '#d1d5db',
                backgroundColor: activeFilterTab === 'vendors' ? '#1A5276' : 'white',
                color: activeFilterTab === 'vendors' ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Filter by Vendor ({allVendorNames.length})
            </button>
            <button
              onClick={() => setActiveFilterTab('clients')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: activeFilterTab === 'clients' ? '#1A5276' : '#d1d5db',
                backgroundColor: activeFilterTab === 'clients' ? '#1A5276' : 'white',
                color: activeFilterTab === 'clients' ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Filter by Client ({allClientNames.length})
            </button>
          </div>

          {/* Vendor Name Filter Buttons */}
          {activeFilterTab === 'vendors' && allVendorNames.length > 0 && (
            <div className="filter-group">
              <div className="filter-buttons">
                <button
                  onClick={() => setSelectedVendorNames([])}
                  className={`filter-btn ${selectedVendorNames.length === 0 ? 'active' : ''}`}
                >
                  All Vendors
                </button>
                {allVendorNames.map(vendorName => (
                  <button
                    key={vendorName}
                    onClick={() => toggleVendorName(vendorName)}
                    className={`filter-btn ${selectedVendorNames.includes(vendorName) ? 'active' : ''}`}
                  >
                    {vendorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Client Name Filter Buttons */}
          {activeFilterTab === 'clients' && allClientNames.length > 0 && (
            <div className="filter-group">
              <div className="filter-buttons">
                <button
                  onClick={() => setSelectedClientNames([])}
                  className={`filter-btn ${selectedClientNames.length === 0 ? 'active' : ''}`}
                >
                  All Clients
                </button>
                {allClientNames.map(clientName => (
                  <button
                    key={clientName}
                    onClick={() => toggleClientName(clientName)}
                    className={`filter-btn ${selectedClientNames.includes(clientName) ? 'active' : ''}`}
                  >
                    {clientName}
                  </button>
                ))}
              </div>
            </div>
          )}
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

        {!loading && !error && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
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
              <Building style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              No projects found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              {hasActiveFilters
                ? `No projects found for selected filters.`
                : 'No projects exist yet.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6B8F71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginRight: '0.5rem'
                }}
              >
                Clear Filters
              </button>
            )}
            <button style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6B8F71',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              Create New Project
            </button>
          </div>
        )}

        {/* Enhanced Project List */}
        {!loading && !error && projects.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {projects.map((project) => (
              <div
                key={project.project_id}
                className="list-card list-card-horizontal"
                onClick={() => handleProjectClick(project)}
              >
                {/* Project Avatar */}
                <div className="list-card-avatar">
                  <span className="list-card-avatar-text">
                    {project.project_title.charAt(0)}
                  </span>
                </div>

                {/* Main Project Info */}
                <div className="list-card-content">
                  <h3 className="list-card-title">
                    {project.project_title}
                  </h3>

                  {/* Line 2: Client + Vendor + Rating + Work Samples indicator */}
                  <div className="list-card-meta">
                    {/* Client Name */}
                    <span className="list-card-meta-primary">
                      {project.client_name || 'No Client'}
                    </span>

                    {/* Vendor Name */}
                    <span className="list-card-meta-item">
                      {project.vendor_name || 'Unassigned'}
                    </span>

                    {/* Project Rating */}
                    <div style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: project.project_overall_rating_calc ? '#dcfce7' : '#f3f4f6',
                      color: project.project_overall_rating_calc ? '#166534' : '#6b7280',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {project.project_overall_rating_calc ?
                        `${Number(project.project_overall_rating_calc).toFixed(1)}/10` :
                        'No rating'}
                    </div>

                    {/* Work Samples Indicator */}
                    {(project.what_went_well || project.areas_for_improvement) && (
                      <div style={{
                        padding: '0.125rem 0.5rem',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Has feedback
                      </div>
                    )}

                    {/* [R-QW1] Timeline Status Badge */}
                    {project.timeline_status && (
                      <div style={{
                        padding: '0.125rem 0.5rem',
                        backgroundColor:
                          project.timeline_status === 'Early' ? '#d1fae5' :
                          project.timeline_status === 'On-Time' ? '#dbeafe' :
                          '#fee2e2',
                        color:
                          project.timeline_status === 'Early' ? '#065f46' :
                          project.timeline_status === 'On-Time' ? '#1e40af' :
                          '#991b1b',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {project.timeline_status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Project Summary */}
        {!loading && !error && projects.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {projects.length} projects
              {hasActiveFilters && ` with active filters`}
              {selectedVendorNames.length > 0 && ` • Vendors: ${selectedVendorNames.join(', ')}`}
              {selectedClientNames.length > 0 && ` • Clients: ${selectedClientNames.join(', ')}`}
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Project Modal - Now Read-Only for Completed Projects */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          onSave={selectedProject.status === 'closed' ? undefined : handleSaveProject}
          onDelete={selectedProject.status === 'closed' ? undefined : handleDeleteProject}
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
