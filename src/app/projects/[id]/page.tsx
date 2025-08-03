'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Calendar, User, Building, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/types';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        console.log('Fetching project with ID:', id);
        const response = await fetch(`/api/projects?id=${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const data = await response.json();
        const projectData = data.projects?.find((p: Project) => p.project_id.toString() === id);

        if (!projectData) {
          throw new Error('Project not found');
        }

        setProject(projectData);
        console.log('Project loaded:', projectData);
      } catch (err) {
        console.error('Error loading project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

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

  const getProjectType = () => {
    // TODO: Add service_categories to Project interface when available
    return 'General Project';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid #1A5276',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#dc2626' }}>Error: {error || 'Project not found'}</p>
        </div>
        <button
          onClick={() => router.push('/projects')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#1A5276',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            margin: '0 auto'
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/projects')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#1A5276',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
              Back to Projects
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#1A5276',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                  {project.project_title.charAt(0)}
                </span>
              </div>

              <div>
                <h1 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#1A5276',
                  margin: 0,
                  fontFamily: 'var(--font-headline)'
                }}>
                  {project.project_title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {getProjectType()}
                  </span>
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
                    {project.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push(`/projects/${id}/edit`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6B8F71',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <Edit2 style={{ width: '1rem', height: '1rem' }} />
            Edit Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Information */}
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Project Details */}
            <div className="professional-card" style={{ padding: '2rem' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#111827'
              }}>
                Project Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Calendar style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                    <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Expected Deadline</label>
                  </div>
                  <p style={{ margin: 0, color: '#6b7280' }}>{'Not set'}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <User style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                    <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Team Member</label>
                  </div>
                  <p style={{ margin: 0, color: '#6b7280' }}>{'Not assigned'}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Building style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                    <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Assigned Vendor</label>
                  </div>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    {project.vendor_name || 'Not assigned'}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Calendar style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                    <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Last Updated</label>
                  </div>
                  <p style={{ margin: 0, color: '#6b7280' }}>{formatDate(project.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Note: project_description and key_skills_required not available in current Project interface */}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Quick Actions */}
            <div className="professional-card" style={{ padding: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#111827'
              }}>
                Quick Actions
              </h3>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {project.status?.toLowerCase() === 'completed' && (
                  <Link
                    href={`/rate-project?project_id=${project.project_id}`}
                    style={{ textDecoration: 'none' }}
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <Star style={{ width: '1rem', height: '1rem' }} />
                      Rate Project
                    </button>
                  </Link>
                )}

                <button
                  onClick={() => router.push(`/projects/${id}/edit`)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#6B8F71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Edit2 style={{ width: '1rem', height: '1rem' }} />
                  Edit Project
                </button>
              </div>
            </div>

            {/* Project Stats */}
            <div className="professional-card" style={{ padding: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#111827'
              }}>
                Project Statistics
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    Project ID: {project.project_id}
                  </p>
                </div>

                {/* Note: initial_vendor_rating not available in current Project interface */}
              </div>
            </div>
          </div>
        </div>
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
