// [R5.3] Updated projects page with workflow-based action buttons
'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, User, Building, CheckCircle, Clock, AlertCircle, Star, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { Project, ProjectsApiResponse } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which project action is loading

  // [R7.5] Fetch projects from Supabase API
  useEffect(() => {
    async function fetchProjects() {
      try {
        const params = new URLSearchParams();
        if (filter !== 'All') params.set('status', filter);

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
  }, [filter]);

  // [R5.3] Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  // [R5.3] Handle workflow action buttons
  const handleCompleteProject = async (projectId: string) => {
    setActionLoading(projectId);
    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          status: 'completed'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete project');
      }

      // Update local state
      setProjects(prev => prev.map(p => 
        p.project_id === projectId 
          ? { ...p, status: 'completed' }
          : p
      ));
      
      console.log('Project completed successfully');
    } catch (err) {
      console.error('Failed to complete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete project');
    } finally {
      setActionLoading(null);
    }
  };

  // [R5.3] Get workflow button for project based on status
  const getWorkflowButton = (project: Project) => {
    const isLoading = actionLoading === project.project_id;
    
    switch (project.status?.toLowerCase()) {
      case 'active':
        return (
          <button 
            onClick={() => handleCompleteProject(project.project_id)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: isLoading ? '#9ca3af' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              transition: 'background-color 150ms',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#15803d';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                Complete Project
              </>
            )}
          </button>
        );
        
      case 'completed':
        return (
          <Link 
            href={`/rate-project?project_id=${project.project_id}`}
            style={{ textDecoration: 'none', width: '100%' }}
          >
            <button style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#ea580c',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 150ms',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c2410c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ea580c';
            }}
            >
              <Star style={{ width: '1rem', height: '1rem' }} />
              Rate Project
            </button>
          </Link>
        );
        
      case 'archived':
        return (
          <Link 
            href={`/rate-project?project_id=${project.project_id}&edit=true`}
            style={{ textDecoration: 'none', width: '100%' }}
          >
            <button style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 150ms',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6d28d9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed';
            }}
            >
              <Edit3 style={{ width: '1rem', height: '1rem' }} />
              Edit Ratings
            </button>
          </Link>
        );
        
      default:
        return (
          <button style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'not-allowed',
            fontWeight: '500',
            opacity: 0.6
          }}
          disabled
          >
            Unknown Status
          </button>
        );
    }
  };

  const uniqueStatuses = ['All', ...new Set(projects.map(p => p.status).filter(Boolean))];

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
          <div style={{ display: 'flex', gap: '1rem' }}>
            {uniqueStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === status ? '#1A5276' : 'transparent',
                  color: filter === status ? 'white' : '#6b7280',
                  transition: 'all 150ms'
                }}
                onMouseEnter={(e) => {
                  if (filter !== status) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== status) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                {status}
              </button>
            ))}
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
              {filter === 'All' ? 'No projects exist yet.' : `No projects match the "${filter}" filter.`}
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

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {projects.map((project) => (
              <div key={project.project_id} className="professional-card">
                <div style={{ padding: '1.5rem' }}>
                  {/* Project Header */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      color: '#111827', 
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      {project.project_title}
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem'
                    }}>
                      Client ID: <span style={{ fontWeight: '500', color: '#374151' }}>
                        {project.client_id || 'Not assigned'}
                      </span>
                    </p>
                    
                    {project.project_description && (
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '0.875rem', 
                        lineHeight: '1.4',
                        marginBottom: '0.75rem'
                      }}>
                        {project.project_description.length > 100 ? `${project.project_description.substring(0, 100)}...` : project.project_description}
                      </p>
                    )}

                    {project.project_type && (
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#E8F4F8',
                        color: '#1A5276',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        marginBottom: '0.75rem'
                      }}>
                        {project.project_type}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      border: '1px solid',
                      ...getStatusColor(project.status)
                    }}>
                      {getStatusIcon(project.status)}
                      Status: {project.status || 'Unknown'}
                    </span>
                  </div>

                  {/* Project Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <Calendar style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                      <span style={{ color: '#6b7280' }}>Due Date:</span>
                      <span style={{ fontWeight: '500', color: '#374151' }}>
                        {formatDate(project.expected_deadline)}
                      </span>
                    </div>

                    {project.key_skills_required && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <User style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                        <span style={{ color: '#6b7280' }}>Skills:</span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          {project.key_skills_required.length > 30 ? 
                            `${project.key_skills_required.substring(0, 30)}...` : 
                            project.key_skills_required}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <Building style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                      <span style={{ color: '#6b7280' }}>Vendor ID:</span>
                      <span style={{ fontWeight: '500', color: '#374151' }}>
                        {project.assigned_vendor_id || 'Not assigned'}
                      </span>
                    </div>

                    {project.team_member && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <User style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                        <span style={{ color: '#6b7280' }}>Team Member:</span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          {project.team_member}
                        </span>
                      </div>
                    )}

                    {project.initial_vendor_rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <svg style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span style={{ color: '#6b7280' }}>Rating:</span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          {project.initial_vendor_rating}/10
                        </span>
                      </div>
                    )}

                    {project.industry_experience && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <Building style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                        <span style={{ color: '#6b7280' }}>Industry:</span>
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          {project.industry_experience}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions - Workflow Buttons */}
                  {getWorkflowButton(project)}
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
              {filter !== 'All' && ` with status "${filter}"`}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}