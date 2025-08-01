// [R5.3] Updated projects page with workflow-based action buttons
'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Building, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Project, ProjectsApiResponse } from '@/types';
import ProjectModal from '../../components/modals/ProjectModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Vendor category filter states
  const [allVendorCategories, setAllVendorCategories] = useState<string[]>([]);
  const [selectedVendorCategory, setSelectedVendorCategory] = useState('all');

  // [R7.5] Fetch projects from Supabase API
  useEffect(() => {
    async function fetchProjects() {
      try {
        const params = new URLSearchParams();
        if (selectedVendorCategory !== 'all') params.set('vendor_category', selectedVendorCategory);

        const response = await fetch(`/api/projects?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch projects');

        const data: ProjectsApiResponse = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [selectedVendorCategory]);

  // [R5.3] Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch all vendor categories from projects on component mount
  useEffect(() => {
    async function fetchAllVendorCategories() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data: ProjectsApiResponse = await response.json();
          const allProjects = data.projects || [];

          const categorySet = new Set<string>();
          allProjects.forEach(project => {
            if (project.vendors?.service_categories) {
              const categories = Array.isArray(project.vendors.service_categories)
                ? project.vendors.service_categories
                : [project.vendors.service_categories].filter(Boolean);
              categories.forEach(cat => {
                if (cat && typeof cat === 'string' && cat.trim()) {
                  categorySet.add(cat.trim());
                }
              });
            }
          });

          setAllVendorCategories(Array.from(categorySet).sort());
        }
      } catch (err) {
        console.error('Failed to fetch vendor categories:', err);
      }
    }

    fetchAllVendorCategories();
  }, []);

  // [R7.6] Helper functions
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'in progress':
      case 'active':
        return <Clock style={{ width: '1rem', height: '1rem' }} />;
      case 'planning':
      case 'proposed':
        return <AlertCircle style={{ width: '1rem', height: '1rem' }} />;
      default:
        return <Clock style={{ width: '1rem', height: '1rem' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { color: '#166534', backgroundColor: '#dcfce7', borderColor: '#bbf7d0' };
      case 'in progress':
      case 'active':
        return { color: '#ca8a04', backgroundColor: '#fef3c7', borderColor: '#fde68a' };
      case 'planning':
      case 'proposed':
        return { color: '#1d4ed8', backgroundColor: '#dbeafe', borderColor: '#93c5fd' };
      default:
        return { color: '#6b7280', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
          {/* Vendor Category Filter Buttons */}
          {allVendorCategories.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Filter by Vendor Category
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedVendorCategory('all')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: selectedVendorCategory === 'all' ? '#1A5276' : '#d1d5db',
                    backgroundColor: selectedVendorCategory === 'all' ? '#1A5276' : 'white',
                    color: selectedVendorCategory === 'all' ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  All Categories
                </button>
                {allVendorCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedVendorCategory(category)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      border: '1px solid',
                      borderColor: selectedVendorCategory === category ? '#1A5276' : '#d1d5db',
                      backgroundColor: selectedVendorCategory === category ? '#1A5276' : 'white',
                      color: selectedVendorCategory === category ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {category}
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
              {selectedVendorCategory === 'all' ? 'No projects exist yet.' : `No projects found for "${selectedVendorCategory}" category.`}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}>
                      {project.project_title}
                    </h3>

                    {/* Due date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar style={{ width: '1rem', height: '1rem', color: '#d1d5db' }} />
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(project.expected_deadline)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span style={{ fontWeight: '500', color: '#1A5276' }}>
                      {(() => {
                        if (project.vendors?.service_categories) {
                          const categories = Array.isArray(project.vendors.service_categories)
                            ? project.vendors.service_categories
                            : [project.vendors.service_categories];
                          return categories[0] || 'Unassigned';
                        }
                        return 'Unassigned';
                      })()}
                    </span>

                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      ...getStatusColor(project.status)
                    }}>
                      {getStatusIcon(project.status)}
                      {project.status || 'Unknown'}
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
              {selectedVendorCategory !== 'all' && ` for "${selectedVendorCategory}" category`}
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
