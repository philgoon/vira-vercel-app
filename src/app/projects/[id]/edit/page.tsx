'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Project, Vendor, Client } from '@/types';

const inputStyle = {
  width: '100%',
  padding: 'var(--stm-space-3)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-md)',
  fontSize: 'var(--stm-text-sm)',
  fontFamily: 'var(--stm-font-body)',
  backgroundColor: 'var(--stm-background)',
  color: 'var(--stm-foreground)',
  outline: 'none',
};

const labelStyle = {
  display: 'block' as const,
  fontSize: 'var(--stm-text-xs)',
  fontWeight: 'var(--stm-font-semibold)',
  color: 'var(--stm-muted-foreground)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  fontFamily: 'var(--stm-font-body)',
  marginBottom: 'var(--stm-space-2)',
};

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    project_title: '',
    project_description: '',
    client_key: '',
    assigned_vendor_id: '',
    expected_deadline: '',
    status: 'planning',
    key_skills_required: '',
    team_member: '',
    industry_experience: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [projectRes, vendorsRes, clientsRes] = await Promise.all([
          fetch(`/api/projects?id=${id}`),
          fetch('/api/vendors'),
          fetch('/api/clients'),
        ]);
        if (!projectRes.ok) throw new Error('Failed to fetch project');
        if (!vendorsRes.ok) throw new Error('Failed to fetch vendors');
        if (!clientsRes.ok) throw new Error('Failed to fetch clients');

        const [projectData, vendorsData, clientsData] = await Promise.all([
          projectRes.json(), vendorsRes.json(), clientsRes.json(),
        ]);

        const p = projectData.projects?.find((x: Project) => x.project_id.toString() === id);
        if (!p) throw new Error('Project not found');

        setProject(p);
        setVendors(vendorsData.vendors || []);
        setClients(clientsData.clients || []);

        const fmtDate = (s?: string) => {
          if (!s) return '';
          try { return new Date(s).toISOString().split('T')[0]; } catch { return ''; }
        };

        setFormData({
          project_title: p.project_title || '',
          project_description: (p as any).project_description || '',
          client_key: p.client_key || '',
          assigned_vendor_id: (p as any).assigned_vendor_id || '',
          expected_deadline: fmtDate((p as any).expected_deadline),
          status: p.status || 'planning',
          key_skills_required: (p as any).key_skills_required || '',
          team_member: (p as any).team_member || '',
          industry_experience: (p as any).industry_experience || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: id, ...formData, updated_at: new Date().toISOString() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }
      router.push(`/projects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

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

  if (error && !project) {
    return (
      <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center' }}>
        <div style={{
          backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
          padding: 'var(--stm-space-4)', marginBottom: 'var(--stm-space-4)',
          fontSize: 'var(--stm-text-sm)', color: 'var(--stm-error)', fontFamily: 'var(--stm-font-body)',
        }}>
          Error: {error}
        </div>
        <button
          onClick={() => router.push('/projects')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--stm-space-2)',
            padding: 'var(--stm-space-2) var(--stm-space-4)',
            backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none',
            borderRadius: 'var(--stm-radius-md)', cursor: 'pointer',
            fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)',
          }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-4)' }}>
          Project not found
        </div>
        <button
          onClick={() => router.push('/projects')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--stm-space-2)',
            padding: 'var(--stm-space-2) var(--stm-space-4)',
            backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none',
            borderRadius: 'var(--stm-radius-md)', cursor: 'pointer',
            fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)',
          }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          Back to Projects
        </button>
      </div>
    );
  }

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
            onClick={() => router.push(`/projects/${id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
              padding: 'var(--stm-space-2)', background: 'none', border: 'none',
              color: 'var(--stm-primary)', cursor: 'pointer',
              fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}>
            Edit Project
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--stm-space-2)' }}>
          <button
            onClick={() => router.push(`/projects/${id}`)}
            style={{
              padding: 'var(--stm-space-2) var(--stm-space-4)',
              backgroundColor: 'var(--stm-card)', color: 'var(--stm-muted-foreground)',
              border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)',
              cursor: 'pointer', fontSize: 'var(--stm-text-sm)', fontFamily: 'var(--stm-font-body)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)',
              padding: 'var(--stm-space-2) var(--stm-space-4)',
              backgroundColor: saving ? 'var(--stm-muted-foreground)' : 'var(--stm-primary)',
              color: 'white', border: 'none', borderRadius: 'var(--stm-radius-md)',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', fontFamily: 'var(--stm-font-body)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save style={{ width: '14px', height: '14px' }} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
          padding: 'var(--stm-space-4)', marginBottom: 'var(--stm-space-5)',
          fontSize: 'var(--stm-text-sm)', color: 'var(--stm-error)', fontFamily: 'var(--stm-font-body)',
        }}>
          Error: {error}
        </div>
      )}

      {/* Form Card */}
      <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-6)' }}>
        <div style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-6)' }}>
          Project Information
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-5)' }}>
          {/* Project Title */}
          <div>
            <label style={labelStyle}>Project Title *</label>
            <input type="text" value={formData.project_title} onChange={e => set('project_title', e.target.value)} style={inputStyle} required />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Project Description</label>
            <textarea
              value={formData.project_description}
              onChange={e => set('project_description', e.target.value)}
              rows={4}
              style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }}
              placeholder="Describe the project goals, requirements, and deliverables..."
            />
          </div>

          {/* Client + Vendor */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--stm-space-5)' }}>
            <div>
              <label style={labelStyle}>Client</label>
              <select value={formData.client_key} onChange={e => set('client_key', e.target.value)} style={inputStyle}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.client_key} value={c.client_key}>{c.client_name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Assigned Vendor</label>
              <select value={formData.assigned_vendor_id} onChange={e => set('assigned_vendor_id', e.target.value)} style={inputStyle}>
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>)}
              </select>
            </div>
          </div>

          {/* Status + Deadline + Team Member */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--stm-space-5)' }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={formData.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Expected Deadline</label>
              <input type="date" value={formData.expected_deadline} onChange={e => set('expected_deadline', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Team Member</label>
              <input type="text" value={formData.team_member} onChange={e => set('team_member', e.target.value)} style={inputStyle} placeholder="Internal team member responsible" />
            </div>
          </div>

          {/* Key Skills */}
          <div>
            <label style={labelStyle}>Key Skills Required</label>
            <textarea
              value={formData.key_skills_required}
              onChange={e => set('key_skills_required', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="List the key skills, technologies, or expertise required..."
            />
          </div>

          {/* Industry Experience */}
          <div>
            <label style={labelStyle}>Industry Experience</label>
            <input type="text" value={formData.industry_experience} onChange={e => set('industry_experience', e.target.value)} style={inputStyle} placeholder="Relevant industry experience needed" />
          </div>
        </div>
      </div>
    </div>
  );
}
