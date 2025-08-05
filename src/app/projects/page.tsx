// [R5.3] Updated projects page with workflow-based action buttons
'use client';

import { useState, useEffect } from 'react';
import { Plus, Building } from 'lucide-react';
import { Project, ProjectsApiResponse } from '@/types';
import ProjectModal from '../../components/modals/ProjectModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Vendor name filter states
  const [allVendorNames, setAllVendorNames] = useState<string[]>([]);
  const [selectedVendorNames, setSelectedVendorNames] = useState<string[]>([]);

  // [R7.5] Fetch projects from Supabase API
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

        setProjects(projectList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [selectedVendorNames]);

  // [R5.3] Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch all vendor names from projects on component mount
  useEffect(() => {
    async function fetchAllVendorNames() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data: ProjectsApiResponse = await response.json();
          const allProjects = data.projects || [];

          const vendorNameSet = new Set<string>();
          allProjects.forEach(project => {
            if (project.vendor_name && typeof project.vendor_name === 'string' && project.vendor_name.trim()) {
              vendorNameSet.add(project.vendor_name.trim());
            }
          });

          setAllVendorNames(Array.from(vendorNameSet).sort());
        }
      } catch (err) {
        console.error('Failed to fetch vendor names:', err);
      }
    }

    fetchAllVendorNames();
  }, []);

  // Toggle vendor name selection
  const toggleVendorName = (vendorName: string) => {
    setSelectedVendorNames(prev =>
      prev.includes(vendorName)
        ? prev.filter(name => name !== vendorName)
        : [...prev, vendorName]
    );
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
                Manage and track your project portfolio
              </p>
            </div>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6B8F71',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add New Project
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1rem 1.5rem' }}>
          {/* Vendor Name Filter Buttons */}
          {allVendorNames.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Filter by Vendor Name
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedVendorNames([])}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: selectedVendorNames.length === 0 ? '#1A5276' : '#d1d5db',
                    backgroundColor: selectedVendorNames.length === 0 ? '#1A5276' : 'white',
                    color: selectedVendorNames.length === 0 ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  All Vendors
                </button>
                {allVendorNames.map(vendorName => (
                  <button
                    key={vendorName}
                    onClick={() => toggleVendorName(vendorName)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      border: '1px solid',
                      borderColor: selectedVendorNames.includes(vendorName) ? '#1A5276' : '#d1d5db',
                      backgroundColor: selectedVendorNames.includes(vendorName) ? '#1A5276' : 'white',
                      color: selectedVendorNames.includes(vendorName) ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {vendorName}
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
              {selectedVendorNames.length === 0 ? 'No projects exist yet.' : `No projects found for selected vendors.`}
            </p>
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

        {/* Project List - 2 Column Layout matching vendor page style */}
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
                className="professional-card"
                onClick={() => handleProjectClick(project)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  minHeight: '5rem',
                  cursor: 'pointer'
                }}
              >
                {/* Project Avatar */}
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#1A5276',
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
                  {/* Line 1: Clean project title only */}
                  <div style={{ marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {project.project_title}
                    </h3>
                  </div>

                  {/* Line 2: Client + Vendor + Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {/* Client Name */}
                    <span style={{ fontWeight: '500', color: '#1A5276' }}>
                      {project.client_name || 'No Client'}
                    </span>

                    {/* Vendor Name */}
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Summary */}
        {!loading && !error && projects.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing {projects.length} projects
              {selectedVendorNames.length > 0 && ` for selected vendors`}
            </p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
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
