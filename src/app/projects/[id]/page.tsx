'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Calendar, User, Building, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';
import { Project } from '@/types';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  completed:  { color: 'var(--stm-success)', bg: 'color-mix(in srgb, var(--stm-success) 12%, transparent)' },
  active:     { color: 'var(--stm-primary)', bg: 'color-mix(in srgb, var(--stm-primary) 12%, transparent)' },
  'in progress': { color: 'var(--stm-warning)', bg: 'color-mix(in srgb, var(--stm-warning) 12%, transparent)' },
  planning:   { color: 'var(--stm-muted-foreground)', bg: 'var(--stm-muted)' },
  proposed:   { color: 'var(--stm-muted-foreground)', bg: 'var(--stm-muted)' },
};

const labelStyle = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: 'var(--stm-space-2)',
  fontSize: 'var(--stm-text-xs)',
  fontWeight: 'var(--stm-font-semibold)',
  color: 'var(--stm-muted-foreground)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  fontFamily: 'var(--stm-font-body)',
  marginBottom: 'var(--stm-space-2)',
};

const valueStyle = {
  fontSize: 'var(--stm-text-sm)',
  color: 'var(--stm-foreground)',
  fontFamily: 'var(--stm-font-body)',
};

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects?id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        const data = await response.json();
        const projectData = data.projects?.find((p: Project) => p.project_id.toString() === id);
        if (!projectData) throw new Error('Project not found');
        setProject(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center' }}>
        <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: 'var(--stm-space-4)' }}>
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dot" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
          <span className="stm-loader-capsule stm-loader-dash" />
        </div>
        <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
          Loading project details...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center' }}>
        <div style={{
          backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
          padding: 'var(--stm-space-4)',
          marginBottom: 'var(--stm-space-4)',
          fontSize: 'var(--stm-text-sm)',
          color: 'var(--stm-error)',
          fontFamily: 'var(--stm-font-body)',
        }}>
          {error || 'Project not found'}
        </div>
        <button
          onClick={() => router.push('/projects')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--stm-space-2)',
            padding: 'var(--stm-space-2) var(--stm-space-4)',
            backgroundColor: 'var(--stm-primary)', color: 'white',
            border: 'none', borderRadius: 'var(--stm-radius-md)',
            cursor: 'pointer', fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)',
          }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          Back to Projects
        </button>
      </div>
    );
  }

  const statusKey = project.status?.toLowerCase() || '';
  const statusStyle = STATUS_STYLE[statusKey] || { color: 'var(--stm-muted-foreground)', bg: 'var(--stm-muted)' };
  const StatusIcon = statusKey === 'completed' ? CheckCircle : statusKey === 'planning' || statusKey === 'proposed' ? AlertCircle : Clock;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : 'Not set';

  return (
    <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)',
        borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-5)',
        marginBottom: 'var(--stm-space-6)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-4)' }}>
          <button
            onClick={() => router.push('/projects')}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
              padding: 'var(--stm-space-2)', background: 'none', border: 'none',
              color: 'var(--stm-primary)', cursor: 'pointer', fontSize: 'var(--stm-text-sm)',
              fontFamily: 'var(--stm-font-body)',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)' }}>
            <div style={{
              width: '44px', height: '44px', backgroundColor: 'var(--stm-muted)',
              borderRadius: 'var(--stm-radius-md)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-bold)',
              color: 'var(--stm-primary)', fontFamily: 'var(--stm-font-body)',
            }}>
              {project.project_title.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', lineHeight: 1 }}>
                {project.project_title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)', marginTop: 'var(--stm-space-2)' }}>
                <span style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                  General Project
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--stm-space-1)',
                  padding: 'var(--stm-space-1) var(--stm-space-2)',
                  borderRadius: 'var(--stm-radius-full)',
                  fontSize: 'var(--stm-text-xs)', fontWeight: 'var(--stm-font-medium)',
                  backgroundColor: statusStyle.bg, color: statusStyle.color,
                  fontFamily: 'var(--stm-font-body)',
                }}>
                  <StatusIcon style={{ width: '11px', height: '11px' }} />
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/projects/${id}/edit`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
            padding: 'var(--stm-space-2) var(--stm-space-4)',
            backgroundColor: 'var(--stm-secondary)', color: 'white',
            border: 'none', borderRadius: 'var(--stm-radius-md)',
            cursor: 'pointer', fontSize: 'var(--stm-text-sm)',
            fontWeight: 'var(--stm-font-medium)', fontFamily: 'var(--stm-font-body)',
          }}
        >
          <Edit2 style={{ width: '14px', height: '14px' }} />
          Edit Project
        </button>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--stm-space-6)' }}>

        {/* Main: Project Information */}
        <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-6)' }}>
          <div style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-5)' }}>
            Project Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--stm-space-5)' }}>
            {[
              { label: 'Expected Deadline', icon: Calendar, value: formatDate((project as any).expected_deadline) },
              { label: 'Team Member',       icon: User,     value: (project as any).team_member || 'Not assigned' },
              { label: 'Assigned Vendor',   icon: Building, value: project.vendor_name || 'Not assigned' },
              { label: 'Last Updated',      icon: Calendar, value: formatDate(project.updated_at) },
            ].map(({ label, icon: Icon, value }) => (
              <div key={label}>
                <div style={labelStyle}>
                  <Icon style={{ width: '12px', height: '12px' }} />
                  {label}
                </div>
                <div style={valueStyle}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-4)' }}>
          {/* Quick Actions */}
          <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-5)' }}>
            <div style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-4)' }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
              {project.status?.toLowerCase() === 'completed' && (
                <button
                  onClick={() => router.push('/ratings')}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 'var(--stm-space-2)', padding: 'var(--stm-space-3)',
                    backgroundColor: 'var(--stm-warning)', color: 'white',
                    border: 'none', borderRadius: 'var(--stm-radius-md)',
                    cursor: 'pointer', fontWeight: 'var(--stm-font-medium)',
                    fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)',
                  }}
                >
                  <Star style={{ width: '14px', height: '14px' }} />
                  Rate Project
                </button>
              )}
              <button
                onClick={() => router.push(`/projects/${id}/edit`)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 'var(--stm-space-2)', padding: 'var(--stm-space-3)',
                  backgroundColor: 'var(--stm-secondary)', color: 'white',
                  border: 'none', borderRadius: 'var(--stm-radius-md)',
                  cursor: 'pointer', fontWeight: 'var(--stm-font-medium)',
                  fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)',
                }}
              >
                <Edit2 style={{ width: '14px', height: '14px' }} />
                Edit Project
              </button>
            </div>
          </div>

          {/* Project Stats */}
          <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-5)' }}>
            <div style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-4)' }}>
              Project Statistics
            </div>
            <div style={{
              padding: 'var(--stm-space-3)',
              backgroundColor: 'var(--stm-muted)',
              borderRadius: 'var(--stm-radius-md)',
              fontSize: 'var(--stm-text-xs)',
              color: 'var(--stm-muted-foreground)',
              fontFamily: 'var(--stm-font-body)',
              textAlign: 'center',
            }}>
              Project ID: {project.project_id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
